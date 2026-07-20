# AI Usage — Implementation Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: Backend scaffolding, frontend scaffolding, feature implementation

This document records AI prompts used during implementation, including what was accepted, modified, or rejected.

---

## Prompt 1: Backend Scaffolding

### Original Prompt

```
Generate the backend project.

Tech:

Express
MongoDB
Mongoose
MVC

Generate:

folder structure
controllers
routes
models
middleware
validators
services
config
utils

Do not implement business logic.

Generate clean scaffolding only.
```

### AI Summary

The AI scaffolded the Express server with `src/` layout (config, controllers, routes, models, middleware, validators, services, utils, constants), stub controllers delegating to TODO services, route wiring, auth middleware stub, `asyncHandler`, `ApiError`, and Jest test folder structure.

### Accepted

- ES modules (`"type": "module"`)
- `app.js` separated from `index.js` for testability
- `asyncHandler` wrapper for async route errors
- Validator files per resource (ticket, comment, user)
- Empty service files ready for business logic injection

### Modified

- `ApiError` later replaced/extended by `errors/` module with typed error classes
- Services fully implemented in subsequent prompts (no longer stubs)

### Rejected

- CommonJS `require` syntax
- Putting business logic directly in controllers
- Single-file monolithic `server.js`

### Reason

Scaffolding establishes conventions before implementation. Separating `app.js` enables Supertest integration tests without starting a live server.

---

## Prompt 2: React Frontend Scaffolding

### Original Prompt

```
Generate the React frontend.

Use:

React
Vite
React Router
Axios
Context API

Generate:

Folder Structure
Pages
Components
Hooks
Services
Layouts
Shared Components

No implementation.

Only scaffolding.
```

### AI Summary

The AI created the Vite React app with page stubs, component folders (tickets, comments, common, layout), hook stubs (`useTickets`, `useTicket`, `useUsers`), Axios API client, `AuthContext`/`ToastContext` stubs, `AppRoutes`, and `Layout` shell.

### Accepted

- Vite dev server with `/api` proxy to port 5000
- Feature-based component folders
- Page-level route components
- Stub hooks returning placeholder data shapes

### Modified

- Hooks and services fully implemented in later prompts
- `ToastContext` upgraded from stub to working auto-dismiss toasts
- Service layer (`client/src/services/`) added on top of raw `api/` wrappers

### Rejected

- Create React App (CRA) in favor of Vite
- TypeScript (project uses JavaScript per assessment simplicity)
- CSS-in-JS libraries (plain CSS used)

### Reason

Vite offers faster dev feedback. Scaffolding first ensures folder conventions match `ui-flow.md` before wiring API calls.

---

## Prompt 3: Mongoose Models

### Original Prompt

```
Implement Mongoose models.

Implement:

User
Ticket
Comment

Include:

Indexes
Validation
Enums
Timestamps
Relationships

Follow best practices.
```

### AI Summary

The AI implemented three Mongoose schemas with enum validation for roles/statuses/priorities, `ref` relationships, compound and text indexes, `timestamps: true`, email uniqueness, and soft-delete support via `deletedAt` on tickets.

### Accepted

- All indexes from design docs (text search, compound list, sparse `assignedTo`)
- Schema-level enum validation matching constants files
- `toJSON` transform excluding sensitive fields (password)
- Barrel export via `models/index.js`

### Modified

- Password field added to User model for future auth (bcrypt hashed in seed only)
- `updatedAt` manually bumped when comments are added (service layer)

### Rejected

- Discriminator patterns for ticket subtypes
- Pre-save hooks for status transitions (kept in service layer per architecture rule)

### Reason

Schema validation catches data integrity issues at persistence boundary. State machine logic intentionally lives in services, not Mongoose hooks, for testability and clear error messages.

---

## Prompt 4: Ticket CRUD

### Original Prompt

```
Implement complete Ticket CRUD.

Requirements:

Create Ticket
Get All Tickets
Get Ticket
Update Ticket
Delete Ticket (soft delete optional)

Validate requests
Return proper HTTP codes
Use service layer.
Write production quality code.
```

### AI Summary

The AI implemented `ticket.service.js` with full CRUD, soft delete via `deletedAt`, population of `createdBy`/`assignedTo`, input validation through express-validator, proper HTTP status codes (201, 200, 404), and integration tests for create/read/update/delete flows.

### Accepted

- Service layer pattern (`ticket.service.js`)
- Soft delete (set `deletedAt`, exclude from queries)
- `getActiveTicketById` helper reused by comment service
- Population constants for consistent field selection
- Pagination support in `getTickets`

