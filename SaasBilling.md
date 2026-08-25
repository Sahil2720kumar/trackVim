# TrackVim — SaaS Billing System Documentation

This document explains the complete gym subscription billing flow: trial → first invoice → payment → monthly recurring → overdue/suspension → cancellation/reactivation → plan changes. It covers **which triggers fire automatically**, **which RPCs are called explicitly**, and **which crons run on a schedule**.

---

## 1. Mental model: Trigger vs RPC vs Cron

| Type        | Who calls it                                  | Example                                                          |
| ----------- | --------------------------------------------- | ---------------------------------------------------------------- |
| **Trigger** | Postgres, automatically, on a table event     | `gyms_set_billing_defaults` on `INSERT INTO gyms`                |
| **RPC**     | Application/backend, explicitly               | `change_gym_subscription_plan()` when owner clicks "Change Plan" |
| **Cron**    | `pg_cron` / Supabase scheduler, on a schedule | `generate_first_gym_invoices()` at 02:30 daily                   |

```mermaid
flowchart LR
    subgraph Triggers["TRIGGERS (automatic)"]
        T1[gyms_set_billing_defaults]
        T2[gyms_protect_billing_fields]
    end

    subgraph App["USER / APP"]
        A1[Owner actions]
    end

    subgraph RPCs["RPCs (explicit calls)"]
        R1[change_gym_subscription_plan]
        R2[create_subscription_payment_order]
        R3[record_subscription_payment_captured]
        R4[cancel_gym_billing]
        R5[reactivate_gym_subscription]
    end

    subgraph DB["DATABASE STATE"]
        D1[(gyms)]
        D2[(subscription_plans)]
        D3[(gym_subscriptions)]
        D4[(subscription_payments)]
    end

    subgraph Cron["CRON (scheduled)"]
        C1[generate_first_gym_invoices]
        C2[generate_gym_subscription_invoices]
        C3[mark_overdue_gym_subscriptions]
    end

    Triggers --> DB
    A1 --> RPCs --> DB
    Cron --> DB
    DB --> Cron
```

**Triggers protect/set data. RPCs perform business actions. Cron drives time-based billing.**

---

## 2. Schema change: separate `billing_status` from `gyms.status`

This is the key structural change in the current design: **billing state is no longer conflated with application state, and it's no longer inferred from `current_plan_id` being NULL.**

Previously, "billing cancelled" had no clean representation — you'd be tempted to null out `current_plan_id`, which loses the record of what the owner was subscribed to. Instead, `gyms` gets its own billing-specific enum.

```ts
export const gymBillingStatusEnum = pgEnum("gym_billing_status", [
  "Trial",
  "Active",
  "Pending",
  "Suspended",
  "Cancelled",
]);
```

```ts
billingStartDate: date("billing_start_date"),

currentPlanId: uuid("current_plan_id").references(
  () => subscriptionPlans.id,
),

billingStatus: gymBillingStatusEnum("billing_status")
  .notNull()
  .default("Trial"),
```

**`current_plan_id` is never cleared on cancellation** — the plan the owner was on stays on record even while `billing_status = Cancelled`.

The supporting index moves from gym/application status onto billing status:

```ts
index("gyms_billing_status_idx")
  .on(t.billingStatus, t.billingStartDate)
  .where(sql`billing_start_date is not null`),
```

### Three separate concepts, three separate fields

| Field                      | Answers                                         | Owned by                     |
| -------------------------- | ----------------------------------------------- | ---------------------------- |
| `gyms.status`              | Is the gym/application itself operational?      | Application logic            |
| `gyms.billing_status`      | What is the gym's subscription state right now? | Billing system               |
| `gym_subscriptions.status` | What happened to _this one invoice_?            | Individual invoice lifecycle |

Example — a gym can be billing-`Active` even while one invoice sits `Paid` and the next sits `Pending`, because the current invoice isn't overdue yet:

```text
gyms
────────────────────────
billing_status = Active
current_plan_id = Pro

gym_subscriptions
────────────────────────────────
August    Paid
September Pending   ← not yet due, gym stays Active
```

---

## 3. `billing_status` state machine

