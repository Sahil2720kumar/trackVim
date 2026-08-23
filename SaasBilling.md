# TrackVim — SaaS Billing System Documentation

This document explains the complete gym subscription billing flow: trial → first invoice → payment → monthly recurring → overdue/suspension → plan changes. It covers **which triggers fire automatically**, **which RPCs are called explicitly**, and **which crons run on a schedule**.

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

## 2. End-to-end lifecycle overview

```mermaid
flowchart TD
    A[Owner signup] --> B[INSERT INTO gyms]
    B --> C{{"BEFORE INSERT trigger:\ngyms_set_billing_defaults"}}
    C --> D["billing_start_date = signup + 1 month\ncurrent_plan_id = Basic (if NULL)"]
    D --> E[Gym created — 1 month free trial]
    E --> F["DAILY CRON 02:30\ngenerate_first_gym_invoices()"]
    F --> G{billing_start_date <= today?}
    G -- No --> H[Nothing happens yet]
    G -- Yes --> I{Gym already has an invoice?}
    I -- Yes --> H
    I -- No --> J[Count active members]
    J --> K[Get current plan]
    K --> L[Calculate first-period amount + proration]
    L --> M["create_gym_invoice()"]
    M --> N[(gym_subscriptions\nstatus = Pending)]
```

> **Key design change:** there is **no trigger** that creates the first invoice on gym insert anymore. The old trigger `gyms_generate_first_invoice_on_insert` was removed. Instead: `INSERT gym → trial → daily cron → first invoice`.

---

## 3. Trial flow — owner inactivity, cancellation & reactivation

This traces the trial period through to its two possible outcomes: the owner pays and the gym goes live, or the owner never engages and the invoice/gym eventually gets manually shut down — with a path back in later.

```mermaid
flowchart TD
    A[Gym created] --> B["BEFORE INSERT trigger:\ngyms_set_billing_defaults"]
    B --> C["billing_start_date = today + 1 month"]
    B --> D["current_plan_id = Basic"]
    C --> E[TRIAL]
    D --> E
    E --> F[1 month passes]
    F --> G{billing_start_date <= current_date?}
    G -- Yes --> H["pg_cron 02:30 daily"]
    H --> I["generate_first_gym_invoices()"]
    I --> J["create_gym_invoice()"]
    J --> K["First invoice: Pending"]
    K --> L{Owner continues?}
    L -- Yes --> M[Owner pays]
    M --> N[Invoice: Paid]
    L -- No --> O[Owner doesn't use the application]
    O --> P[MANUALLY CANCEL INVOICE]
    P --> Q[Gym: Suspended]
    Q --> R[No further invoices generated]
    R --> S[Owner returns later]
    S --> T["reactivate_gym_subscription()"]
    T --> U[New prorated invoice]
```

### Notes on this path

- The trial itself needs **no invoice** — `gyms_set_billing_defaults` only stamps `billing_start_date` and the default `Basic` plan; the daily cron is what turns trial-end into an actual Pending invoice.
- If the owner simply goes quiet, TrackVim doesn't auto-generate invoices forever against a dead gym — the first Pending invoice is **manually cancelled** (support/admin action) rather than left to age into Overdue indefinitely, and the gym is marked **Suspended** directly.
- Once suspended this way, the monthly cron (`generate_gym_subscription_invoices()`) has nothing to act on — no invoice history means no recurring billing starts.
- Coming back is a distinct RPC, `reactivate_gym_subscription()`, not a resumption of the original trial: it issues a **new prorated invoice** reflecting the current plan and today's date, rather than resurrecting the old billing_start_date.

---

## 4. First invoice generation (daily cron, 02:30)

```mermaid
flowchart TD
    Start(["CRON 02:30\ngenerate_first_gym_invoices()"]) --> F1[Find eligible gyms]
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
```

---

## 5. Monthly recurring invoices (cron, 1st of month 03:00)

```mermaid
flowchart TD
    Start(["CRON 03:00 on 1st\ngenerate_gym_subscription_invoices()"]) --> F1[Find gyms]
    F1 --> C1{billing_start_date <= period_start?}
    C1 -- No --> Skip1[Skip]
    C1 -- Yes --> C2{Gym has an invoice already?}
    C2 -- No --> Skip2[Skip]
    C2 -- Yes --> P1[Count active members]
    P1 --> P2[Get current plan]
    P2 --> P3[Full calendar month]
    P3 --> P4["create_gym_invoice()"]
    P4 --> P5[(gym_subscriptions\nstatus = Pending)]
```

