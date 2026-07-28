<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Here's the full lifecycle, mapped to the exact tables from the schema, so you can see which write happens at each step.

## 1. Owner — Setup Phase

**A. Sign up**
Owner signs up via Clerk → webhook creates a row in `users` with `role = 'owner'`.

**B. Register gym**
Owner fills the onboarding form → insert into `gyms` (name, address, GST info, facilities). A unique `code` is generated (e.g. `Q8K7PW`) — this is what members will later use to find the gym. `gymLocations` gets one auto-row (`isPrimary = true`) even for single-branch gyms.

**C. Generate entrance QR**
Owner goes to Settings → "Attendance QR" → system inserts one row into `gymQrCodes` (linked to that location) with a server-generated `signatureSecret`. This QR gets printed and stuck at the entrance — it never changes per member, only per gym.

**D. Create membership plans**
Owner builds plans (Basic/Premium/etc.) → rows in `membershipPlans`, each with `planPrice`, `durationMonths`, `joiningFee`, features. `status = 'Draft'` until the owner is ready to publish, then `'Active'`.

**E. Invite trainers**
Owner adds a trainer → a `users` row (if not existing) + a `trainers` row scoped to `gymId`, with `invitationSent = true`. Trainer gets a notification (`notifications` row) to accept and complete their profile.

## 2. Trainer — Onboarding & Daily Work

**A. Accepts invite**
Trainer logs in via Clerk → their `trainers` row (already created by owner) is now editable by them — they fill in `bio`, `specializations`, `workingDays`, `startTime`/`endTime`.

**B. Builds exercise library (optional)**
Trainer can add gym-specific exercises → `exercises` rows (with `gymId` set; global library exercises have `gymId = null` and are shared across all gyms).

**C. Creates a workout template**
Trainer builds "Push Day Strength" → insert into `workoutTemplates` (category, difficulty, goal). Then adds exercises one by one → `templateExercises` rows (position, sets, reps, weight, rest — each row points at an `exercises.id`).

**D. Creates a session from the template**
Trainer picks a member + a template → insert into `trainingSessions` (`templateId` set, `status = 'Upcoming'`). At creation, every row in that template's `templateExercises` is **copied** into `sessionExercises` for this specific session.

**E. Edits the session (optional)**
Trainer tweaks this one session — changes reps, adds an exercise, removes one. This only touches `sessionExercises` rows tied to that `sessionId`. The original `workoutTemplates`/`templateExercises` are untouched, so the next time this template is used for someone else, it's still clean.

**F. Runs the session with the member**
Member does the workout → trainer marks `trainingSessions.status = 'Completed'`, `completedAt` timestamp set. That `sessionExercises` snapshot is now permanent history — even if the template gets edited later, this record never changes.

**G. Assigned to a member**
Separately (usually at gym-membership approval time), owner or trainer creates a `trainerAssignments` row linking `gymId + memberId + trainerId`. This is what lets a member have Trainer A at Gym 1 and Trainer B at Gym 2 — it's per-gym, not global.

## 3. Member — Full Journey

**A. Sign up**
Member signs up via Clerk (mobile app) → `users` row with `role = 'member'`. On first login, a global `members` row is created — one per person, ever, no `gymId`.

**B. Discover a gym**
Member browses gyms or enters a gym `code` → sees `gyms` + published `membershipPlans` for that gym.

**C. Submit application**
Member picks a plan and applies → insert into `membershipApplications`: `gymId`, `memberId`, `planId`, `status = 'Pending'`. Owner gets a `notifications` row.

**D. Owner reviews**
Owner sees the application in their dashboard queue. Two paths:

