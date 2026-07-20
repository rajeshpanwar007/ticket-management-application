# Acceptance Criteria

> **Purpose:** Testable definitions for all core acceptance criteria. Cursor must verify each AC before marking a phase complete.

## Validation Approach

Each criterion is validated by:
1. **API test** — request/response against Express endpoints
2. **UI test** — manual browser verification
3. **Automated test** — unit or integration test (where marked mandatory)

Update the **Status** column in the summary table as work progresses.

---

## AC-1: Create Ticket

**Definition:** A client can create a new support ticket via the API and UI. The ticket is persisted with status `open`.

**API:**
- `POST /api/tickets` with `{ title, description, priority? }` returns **201**
- Response includes `{ ticket: { _id, title, description, status: "open", ... } }`
- Missing `title` or `description` → **400**

**UI:**
- Create form submits successfully and redirects to ticket detail

**Test evidence:** Integration test or manual Postman check

| Status |
|--------|
| [ ] Not verified |

---

## AC-2: List Tickets

**Definition:** A client can retrieve a list of all tickets.

**API:**
- `GET /api/tickets` returns **200** with `{ tickets: [...], total: N }`
- Each ticket includes populated `createdBy` and `assignedTo` (or null)

**UI:**
- Ticket list page renders all tickets in a table or card layout

**Test evidence:** Manual or integration test

| Status |
|--------|
| [ ] Not verified |

---

## AC-3: Ticket Detail

**Definition:** A client can view a single ticket with full details and its comment thread.

**API:**
- `GET /api/tickets/:id` returns **200** with `{ ticket: { ..., comments: [...] } }`
- Non-existent ID → **404**

**UI:**
- Detail page shows title, description, status, priority, assignee, dates, comments

**Test evidence:** Manual or integration test

| Status |
|--------|
| [ ] Not verified |

---

## AC-4: Update Ticket

**Definition:** A client can update mutable ticket fields (title, description, priority).

**API:**
- `PATCH /api/tickets/:id` with `{ title?, description?, priority? }` returns **200**
- Empty `title` or `description` → **400**
- Non-existent ID → **404**

**UI:**
- Edit form on detail page saves changes and reflects updated values

**Test evidence:** Manual or integration test

| Status |
|--------|
| [ ] Not verified |

---

## AC-5: Reassign Ticket

**Definition:** A client can change the assignee of a ticket.

**API:**
- `PATCH /api/tickets/:id` with `{ assignedTo: "userId" }` returns **200** with updated assignee
- `PATCH` with `{ assignedTo: null }` unassigns the ticket
- Non-existent `assignedTo` user ID → **400** or **404**
- Non-existent ticket ID → **404**

**UI:**
- Assignee dropdown on detail page updates assignee on save

**Test evidence:** Manual or integration test

| Status |
|--------|
| [ ] Not verified |

---

## AC-6: Add Comment

**Definition:** A client can add a comment to an existing ticket.

**API:**
- `POST /api/tickets/:id/comments` with `{ body }` returns **201** with `{ comment: { ... } }`
- Empty `body` → **400**
- Non-existent ticket → **404**
- Comment appears in subsequent `GET /api/tickets/:id` response

**UI:**
- Comment form on detail page adds to thread without full page reload (or with refresh)

**Test evidence:** Manual or integration test

| Status |
|--------|
| [ ] Not verified |

---

## AC-7: Status Machine Enforced (Mandatory Test Tier)

**Definition:** Ticket status transitions follow the defined state machine. Invalid transitions are rejected server-side with HTTP 409.

**Allowed transitions:**
- `open → in_progress`
- `open → cancelled`
- `in_progress → resolved`
- `resolved → closed`

**Rejected transitions (must return 409):**
- `open → closed`
- `open → resolved`
- `resolved → cancelled`
- Any transition from `closed` or `cancelled`

**API error shape on 409:**
```json
{
  "error": {
    "code": "INVALID_TRANSITION",
    "message": "Invalid status transition: open → closed. Allowed from open: in_progress, cancelled"
  }
}
```

**Mandatory automated tests (must all pass):**