**Division of responsibility:**

- `generate_first_gym_invoices()` → the **first** invoice only
- `generate_gym_subscription_invoices()` → **all future** monthly invoices

Both ultimately call the shared `create_gym_invoice()` RPC, which is the central invoice-creation function (takes the plan + member snapshot and creates the invoice row).

---

## 6. Owner pays: Billing → Pay Now → Razorpay

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

## 7. Razorpay payment capture → webhook → RPC chain

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

Its job in one line: **Razorpay order → find TrackVim payment → mark payment Captured → find TrackVim invoice → mark invoice Paid.** It's the bridge between the external payment gateway and TrackVim's internal billing state.

### `mark_gym_subscription_paid()`

```mermaid
flowchart TD
    Start["mark_gym_subscription_paid(invoice_id)"] --> A[Find invoice]
    A --> B[FOR UPDATE lock]
    B --> C[Invoice status = Paid]
    C --> D{Any other Pending/Overdue\ninvoices for this gym?}
    D -- Yes --> E[Gym stays Suspended\n— no change]
    D -- No --> F["gyms.status:\nSuspended → Active"]
```

> Paying **one** overdue invoice does not blindly reactivate the gym — the function checks whether anything else is unpaid first.

---

## 8. Overdue & suspension flow (daily cron, 04:00)

```mermaid
flowchart TD
    Start(["CRON 04:00 daily\nmark_overdue_gym_subscriptions()"]) --> A["Find gym_subscriptions WHERE\nstatus = Pending AND due_date < current_date"]
    A --> B[UPDATE invoice: Pending → Overdue]
    B --> C[UPDATE gyms: Active → Suspended]
    C --> D["INSERT notification:\n'Payment overdue — access suspended'"]
```

### Recovery after suspension

```mermaid
flowchart TD
    A[Gym: Suspended] --> B[Owner pays Overdue invoice]
    B --> C[Razorpay payment.captured webhook]
    C --> D["record_subscription_payment_captured()"]
    D --> E["subscription_payments:\nCreated → Captured"]
    E --> F["mark_gym_subscription_paid()"]
    F --> G["Invoice: Overdue → Paid"]
    G --> H{Other Pending/Overdue\ninvoices remain?}
    H -- Yes --> I[Gym remains Suspended]
    H -- No --> J[Gym becomes Active]
```

---

## 9. Plan change flow (updated)

The owner changes their subscription plan from Settings. Unlike earlier revisions of this flow, the **current invoice is now recalculated in place** rather than left untouched — the plan change is reflected immediately on the active Pending invoice via proration.

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

The protection trigger `gyms_protect_billing_fields` runs on every `UPDATE gyms` and blocks direct changes to `billing_start_date` and `current_plan_id`. A normal client-side update would be rejected:

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

## 10. Trial extension (admin/support operation)

```mermaid
flowchart TD
    A[Admin triggers extend_gym_trial] --> B[Find old billing_start_date]
    B --> C[Cancel old Pending first invoice, if any]
    C --> D["set_config('app.allow_billing_field_change', true, true)"]
    D --> E[UPDATE gyms.billing_start_date]
    E --> F[gyms_protect_billing_fields trigger → ALLOW]
    F --> G["New billing_start_date, e.g. 23 Sep → 10 Oct"]
    G --> H["Daily first-invoice cron eventually sees\nbilling_start_date <= today and creates new first invoice"]
```

---

## 11. All triggers in the current design

### Trigger 1 — `gyms_set_billing_defaults`

- **Fires on:** `BEFORE INSERT` on `gyms`
- **Does:** sets `billing_start_date = signup + 1 month`, and `current_plan_id = Basic` if NULL

```mermaid
flowchart LR
    A[INSERT gyms] --> B[BEFORE INSERT] --> C[gyms_set_billing_defaults] --> D[modify NEW row] --> E[INSERT continues]
```

### Trigger 2 — `gyms_protect_billing_fields`

- **Fires on:** `BEFORE UPDATE` on `gyms`
- **Protects:** `billing_start_date`, `current_plan_id`
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

## 12. Complete RPC / function map

