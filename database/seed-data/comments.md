# Seed Data: Comments

> Six demo comments across four tickets.
> Inserted after tickets and users.

---

## Records

### C1 — On T1 (Agent response)

| Field | Value |
|-------|-------|
| ticketId | T1 (Cannot login to account) |
| authorId | U3 (Bob Agent) |
| body | `Hi Alice, I can see your account is locked due to multiple failed login attempts. I'll unlock it now.` |
| createdAt | T1.createdAt + 30 minutes |

**Test use:** Verify comment appears on T1 detail; agent-authored comment

---

### C2 — On T1 (Agent follow-up)

| Field | Value |
|-------|-------|
| ticketId | T1 |
| authorId | U3 (Bob Agent) |
| body | `Your account has been unlocked. Please try logging in again and let me know if the issue persists.` |
| createdAt | T1.createdAt + 45 minutes |

**Test use:** Multiple comments on same ticket; chronological ordering

---

### C3 — On T1 (Customer reply)

| Field | Value |
|-------|-------|
| ticketId | T1 |
| authorId | U4 (Alice Customer) |
| body | `Thanks Bob! I was able to login successfully now.` |
| createdAt | T1.createdAt + 60 minutes |

**Test use:** Customer-authored comment; thread has 3 messages

---

### C4 — On T2 (Agent update)

| Field | Value |
|-------|-------|
| ticketId | T2 (Password reset email) |
| authorId | U3 (Bob Agent) |
| body | `I've checked the email delivery logs. The reset email was sent but bounced due to a full mailbox. Please clear some space and request a new reset.` |
| createdAt | T2.createdAt + 20 minutes |

**Test use:** Comment on in_progress ticket

---

### C5 — On T3 (Resolution note)

| Field | Value |
|-------|-------|
| ticketId | T3 (Dashboard loading slowly) |
| authorId | U3 (Bob Agent) |
| body | `Identified a slow database query on the dashboard. Deployed a fix in v2.3.1. Please confirm the dashboard loads normally now.` |
| createdAt | T3.createdAt + 2 hours |

**Test use:** Comment on resolved ticket

---

### C6 — On T4 (Closing note on closed ticket)

| Field | Value |
|-------|-------|
| ticketId | T4 (Billing discrepancy — closed) |
| authorId | U2 (Morgan Manager) |
| body | `Refund of $49.99 has been processed. Invoice #1234 has been corrected. Closing this ticket.` |
| createdAt | T4.createdAt + 3 days |

**Test use:** Comment allowed on terminal (closed) ticket; manager-authored comment

---

## Summary Table

| ID | Ticket | Author | Role | Body (truncated) |
|----|--------|--------|------|-----------------|
| C1 | T1 | U3 Bob Agent | agent | Account locked, unlocking now |
| C2 | T1 | U3 Bob Agent | agent | Account unlocked, try again |
| C3 | T1 | U4 Alice Customer | customer | Login successful, thanks |
| C4 | T2 | U3 Bob Agent | agent | Email bounced, clear mailbox |
| C5 | T3 | U3 Bob Agent | agent | DB query fix deployed |
| C6 | T4 | U2 Morgan Manager | manager | Refund processed, closing |

---

## Comments per Ticket

| Ticket | Status | Comment Count | IDs |
|--------|--------|--------------|-----|
| T1 | open | 3 | C1, C2, C3 |
| T2 | in_progress | 1 | C4 |
| T3 | resolved | 1 | C5 |
| T4 | closed | 1 | C6 |
| T5 | open | 0 | — |
| T6 | cancelled | 0 | — |
| T7 | open | 0 | — |
| T8 | open | 0 | — |

**Why some tickets have no comments:** Tests create-comment flow (AC-6) on T5, T7, or T8 without conflicting with existing seed data.

---

## Thread Ordering Test

`GET /api/tickets/T1-id` must return comments in order: C1 → C2 → C3 (ascending `createdAt`).

---

## Notes

- `createdAt` values set relative to parent ticket `createdAt` for realistic chronology
- Comments are append-only — no edit or delete in seed or core API
- C6 on closed ticket T4 confirms comments are allowed on terminal-status tickets