### Modified

- Soft delete changed from "optional" to implemented default
- Duplicate prompt sent twice — same implementation verified, no duplicate code

### Rejected

- Hard delete
- Returning deleted tickets in list results
- Business logic in controllers

### Reason

Soft delete preserves data for assessment demos and matches design docs. Service layer centralizes query filters (`deletedAt: null`).

---

## Prompt 5: Comment APIs

### Original Prompt

```
Implement Comment APIs.

Create Comment
Get Comments
Validate Ticket exists
Update timestamps
Return meaningful responses.

Use MVC architecture.
```

### AI Summary

The AI implemented `comment.service.js` and wired routes under `/api/tickets/:id/comments` with ticket existence checks, author validation, parent ticket `updatedAt` bump, populated author names, and 201/200/404 responses.

### Accepted

- Nested route pattern matching API contract
- Reuse of `getActiveTicketById` from ticket service
- Comments sorted by `createdAt` ascending
- Author populated in list responses

### Modified

- Comments included in ticket detail response (GET `/tickets/:id`) in addition to dedicated comments endpoint

### Rejected

- Comment edit/delete endpoints (out of scope)
- Anonymous comments without author

### Reason

Validating ticket existence prevents orphan comments. Bumping `updatedAt` keeps list sort-by-recent accurate.

---

## Prompt 6: Search and Filtering

### Original Prompt

```
Implement search and filtering.

Requirements:

Keyword search
Status filter
Combine filters
Case insensitive
MongoDB indexes
Return paginated results if easily supported.
```

### AI Summary

The AI implemented `domain/ticketQuery.js` for filter building, MongoDB `$text` search with regex fallback, status filter combination, case-insensitive matching, pagination via `utils/pagination.js`, and list endpoint query validators.

### Accepted

- Pure `buildTicketListFilter` / `buildTicketListSort` functions (unit tested)
- `$text` search for simple alphanumeric queries
- Regex fallback for special characters
- Combined `search` + `status` filters
- Paginated response metadata

### Modified

- Text score sorting when using `$text`; `createdAt` sort otherwise

### Rejected

- Elasticsearch / Atlas Search integration
- Fuzzy matching beyond MongoDB text index defaults

### Reason

`ticketQuery.js` isolates query construction for unit testing independent of HTTP layer. Pagination was straightforward to add via existing list endpoint.

---

## Prompt 7: Status State Machine

### Original Prompt

```
Implement Ticket Status State Machine.

Allowed transitions:

Open -> In Progress
In Progress -> Resolved
Resolved -> Closed
Open -> Cancelled
In Progress -> Cancelled

Reject all invalid transitions.

Business rules must exist only in service layer.

Return clear error messages.

Generate unit-testable implementation.

Explain the design before coding.
```

### AI Summary

The AI explained the design (pure `domain/statusMachine.js` module + service enforcement), then implemented `TRANSITIONS` map, `canTransition`, `allowedNextStatuses`, `assertValidStatusTransition` in service layer, `409 INVALID_TRANSITION` errors with human-readable messages, and unit tests for the domain module.

### Accepted

- Pure domain module with no Mongoose imports
- `PATCH /tickets/:id/status` dedicated endpoint
- `STATUS_LABELS` for user-friendly error messages
- `allowedNextStatuses` exposed to frontend for UI buttons
- Unit tests in `tests/unit/statusMachine.test.js`

### Modified

- Design explanation provided inline before code generation (as requested)

### Rejected

- State machine in Mongoose pre-save hooks
- State machine in controller or validator layer
- Allowing admin override of transitions (no auth/RBAC yet)

### Reason

Pure domain module is the assessment's core "judgment piece" — independently unit testable and enforced at exactly one layer (service).

---

## Prompt 8: Backend Validation

### Original Prompt

```
Implement backend validation.

Use express-validator.

Validate:

Title
Description
Priority
Status
Comment
Assignment

Reject invalid input.

Return standardized validation errors.
```

### AI Summary

The AI created shared field validator chains in `validators/shared/fieldValidators.js`, resource-specific validator compositions, `validate.middleware.js` producing `{ error: { code: 'VALIDATION_ERROR', details: { field: message } } }`, and integration tests for invalid inputs.

### Accepted

- Shared validators reused across create/update/status endpoints
- ObjectId format validation middleware
- Trim and length constraints on title/description/comment body
- Enum validation for priority and status

### Modified

- List query validators added for `status`, `page`, `limit` (not in original prompt but needed)

### Rejected

- Joi/Yup alongside express-validator (single validation library)
- Silently coercing invalid enums to defaults