```mermaid
stateDiagram-v2
    [*] --> Trial: Gym created
    Trial --> Pending: billing_start_date reached\n(first invoice created)
    Pending --> Active: Payment captured
    Active --> Pending: New monthly invoice created
    Pending --> Suspended: Invoice overdue
    Suspended --> Active: Payment captured
    Active --> Cancelled: cancel_gym_billing()
    Cancelled --> Pending: reactivate_gym_subscription()\n(new prorated invoice)
```

| Transition            | Trigger                                                                      |
| --------------------- | ---------------------------------------------------------------------------- |
| `Trial → Pending`     | Daily 02:30 cron creates the first invoice                                   |
| `Pending → Active`    | Razorpay webhook confirms payment                                            |
| `Active → Pending`    | Monthly cron creates the next invoice                                        |
| `Pending → Suspended` | Daily 04:00 cron finds an overdue invoice                                    |
| `Suspended → Active`  | Owner pays the overdue invoice                                               |
| `Active → Cancelled`  | Owner (or admin) calls `cancel_gym_billing()`                                |
| `Cancelled → Pending` | Owner returns; `reactivate_gym_subscription()` issues a new prorated invoice |

---

## 4. End-to-end lifecycle overview

```mermaid
flowchart TD
    A[Owner signup] --> B[INSERT INTO gyms]
    B --> C{{"BEFORE INSERT trigger:\ngyms_set_billing_defaults"}}
    C --> D["billing_start_date = signup + 1 month\ncurrent_plan_id = Basic (if NULL)\nbilling_status = Trial"]
    D --> E[Gym created — 1 month free trial]
    E --> F["DAILY CRON 02:30\ngenerate_first_gym_invoices()"]
    F --> G{"billing_status = Trial\nAND billing_start_date <= today?"}
    G -- No --> H[Nothing happens yet]
    G -- Yes --> I{Gym already has an invoice?}
    I -- Yes --> H
    I -- No --> J[Count active members]
    J --> K[Get current plan]
    K --> L[Calculate first-period amount + proration]
    L --> M["create_gym_invoice()"]
    M --> N[(gym_subscriptions: Pending)]
    N --> O["gyms.billing_status:\nTrial → Pending"]
```

> **Key design change:** there is **no trigger** that creates the first invoice on gym insert anymore. The old trigger `gyms_generate_first_invoice_on_insert` was removed. Instead: `INSERT gym → Trial → daily cron → first invoice → billing_status = Pending`.

---

## 5. Trial flow — owner inactivity, cancellation & reactivation

This traces the trial period through to its outcomes: the owner pays and the gym goes live, or the owner never engages and billing is cancelled — with a path back in later via reactivation.

```mermaid
flowchart TD
    A[Gym created] --> B["BEFORE INSERT trigger:\ngyms_set_billing_defaults"]
    B --> C["billing_start_date = today + 1 month"]
    B --> D["current_plan_id = Basic"]
    B --> D2["billing_status = Trial"]
    C --> E[TRIAL]
    D --> E
    D2 --> E
    E --> F[1 month passes]
    F --> G{billing_start_date <= current_date?}
    G -- Yes --> H["pg_cron 02:30 daily"]
    H --> I["generate_first_gym_invoices()"]
    I --> J["create_gym_invoice()"]
    J --> K["First invoice: Pending\nbilling_status: Trial → Pending"]
    K --> L{Owner continues?}
    L -- Yes --> M[Owner pays]
    M --> N["Invoice: Paid\nbilling_status: Pending → Active"]
    L -- No --> O[Owner doesn't use the application]
    O --> P["cancel_gym_billing()"]
    P --> Q["Pending invoice → Cancelled\nbilling_status → Cancelled\ncurrent_plan_id kept"]
    Q --> R[No further invoices generated]
    R --> S[Owner returns later]
    S --> T["reactivate_gym_subscription()"]
    T --> U["billing_status: Cancelled → Pending"]
    U --> V[New prorated invoice created]
    V --> W[Owner pays]
    W --> X["billing_status: Pending → Active"]
```

### Notes on this path

- The trial itself needs **no invoice** — `gyms_set_billing_defaults` only stamps `billing_start_date`, the default `Basic` plan, and `billing_status = Trial`; the daily cron is what turns trial-end into an actual Pending invoice.
- If the owner simply goes quiet, TrackVim doesn't chase the invoice through Overdue/Suspended forever — inactivity is resolved by calling `cancel_gym_billing()`, which cancels the outstanding Pending invoice and sets `billing_status = Cancelled` directly. **`current_plan_id` is preserved.**
- Once `Cancelled`, the monthly cron (`generate_gym_subscription_invoices()`) has nothing to act on for that gym.
- Coming back goes through `reactivate_gym_subscription()`: `billing_status` moves `Cancelled → Pending` and a **new prorated invoice** is created reflecting the current plan and today's date, rather than resurrecting the old `billing_start_date`. `billing_status` only reaches `Active` again once that invoice is paid.