| Function                                 | Called by                        | When                                               | Purpose                                          |
| ---------------------------------------- | -------------------------------- | -------------------------------------------------- | ------------------------------------------------ |
| `gyms_set_billing_defaults()`            | DB trigger                       | Gym INSERT                                         | Set trial end + default plan                     |
| `gyms_protect_billing_fields()`          | DB trigger                       | Gym UPDATE                                         | Prevent direct billing field changes             |
| `generate_first_gym_invoices()`          | Cron                             | Daily 02:30                                        | Create first invoice                             |
| `create_gym_invoice()`                   | First/monthly generator          | During invoice generation                          | Actually create the invoice row                  |
| `generate_gym_subscription_invoices()`   | Cron                             | 1st of month, 03:00                                | Create recurring invoices                        |
| `create_subscription_payment_order()`    | Owner app                        | "Pay Now" click                                    | Create Razorpay payment mapping                  |
| `record_subscription_payment_captured()` | Razorpay webhook                 | Payment captured                                   | Capture payment + mark invoice Paid              |
| `mark_gym_subscription_paid()`           | Capture function                 | Successful payment                                 | Mark invoice Paid + restore gym if clear         |
| `mark_overdue_gym_subscriptions()`       | Cron                             | Daily 04:00                                        | Pending → Overdue + suspend gym                  |
| `change_gym_subscription_plan()`         | Owner app                        | Plan change                                        | Change plan + recalc current invoice             |
| `recalculate_gym_invoice()`              | `change_gym_subscription_plan()` | During plan change                                 | Recompute amount/proration on locked invoice     |
| `extend_gym_trial()`                     | Admin/backend                    | Trial extension                                    | Push billing_start_date forward                  |
| `reactivate_gym_subscription()`          | Admin/backend                    | Owner returns after inactivity-driven cancellation | Issue new prorated invoice, lift suspension path |

---

## 13. Master flow — everything together

```mermaid
flowchart TD
    subgraph Signup["Signup & Trial"]
        A[Gym signup] --> B[INSERT gyms]
        B --> C["BEFORE INSERT trigger:\ngyms_set_billing_defaults"]
        C --> D[Free trial — 1 month]
    end

    subgraph FirstInvoice["First Invoice — Daily 02:30"]
        D --> E["generate_first_gym_invoices()"]
        E --> F{billing_start_date <= today\nAND no prior invoice?}
        F -- Yes --> G[Count members → get plan → calc amount + proration]
        G --> H["create_gym_invoice()"]
        H --> I[(gym_subscriptions: Pending)]
        I --> AA{Owner continues?}
        AA -- No --> AB[Manually cancel invoice]
        AB --> AC[Gym: Suspended, no further invoices]
        AC --> AD[Owner returns later]
        AD --> AE["reactivate_gym_subscription()"]
        AE --> AF[New prorated invoice]
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
        Q -- No --> R[Gym: Active]
        Q -- Yes --> S[Gym: stays Suspended]
    end

    subgraph Monthly["Monthly Recurring — 1st of month 03:00"]
        R --> T["generate_gym_subscription_invoices()"]
        T --> U[(New Pending invoice each month)]
        U --> J
    end

    subgraph Overdue["Overdue — Daily 04:00"]
        U -->|due_date passed, unpaid| V["mark_overdue_gym_subscriptions()"]
        V --> W[Invoice: Pending → Overdue]
        W --> X[Gym: Active → Suspended]
        X --> Y[Notification sent]
        Y --> J
    end

    subgraph PlanChange["Plan Change (owner-initiated, any time)"]
        Z1[Owner clicks Change Plan] --> Z2["change_gym_subscription_plan()"]
        Z2 --> Z3[Checks: is_gym_owner, plan active, invoice Pending + locked]
        Z3 --> Z4["set_config bypass"] --> Z5[UPDATE current_plan_id]
        Z5 --> Z6["recalculate_gym_invoice()"] --> Z7[Same invoice updated with new amount]
    end
```

---

## 14. Key takeaways

- **No insert-time invoice trigger anymore** — the first invoice is cron-driven, giving every gym a real 1-month trial.
- **Three cron jobs drive the whole billing calendar:** first invoice (daily 02:30), monthly recurring (1st @ 03:00), overdue sweep (daily 04:00).
- **Two triggers only**, and both operate on `gyms`: one sets defaults on insert, one protects billing fields on update.
- **`set_config()` with `is_local = true`** is the mechanism that lets trusted RPCs bypass the protection trigger for exactly one transaction.
- **Plan changes are no longer "fire and forget"** — they recalculate and update the _current_ Pending invoice in place (with proration), rather than leaving it untouched until the next billing cycle.
- **Paying an invoice never blindly reactivates a gym** — both `mark_gym_subscription_paid()` and the recovery-after-suspension path explicitly check for other unpaid invoices first.