| # | Transition | Expected HTTP |
|---|------------|---------------|
| T1 | `open → in_progress` | 200 |
| T2 | `open → cancelled` | 200 |
| T3 | `open → closed` | 409 |
| T4 | `in_progress → resolved` | 200 |
| T5 | `resolved → closed` | 200 |
| T6 | `resolved → cancelled` | 409 |
| T7 | `closed → in_progress` | 409 |
| T8 | `cancelled → open` | 409 |

**UI:**
- Status action buttons show only valid next states
- 409 error displayed clearly to user

| Status |
|--------|
| [ ] Not verified |

---

## AC-8: Search and Filter

**Definition:** The ticket list supports keyword search and status filtering via query parameters.

**API:**
- `GET /api/tickets?search=keyword` returns tickets where `title` or `description` contains keyword (case-insensitive)
- `GET /api/tickets?status=open` returns only tickets with that status
- `GET /api/tickets?search=keyword&status=open` applies both filters (AND)
- Invalid `status` value → **400**
- No matches → **200** with empty array

**UI:**
- Search input and status dropdown update the list

**Test evidence:** Integration test or manual check with seeded data

| Status |
|--------|
| [ ] Not verified |

---

## AC-9: Persistence

**Definition:** All data is stored in MongoDB and survives server restart.

**Verification steps:**
1. Create tickets and comments via API or UI
2. Stop the Express server
3. Restart the Express server
4. `GET /api/tickets` returns previously created data

**Requirements:**
- No in-memory storage for tickets, comments, or users
- MongoDB connection via `MONGODB_URI` environment variable

| Status |
|--------|
| [ ] Not verified |

---

## AC-10: Validation

**Definition:** All write endpoints validate input and return structured 400 errors for invalid data.

**Required validations:**

| Endpoint | Rule | Error |
|----------|------|-------|
| POST /api/tickets | title required, non-empty | 400 |
| POST /api/tickets | description required, non-empty | 400 |
| POST /api/tickets | priority must be enum if provided | 400 |
| PATCH /api/tickets/:id | same field rules as create | 400 |
| PATCH /api/tickets/:id | status must be valid enum | 400 |
| POST /api/tickets/:id/comments | body required, non-empty | 400 |
| All | non-existent resource ID | 404 |

**Error shape:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": { "title": "Title is required" }
  }
}
```

| Status |
|--------|
| [ ] Not verified |

---

## Stretch Criteria (Optional)

| ID | Criterion | Status |
|----|-----------|--------|
| S-1 | Login / logout works end-to-end | [ ] |
| S-2 | Customer sees only own tickets at API layer | [ ] |
| S-3 | Agent can only modify assigned tickets | [ ] |
| S-4 | Manager can reassign any ticket | [ ] |
| S-5 | Admin can manage users | [ ] |
| S-6 | Unauthenticated requests to protected routes → 401 | [ ] |
| S-7 | Permission denied → 403 | [ ] |

---

## Summary Table

| AC | Description | API | UI | Automated Test | Status |
|----|-------------|-----|----|--------------:|--------|
| AC-1 | Create ticket | POST /api/tickets | Create form | Optional | [ ] |
| AC-2 | List tickets | GET /api/tickets | List page | Optional | [ ] |
| AC-3 | Ticket detail | GET /api/tickets/:id | Detail page | Optional | [ ] |
| AC-4 | Update ticket | PATCH /api/tickets/:id | Edit form | Optional | [ ] |
| AC-5 | Reassign ticket | PATCH assignedTo | Assignee dropdown | Optional | [ ] |
| AC-6 | Add comment | POST comments | Comment form | Optional | [ ] |
| AC-7 | State machine | PATCH status | Status buttons | **Mandatory** | [ ] |
| AC-8 | Search & filter | Query params | Search/filter UI | Optional | [ ] |
| AC-9 | Persistence | MongoDB | — | Manual restart | [ ] |
| AC-10 | Validation | 400 responses | Form errors | Optional | [ ] |

---

## Pre-Submission Checklist

- [ ] All 10 core ACs marked verified
- [ ] All 8 mandatory state-machine tests pass
- [ ] `test-results.md` updated with evidence
- [ ] Root `acceptance-criteria.md` synced with this file
- [ ] `pr-description.md` AC checklist completed
