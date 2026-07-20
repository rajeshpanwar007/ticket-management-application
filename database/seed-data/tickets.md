# Seed Data: Tickets

> Eight demo tickets covering all statuses and search test cases.
> Inserted after users; references user `_id` values from seed.

---

## Status Coverage

| Status | Ticket ID | Title |
|--------|-----------|-------|
| `open` | T1, T5 | See below |
| `in_progress` | T2 | See below |
| `resolved` | T3 | See below |
| `closed` | T4 | See below |
| `cancelled` | T6 | See below |

T7 and T8 provide additional search test data.

---

## Records

### T1 — Open (high priority, assigned)

| Field | Value |
|-------|-------|
| title | `Cannot login to account` |
| description | `Getting a 401 error when trying to login since yesterday. Tried clearing cookies and using a different browser.` |
| status | `open` |
| priority | `high` |
| createdBy | U4 (Alice Customer) |
| assignedTo | U3 (Bob Agent) |

**Test use:** Transition `open → in_progress` (AC-7 T1); search keyword `login` (AC-8)

---

### T2 — In Progress (medium priority, assigned)

| Field | Value |
|-------|-------|
| title | `Password reset email not received` |
| description | `Requested a password reset 2 hours ago but no email arrived. Checked spam folder.` |
| status | `in_progress` |
| priority | `medium` |
| createdBy | U4 (Alice Customer) |
| assignedTo | U3 (Bob Agent) |

**Test use:** Transition `in_progress → resolved` (AC-7 T4); filter `status=in_progress`

---

### T3 — Resolved (low priority, assigned)

| Field | Value |
|-------|-------|
| title | `Dashboard loading slowly` |
| description | `Dashboard takes over 30 seconds to load. Started after the last deployment.` |
| status | `resolved` |
| priority | `low` |
| createdBy | U4 (Alice Customer) |
| assignedTo | U3 (Bob Agent) |

**Test use:** Transition `resolved → closed` (AC-7 T5); reject `resolved → cancelled` (AC-7 T6)

---

### T4 — Closed (medium priority, unassigned)

| Field | Value |
|-------|-------|
| title | `Billing discrepancy on invoice` |
| description | `Invoice #1234 shows a charge for a service I cancelled last month.` |
| status | `closed` |
| priority | `medium` |
| createdBy | U2 (Morgan Manager) |
| assignedTo | null |

**Test use:** Reject any transition from `closed` (AC-7 T7); filter `status=closed`

---

### T5 — Open (low priority, unassigned)

| Field | Value |
|-------|-------|
| title | `Feature request: export to CSV` |
| description | `Would like the ability to export ticket history to CSV format for reporting.` |
| status | `open` |
| priority | `low` |
| createdBy | U4 (Alice Customer) |
| assignedTo | null |

**Test use:** Reassign to Bob Agent; transition `open → cancelled` (AC-7 T2); search `export` (AC-8)

---

### T6 — Cancelled (medium priority, unassigned)

| Field | Value |
|-------|-------|
| title | `Duplicate ticket - please ignore` |
| description | `Accidentally created a duplicate of T1. Please cancel this one.` |
| status | `cancelled` |
| priority | `medium` |
| createdBy | U4 (Alice Customer) |
| assignedTo | null |

**Test use:** Reject any transition from `cancelled` (AC-7 T8); filter `status=cancelled`

---

### T7 — Open (high priority, unassigned)

| Field | Value |
|-------|-------|
| title | `API integration timeout errors` |
| description | `Third-party API calls are timing out after 5 seconds. Started this morning around 9am.` |
| status | `open` |
| priority | `high` |
| createdBy | U4 (Alice Customer) |
| assignedTo | null |

**Test use:** Search keyword `API` or `timeout` (AC-8); reject `open → closed` (AC-7 T3)

---

### T8 — Open (medium priority, unassigned)

| Field | Value |
|-------|-------|
| title | `Mobile app crashes on startup` |
| description | `App crashes immediately on launch on iOS 17. Works fine on Android.` |
| status | `open` |
| priority | `medium` |
| createdBy | U4 (Alice Customer) |
| assignedTo | null |

**Test use:** Search keyword `mobile` or `crash` (AC-8); create/update tests

---

## Summary Table

| ID | Title (short) | Status | Priority | Created By | Assigned To |
|----|--------------|--------|----------|------------|-------------|
| T1 | Cannot login | open | high | U4 Customer | U3 Agent |
| T2 | Password reset | in_progress | medium | U4 Customer | U3 Agent |
| T3 | Dashboard slow | resolved | low | U4 Customer | U3 Agent |
| T4 | Billing discrepancy | closed | medium | U2 Manager | null |
| T5 | Export CSV request | open | low | U4 Customer | null |
| T6 | Duplicate ticket | cancelled | medium | U4 Customer | null |
| T7 | API timeout | open | high | U4 Customer | null |
| T8 | Mobile app crash | open | medium | U4 Customer | null |

---

## State Machine Test Matrix (from seed state)

| Ticket | Current Status | Valid Next Action | Invalid Action (expect 409) |
|--------|---------------|-------------------|----------------------------|
| T1 | open | → in_progress | → closed |
| T2 | in_progress | → resolved | → cancelled |
| T3 | resolved | → closed | → cancelled |
| T4 | closed | none | → in_progress |
| T5 | open | → cancelled | → closed |
| T6 | cancelled | none | → open |
| T7 | open | → in_progress | → closed |
| T8 | open | → in_progress | → resolved |

---

## Search Test Cases

| Query | Expected Matches |
|-------|-----------------|
| `search=login` | T1 |
| `search=password` | T2 |
| `search=API` | T7 |
| `search=mobile` | T8 |
| `search=export` | T5 |
| `status=open` | T1, T5, T7, T8 (4 tickets) |
| `status=open&search=login` | T1 only |
| `search=nonexistent` | 0 tickets |

---

## Notes

- All new tickets created via API also start as `open` regardless of seed
- `assignedTo: null` means unassigned — test reassign flow with T5, T7, or T8
- T4 created by Manager (not Customer) — useful for RBAC list-filter testing (stretch)
