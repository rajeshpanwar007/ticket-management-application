# Task Tracker

> **Purpose:** Living task list for Cursor sessions. Update status after each work session.

**Last updated:** <!-- TODO: date -->

## Status Legend

| Symbol | Meaning |
|--------|---------|
| `[ ]` | Not started |
| `[~]` | In progress |
| `[x]` | Complete |
| `[-]` | Deferred / out of scope |

---

## Phase 0: Planning and Repository Setup

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P0-1 | Create assessment documentation scaffold | [x] | Root markdown files |
| P0-2 | Create Cursor workflow persistent memory | [x] | This folder |
| P0-3 | Complete `requirements-analysis.md` | [ ] | |
| P0-4 | Complete root `acceptance-criteria.md` | [ ] | |
| P0-5 | Complete `implementation-plan.md` | [ ] | |
| P0-6 | Complete `candidate-info.md` | [ ] | |
| P0-7 | Initialize `server/` package (Express, Mongoose, dotenv) | [ ] | No business logic yet |
| P0-8 | Initialize `client/` package (React + Vite) | [ ] | |
| P0-9 | Add `.env.example`, `.gitignore` | [ ] | No real secrets |
| P0-10 | Add root README run instructions skeleton | [ ] | |

---

## Phase 1: Data Layer

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P1-1 | Create `User` Mongoose model | [ ] | |
| P1-2 | Create `Ticket` Mongoose model | [ ] | Indexes on status, createdBy |
| P1-3 | Create `Comment` Mongoose model | [ ] | Index on ticketId |
| P1-4 | Create `config/db.js` — MongoDB connection | [ ] | |
| P1-5 | Create `scripts/seed.js` | [ ] | Users, tickets, comments |
| P1-6 | Document seed data in `database/seed-data.md` | [ ] | |
| P1-7 | Verify seed runs and data persists | [ ] | AC-9 partial |

---

## Phase 2: Status Machine (Mandatory)

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P2-1 | Create `domain/statusMachine.js` — pure functions | [ ] | `canTransition`, `allowedNextStatuses` |
| P2-2 | Unit tests for statusMachine | [ ] | All valid + invalid paths |
| P2-3 | Integration tests — mandatory tier | [ ] | Supertest + test DB |
| P2-4 | Verify all 8 mandatory scenarios pass | [ ] | See `acceptance-criteria.md` AC-7 |

---

## Phase 3: Core Ticket API

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P3-1 | `utils/ApiError.js` + `utils/asyncHandler.js` | [ ] | |
| P3-2 | `middleware/errorHandler.js` | [ ] | Consistent error shape |
| P3-3 | `middleware/validate.js` — request validation | [ ] | |
| P3-4 | `services/ticket.service.js` | [ ] | Business logic |
| P3-5 | `controllers/ticket.controller.js` | [ ] | Thin controllers |
| P3-6 | `routes/ticket.routes.js` | [ ] | |
| P3-7 | `POST /api/tickets` — create | [ ] | AC-1 |
| P3-8 | `GET /api/tickets` — list | [ ] | AC-2 |
| P3-9 | `GET /api/tickets/:id` — detail | [ ] | AC-3 |
| P3-10 | `PATCH /api/tickets/:id` — update fields | [ ] | AC-4 |
| P3-11 | `PATCH /api/tickets/:id` — reassign | [ ] | AC-5 |
| P3-12 | `PATCH /api/tickets/:id` — status transition | [ ] | AC-7 |
| P3-13 | Search query param on list | [ ] | AC-8 |
| P3-14 | Status filter query param on list | [ ] | AC-8 |
| P3-15 | Validation on all write endpoints | [ ] | AC-10 |
| P3-16 | Update `api-contract.md` with final shapes | [ ] | |

---

## Phase 4: Comments API

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P4-1 | `services/comment.service.js` | [ ] | |
| P4-2 | `controllers/comment.controller.js` | [ ] | |
| P4-3 | `routes/comment.routes.js` | [ ] | |
| P4-4 | `POST /api/tickets/:id/comments` | [ ] | AC-6 |
| P4-5 | Include comments in ticket detail response | [ ] | AC-3 |
| P4-6 | Integration test — add comment + 404 cases | [ ] | |

