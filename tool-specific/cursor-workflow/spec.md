# Specification

> **Purpose:** Authoritative functional and technical specification. Cursor must treat this as the source of truth for what to build.

## 1. System Overview

A MERN-stack support ticket management system with three core entities (User, Ticket, Comment), a governed ticket lifecycle, and REST API + React SPA front end.

**Architecture pattern:** Layered backend (routes → controllers → services → models) + React SPA consuming REST JSON.

## 2. Data Model

### 2.1 User

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Primary key |
| `name` | String | yes | Display name |
| `email` | String | yes | Unique, lowercase |
| `password` | String | stretch | Hashed; omit from API responses |
| `role` | String enum | stretch | `admin` \| `manager` \| `agent` \| `customer` |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Indexes:** `email` (unique)

### 2.2 Ticket

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Primary key |
| `title` | String | yes | Max 200 chars |
| `description` | String | yes | Max 5000 chars |
| `status` | String enum | yes | Default `open` |
| `priority` | String enum | yes | Default `medium` |
| `createdBy` | ObjectId → User | yes | Ticket creator |
| `assignedTo` | ObjectId → User | no | Nullable; must reference valid user |
| `createdAt` | Date | auto | |
| `updatedAt` | Date | auto | |

**Status enum:** `open` | `in_progress` | `resolved` | `closed` | `cancelled`

**Priority enum:** `low` | `medium` | `high`

**Indexes:** `status`, `createdBy`, `assignedTo`, text index on `title` + `description`

### 2.3 Comment

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Primary key |
| `ticketId` | ObjectId → Ticket | yes | Parent ticket |
| `authorId` | ObjectId → User | yes | Comment author |
| `body` | String | yes | Max 2000 chars; non-empty |
| `createdAt` | Date | auto | Append-only; no `updatedAt` |

**Indexes:** `ticketId`

## 3. Status State Machine

### 3.1 Transitions

| From | Allowed To |
|------|------------|
| `open` | `in_progress`, `cancelled` |
| `in_progress` | `resolved` |
| `resolved` | `closed` |
| `closed` | *(none — terminal)* |
| `cancelled` | *(none — terminal)* |

### 3.2 Rejected Examples (must return 409)

- `open → closed`
- `open → resolved`
- `resolved → cancelled`
- `resolved → in_progress`
- Any transition from `closed` or `cancelled`

### 3.3 Enforcement Rules

- Validation occurs in the **service layer** using a **pure `statusMachine` module**.
- On invalid transition: HTTP **409** with body:
  ```json
  {
    "error": {
      "code": "INVALID_TRANSITION",
      "message": "Invalid status transition: open → closed. Allowed from open: in_progress, cancelled"
    }
  }
  ```
- New tickets always start with status `open`.
- Same-status PATCH (no change) returns **200** without error.

### 3.4 State Diagram

```
         ┌──────────┐
         │   open   │
         └────┬─────┘
              │
     ┌────────┴────────┐
     ▼                 ▼
┌────────────┐   ┌───────────┐
│in_progress │   │ cancelled │ (terminal)
└─────┬──────┘   └───────────┘
      ▼
┌──────────┐
│ resolved │
└─────┬────┘
      ▼
┌──────────┐
│  closed  │ (terminal)
└──────────┘
```

## 4. API Specification

**Base path:** `/api`
**Content-Type:** `application/json`

### 4.1 Common Error Shape

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

### 4.2 HTTP Status Codes

| Code | Usage |
|------|-------|
| 200 | Successful GET, PATCH |
| 201 | Successful POST (create) |
| 400 | Validation failure |
| 401 | Unauthenticated (stretch) |
| 403 | Forbidden — permission denied (stretch) |
| 404 | Resource not found |
| 409 | Invalid status transition or conflict |
| 500 | Unexpected server error |

### 4.3 Ticket Endpoints

#### `GET /api/tickets`

List tickets with optional search and filter.

**Query parameters:**

| Param | Type | Description |
|-------|------|-------------|
| `search` | string | Case-insensitive match on `title` or `description` |
| `status` | string | Filter by exact status value |

**Response 200:**
```json
{
  "tickets": [ { /* ticket with populated createdBy, assignedTo */ } ],
  "total": 0
}
```

**Rules:** Empty `search` returns all (respecting `status` filter). Invalid `status` value → 400.

#### `POST /api/tickets`

Create a new ticket.

**Request body:**
```json
{
  "title": "string",
  "description": "string",
  "priority": "low | medium | high",
  "assignedTo": "userId (optional)"
}
```

**Response 201:** `{ "ticket": { ... } }` with `status: "open"`.

**Validation:** `title` and `description` required and non-empty. `assignedTo` must reference existing user if provided.

#### `GET /api/tickets/:id`

Return single ticket with comments.

**Response 200:** `{ "ticket": { ..., "comments": [ ... ] } }`
**Response 404:** Ticket not found.