### Reason

Shared validators reduce duplication between create and update chains. Standardized error envelope enables frontend field-level error display.

---

## Prompt 9: Centralized Error Handling

### Original Prompt

```
Implement centralized error handling.

Create:

Custom Error Classes
404 Handler
Validation Error Handler
Mongo Errors
Unexpected Errors
Consistent JSON response.

Include logging.
```

### AI Summary

The AI implemented `errors/` module (`AppError`, `NotFoundError`, `ValidationError`, `ConflictError`, `BadRequestError`), global `errorHandler.middleware.js` mapping Mongoose cast/validation/duplicate errors, `notFound.middleware.js`, structured `logger.js`, and request logging middleware.

### Accepted

- Typed error classes with `statusCode` and `code`
- Mongoose `CastError` → 400, duplicate key → 409
- Unknown errors → 500 with message hidden in production
- Request logger with method, path, status, duration

### Modified

- Legacy `ApiError` in `utils/` superseded by `errors/` module

### Rejected

- Stack traces in production API responses
- Per-controller try/catch blocks (centralized handler preferred)

### Reason

Consistent error shape simplifies frontend `apiError.js` parsing and integration test assertions.

---

## Prompt 10: MongoDB Seed Script

### Original Prompt

```
Generate MongoDB seed script.

Seed:

Users
Tickets
Comments

Relationships must be valid.

Generate reusable seed script.
```

### AI Summary

The AI created `scripts/seed/seedData.js`, `seedDatabase.js` (importable), `seed.js` (CLI via `npm run seed`), 4 users, 8 tickets, 6 comments with valid cross-references, bcrypt password hashing, and relative timestamps.

### Accepted

- Keyed entities (`usersByKey`, `ticketsByKey`) for test reuse
- `clearExisting` option
- Demo password `Demo@1234` for all users
- `bcryptjs` dependency for password hashing

### Modified

- Seed module exported for integration test helper (`seedIntegrationDatabase`)

### Rejected

- Random/faker data (deterministic seed preferred for reproducible tests)
- Production seed on server startup

### Reason

Reusable seed function supports both CLI demo setup and automated integration tests with known data shapes.

---

## Prompt 11: Frontend Pages

### Original Prompt

```
Implement frontend pages.

Dashboard
Ticket List
Ticket Detail
Create Ticket
Edit Ticket
Search
Status Update
Comment Section

Connect to backend using Axios.

Handle loading and errors.
```

### AI Summary

The AI wired all pages to backend APIs with loading skeletons, error alerts with retry, debounced URL-synced search on list page, status action buttons, comment form/list on detail page, dashboard summary cards, and basic CSS styling.

### Accepted

- All pages functional against live API
- Loading and error states on every data fetch
- Client-side validation in forms before submit
- Dashboard aggregating from ticket list data

### Modified

- Search kept on list page (not separate route) per design decision

### Rejected

- Mock data mode / MSW for development
- Optimistic UI updates without refetch

### Reason

End-to-end wired pages demonstrate full MERN stack integration for assessment review.

---

## Prompt 12: Frontend Service Layer and Hooks

### Original Prompt

```
Connect frontend to backend.

Create API service layer.

Handle:

Loading
Errors
Retries (optional)
Toast notifications
Reusable hooks.
```

### AI Summary

The AI created `services/httpClient.js`, `retry.js` (2 retries on network/5xx), resource services (`ticketService`, `commentService`, `userService`), hooks (`useAsync`, `useMutation`, `useTickets`, `useTicket`, `useCreateTicket`, etc.), and working `ToastContext`.

### Accepted

- Retry wrapper with exponential backoff
- `useMutation` hook for create/update/delete with toast feedback
- `useDebounce` for search input
- Barrel exports from `hooks/index.js`

### Modified

- Low-level `api/` folder retained beneath `services/` layer

### Rejected

- React Query / SWR (no new dependency; custom hooks sufficient)
- Global error boundary replacing per-page error alerts

### Reason

Service layer abstracts HTTP details from components. Retries improve resilience during local dev when MongoDB is starting.

---

## Implementation Phase Summary

| Metric | Value |
|--------|-------|
| Prompts logged | 12 |
| Backend files | ~45 source files |
| Frontend files | ~78 source files |
| Key pattern | Scaffolding → models → services → UI → hooks |
| Stretch deferred | JWT auth, RBAC, protected routes |

## Related Artifacts

- [`../server/src/`](../server/src/)
- [`../client/src/`](../client/src/)
- [`../implementation-plan.md`](../implementation-plan.md)
