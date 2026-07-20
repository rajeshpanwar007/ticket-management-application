# Seed Data: Users

> Four demo users — one per role.
> Inserted first; referenced by tickets and comments.

---

## Records

### U1 — Admin

| Field | Value |
|-------|-------|
| name | `Alex Admin` |
| email | `admin@demo.com` |
| password | `Demo@1234` (bcrypt hashed before insert) |
| role | `admin` |

**Purpose:** Full access; user management (stretch). Creates no tickets in seed.

---

### U2 — Manager

| Field | Value |
|-------|-------|
| name | `Morgan Manager` |
| email | `manager@demo.com` |
| password | `Demo@1234` |
| role | `manager` |

**Purpose:** Can reassign tickets; views all tickets (stretch). Creates T4 in seed.

---

### U3 — Agent

| Field | Value |
|-------|-------|
| name | `Bob Agent` |
| email | `agent@demo.com` |
| password | `Demo@1234` |
| role | `agent` |

**Purpose:** Assigned to T1, T2, T3. Authors C1, C2, C4, C5.

---

### U4 — Customer

| Field | Value |
|-------|-------|
| name | `Alice Customer` |
| email | `customer@demo.com` |
| password | `Demo@1234` |
| role | `customer` |

**Purpose:** Creates T1, T2, T5, T6, T7, T8. Authors C3, C6. Primary demo user for customer RBAC testing.

---

## Summary Table

| ID | Name | Email | Role | Creates Tickets | Assigned Tickets |
|----|------|-------|------|----------------|-----------------|
| U1 | Alex Admin | admin@demo.com | admin | — | — |
| U2 | Morgan Manager | manager@demo.com | manager | T4 | — |
| U3 | Bob Agent | agent@demo.com | agent | — | T1, T2, T3 |
| U4 | Alice Customer | customer@demo.com | customer | T1,T2,T5,T6,T7,T8 | — |

---

## Upsert Key

**Natural key:** `email`

Seed script upserts by email to prevent duplicate key errors on re-run (if using non-destructive strategy).

---

## Notes

- All passwords hashed with bcrypt (10 rounds) before `insertMany`
- `password` field has `select: false` — never returned in API responses
- Demo password `Demo@1234` must be documented in README with dev-only warning