---

## Phase 5: React UI — Core

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P5-1 | `api/client.js` — axios instance + error handling | [ ] | |
| P5-2 | `api/tickets.js` — endpoint wrappers | [ ] | |
| P5-3 | React Router setup | [ ] | |
| P5-4 | `TicketListPage` — list + search + filter | [ ] | AC-2, AC-8 |
| P5-5 | `CreateTicketPage` — form + validation | [ ] | AC-1 |
| P5-6 | `TicketDetailPage` — view + edit | [ ] | AC-3, AC-4 |
| P5-7 | `StatusActions` — only valid transitions shown | [ ] | AC-7 |
| P5-8 | Assignee selector — reassign | [ ] | AC-5 |
| P5-9 | `CommentList` + add comment form | [ ] | AC-6 |
| P5-10 | Loading, empty, error UI states | [ ] | |
| P5-11 | Update `ui-flow.md` | [ ] | |

---

## Phase 6: Stretch — Auth and RBAC

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P6-1 | `middleware/auth.js` — JWT or session | [-] | Stretch |
| P6-2 | `middleware/rbac.js` — role checks | [-] | Stretch |
| P6-3 | `services/auth.service.js` | [-] | Stretch |
| P6-4 | Auth routes: login, logout, me | [-] | Stretch |
| P6-5 | `canAccessTicket` / `canModifyTicket` in service layer | [-] | Stretch |
| P6-6 | `GET /api/users` for assignee dropdown | [-] | Stretch |
| P6-7 | `LoginPage` + protected routes | [-] | Stretch |
| P6-8 | Permission denial integration tests | [-] | Stretch |

---

## Phase 7: Hardening and Submission

| ID | Task | Status | Notes |
|----|------|--------|-------|
| P7-1 | Run full manual test checklist | [ ] | All 10 ACs |
| P7-2 | Complete `test-results.md` | [ ] | |
| P7-3 | Complete `debugging-notes.md` | [ ] | |
| P7-4 | Self code review → `code-review-notes.md` | [ ] | |
| P7-5 | Apply fixes → `review-fixes.md` | [ ] | |
| P7-6 | Complete `reflection.md` | [ ] | |
| P7-7 | Complete `pr-description.md` | [ ] | |
| P7-8 | Complete `final-ai-usage-summary.md` | [ ] | |
| P7-9 | Final README — clone to run verified | [ ] | |
| P7-10 | Verify no secrets in git history | [ ] | |

---

## Current Sprint Focus

<!-- TODO: Update at the start of each Cursor session -->

**Active phase:** Phase 0 — Planning and Repository Setup

**Today's tasks:**
1. <!-- TODO -->
2. <!-- TODO -->
3. <!-- TODO -->

**Blockers:**
- <!-- TODO: None / describe blocker -->

---

## Session Log

| Date | Tasks Completed | Next Up |
|------|-----------------|---------|
| <!-- TODO --> | <!-- TODO --> | <!-- TODO --> |

---

## Acceptance Criteria Quick Check

| AC | Task IDs | Status |
|----|----------|--------|
| AC-1 Create | P3-7, P5-5 | [ ] |
| AC-2 List | P3-8, P5-4 | [ ] |
| AC-3 Detail | P3-9, P4-5, P5-6 | [ ] |
| AC-4 Update | P3-10, P5-6 | [ ] |
| AC-5 Reassign | P3-11, P5-8 | [ ] |
| AC-6 Comment | P4-4, P5-9 | [ ] |
| AC-7 State machine | P2-1–P2-4, P3-12, P5-7 | [ ] |
| AC-8 Search/filter | P3-13, P3-14, P5-4 | [ ] |
| AC-9 Persistence | P1-5, P1-7 | [ ] |
| AC-10 Validation | P3-3, P3-15 | [ ] |