- **Reject** → `membershipApplications.status = 'Rejected'`, `rejectionReason` set. Member notified, journey stops here (can reapply — new row).
- **Approve** → `membershipApplications.status = 'Approved'`, `reviewedBy`/`reviewedAt` set. **This triggers creation of a `gymMemberships` row**: `status = 'PaymentPending'`, `applicationId` linked back, price/duration copied from the plan at that moment (so future plan price changes don't retroactively affect this membership).

**E. Member pays**
Member sees "Pay ₹X" on their approved application → uploads payment (cash confirmation, UPI screenshot, etc.). Insert into `payments`: `gymMembershipId` set, `status = 'PendingVerification'`. The uploaded file → `paymentReceipts` row (`isCurrent = true`).
`gymMemberships.status` moves to `'PaymentUploaded'`.

**F. Owner verifies payment**
Owner reviews the receipt:

- **Reject** → `payments.status = 'Rejected'`, `rejectionReason` set, `gymMemberships.status = 'PaymentRejected'`. Member re-uploads → new `paymentReceipts` row (old one's `isCurrent` flipped to `false`), same `payments` row updated, back to `'PendingVerification'`.
- **Approve** → `payments.status = 'Verified'`, `verifiedBy`/`verifiedAt` set. **`gymMemberships.status = 'Active'`**, `activatedAt`/`activatedBy` set, `startDate`/`endDate` calculated from `durationMonths`.

**G. Membership activated — gym features unlock**
Member's `members.activeGymMembershipId` gets pointed at this new `gymMemberships.id` (this is what your app uses as "currently selected gym" in a multi-gym switcher). Member can now:

- View their assigned trainer (`trainerAssignments`)
- See upcoming `trainingSessions`
- Check in

**H. Daily attendance**
Member opens app → scans the gym's static QR (`gymQrCodes.qrIdentifier`, signature verified server-side against `signatureSecret`).

- System checks: is there an `attendance` row for `(memberId, gymId, today)`?
  - **No row** → insert new `attendance`: `checkIn = now`, `status = 'CheckedIn'`, `gymMembershipId` = their active membership.
  - **Row exists, `status = 'CheckedIn'`** → this scan is check-out: update the same row — `checkOut = now`, compute `durationMinutes`, `status = 'CheckedOut'`.
  - **Row exists, `status = 'CheckedOut'`** → done for today, button disappears in UI.

**I. Renewal**
When `endDate` passes, a daily cron flips `gymMemberships.status = 'Expired'`. Attendance is blocked (app checks for an `Active` membership before allowing a scan). Member re-applies or renews → **new `gymMemberships` row** inserted (never update the expired one) — full history preserved.

**J. Multi-gym**
Member repeats steps B–I for a second gym → a second, independent `gymMemberships` row, its own trainer assignment, its own attendance history. Switching gyms in the app just updates `members.activeGymMembershipId`.

## 4. Billing — TrackVim → Owner (separate from all of the above)

**A. Every billing cycle (e.g. monthly cron)**
For each gym, count `gymMemberships` WHERE `gymId = X AND status = 'Active'`. This number is _never_ stored manually — always computed fresh.

**B. Generate invoice**
Insert a `gymSubscriptions` row: `activeMemberCount` = that count, `totalAmount` = count × `subscriptionPlans.pricePerMember` (or flat fee, depending on `billingModel`), `status = 'Pending'`.

**C. Owner pays TrackVim**
Owner pays via Razorpay → `subscriptionPayments` row created (`status = 'Created'` → `'Captured'` on gateway webhook success) → `gymSubscriptions.status = 'Paid'`.

**D. Next cycle**
Repeat B–C with a fresh member count — so if the gym grew from 45 to 52 active members, next month's invoice reflects that automatically.

---

One gap worth flagging: nothing here auto-computes `payments.gymMembershipId` when the _first_ payment for a brand-new membership happens — you'll want an API route that, on application approval, atomically creates the `gymMemberships` row **and** a stub `payments` row in one transaction, so the member's payment screen has something to attach the receipt to immediately. Want me to sketch that API route (Next.js route handler + Drizzle transaction) next?

##The suggested solution

Instead of waiting until the member uploads the receipt...

Create the payment immediately.

Owner approves

↓

Transaction begins

Create gymMembership

↓

Create payment
status = Pending

↓

Commit

Now the database already has

payments

id = payment_1

gymMembershipId = membership_1

amount = ₹1500

status = Pending

When the member opens the payment page

instead of

No payment

they see

Membership Fee

₹1500

Status

Pending Payment

Now they click

Upload Receipt

which updates

payments

status = PendingVerification

instead of inserting a brand new row.

##proposed Flow

Application
│
▼
Approve
│
▼
Create Membership
│
▼
Create Payment (Pending)
│
▼
Upload Receipt
│
▼
Payment (PendingVerification)
│
▼
Owner Verifies
│
▼
Payment (Verified)
│
▼
Membership Active

# APP COMPLETE FLOW

Based on the schema you've shared, here's the complete lifecycle of your TrackVim system, including **when each RPC, trigger, and cron job runs**.

---

# 1. Gym Registration

### User Action

Owner signs up and creates a gym.

```
Owner
    │
    ▼
Insert into gyms
```

### Trigger

```
gyms_set_billing_defaults()
```

Runs **BEFORE INSERT**

It automatically sets:

- `billing_start_date = current_date + 1 month`
- `current_plan_id = Basic`

Owner cannot choose these.

---

## Example

```
Signup

July 15

↓

billing_start_date

Aug 15

↓

current_plan

Basic
```

---

# 2. Owner changes subscription plan

During trial (or later)

Owner clicks

```
Upgrade to Premium
```

Client calls

```
change_gym_subscription_plan()
```

RPC checks

- Owner owns gym
- Plan exists
- Plan is active

Then

```
gyms.current_plan_id

↓

Premium
```

No invoices change.

---

# 3. Member applies for membership

Member selects

```
Gym

↓

Plan

↓

Apply
```

Client inserts

```
membership_applications
```

Status

```
Pending
```

No RPC yet.

---

# 4. Owner reviews application

Owner opens

```
Pending Applications
```

---

## Approve

Client calls

```
approve_membership_application(application_id)
```

This RPC

Updates

```
membership_application

Pending

↓

Approved
```

Creates

```
gym_membership

PaymentPending
```

Creates

```
payment

Pending
```

Creates

```
notification
```

Everything happens atomically.

---

## Reject

Owner clicks Reject

Calls

```
reject_membership_application(
    application_id,
    reason
)
```

Updates

```
Application

↓

Rejected
```

Creates notification.

No membership created.

---

# 5. Member submits payment

Member opens

```
Pending Payment
```

Uploads receipt

Calls

```
submit_payment()
```

RPC

Updates

```
Payment

Pending

↓

PendingVerification
```

Creates

```
payment_receipts
```

Cannot fake

```
Verified
```

because RPC controls status.

---

# 6. Owner verifies payment

Owner reviews receipt.

---

Approve

Calls

```
verify_payment()
```

RPC

Updates

```
Payment

PendingVerification

↓

Verified
```

Updates

```
Membership

PaymentPending

↓

Active
```

Recalculates

```
start_date

end_date
```

Creates notification.

---

Reject

Calls

```
reject_payment()
```

Updates

```
Payment

↓

Rejected
```

Updates

```
Membership

↓

PaymentRejected
```

Creates notification.

---

# 7. Member resubmits payment

Member uploads new receipt.

Calls

```
submit_payment()
```

again.

Allowed because status

```
Rejected
```

is accepted.

---

# 8. Attendance

Member scans QR.

Calls

```
check_in_or_out(qr_identifier)
```

RPC

Finds

- member
- gym
- today's attendance

If no attendance

```
INSERT attendance

Check In
```

Else

```
UPDATE attendance

Check Out
```

Members never directly insert attendance.

Only RPC.

---

# 9. Trainer creates session

Trainer inserts

```
training_sessions
```

Trigger runs

```
notify_session_scheduled()
```

Creates notification.

---

# 10. Daily Membership Expiration

Cron

```
2 AM
```

Runs

```
expire_overdue_memberships()
```

Changes

```
Active

↓

Expired
```

Creates notifications.

---

# 11. Trial Ends

Example

```
Signup

July 15

↓

Trial Ends

Aug 15
```

Daily cron

```
2:30 AM
```

Runs

```
generate_first_gym_invoices()
```

Checks

```
billing_start_date <= today
```

AND

```
No invoice exists
```

Creates

```
First Invoice

Aug15

↓

Aug31
```

using

```
create_gym_invoice()
```

which calls

```
gym_subscription_plan_for()
```

to read

```
gyms.current_plan_id
```

---

# 12. Owner Pays Platform Subscription

Owner clicks

```
Pay Now
```

Backend creates Razorpay Order.

Then calls

```
create_subscription_payment_order()
```

Creates

```
subscription_payments

Created
```

Stores

```
gateway_order_id
```

---

# 13. Razorpay webhook

Payment succeeds.

Webhook receives

```
payment.captured
```

Server calls

```
record_subscription_payment_captured()
```

Looks up

```
subscription_payments

↓

gateway_order_id
```

Updates

```
Captured
```

Calls

```
mark_gym_subscription_paid()
```

Updates

```
Invoice

↓

Paid
```

If no unpaid invoices remain

```
Gym

Suspended

↓

Active
```

---

# 14. Monthly Billing

Every

```
1st

3 AM
```

Cron

Runs

```
generate_gym_subscription_invoices()
```

Loops all gyms

Creates invoice

via

```
create_gym_invoice()
```

---

# 15. Daily Overdue Check

Every day

```
4 AM
```

Runs

```
mark_overdue_gym_subscriptions()
```

Updates

```
Pending

↓

Overdue
```

Suspends gym

Creates notification.

---

# 16. Membership Renewal

Owner chooses

```
Renew
```

Calls

```
renew_membership()
```

Creates

```
NEW gym_membership
```

Creates

```
NEW payment
```

Old membership remains.

History preserved.

---

# 17. Trial Extension (Admin)

Support decides

```
Extend Trial
```

Backend

Calls

```
extend_gym_trial()
```

Updates

```
billing_start_date
```

Cancels first pending invoice if one exists.

---

# Complete Flow Diagram

```text
Owner creates Gym
        │
        ▼
gyms_set_billing_defaults() (Trigger)
        │
        ▼
1 Month Trial
        │
        ├───────────────► change_gym_subscription_plan()
        │
Member Applies
        │
        ▼
membership_applications
        │
        ├────────► approve_membership_application()
        │                 │
        │                 ├── gym_membership
        │                 ├── payment
        │                 └── notification
        │
        └────────► reject_membership_application()

Member Pays
        │
        ▼
submit_payment()
        │
        ▼
PendingVerification
        │
        ├────────► verify_payment()
        │                 ├── membership Active
        │                 └── payment Verified
        │
        └────────► reject_payment()

Member Uses Gym
        │
        ▼
check_in_or_out()

Trainer Creates Session
        │
        ▼
notify_session_scheduled() (Trigger)

Daily 2:00 AM
        │
        ▼
expire_overdue_memberships()

Daily 2:30 AM
        │
        ▼
generate_first_gym_invoices()
        │
        ▼
create_gym_invoice()

Owner Pays TrackVim
        │
        ▼
create_subscription_payment_order()
        │
        ▼
Razorpay Checkout
        │
        ▼
Webhook
        │
        ▼
record_subscription_payment_captured()
        │
        ▼
mark_gym_subscription_paid()

Monthly (1st, 3:00 AM)
        │
        ▼
generate_gym_subscription_invoices()
        │
        ▼
create_gym_invoice()

Daily 4:00 AM
        │
        ▼
mark_overdue_gym_subscriptions()

Membership Renewal
        │
        ▼
renew_membership()

Support/Admin
        │
        ▼
extend_gym_trial()
```

This architecture is well structured: **user-facing actions** (approvals, payments, attendance, renewals) are handled through RPCs, **automatic row-level reactions** (defaults, notifications) are handled by triggers, and **time-based operations** (billing, expiration, overdue checks) are handled by scheduled cron jobs.

<!-- END:nextjs-agent-rules -->