---

## 6. First invoice generation (daily cron, 02:30)

```mermaid
flowchart TD
    Start(["CRON 02:30\ngenerate_first_gym_invoices()"]) --> F1["Find gyms WHERE\nbilling_status = 'Trial'"]
    F1 --> C1{billing_start_date > today?}
    C1 -- Yes --> Skip1[Skip]
    C1 -- No --> C2{Previous invoice exists?}
    C2 -- Yes --> Skip2[Skip]
    C2 -- No --> P1[Get billing_start_date]
    P1 --> P2[Calculate period_end]
    P2 --> P3[Count Active members]
    P3 --> P4[Get current plan]
    P4 --> P5[Calculate invoice amount]
    P5 --> P6[Calculate proration]
    P6 --> P7["create_gym_invoice()"]
    P7 --> P8[(INSERT gym_subscriptions\nstatus = Pending)]
    P8 --> P9["UPDATE gyms\nbilling_status = 'Pending'"]
```

---

## 7. Monthly recurring invoices (cron, 1st of month 03:00)

```mermaid
flowchart TD
    Start(["CRON 03:00 on 1st\ngenerate_gym_subscription_invoices()"]) --> F1["Find gyms WHERE\nbilling_status IN ('Active','Suspended')"]
    F1 --> C1{billing_start_date <= period_start?}
    C1 -- No --> Skip1[Skip]
    C1 -- Yes --> C2{Gym has an invoice already?}
    C2 -- No --> Skip2[Skip]
    C2 -- Yes --> P1[Count active members]
    P1 --> P2[Get current plan]
    P2 --> P3[Full calendar month]
    P3 --> P4["create_gym_invoice()"]
    P4 --> P5[(gym_subscriptions: Pending)]
    P5 --> P6["UPDATE gyms\nbilling_status = 'Pending'\n(if it was Active)"]
```

**Division of responsibility:**

- `generate_first_gym_invoices()` → gyms with `billing_status = 'Trial'`, creates the **first** invoice, flips to `Pending`
- `generate_gym_subscription_invoices()` → gyms already billing (`Active`/`Suspended`), creates **all future** monthly invoices

Both ultimately call the shared `create_gym_invoice()` RPC, which is the central invoice-creation function (takes the plan + member snapshot and creates the invoice row).

> **Query change:** these crons now filter on `gyms.billing_status`, not `gyms.status` — the old index `gyms_billing_status_idx` was rebuilt on `(billing_status, billing_start_date)` for exactly this reason.

---

## 8. Owner pays: Billing → Pay Now → Razorpay

```mermaid
sequenceDiagram
    participant O as Owner
    participant App as Backend/App
    participant RPC as create_subscription_payment_order()
    participant RZ as Razorpay

    O->>App: Open Billing page
    App->>App: Find Pending/Overdue invoice
    O->>App: Click "Pay Now"
    App->>RZ: Create Razorpay Order
    RZ-->>App: order_id
    App->>RPC: create_subscription_payment_order(invoice_id)
    RPC->>RPC: Check invoice exists
    RPC->>RPC: Check is_gym_owner()
    RPC->>RPC: Check status (Pending / Overdue)
    RPC->>RPC: INSERT subscription_payments (status = Created)
    RPC-->>App: gateway_order_id
    App->>O: Open Razorpay Checkout
```

### `create_subscription_payment_order()` internal flow

```mermaid
flowchart TD
    Start["create_subscription_payment_order()"] --> A{Invoice exists?}
    A -- No --> E1[ERROR]
    A -- Yes --> B{is_gym_owner?}
    B -- No --> E2[ERROR]
    B -- Yes --> C{Status Pending or Overdue?}
    C -- No --> E3[ERROR]
    C -- Yes --> D[(INSERT subscription_payments\nstatus = Created)]
```

---

## 9. Razorpay payment capture → webhook → RPC chain

