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

<!-- END:nextjs-agent-rules -->
