# AI Usage — Design Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: Architecture, data model, API contract, UI design

This document records AI prompts used during the design phase, including what was accepted, modified, or rejected.

---

## Prompt 1: Complete Architecture Design

### Original Prompt

```
Design the complete architecture.

Include:

Frontend Architecture
Backend Architecture
MongoDB Design
Folder Structure
REST API Design
Validation Strategy
Error Handling Strategy
Logging Strategy
Testing Strategy
State Machine Strategy

Explain every design decision.

Do not generate code.
```

### AI Summary

The AI produced `design-notes.md` — a comprehensive architecture document (~900 lines) covering layered Express MVC, React SPA with hooks and service layer, MongoDB collections and indexes, REST conventions, express-validator strategy, centralized error handling with custom error classes, structured logging, Jest/Supertest testing pyramid, and a pure `statusMachine` domain module with ADRs explaining each decision.

### Accepted

- Monorepo with decoupled client/server over REST/JSON
- Backend layering: routes → validators → controllers → services → models
- Pure domain module for state machine (unit-testable, no DB coupling)
- express-validator at route boundary; business rules in services
- Centralized error handler with consistent JSON envelope
- Soft delete via `deletedAt` on tickets
- Text index + compound indexes for search/list performance
- Jest integration tests with mongodb-memory-server

### Modified

- Redux/Zustand rejected in favor of React Context + custom hooks (documented as intentional simplification)
- JWT auth designed as stretch scaffold only — middleware stubbed, not fully implemented
- Logging kept as structured console output rather than external log aggregation (Winston/Datadog)

### Rejected

- GraphQL API layer
- Microservices decomposition
- Server-side rendering (Next.js)
- Hard delete as default (soft delete preferred for auditability)

### Reason

Assessment scope favors clarity and testability over enterprise scale. A pure state machine module and service layer satisfy the "judgment piece" requirement while keeping the architecture reviewable.

---

## Prompt 2: MongoDB Schema Design

### Original Prompt

```
Design the MongoDB schema.

Entities:

User
Ticket
Comment

Include:

Collections
Relationships
Indexes
Validation Rules
Seed Data Strategy
Migration Strategy
Environment Variables

Generate:

data-model.md
database/setup-notes.md
database/schema
database/seed-data

No code yet.
```

### AI Summary

The AI documented three collections with field-level schemas, ObjectId relationships (Ticket → User, Comment → Ticket + User), index strategy (unique email, text search, compound list indexes), Mongoose validation rules, bcrypt password hashing for seed users, idempotent seed strategy, and environment variable requirements.

### Accepted

- User roles enum: `admin`, `manager`, `agent`, `customer`
- Ticket statuses: `open`, `in_progress`, `resolved`, `closed`, `cancelled`
- Ticket priorities: `low`, `medium`, `high`
- Comment references `ticketId` + `authorId`
- Text index on `title` + `description`
- Compound indexes: `{ deletedAt, status, createdAt }`, `{ deletedAt, createdAt }`
- Seed data keyed by logical names (`t1`, `admin`, `c1`) for test reuse

### Modified

- `database/setup-notes.md` renamed/consolidated with `database/setup.md` in some paths
- Migration strategy documented as "re-seed for dev" rather than formal migration tooling (no production deployment requirement)

### Rejected

- Embedding comments array inside Ticket document (normalized to separate collection)
- Storing plaintext passwords in seed data
- Multi-tenant / organization scoping (out of assessment scope)

### Reason

Normalized comments support unbounded threads without document size limits. Separate collections align with REST nesting (`/tickets/:id/comments`) and simplify querying.

---

## Prompt 3: REST API Contract

### Original Prompt

```
Design a REST API contract.

Generate every endpoint.

Include:

Method
URL
Purpose
Request Body
Response Body
Validation Rules
Possible Errors
Status Codes

Include:

Tickets
Comments
Users (Seed only)
Status Update Endpoint
Search Endpoint

Return markdown only.
```

### AI Summary

The AI generated `api-contract.md` documenting all ticket CRUD endpoints, dedicated `PATCH /tickets/:id/status` for state transitions, nested comment endpoints, user list/detail for dropdowns, query params for search/filter/pagination, validation rules per field, and error codes (`VALIDATION_ERROR`, `NOT_FOUND`, `INVALID_TRANSITION`, etc.).

### Accepted

- Separate status update endpoint (not generic PATCH) to isolate state machine logic
- `GET /tickets` with `search`, `status`, `page`, `limit` query params
- Paginated list response: `{ tickets, total, page, limit, totalPages }`
- Standard error envelope: `{ error: { code, message, details } }`
- `204` avoided in favor of JSON bodies for consistency
- Soft-deleted tickets return `404` on direct access

### Modified

- User endpoints limited to read-only (seed support) — no user CRUD API
- Search uses MongoDB `$text` for alphanumeric terms; regex fallback for special characters

### Rejected

- `PUT` for full replacement updates (PATCH used for partial updates)
- Nested routes deeper than one level (e.g. `/tickets/:id/comments/:id/replies`)
- GraphQL or RPC-style endpoints

### Reason

REST with explicit status endpoint makes state machine enforcement visible in the API contract — a key assessment criterion. Pagination metadata supports the ticket list UI without additional round trips.

---

## Prompt 4: Frontend UI Design

### Original Prompt

```
Design the frontend.

Pages:

Dashboard
Ticket List
Create Ticket
Ticket Detail
Edit Ticket
Search
Status Update
Comment Section

Include:

User Flow
Navigation
Component Hierarchy
State Management
Error UI
Loading UI
Responsive Design

Generate ui-flow.md
```

### AI Summary

The AI produced `ui-flow.md` with page wireframes, navigation map, component hierarchy (pages → feature components → shared UI), hook-based data fetching, debounced search with URL sync, status action buttons driven by allowed transitions, comment thread layout, error alert + retry patterns, skeleton loaders, and responsive breakpoints.

### Accepted

- React Router routes: `/`, `/tickets`, `/tickets/new`, `/tickets/:id`, `/tickets/:id/edit`
- Search/filter on list page with URL query param sync
- `StatusActions` component showing only valid next statuses
- `CommentSection` with list + form on detail page
- Toast notifications for mutation success/failure
- Shared components: `ErrorAlert`, `LoadingSkeleton`, `PageHeader`, `FormField`

### Modified

- Search integrated into Ticket List page rather than a separate `/search` route
- Auth/login page scaffolded at `/login` but not wired to backend
- Context API used instead of Redux (per architecture decision)

### Rejected

- Separate mobile-native app
- Real-time WebSocket comment updates
- Drag-and-drop kanban board view

### Reason

Integrating search into the list page matches common helpdesk UX and reduces routing complexity. Component hierarchy supports incremental implementation from scaffolding to wired pages.

---

## Design Phase Summary

| Metric | Value |
|--------|-------|
| Prompts logged | 4 |
| Code generated | None (by design) |
| Primary artifacts | `design-notes.md`, `data-model.md`, `api-contract.md`, `ui-flow.md` |
| Key human decision | Auth/RBAC designed but deferred; core flows prioritized |

## Related Artifacts

- [`../design-notes.md`](../design-notes.md)
- [`../data-model.md`](../data-model.md)
- [`../api-contract.md`](../api-contract.md)
- [`../ui-flow.md`](../ui-flow.md)
- [`../database/schema/README.md`](../database/schema/README.md)