#### `PATCH /api/tickets/:id`

Partial update. Supported fields: `title`, `description`, `priority`, `assignedTo`, `status`.

**Request body (any subset):**
```json
{
  "title": "string",
  "description": "string",
  "priority": "low | medium | high",
  "assignedTo": "userId | null",
  "status": "open | in_progress | resolved | closed | cancelled"
}
```

**Rules:**
- `assignedTo: null` unassigns the ticket.
- `assignedTo` must reference an existing user.
- `status` change triggers state machine validation.
- Returns updated ticket on 200.

### 4.4 Comment Endpoints

#### `POST /api/tickets/:id/comments`

Add a comment to a ticket.

**Request body:**
```json
{ "body": "string" }
```

**Response 201:** `{ "comment": { ... } }`
**Response 404:** Ticket not found.
**Response 400:** Empty `body`.

Comments are allowed on tickets in any status (including terminal).

### 4.5 Auth Endpoints (Stretch)

| Method | Path | Purpose |
|--------|------|---------|
| POST | `/api/auth/login` | Authenticate; return token or set session cookie |
| POST | `/api/auth/logout` | Invalidate session |
| GET | `/api/auth/me` | Return current user |

### 4.6 User Endpoints (Stretch)

| Method | Path | Purpose | Roles |
|--------|------|---------|-------|
| GET | `/api/users` | List users for assignee dropdown | agent+ |
| POST | `/api/users` | Create user | admin |

## 5. Permission Model (Stretch)

| Action | customer | agent | manager | admin |
|--------|----------|-------|---------|-------|
| Create ticket | own | yes | yes | yes |
| List tickets | own only | assigned + own | all | all |
| View ticket | own only | assigned + own | all | all |
| Update fields | own (limited) | assigned | all | all |
| Reassign | no | no | yes | yes |
| Change status | own (limited) | assigned | all | all |
| Add comment | own | assigned + own | all | all |
| Manage users | no | no | no | yes |

Enforce via `canAccessTicket(user, ticket)` and `canModifyTicket(user, ticket)` in the **service layer**.

## 6. UI Specification

### 6.1 Routes

| Route | Page | Description |
|-------|------|-------------|
| `/` | Ticket List | Default landing; search + filter |
| `/tickets/new` | Create Ticket | Form with validation |
| `/tickets/:id` | Ticket Detail | View, edit, status, comments |
| `/login` | Login | Stretch only |

### 6.2 Ticket List Page

- Table or card list showing: title, status, priority, assignee, created date
- Search input (debounced) — queries `?search=`
- Status filter dropdown — queries `?status=`
- "Create Ticket" button
- Click row → navigate to detail

### 6.3 Create Ticket Page

- Fields: title, description, priority
- Assignee dropdown (stretch / if users available)
- Client-side validation with inline errors
- Submit → POST → redirect to detail on success

### 6.4 Ticket Detail Page

- Display all ticket fields
- Edit mode for title, description, priority (PATCH)
- Assignee selector (PATCH `assignedTo`)
- Status action buttons — **only show transitions allowed from current status**
- Comment thread (chronological)
- Add comment form
- Error display for 409 invalid transitions

### 6.5 UI States

Every async view must handle: **loading**, **empty**, **error**, **success**.

## 7. Non-Functional Requirements

| Requirement | Standard |
|-------------|----------|
| Persistence | MongoDB; data survives server restart |
| Validation | Server-side on all write endpoints; client-side for UX only |
| Security | No secrets in repo; bcrypt for passwords (stretch) |
| CORS | Restrict to `CLIENT_URL` in development |
| Error handling | Consistent `{ error: { code, message } }` shape |
| Logging | Server errors logged; no passwords or tokens in logs |
| Testability | Pure status machine module; integration tests with real DB |
| Documentation | README must allow clone-to-run in under 15 minutes |

## 8. Seed Data Requirements

Seed script must create:

- At least 4 users (one per role if stretch is implemented)
- At least 6 tickets covering all statuses
- At least 3 comments on different tickets
- Demo credentials documented in README

## 9. Testing Requirements

### Mandatory (must pass before submission)

Integration tests for state machine — real HTTP requests against test DB:

| Scenario | Expected |
|----------|----------|
| `open → in_progress` | 200 |
| `open → cancelled` | 200 |
| `open → closed` | 409 |
| `in_progress → resolved` | 200 |
| `resolved → closed` | 200 |
| `resolved → cancelled` | 409 |
| `closed → in_progress` | 409 |
| `cancelled → open` | 409 |

### Recommended

- Unit tests for `statusMachine` pure functions
- Integration tests for CRUD, comments, search/filter
- Permission denial tests (stretch): customer accessing another user's ticket → 403

## 10. Documentation Deliverables

All root-level markdown files in the repository must be completed before submission. AI prompt history must be logged in `ai-prompts/`.