```mermaid
flowchart TD
    A[(subscription_payments\ninvoice_id, amount, gateway_order_id\nstatus = Created)] --> B[Razorpay Checkout]
    B --> C{Result}
    C -- Failed --> D[status = Failed]
    C -- Success --> E["payment.captured event"]
    E --> F[Razorpay Webhook]
    F --> G[Verify webhook signature]
    G --> H["record_subscription_payment_captured()"]
```

### `record_subscription_payment_captured()`

```mermaid
flowchart TD
    Start["record_subscription_payment_captured(order_id)"] --> A["Find subscription_payments\nWHERE gateway_order_id = ?"]
    A --> B{Found?}
    B -- No --> E1[ERROR]
    B -- Yes --> C[FOR UPDATE lock row]
    C --> D{Already status = Captured?}
    D -- Yes --> R1[Return — idempotent no-op]
    D -- No --> F["UPDATE payment:\nstatus = Captured\ngateway_payment_id\npaid_at = now()"]
    F --> G["mark_gym_subscription_paid(invoice_id)"]
```

Its job in one line: **Razorpay order → find TrackVim payment → mark payment Captured → find TrackVim invoice → mark invoice Paid → update gym billing_status.** It's the bridge between the external payment gateway and TrackVim's internal billing state.

### `mark_gym_subscription_paid()` — now updates both invoice and gym billing status

```mermaid
flowchart TD
    Start["mark_gym_subscription_paid(invoice_id)"] --> A[Find invoice]
    A --> B[FOR UPDATE lock]
    B --> C["Invoice status = Paid"]
    C --> D{Any other Pending/Overdue\ninvoices for this gym?}
    D -- Yes --> E["gyms.billing_status\nunchanged (stays Suspended/Pending)"]
    D -- No --> F["gyms.billing_status:\nPending/Suspended → Active"]
```

> Paying **one** overdue invoice does not blindly reactivate the gym — the function checks whether anything else is unpaid first. Payment now changes **both** the invoice row (`Pending/Overdue → Paid`) and the gym row (`billing_status → Active`) in the same operation.

---

## 10. Overdue & suspension flow (daily cron, 04:00)

```mermaid
flowchart TD
    Start(["CRON 04:00 daily\nmark_overdue_gym_subscriptions()"]) --> A["Find gym_subscriptions WHERE\nstatus = Pending AND due_date < current_date"]
    A --> B[UPDATE invoice: Pending → Overdue]
    B --> C["UPDATE gyms.billing_status:\nPending/Active → Suspended"]
    C --> D["INSERT notification:\n'Payment overdue — access suspended'"]
```

### Recovery after suspension

```mermaid
flowchart TD
    A["gyms.billing_status = Suspended"] --> B[Owner pays Overdue invoice]
    B --> C[Razorpay payment.captured webhook]
    C --> D["record_subscription_payment_captured()"]
    D --> E["subscription_payments:\nCreated → Captured"]
    E --> F["mark_gym_subscription_paid()"]
    F --> G["Invoice: Overdue → Paid"]
    G --> H{Other Pending/Overdue\ninvoices remain?}
    H -- Yes --> I["billing_status remains Suspended"]
    H -- No --> J["billing_status → Active"]
```

---

## 11. Plan change flow

The owner changes their subscription plan from Settings. The **current invoice is recalculated in place** rather than left untouched — the plan change is reflected immediately on the active Pending invoice via proration. `billing_status` itself is not touched by a plan change — only `current_plan_id` and the locked invoice.

```mermaid
flowchart TD
    A[Owner clicks 'Change Plan'] --> B["change_gym_subscription_plan()"]
    B --> C{is_gym_owner?}
    C -- No --> E1[ERROR]
    C -- Yes --> D{New plan active?}
    D -- No --> E2[ERROR]
    D -- Yes --> F[Find current invoice]
    F --> G[FOR UPDATE lock invoice]
    G --> H{Invoice status = Pending?}
    H -- No --> E3[ERROR]
    H -- Yes --> I["set_config('app.allow_billing_field_change', true, true)"]
    I --> J["UPDATE gyms.current_plan_id"]
    J --> K["recalculate_gym_invoice()"]
    K --> L[Lock invoice]
    L --> M[Get new plan]
    M --> N[Count active members]
    N --> O{Pricing model}
    O -- PerMember --> P["amount = members × price"]
    O -- Flat --> Q["amount = flat price"]
    P --> R{Is prorated?}
    Q --> R
    R -- Yes --> S[Apply prorated fraction]
    R -- No --> T[Use full amount]
    S --> U["UPDATE invoice:\nsame invoice row, new plan,\nnew member count, new amount"]
    T --> U
```

