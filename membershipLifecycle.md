# TrackVim membership lifecycle

Full state machine covering enrollment, payment verification, rejection retry, and renewal — normal members and walk-ins both flow through the same payment pipeline.

```mermaid
flowchart TD
    A[Member enters gym] --> B{Normal or walk-in?}

    B -->|Normal member<br/>has TrackVim account| C["membership_application()<br/>Pending"]
    B -->|Walk-in member<br/>no account| D["create_walkin_member()<br/>Created directly"]

    C --> E["Owner approves<br/>approve_membership_application()"]
    E --> F["Membership: PaymentPending"]
    D --> F

    F --> G["Payment: Pending"]
    G --> H{Normal or walk-in?}

    H -->|Normal member| I["submit_payment()<br/>Uploads txn ref, screenshot, notes"]
    H -->|Walk-in member| J["record_walkin_payment()<br/>Staff receives payment"]

    I --> K["Payment: PendingVerification"]
    J --> K
    K --> L["Membership: PaymentUploaded"]
    L --> M{Owner reviews}

    M -->|Reject| N["reject_payment()<br/>Payment: Rejected"]
    M -->|Verify| O["verify_payment()<br/>Payment: Verified"]

    N --> P["Membership: PaymentRejected"]
    O --> Q["Membership: Active"]

    Q --> R["Use gym<br/>check_in_or_out()"]
    R --> Q

    P -.->|Member resubmits payment| G
    Q -.->|Owner clicks Renew| S["renew_membership()"]
    S --> T["New membership: PaymentPending"]
    T --> G

    style F fill:#FF5A1F,color:#fff
    style Q fill:#0F6E56,color:#fff
    style P fill:#993C1D,color:#fff
    style K fill:#EF9F27,color:#000
```

## Legend

- **Solid arrows** — the forward, one-time path a payment/application takes on its first attempt.
- **Dashed arrows** — retry loops: a rejected payment goes back into `Payment: Pending`, and an active membership loops back through the same pipeline on renewal.
- Both **normal members** and **walk-ins** merge into identical downstream states (`PaymentPending`, `PendingVerification`, `Active`) — the only difference is _who_ triggers the transition (member vs. staff/owner).
- `check_in_or_out()` doesn't change membership state — an active member can check in/out indefinitely until renewal is triggered.

## Key functions

| Function                           | Triggered by  | Effect                                            |
| ---------------------------------- | ------------- | ------------------------------------------------- |
| `membership_application()`         | Normal member | Creates application in `Pending`                  |
| `create_walkin_member()`           | Staff         | Creates member directly, skips application        |
| `approve_membership_application()` | Owner         | Moves application → `PaymentPending`              |
| `submit_payment()`                 | Normal member | Uploads proof → `PendingVerification`             |
| `record_walkin_payment()`          | Staff         | Records payment → `PendingVerification`           |
| `verify_payment()`                 | Owner         | Payment `Verified` → Membership `Active`          |
| `reject_payment()`                 | Owner         | Payment `Rejected` → Membership `PaymentRejected` |
| `check_in_or_out()`                | Member/staff  | Attendance only, no state change                  |
| `renew_membership()`               | Owner         | Spins up new `PaymentPending` cycle               |


 
## 3. Early renewal
 
The key idea: renewing doesn't touch the old membership. It creates a second membership row that runs the *same* payment flow, then sits as `Scheduled` until its start date, at which point a cron-style job flips both records over.
 
```mermaid
flowchart TD
    A["OLD membership: Active"] -->|Owner renews early| B["renew_membership()"]
    B --> C["OLD membership<br/>remains Active"]
    B --> D["NEW membership: PaymentPending<br/>NEW payment: Pending"]
 
    D --> E["Same payment flow<br/>(submit_payment / record_walkin_payment<br/>→ PendingVerification → verify_payment)"]
 
    E --> F{start_date vs. today}
    F -->|start_date > today, typical| G["NEW membership: Scheduled"]
    F -->|start_date <= today| H["NEW membership: Active immediately"]
 
    G -->|start_date arrives| I["activate_scheduled_memberships()"]
    I --> J["OLD membership → Expired"]
    I --> K["NEW membership → Active"]
    K --> L["active_gym_membership_id<br/>now points to NEW membership"]
    H --> L
 
    style A fill:#0F6E56,color:#fff
    style C fill:#0F6E56,color:#fff
    style G fill:#EF9F27,color:#000
    style J fill:#993C1D,color:#fff
    style K fill:#0F6E56,color:#fff
    style L fill:#FF5A1F,color:#fff
```
 
---
 