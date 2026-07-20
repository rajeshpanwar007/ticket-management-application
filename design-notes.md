# Design Notes — Complete Architecture

> Authoritative architecture reference for the Support Ticket Management System (MERN).
> See also: `tool-specific/cursor-workflow/spec.md`, `api-contract.md`, `data-model.md`.

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Frontend Architecture](#2-frontend-architecture)
3. [Backend Architecture](#3-backend-architecture)
4. [MongoDB Design](#4-mongodb-design)
5. [Folder Structure](#5-folder-structure)
6. [REST API Design](#6-rest-api-design)
7. [Validation Strategy](#7-validation-strategy)
8. [Error Handling Strategy](#8-error-handling-strategy)
9. [Logging Strategy](#9-logging-strategy)
10. [Testing Strategy](#10-testing-strategy)
11. [State Machine Strategy](#11-state-machine-strategy)
12. [Cross-Cutting Concerns](#12-cross-cutting-concerns)
13. [Architecture Decision Records](#13-architecture-decision-records)

---

## 1. System Overview

### Pattern

**Monorepo with decoupled client and server** communicating over HTTP/JSON.

```
┌─────────────────────────────────────────────────────────┐
│                     Browser (React SPA)                  │
│  Pages → Components → Hooks → API Client → HTTP/JSON    │
└──────────────────────────┬──────────────────────────────┘
                           │ REST (port 5173 → 5000)
┌──────────────────────────▼──────────────────────────────┐
│                   Express API (Node.js)                  │
│  Routes → Middleware → Controllers → Services → Models   │
│                              ↓                           │
│                         Domain Layer                     │
│                    (statusMachine — pure)                │
└──────────────────────────┬──────────────────────────────┘
                           │ Mongoose ODM
┌──────────────────────────▼──────────────────────────────┐
│                      MongoDB                             │
│           users · tickets · comments                     │
└─────────────────────────────────────────────────────────┘
```

### Why This Pattern

| Decision | Rationale |
|----------|-----------|
| **SPA + REST API** | Standard MERN separation; React handles UI reactivity; Express handles business rules and persistence |
| **Monorepo (client + server folders)** | Single submission repo; shared documentation; simpler for assessors to clone and run |
| **No SSR** | Assessment scope does not require SEO or server rendering; Vite dev server is faster to set up |
| **No GraphQL** | REST is sufficient for CRUD + PATCH; lower complexity; matches assessment expectations |
| **No microservices** | Three entities and ~8 endpoints do not justify distributed architecture overhead |

---

## 2. Frontend Architecture

### 2.1 Stack

| Choice | Version | Why |
|--------|---------|-----|
| React | 18 | Required by MERN; hooks-based functional components |
| Vite | 5.x | Fast dev server and build; simpler than CRA |
| React Router | 6.x | Client-side routing for list / create / detail / login |
| Axios | 1.x | Interceptors for auth headers and centralized error parsing |

**Not chosen:** Redux/Zustand — local component state and custom hooks are sufficient for this scope. Adding global state management would be over-engineering.

### 2.2 Layer Model

```
┌─────────────────────────────────────────────┐
│  Pages (route-level containers)              │
│  TicketListPage · CreateTicketPage · etc.   │
├─────────────────────────────────────────────┤
│  Components (reusable UI)                    │
│  TicketTable · StatusActions · CommentList  │
├─────────────────────────────────────────────┤
│  Hooks (data-fetching + side effects)        │
│  useTickets · useTicket · useComments       │
├─────────────────────────────────────────────┤
│  API Layer (HTTP wrappers)                   │
│  api/client.js · api/tickets.js             │
├─────────────────────────────────────────────┤
│  Constants + Utils (display helpers only)    │
│  ticketStatus.js · validation.js            │
└─────────────────────────────────────────────┘
```

### 2.3 Design Decisions

| Decision | Explanation |
|----------|-------------|
| **Pages own routing; components own presentation** | Pages fetch data and pass props down. Components do not call the API directly. This keeps components testable and reusable. |
| **All HTTP through `api/` module** | Single Axios instance with base URL, credentials, and error interceptor. Prevents scattered fetch calls and inconsistent error handling. |
| **Custom hooks for data fetching** | `useTickets({ search, status })` encapsulates loading/error/data states. Avoids duplicating `useState` + `useEffect` in every page. |
| **Status buttons driven by allowed transitions** | UI reads from a shared `allowedNextStatuses(currentStatus)` constant mirroring the server state machine. Buttons not in the allowed list are hidden — but the server still enforces rules independently. |
| **No business logic in React** | React never decides if a transition is valid. It only displays options and sends PATCH requests. Invalid attempts show the server's 409 error message. |
| **Optimistic UI deferred** | For assessment reliability, wait for server response before updating UI. Optimistic updates add complexity and race-condition risk without assessment benefit. |
| **Debounced search (300ms)** | Prevents excessive API calls while typing. Filter dropdown fires immediately on change. |

### 2.4 UI State Machine

Every async view implements four states:

| State | User Experience |
|-------|----------------|
| **Loading** | Skeleton or spinner while fetching |
| **Empty** | "No tickets found" with link to create |
| **Error** | Alert with server error message (especially 409 for invalid transitions) |
| **Success** | Rendered data |

### 2.5 Routing

| Route | Page | Auth |
|-------|------|------|
| `/` | TicketListPage | Open (core) / Protected (stretch) |
| `/tickets/new` | CreateTicketPage | Open / Protected |
| `/tickets/:id` | TicketDetailPage | Open / Protected |
| `/login` | LoginPage | Stretch only |

**Why React Router over manual hash routing:** Clean URLs, standard pattern, supports protected route wrappers for stretch auth.

### 2.6 Component Boundaries

| Component | Responsibility |
|-----------|---------------|
| `TicketTable` | Renders list rows; emits `onRowClick` |
| `SearchBar` | Controlled input; emits debounced `onSearch` |
| `StatusFilter` | Dropdown; emits `onFilterChange` |
| `TicketForm` | Create/edit form with client validation |
| `StatusActions` | Renders only valid transition buttons |
| `CommentList` | Chronological comment thread |
| `CommentForm` | Add comment with submit handler |
| `ErrorAlert` | Displays API error message |
| `Layout` | App shell with nav and outlet |

---

## 3. Backend Architecture

### 3.1 Stack

| Choice | Why |
|--------|-----|
| Node.js 20 LTS | Required; stable, long-term support |
| Express 4.x | Minimal, well-understood, fits REST assessment |
| Mongoose 8.x | Schema validation, refs, indexes, middleware hooks |
| express-validator or Joi | Request body validation at middleware layer |
| bcryptjs (stretch) | Password hashing for auth |
| jsonwebtoken (stretch) | Stateless auth tokens |

**Not chosen:** NestJS (too much framework ceremony), Fastify (assessment specifies Express), raw MongoDB driver (Mongoose provides schema safety with less boilerplate).

### 3.2 Layered Architecture

```
HTTP Request
     │
     ▼
┌─────────┐   Maps URL + method to handler. No logic.
│  Routes │
└────┬────┘
     ▼
┌─────────────┐   Auth, validation, rate-limit (stretch). Cross-cutting.
│ Middleware  │
└────┬────────┘
     ▼
┌──────────────┐   Extracts req params/body. Calls service. Sets res status.
│ Controllers  │   Thin — max ~15 lines per handler.
└────┬─────────┘
     ▼
┌──────────────┐   Business rules, permissions, state machine, orchestration.
│  Services    │   Throws ApiError on failure.
└────┬─────────┘
     │
     ├──► ┌─────────┐   Pure functions. No I/O.
     │    │ Domain  │
     │    └─────────┘
     │
     ▼
┌──────────────┐   Mongoose schemas. DB constraints only.
│   Models     │
└────┬─────────┘
     ▼
  MongoDB
```

### 3.3 Layer Responsibilities

| Layer | Does | Does NOT |
|-------|------|----------|
| **Routes** | HTTP mapping, middleware chain | Business logic, DB queries |
| **Middleware** | Auth, validation, error formatting | Domain rules |
| **Controllers** | req → service → res | Validation rules, state transitions |
| **Services** | All business logic | HTTP concerns (status codes set via thrown errors) |
| **Domain** | Pure state machine functions | DB, HTTP, Express |
| **Models** | Schema, indexes, defaults | Transition rules, permissions |

### 3.4 Key Design Decisions

| Decision | Explanation |
|----------|-------------|
| **Thin controllers** | Controllers are adapters between HTTP and services. All testable logic lives in services and domain. |
| **Services throw `ApiError`** | Services express failure as domain errors (`ApiError(409, 'INVALID_TRANSITION', message)`). Controllers don't catch — global error handler formats the response. |
| **`asyncHandler` wrapper** | Wraps async route handlers to forward rejections to Express error middleware. Avoids try/catch in every controller. |
| **Single `app.js` + `index.js` split** | `app.js` configures Express (middleware, routes); `index.js` connects DB and starts listening. Enables Supertest to import `app` without starting a server. |
| **Population over embedding** | Ticket detail populates `createdBy`, `assignedTo`, and fetches comments separately. Keeps documents normalized. |
| **PATCH over PUT** | Partial updates (change only `status` or only `assignedTo`) are the primary use case. PATCH is semantically correct. |

### 3.5 Service Layer Design

**`ticket.service.js`** — central orchestrator:

| Method | Responsibility |
|--------|---------------|
| `createTicket(data, userId)` | Validate refs, default status `open`, save |
| `getTickets(filters)` | Build query with search + status filter |
| `getTicketById(id)` | Fetch + populate + attach comments |
| `updateTicket(id, updates, userId)` | Field updates; delegate status changes |
| `updateTicketStatus(id, newStatus, userId)` | Call `canTransition`; throw 409 if invalid |
| `reassignTicket(id, assignedTo, userId)` | Validate user exists; update field |

**`comment.service.js`:**

| Method | Responsibility |
|--------|---------------|
| `addComment(ticketId, body, authorId)` | Verify ticket exists; save comment |

**`permission.service.js` (stretch):**

| Method | Responsibility |
|--------|---------------|
| `canAccessTicket(user, ticket)` | Read permission check |
| `canModifyTicket(user, ticket)` | Write permission check |
| `canReassign(user)` | Role-based reassign check |

### 3.6 Middleware Chain Order

```
1. cors()              — restrict to CLIENT_URL
2. express.json()      — parse JSON bodies
3. requestLogger       — log method, path, status, duration
4. auth (stretch)      — attach req.user from JWT
5. routes              — route-level validate middleware
6. notFoundHandler     — 404 for unknown routes
7. errorHandler        — format all errors consistently
```

**Why this order:** CORS and body parsing must run before routes. Auth before routes so `req.user` is available. Error handler must be last.

---

## 4. MongoDB Design

### 4.1 Database Strategy

| Decision | Rationale |
|----------|-----------|
| **Single database, normalized collections** | Three entities with references — not embedded documents. Comments grow independently; embedding would bloat ticket documents. |
| **Mongoose ODM over raw driver** | Schema validation at DB layer, middleware hooks, population, indexes declared in schema. Reduces boilerplate for an assessment-sized project. |
| **No transactions for core scope** | Single-document updates for status changes. Assessment data volume does not require multi-document ACID. Document as limitation. |
| **Separate test database** | `ticket-management-test` database for integration tests. Prevents polluting dev seed data. |

### 4.2 Collections

#### `users`

| Field | Type | Index | Notes |
|-------|------|-------|-------|
| `name` | String | — | Required |
| `email` | String | Unique | Lowercased on save |
| `password` | String | — | bcrypt hash; `select: false` |
| `role` | String | — | Enum: admin, manager, agent, customer |
| `createdAt` | Date | — | Auto |
| `updatedAt` | Date | — | Auto |

**Why unique email index:** Prevents duplicate accounts; fast login lookup.

#### `tickets`

| Field | Type | Index | Notes |
|-------|------|-------|-------|
| `title` | String | Text | Max 200 chars |
| `description` | String | Text | Max 5000 chars |
| `status` | String | Single | Enum; default `open` |
| `priority` | String | — | Enum; default `medium` |
| `createdBy` | ObjectId | Single | Ref → users |
| `assignedTo` | ObjectId | Single, sparse | Ref → users; nullable |
| `createdAt` | Date | — | Auto |
| `updatedAt` | Date | — | Auto |

**Indexes:**
- `{ status: 1 }` — filter by status (AC-8)
- `{ createdBy: 1 }` — customer's own tickets (stretch RBAC)
- `{ assignedTo: 1 }` — agent's assigned tickets (stretch)
- `{ title: 'text', description: 'text' }` — full-text search (AC-8)

**Why text index over regex:** MongoDB text index is more performant for keyword search. Fallback to case-insensitive regex if text index setup is problematic — document the choice.

**Why sparse index on `assignedTo`:** Many tickets may be unassigned; sparse index excludes null values efficiently.

#### `comments`

| Field | Type | Index | Notes |
|-------|------|-------|-------|
| `ticketId` | ObjectId | Single | Ref → tickets |
| `authorId` | ObjectId | — | Ref → users |
| `body` | String | — | Max 2000 chars |
| `createdAt` | Date | — | Auto; no `updatedAt` (append-only) |

**Why separate collection vs embedding in ticket:** Comments can grow large; embedding would hit MongoDB's 16MB document limit on active tickets and make comment queries inefficient.

### 4.3 Referential Integrity

| Rule | Enforcement |
|------|-------------|
| `assignedTo` must reference existing user | Service layer checks before save |
| `createdBy` must reference existing user | Set from authenticated user or seed |
| `ticketId` on comment must exist | Service returns 404 if not found |
| Orphan comments on ticket delete | Ticket delete not in core scope; if added later, cascade delete comments |

**Why application-level over DB-level foreign keys:** MongoDB does not enforce foreign keys natively. Mongoose `ref` enables population but not constraint enforcement. Service-layer checks are explicit and testable.

### 4.4 Seed Data Design

| Entity | Count | Purpose |
|--------|-------|---------|
| Users | 4 | One per role (stretch) |
| Tickets | 6+ | One per status + extras |
| Comments | 3+ | Spread across tickets |

**Why seed script over migrations:** Assessment project uses Mongoose schemas as source of truth. A `seed.js` script is simpler than a migration framework for demo data.

---

## 5. Folder Structure

### 5.1 Repository Root

```
ticket-management-application/
├── README.md                    # Clone-to-run guide
├── design-notes.md              # This file
├── api-contract.md              # Endpoint reference
├── data-model.md                # Schema reference
├── [assessment docs...]
├── database/                    # DB setup documentation
├── ai-prompts/                  # AI interaction logs
├── tool-specific/cursor-workflow/  # Persistent Cursor memory
├── server/                      # Express API
└── client/                      # React SPA
```

**Why docs at root:** Assessors expect documentation at repo top level, not buried in source.

### 5.2 Server

```
server/
├── package.json
├── .env.example
├── src/
│   ├── index.js                 # Entry: connect DB, start server
│   ├── app.js                   # Express app (importable for tests)
│   ├── config/
│   │   ├── env.js               # Validated env vars
│   │   └── db.js                # Mongoose connection
│   ├── models/
│   │   ├── user.model.js
│   │   ├── ticket.model.js
│   │   └── comment.model.js
│   ├── domain/
│   │   └── statusMachine.js     # Pure transition logic
│   ├── services/
│   │   ├── ticket.service.js
│   │   ├── comment.service.js
│   │   ├── auth.service.js      # stretch
│   │   └── permission.service.js # stretch
│   ├── controllers/
│   │   ├── ticket.controller.js
│   │   ├── comment.controller.js
│   │   └── auth.controller.js   # stretch
│   ├── routes/
│   │   ├── index.js             # Mounts all route modules
│   │   ├── ticket.routes.js
│   │   ├── comment.routes.js
│   │   └── auth.routes.js       # stretch
│   ├── middleware/
│   │   ├── validate.middleware.js
│   │   ├── auth.middleware.js   # stretch
│   │   ├── errorHandler.middleware.js
│   │   └── requestLogger.middleware.js
│   ├── utils/
│   │   ├── ApiError.js
│   │   └── asyncHandler.js
│   └── scripts/
│       └── seed.js
└── tests/
    ├── unit/
    │   └── statusMachine.test.js
    ├── integration/
    │   ├── statusMachine.integration.test.js  # MANDATORY
    │   ├── tickets.integration.test.js
    │   └── comments.integration.test.js
    └── helpers/
        └── testSetup.js         # DB connect, seed, teardown
```

**Why `domain/` separate from `services/`:** Domain module has zero dependencies — importable by unit tests without mocking Express or Mongoose. This is the single most important structural decision for the state machine.

**Why `tests/` outside `src/`:** Test files are not shipped; keeps `src/` clean for production bundle.

### 5.3 Client

```
client/
├── package.json
├── vite.config.js
├── index.html
└── src/
    ├── main.jsx                 # ReactDOM render + Router
    ├── App.jsx                  # Route definitions
    ├── api/
    │   ├── client.js            # Axios instance + interceptors
    │   ├── tickets.js           # Ticket endpoint wrappers
    │   ├── comments.js          # Comment endpoint wrappers
    │   └── auth.js              # stretch
    ├── pages/
    │   ├── TicketListPage.jsx
    │   ├── CreateTicketPage.jsx
    │   ├── TicketDetailPage.jsx
    │   └── LoginPage.jsx        # stretch
    ├── components/
    │   ├── layout/
    │   │   ├── Layout.jsx
    │   │   └── Navbar.jsx
    │   ├── tickets/
    │   │   ├── TicketTable.jsx
    │   │   ├── TicketForm.jsx
    │   │   ├── StatusActions.jsx
    │   │   ├── StatusBadge.jsx
    │   │   └── PriorityBadge.jsx
    │   ├── comments/
    │   │   ├── CommentList.jsx
    │   │   └── CommentForm.jsx
    │   └── common/
    │       ├── SearchBar.jsx
    │       ├── StatusFilter.jsx
    │       ├── ErrorAlert.jsx
    │       ├── LoadingSpinner.jsx
    │       └── EmptyState.jsx
    ├── hooks/
    │   ├── useTickets.js
    │   ├── useTicket.js
    │   └── useAuth.js           # stretch
    ├── constants/
    │   └── ticketStatus.js      # Status labels + allowedNextStatuses
    └── utils/
        └── validation.js        # Client-side form validation
```

**Why feature-grouped components (`tickets/`, `comments/`):** Scales better than flat `components/` as the app grows. Matches domain boundaries.

---

## 6. REST API Design

### 6.1 Principles

| Principle | Application |
|-----------|-------------|
| **Resource-oriented URLs** | `/api/tickets`, `/api/tickets/:id/comments` |
| **HTTP verbs express intent** | GET=read, POST=create, PATCH=partial update |
| **Plural nouns** | `/tickets` not `/ticket` |
| **Nested resources for ownership** | Comments belong to tickets → nested route |
| **Consistent response envelopes** | `{ ticket }`, `{ tickets, total }`, `{ comment }` |
| **Consistent error envelopes** | `{ error: { code, message, details? } }` |
| **Stateless** | No server-side session state in core; JWT for stretch |

### 6.2 Endpoint Catalog

| Method | Path | Purpose | Success |
|--------|------|---------|---------|
| GET | `/api/tickets` | List + search + filter | 200 |
| POST | `/api/tickets` | Create ticket | 201 |
| GET | `/api/tickets/:id` | Ticket detail + comments | 200 |
| PATCH | `/api/tickets/:id` | Update / reassign / status | 200 |
| POST | `/api/tickets/:id/comments` | Add comment | 201 |
| POST | `/api/auth/login` | Login (stretch) | 200 |
| POST | `/api/auth/logout` | Logout (stretch) | 200 |
| GET | `/api/auth/me` | Current user (stretch) | 200 |
| GET | `/api/users` | List users (stretch) | 200 |

### 6.3 Design Decisions

| Decision | Why |
|----------|-----|
| **PATCH for all ticket updates** | Single endpoint handles field update, reassign, and status change. Client sends only changed fields. Simpler than separate `/reassign` and `/status` endpoints. |
| **Status change via PATCH `status` field** | RESTful — status is an attribute of the resource. Service layer intercepts status changes for state machine validation. |
| **Comments as nested POST** | Comment cannot exist without a ticket. Nesting expresses the relationship. Alternative `POST /api/comments` with `ticketId` in body is less RESTful. |
| **Search via query params** | `?search=keyword&status=open` — cacheable, bookmarkable, no request body on GET. |
| **Populate user refs in responses** | Client needs `name` and `email` for display, not just ObjectId. Population in service layer avoids N+1 manual lookups. |
| **No HATEOAS** | Assessment scope does not require hypermedia links. Status actions driven by shared constants. |
| **No API versioning** | Single assessment submission; `/api/v1` adds noise without benefit. |

### 6.4 Request/Response Examples

**List with filters:**
```
GET /api/tickets?search=login&status=open
→ 200 { "tickets": [...], "total": 2 }
```

**Invalid transition:**
```
PATCH /api/tickets/abc123 { "status": "closed" }  // current: open
→ 409 { "error": { "code": "INVALID_TRANSITION", "message": "..." } }
```

**Validation failure:**
```
POST /api/tickets { "title": "" }
→ 400 { "error": { "code": "VALIDATION_ERROR", "message": "...", "details": { "title": "Title is required" } } }
```

---

## 7. Validation Strategy

### 7.1 Two-Layer Model

```
Client (UX)                    Server (Authority)
─────────────                  ─────────────────
Inline form errors      →      Middleware validation → 400
Disabled submit button  →      Service-layer checks  → 400/404/409
Max-length hints        →      Mongoose schema       → last resort
```

**Rule: Server validation is authoritative. Client validation is for user experience only.**

### 7.2 Server Validation Layers

| Layer | Tool | What It Validates |
|-------|------|-------------------|
| **Middleware** | express-validator / Joi | Request shape, types, required fields, enum values, max lengths |
| **Service** | Custom checks | Business rules: user exists, state machine, permissions |
| **Mongoose schema** | Schema validators | Type coercion, enum, maxlength as safety net |

**Why three layers:** Middleware catches malformed requests early (fast 400). Service catches business rules that require DB lookups. Mongoose catches anything that slips through — defense in depth.

### 7.3 Validation Rules by Endpoint

| Endpoint | Field | Rule |
|----------|-------|------|
| POST /tickets | title | Required, string, 1–200 chars |
| POST /tickets | description | Required, string, 1–5000 chars |
| POST /tickets | priority | Optional, enum: low/medium/high |
| POST /tickets | assignedTo | Optional, valid ObjectId, user must exist |
| PATCH /tickets/:id | status | Optional, valid enum; triggers state machine |
| PATCH /tickets/:id | assignedTo | Optional, valid ObjectId or null |
| POST /comments | body | Required, string, 1–2000 chars |
| GET /tickets | status | Optional, valid enum; invalid → 400 |

### 7.4 Client Validation

| Field | Client Rule | Purpose |
|-------|------------|---------|
| title | Required, max 200 | Immediate feedback |
| description | Required, max 5000 | Immediate feedback |
| comment body | Required | Disable submit when empty |
| priority | Select from enum | Prevent invalid selection |

**Why not validate status on client:** StatusActions component only renders valid buttons. No free-text status input.

### 7.5 ObjectId Validation

Invalid MongoDB ObjectId format in URL params (`:id`) returns **400** (bad request), not **500** (server error). Validated in middleware before DB query.

---

## 8. Error Handling Strategy

### 8.1 Error Flow

```
Service throws ApiError
        │
        ▼
asyncHandler catches rejection
        │
        ▼
errorHandler middleware
        │
        ├── ApiError → formatted JSON + correct status
        ├── Mongoose ValidationError → 400 VALIDATION_ERROR
        ├── Mongoose CastError → 400 INVALID_ID
        └── Unknown Error → 500 INTERNAL_ERROR (no stack in response)
```

### 8.2 ApiError Class

| Property | Purpose |
|----------|---------|
| `statusCode` | HTTP status (400, 404, 409, etc.) |
| `code` | Machine-readable: `INVALID_TRANSITION`, `NOT_FOUND` |
| `message` | Human-readable description |
| `details` | Optional field-level errors (validation) |

**Why custom error class:** Distinguishes intentional business errors from unexpected exceptions. Error handler can format them consistently without if/else chains in controllers.

### 8.3 HTTP Status Code Mapping

| Situation | Status | Code |
|-----------|--------|------|
| Validation failure | 400 | `VALIDATION_ERROR` |
| Invalid ObjectId format | 400 | `INVALID_ID` |
| Unauthenticated (stretch) | 401 | `UNAUTHORIZED` |
| Permission denied (stretch) | 403 | `FORBIDDEN` |
| Resource not found | 404 | `NOT_FOUND` |
| Invalid status transition | 409 | `INVALID_TRANSITION` |
| Unexpected error | 500 | `INTERNAL_ERROR` |

**Why 409 for invalid transitions:** 409 Conflict semantically means "request conflicts with current resource state" — exactly what an invalid state transition is. More precise than 400.

### 8.4 Error Response Contract

All errors follow:
```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": {}
  }
}
```

**Why consistent shape:** Frontend `api/client.js` interceptor can parse any error uniformly and display `error.message`.

### 8.5 Frontend Error Handling

| HTTP Status | UI Behavior |
|-------------|-------------|
| 400 | Show field-level errors from `details` |
| 409 | Show transition error in alert on detail page |
| 404 | Redirect to list with "Ticket not found" toast |
| 403 | Show "Access denied" (stretch) |
| 500 | Show generic "Something went wrong" |

### 8.6 What NOT to Expose

- Stack traces (production)
- MongoDB internal error messages
- JWT secrets or password hashes
- Internal file paths

---

## 9. Logging Strategy

### 9.1 Approach

**Structured console logging for development and assessment.** No external log aggregation (Datadog, ELK) — out of scope.

### 9.2 What to Log

| Event | Level | Fields |
|-------|-------|--------|
| Server start | INFO | port, env, DB connected |
| HTTP request | INFO | method, path, status, durationMs |
| Validation error | WARN | path, code, message |
| Business error (409, 404) | WARN | path, code, message |
| Unexpected error | ERROR | path, message, stack (server log only) |
| DB connection failure | ERROR | message |

### 9.3 What NOT to Log

- Passwords or password hashes
- JWT tokens or session IDs
- Full request bodies containing sensitive data
- MongoDB connection strings

### 9.4 Request Logger Middleware

Logs one line per request on response finish:
```
[INFO] GET /api/tickets 200 45ms
[WARN] PATCH /api/tickets/abc 409 12ms — INVALID_TRANSITION
[ERROR] POST /api/tickets 500 8ms — Cannot read property...
```

**Why middleware over Morgan:** Custom format includes error code. Morgan is fine as an alternative — either is acceptable.

### 9.5 Environment-Based Verbosity

| Environment | Behavior |
|-------------|----------|
| development | INFO + WARN + ERROR; stack traces in server console |
| test | Silent or ERROR only |
| production | INFO + ERROR; no stack in responses |

### 9.6 Future Improvement

Replace console logging with `pino` or `winston` for JSON-structured logs if the project moves beyond assessment scope.

---

## 10. Testing Strategy

### 10.1 Test Pyramid

```
         ┌──────────────┐
         │ Manual / E2E │  5%  — pre-submission checklist
         ├──────────────┤
         │ Integration  │  55% — API + real DB (mandatory tier)
         ├──────────────┤
         │    Unit      │  40% — domain + utils
         └──────────────┘
```

### 10.2 Mandatory Integration Tests

**File:** `server/tests/integration/statusMachine.integration.test.js`

| # | Scenario | Expected |
|---|----------|----------|
| T1 | open → in_progress | 200 |
| T2 | open → cancelled | 200 |
| T3 | open → closed | 409 |
| T4 | in_progress → resolved | 200 |
| T5 | resolved → closed | 200 |
| T6 | resolved → cancelled | 409 |
| T7 | closed → in_progress | 409 |
| T8 | cancelled → open | 409 |

**Why real HTTP + real DB (no mocks):** Proves the full stack works — routes, middleware, service, domain, model, and DB. This is the assessment's signature judgment test.

### 10.3 Unit Tests

| Module | Coverage |
|--------|----------|
| `domain/statusMachine.js` | Every valid transition returns true; every invalid returns false; `allowedNextStatuses` for each state; terminal states return empty array |
| `utils/ApiError.js` | Constructor sets properties correctly |
| `permission.service.js` (stretch) | Full permission matrix |

**Why unit test domain separately:** Fast feedback loop. Domain logic is pure — tests run in milliseconds without DB.

### 10.4 Recommended Integration Tests

| Suite | Scenarios |
|-------|-----------|
| `tickets.integration.test.js` | Create, list, detail, update, reassign, 404, 400 validation |
| `comments.integration.test.js` | Add comment, 404 on missing ticket, 400 on empty body |
| `search.integration.test.js` | Search keyword, status filter, combined, no results |
| `permissions.integration.test.js` (stretch) | Customer 403 on other's ticket |

### 10.5 Test Environment

| Setting | Value |
|---------|-------|
| Database | `ticket-management-test` (separate from dev) |
| Setup | `beforeAll`: connect, seed minimal data |
| Teardown | `afterAll`: drop test collections, disconnect |
| Runner | Jest or Vitest |
| HTTP | Supertest against `app.js` (no port binding) |

### 10.6 Manual Test Checklist (Pre-Submission)

- [ ] Create ticket via UI → appears in list
- [ ] Search finds ticket by title keyword
- [ ] Filter by status shows correct subset
- [ ] Detail page shows comments
- [ ] Valid status transition succeeds
- [ ] Invalid status transition shows 409 error in UI
- [ ] Restart server → data persists
- [ ] Empty form shows validation errors

### 10.7 What Not to Test

- Mongoose or Express internals
- Third-party library behavior
- CSS layout (no visual regression tests for assessment)

---

## 11. State Machine Strategy

### 11.1 Why a State Machine

Ticket status is not a free-form field. It represents a governed business process: a ticket must be worked (`in_progress`) before it can be resolved, and resolved before it can be closed. Allowing arbitrary transitions (e.g., `open → closed`) would bypass accountability.

### 11.2 Design

**Pure function module** at `server/src/domain/statusMachine.js`:

| Function | Input | Output | Purity |
|----------|-------|--------|--------|
| `canTransition(from, to)` | Two status strings | boolean | Pure |
| `allowedNextStatuses(from)` | Current status | string[] | Pure |
| `isTerminal(status)` | Status string | boolean | Pure |
| `TRANSITIONS` | — | Map constant | Immutable |

**No imports from Express, Mongoose, or any I/O module.**

### 11.3 Transition Table (Source of Truth)

```javascript
const TRANSITIONS = {
  open:         ['in_progress', 'cancelled'],
  in_progress:  ['resolved'],
  resolved:     ['closed'],
  closed:       [],
  cancelled:    [],
};
```

**Why a map over if/else chains:** Declarative, easy to read, easy to test, easy to extend. All transition rules in one place.

### 11.4 Enforcement Points

| Layer | Role |
|-------|------|
| **Domain (`statusMachine.js`)** | Defines and validates transitions — single source of truth |
| **Service (`ticket.service.js`)** | Calls `canTransition` before DB update; throws `ApiError(409)` |
| **Controller** | No state machine logic |
| **React (`StatusActions.jsx`)** | Calls `allowedNextStatuses` to show/hide buttons — UX only |

```
UI shows buttons ← allowedNextStatuses() ← same rules as → canTransition() → Service enforces
```

**Why enforce in service, not Mongoose middleware:** Business rules belong in the service/domain layer. Mongoose pre-save hooks are harder to test in isolation and mix persistence with domain logic.

### 11.5 Edge Case Handling

| Case | Behavior |
|------|----------|
| Same status PATCH (`open → open`) | 200 no-op; no DB write needed |
| Invalid transition | 409 with message listing allowed next states |
| Transition on terminal state | 409; `allowedNextStatuses` returns `[]` |
| Status field omitted in PATCH | No transition attempted; other fields updated |
| Concurrent PATCH requests | Last write wins; document as known limitation |

### 11.6 Error Message Format

```
Invalid status transition: open → closed. Allowed from open: in_progress, cancelled
```

**Why include allowed transitions in message:** Helps API consumers and UI display actionable feedback without a separate lookup.

### 11.7 UI Mirror Strategy

`client/src/constants/ticketStatus.js` exports the same transition map for UI display purposes.

**Critical rule:** If server and client maps ever diverge, the server wins. Client map is for UX convenience only. Consider exporting the map from a shared package in a future iteration — for this assessment, duplicate with a comment linking to the server module.

### 11.8 Testing the State Machine

| Test Type | What It Proves |
|-----------|---------------|
| Unit | Logic is correct in isolation |
| Integration | Full HTTP → service → domain → DB chain works |
| Manual | UI buttons match server behavior |

---

## 12. Cross-Cutting Concerns

### 12.1 Authentication (Stretch)

| Decision | Choice | Why |
|----------|--------|-----|
| Mechanism | JWT in `Authorization: Bearer` header | Stateless; simple for SPA; no server-side session store |
| Password storage | bcrypt, 10 rounds | Industry standard; slow by design |
| Token expiry | 24 hours | Balance security and UX for assessment |
| Protected routes | `auth.middleware.js` attaches `req.user` | Reusable across all protected endpoints |

**Alternative considered:** HTTP-only session cookies — more secure against XSS but harder CORS setup. JWT chosen for SPA simplicity.

### 12.2 CORS

```javascript
cors({ origin: process.env.CLIENT_URL, credentials: true })
```

**Why restrict origin:** Prevents arbitrary websites from calling the API. `credentials: true` needed if using cookies (stretch).

### 12.3 Environment Configuration

All config loaded once in `config/env.js` with startup validation. Server refuses to start if `MONGODB_URI` is missing.

**Why validate at startup:** Fail fast with clear error rather than cryptic runtime failure on first DB call.

### 12.4 Security Checklist

- [ ] No secrets in git
- [ ] Passwords hashed (stretch)
- [ ] `password` field has `select: false` in User model
- [ ] CORS restricted to client origin
- [ ] Input validated on all write endpoints
- [ ] Permissions enforced in service layer (stretch)
- [ ] No stack traces in production responses

---

## 13. Architecture Decision Records

| # | Decision | Alternatives Considered | Outcome | Rationale |
|---|----------|------------------------|---------|-----------|
| ADR-1 | Layered Express backend | MVC, clean architecture hexagon | Layered | Simplest fit for assessment scope; clear layer boundaries |
| ADR-2 | Pure domain module for state machine | Logic in service, Mongoose hooks, DB constraints | Pure domain module | Testable without I/O; single source of truth |
| ADR-3 | PATCH for all ticket updates | Separate /status and /reassign endpoints | Single PATCH | Fewer endpoints; RESTful partial update |
| ADR-4 | Normalized comments collection | Embed comments in ticket document | Separate collection | Scalability; append-only pattern |
| ADR-5 | Mongoose over raw driver | Native MongoDB driver, Prisma | Mongoose | Schema validation, refs, assessment-appropriate |
| ADR-6 | No Redux | Context API, Zustand, Redux | Local state + hooks | Scope does not justify global state library |
| ADR-7 | Vite over CRA | Create React App, Next.js | Vite | Faster dev; CRA is deprecated |
| ADR-8 | 409 for invalid transitions | 400 Bad Request | 409 Conflict | Semantically correct for state conflicts |
| ADR-9 | JWT for stretch auth | Session cookies, Passport.js | JWT | Stateless; SPA-friendly |
| ADR-10 | No pagination in core | Offset pagination, cursor pagination | Deferred | Document as limitation; not required by ACs |
| ADR-11 | Text index for search | Regex query | Text index | Better performance; fallback to regex if needed |
| ADR-12 | Supertest integration tests | Mocked services, e2e Playwright | Supertest + real DB | Proves full stack; mandatory assessment tier |

---

*Last updated: assessment planning phase. Update this document when architecture decisions change during implementation.*