### Why this differs from a simple plan swap

- The RPC now **requires** a Pending invoice to exist and locks it (`FOR UPDATE`) before touching anything — an Overdue or already-Paid invoice blocks the change with an error, rather than silently changing the plan for next month only.
- `recalculate_gym_invoice()` re-derives the amount from scratch (fresh member count + new plan price), then applies proration if the plan's billing model is prorated — it does **not** just multiply the difference.
- The **same invoice row** is updated (not a new one created), so the owner sees one clean Pending invoice reflecting the new plan.

### Why `set_config()` is involved

The protection trigger `gyms_protect_billing_fields` runs on every `UPDATE gyms` and blocks direct changes to `billing_start_date`, `current_plan_id`, and now `billing_status`. A normal client-side update would be rejected:

```mermaid
flowchart LR
    A["UPDATE gyms\n(direct/client)"] --> B[gyms_protect_billing_fields trigger]
    B --> C{bypass flag set?}
    C -- No --> D[REJECT]
```

The trusted RPC sets a transaction-local flag first (third argument `true` = local to the transaction, auto-clears at commit):

```mermaid
flowchart LR
    A["change_gym_subscription_plan()"] --> B["set_config('app.allow_billing_field_change', 'true', true)"]
    B --> C["UPDATE gyms.current_plan_id"]
    C --> D[gyms_protect_billing_fields trigger]
    D --> E{bypass flag set?}
    E -- Yes --> F[ALLOW]
```

---

## 12. Cancellation & reactivation RPCs

### `cancel_gym_billing()`

