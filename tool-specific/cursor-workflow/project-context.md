# Project Context

> **Purpose:** Persistent project memory for Cursor. Read this file at the start of every session before making changes.

## Project Identity

| Field | Value |
|-------|-------|
| **Name** | Support Ticket Management System |
| **Type** | AI Practical Assessment — full-stack submission |
| **Stack** | MERN (MongoDB, Express, React, Node.js) |
| **Repository** | `ticket-management-application` |

## Problem Statement

Build a support ticket management application where users create, track, and resolve support requests through a governed lifecycle. The system models **Users**, **Tickets**, and **Comments**, enforces a **server-side ticket status state machine**, and provides list/detail workflows with **search and filtering**.

## Primary Goals

1. Satisfy all **10 Core Acceptance Criteria** (see `acceptance-criteria.md`).
2. Enforce the **status state machine on the server** — not only in the UI.
3. Persist all data in **MongoDB** (no in-memory storage).
4. Deliver a working **React SPA** connected to an **Express REST API**.
5. Pass the **mandatory state-machine integration test tier**.
6. Document the full lifecycle: planning → implementation → testing → review → reflection.
7. Maintain a **traceable AI workflow** (prompts, decisions, corrections).

## Scope Boundaries

### In Scope (Core)

- Ticket create, list, detail, update, reassign
- Comment creation on tickets
- Status state machine with valid/invalid transition enforcement
- Search (keyword) and filter (status) on ticket list
- Server-side validation and consistent error responses
- MongoDB persistence with seed data
- Assessment documentation artifacts

### In Scope (Stretch — after core is complete)

- Authentication (login / logout / session or JWT)
- Role-based access control (RBAC)
- User management (list/create users)
- Permission boundaries enforced at API layer

### Out of Scope

- File attachments on tickets
- Email / push notifications
- Audit / change-history log
- Pagination (document as future improvement)
- Multi-tenant organizations
- Production deployment / CI/CD (optional bonus only)

## Core Entities

| Entity | Purpose |
|--------|---------|
| **User** | Ticket creator and assignee; carries role if auth is implemented |
| **Ticket** | Support request with title, description, status, priority, assignee |
| **Comment** | Append-only message thread on a ticket |

## Signature Domain Logic

The **ticket status state machine** is the hardest and most important piece of core logic. Invalid transitions (e.g., `open → closed`) must be rejected by the API with HTTP **409** and a message listing allowed next states. This logic lives in a **pure, isolated server module** — never embedded in route handlers or React components.

## Repository Layout

```
ticket-management-application/
├── README.md                          # Run instructions, demo credentials
├── candidate-info.md
├── requirements-analysis.md
├── acceptance-criteria.md               # Root-level AC tracking
├── implementation-plan.md
├── design-notes.md
├── api-contract.md
├── data-model.md
├── ui-flow.md
├── test-strategy.md
├── test-results.md
├── debugging-notes.md
├── code-review-notes.md
├── review-fixes.md
├── reflection.md
├── pr-description.md
├── final-ai-usage-summary.md
├── database/                          # DB setup, schema, seed docs
├── ai-prompts/                        # Prompt history by phase
├── tool-specific/cursor-workflow/     # ← Persistent Cursor memory (this folder)
├── server/                            # Express API (to be created)
└── client/                            # React SPA (to be created)
```

## Planned Application Layout

```
server/
├── src/
│   ├── index.js              # Entry: DB connect + listen
│   ├── app.js                # Express app setup
│   ├── config/               # env, db
│   ├── models/               # Mongoose schemas
│   ├── routes/               # Route definitions only
│   ├── controllers/          # Request/response handling
│   ├── services/             # Business logic
│   ├── domain/               # statusMachine.js (pure logic)
│   ├── middleware/           # validate, auth, errorHandler
│   ├── utils/                # ApiError, asyncHandler
│   └── scripts/              # seed.js
└── tests/
    ├── integration/          # Mandatory state-machine tests
    └── unit/

client/
├── src/
│   ├── api/                  # HTTP client + endpoint wrappers
│   ├── components/           # Reusable UI
│   ├── pages/                # Route-level views
│   ├── hooks/                # Data-fetching hooks
│   ├── constants/            # Status enums (UI display only)
│   └── utils/                # Client validation helpers
```

## Key Constraints

- **Stack is fixed:** MongoDB + Express + React + Node.js. Do not substitute frameworks without explicit approval.
- **No secrets in repo:** Use `.env` + `.env.example` only.
- **Server enforces business rules:** Never trust the client for status transitions or permissions.
- **Minimal diffs:** Smallest change that solves the task; no unrelated refactors.
- **No new dependencies** unless justified and pinned.
- **Tests required** when behavior changes; mandatory integration tests for state machine.
- **Document decisions** in `ai-prompts/` and `final-ai-usage-summary.md`.

## User Roles (Stretch)

| Role | Hierarchy | Typical Access |
|------|-----------|----------------|
| `customer` | Lowest | Own tickets only |
| `agent` | ↑ | Assigned tickets |
| `manager` | ↑ | Team tickets, reassign |
| `admin` | Highest | Full access, user management |

Customers must be restricted **at the API layer**, not only by hiding UI elements.

## Environment Variables

| Variable | Layer | Purpose |
|----------|-------|---------|
| `MONGODB_URI` | Server | MongoDB connection string |
| `PORT` | Server | API listen port (default `5000`) |
| `NODE_ENV` | Server | `development` / `test` / `production` |
| `JWT_SECRET` | Server | Auth signing key (stretch only) |
| `CLIENT_URL` | Server | CORS allowed origin |
| `VITE_API_URL` | Client | Express API base URL |

## Persistent Context Files (read in order)

1. `project-context.md` — this file
2. `spec.md` — full functional specification
3. `acceptance-criteria.md` — testable AC definitions
4. `tasks.md` — current task status and next steps
5. `cursor-rules-or-instructions.md` — coding standards and AI rules

## Definition of Done

A feature is done when:

- [ ] Code implements the requirement
- [ ] Server-side validation and error handling are in place
- [ ] Relevant tests pass (integration tests for state machine changes)
- [ ] No secrets committed
- [ ] `acceptance-criteria.md` updated with evidence
- [ ] Prompt/decision logged in `ai-prompts/` if AI was used
- [ ] README updated if setup or run steps changed

## Related Documentation

| Document | Location |
|----------|----------|
| Full spec | `spec.md` |
| Task tracker | `tasks.md` |
| Cursor rules | `cursor-rules-or-instructions.md` |
| API contract | `../../api-contract.md` |
| Data model | `../../data-model.md` |
| Test strategy | `../../test-strategy.md` |
| Prompt history | `../../ai-prompts/` |