Cancels only the outstanding **Pending** invoice — a already-**Paid** invoice (e.g. this month's) is left untouched — and moves the gym to `billing_status = Cancelled`. `current_plan_id` is deliberately kept so the owner's prior plan is on record.

```mermaid
flowchart TD
    Start["cancel_gym_billing()"] --> A[Find gym for current_user_id]
    A --> B{Gym found?}
    B -- No --> E1[ERROR]
    B -- Yes --> C["UPDATE gym_subscriptions\nSET status = 'Cancelled'\nWHERE status = 'Pending'"]
    C --> D["set_config('app.allow_billing_field_change', true, true)"]
    D --> E["UPDATE gyms\nbilling_status = 'Cancelled'"]
    E --> F["current_plan_id: untouched"]
```

Example outcome:

```text
August    → Paid       (untouched)
September → Cancelled  (was Pending)
billing_status → Cancelled
current_plan_id → unchanged
```

### `reactivate_gym_subscription()`

```mermaid
flowchart TD
    Start["reactivate_gym_subscription()"] --> A["billing_status: Cancelled → Pending"]
    A --> B[Calculate remaining days in period]
    B --> C[Create new prorated invoice]
    C --> D[(gym_subscriptions: Pending)]
    D --> E[Owner pays]
    E --> F["billing_status: Pending → Active"]
```

### `get_gym_billing_overview()` — now returns `billing_status`

This read-only RPC assembles the owner's full billing picture in one call: the gym row (including `billing_status` and `billing_start_date`), the current plan, the current Pending invoice (if any), and the most recent invoice regardless of status.

```mermaid
flowchart TD
    Start["get_gym_billing_overview()"] --> A[Find gym for current_user_id]
    A --> B{Gym found?}
    B -- No --> E1[ERROR]
    B -- Yes --> C[Load current plan, if current_plan_id set]
    C --> D["Load current invoice\nWHERE status = 'Pending'\nORDER BY billing_period_start DESC LIMIT 1"]
    D --> E["Load last invoice\nORDER BY billing_period_start DESC LIMIT 1"]
    E --> F["Return jsonb:\ngym (incl. billing_status)\nplan\ncurrent_invoice\nlast_invoice"]
```

---

## 13. Trial extension (admin/support operation)

```mermaid
flowchart TD
    A[Admin triggers extend_gym_trial] --> B[Find old billing_start_date]
    B --> C[Cancel old Pending first invoice, if any]
    C --> D["set_config('app.allow_billing_field_change', true, true)"]
    D --> E[UPDATE gyms.billing_start_date]
    E --> F[gyms_protect_billing_fields trigger → ALLOW]
    F --> G["New billing_start_date, e.g. 23 Sep → 10 Oct"]
    G --> H["Daily first-invoice cron eventually sees\nbilling_status = Trial AND billing_start_date <= today,\ncreates new first invoice"]
```

---

## 14. All triggers in the current design

### Trigger 1 — `gyms_set_billing_defaults`

- **Fires on:** `BEFORE INSERT` on `gyms`
- **Does:** sets `billing_start_date = signup + 1 month`, `current_plan_id = Basic` if NULL, and `billing_status = Trial`

```mermaid
flowchart LR
    A[INSERT gyms] --> B[BEFORE INSERT] --> C[gyms_set_billing_defaults] --> D[modify NEW row] --> E[INSERT continues]
```

### Trigger 2 — `gyms_protect_billing_fields`

- **Fires on:** `BEFORE UPDATE` on `gyms`
- **Protects:** `billing_start_date`, `current_plan_id`, `billing_status`
- **Bypassed only** by trusted RPCs via `set_config('app.allow_billing_field_change', 'true', true)`

```mermaid
flowchart LR
    A[UPDATE gyms] --> B[BEFORE UPDATE] --> C[gyms_protect_billing_fields]
    C --> D{bypass flag?}
    D -- false --> E[ERROR]
    D -- true --> F[ALLOW]
```

### Removed trigger — `gyms_generate_first_invoice_on_insert`

No longer exists. First-invoice creation moved from an insert-time trigger to the daily cron (`generate_first_gym_invoices()`), so gyms get a real free trial period before any invoice appears.

---

## 15. Complete RPC / function map

| Function                                 | Called by                        | When                             | Purpose                                                                         |
| ---------------------------------------- | -------------------------------- | -------------------------------- | ------------------------------------------------------------------------------- |
| `gyms_set_billing_defaults()`            | DB trigger                       | Gym INSERT                       | Set trial end, default plan, `billing_status = Trial`                           |
| `gyms_protect_billing_fields()`          | DB trigger                       | Gym UPDATE                       | Prevent direct changes to billing_start_date / current_plan_id / billing_status |
| `generate_first_gym_invoices()`          | Cron                             | Daily 02:30                      | Create first invoice for `Trial` gyms; flip `billing_status → Pending`          |
| `create_gym_invoice()`                   | First/monthly generator          | During invoice generation        | Actually create the invoice row                                                 |
| `generate_gym_subscription_invoices()`   | Cron                             | 1st of month, 03:00              | Create recurring invoices for `Active`/`Suspended` gyms                         |
| `create_subscription_payment_order()`    | Owner app                        | "Pay Now" click                  | Create Razorpay payment mapping                                                 |
| `record_subscription_payment_captured()` | Razorpay webhook                 | Payment captured                 | Capture payment + mark invoice Paid                                             |
| `mark_gym_subscription_paid()`           | Capture function                 | Successful payment               | Mark invoice Paid + update `billing_status → Active` if clear                   |
| `mark_overdue_gym_subscriptions()`       | Cron                             | Daily 04:00                      | Pending → Overdue + `billing_status → Suspended`                                |
| `change_gym_subscription_plan()`         | Owner app                        | Plan change                      | Change plan + recalc current invoice                                            |
| `recalculate_gym_invoice()`              | `change_gym_subscription_plan()` | During plan change               | Recompute amount/proration on locked invoice                                    |
| `cancel_gym_billing()`                   | Owner app / admin                | Owner cancels                    | Cancel Pending invoice, `billing_status → Cancelled`, keep `current_plan_id`    |
| `reactivate_gym_subscription()`          | Owner app / admin                | Owner returns after cancellation | `billing_status → Pending`, issue new prorated invoice                          |
| `get_gym_billing_overview()`             | Owner app                        | Billing page load                | Return gym + plan + current/last invoice, including `billing_status`            |
| `extend_gym_trial()`                     | Admin/backend                    | Trial extension                  | Push billing_start_date forward                                                 |

---

## 16. Master flow — everything together

```mermaid
flowchart TD
    subgraph Signup["Signup & Trial"]
        A[Gym signup] --> B[INSERT gyms]
        B --> C["BEFORE INSERT trigger:\ngyms_set_billing_defaults"]
        C --> D["Free trial — billing_status = Trial"]
    end

    subgraph FirstInvoice["First Invoice — Daily 02:30"]
        D --> E["generate_first_gym_invoices()"]
        E --> F{billing_start_date <= today\nAND no prior invoice?}
        F -- Yes --> G[Count members → get plan → calc amount + proration]
        G --> H["create_gym_invoice()"]
        H --> I["gym_subscriptions: Pending\nbilling_status: Trial → Pending"]
        I --> AA{Owner continues?}
        AA -- No --> AB["cancel_gym_billing()"]
        AB --> AC["billing_status → Cancelled\ncurrent_plan_id kept"]
        AC --> AD[Owner returns later]
        AD --> AE["reactivate_gym_subscription()"]
        AE --> AF["billing_status → Pending\nNew prorated invoice"]
    end

    subgraph Payment["Payment"]
        I --> J[Owner clicks Pay Now]
        J --> K["create_subscription_payment_order()"]
        K --> L[(subscription_payments: Created)]
        L --> M[Razorpay Checkout]
        M -->|captured| N[Webhook]
        N --> O["record_subscription_payment_captured()"]
        O --> P["mark_gym_subscription_paid()"]
        P --> Q{Other unpaid invoices?}
        Q -- No --> R["billing_status → Active"]
        Q -- Yes --> S["billing_status stays Suspended"]
    end

    subgraph Monthly["Monthly Recurring — 1st of month 03:00"]
        R --> T["generate_gym_subscription_invoices()"]
        T --> U["New Pending invoice each month\nbilling_status: Active → Pending"]
        U --> J
    end

    subgraph Overdue["Overdue — Daily 04:00"]
        U -->|due_date passed, unpaid| V["mark_overdue_gym_subscriptions()"]
        V --> W[Invoice: Pending → Overdue]
        W --> X["billing_status → Suspended"]
        X --> Y[Notification sent]
        Y --> J
    end

    subgraph Cancel["Cancellation (owner-initiated)"]
        R --> Z0["cancel_gym_billing()"]
        Z0 --> Z0b["billing_status → Cancelled\ncurrent_plan_id kept"]
    end

    subgraph PlanChange["Plan Change (owner-initiated, any time)"]
        Z1[Owner clicks Change Plan] --> Z2["change_gym_subscription_plan()"]
        Z2 --> Z3[Checks: is_gym_owner, plan active, invoice Pending + locked]
        Z3 --> Z4["set_config bypass"] --> Z5[UPDATE current_plan_id]
        Z5 --> Z6["recalculate_gym_invoice()"] --> Z7[Same invoice updated with new amount]
    end
```

---

## 17. Key takeaways

- **Billing state is now its own field.** `gyms.billing_status` (`Trial` / `Pending` / `Active` / `Suspended` / `Cancelled`) is separate from `gyms.status` (application/operational state) and from `gym_subscriptions.status` (per-invoice state). Query and index on the one that actually answers your question.
- **`current_plan_id` survives cancellation.** Cancelling billing never nulls out the plan — `Cancelled` is a distinct state, not the absence of a plan.
- **No insert-time invoice trigger anymore** — the first invoice is cron-driven, giving every gym a real 1-month trial before `billing_status` ever leaves `Trial`.
- **Three cron jobs drive the whole billing calendar:** first invoice (daily 02:30, targets `Trial` gyms), monthly recurring (1st @ 03:00, targets `Active`/`Suspended` gyms), overdue sweep (daily 04:00).
- **Two triggers only**, and both operate on `gyms`: one sets defaults (including `billing_status = Trial`) on insert, one protects billing fields — now including `billing_status` — on update.
- **`set_config()` with `is_local = true`** is the mechanism that lets trusted RPCs bypass the protection trigger for exactly one transaction.
- **Plan changes are no longer "fire and forget"** — they recalculate and update the _current_ Pending invoice in place (with proration), rather than leaving it untouched until the next billing cycle. Plan changes don't touch `billing_status`.
- **Paying an invoice never blindly reactivates a gym** — both `mark_gym_subscription_paid()` and the recovery-after-suspension path explicitly check for other unpaid invoices before moving `billing_status` to `Active`.
- **Cancellation → reactivation is a full loop**, not a dead end: `Active → Cancelled → Pending (reactivate) → Active (pay)`, with a fresh prorated invoice generated on reactivation rather than resuming old billing dates.
