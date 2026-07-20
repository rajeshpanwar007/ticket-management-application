# Cursor Rules and Instructions

> **Purpose:** Binding rules for all AI-assisted work on this project. Cursor must follow these in every session.

---

## 1. Session Startup Protocol

At the start of every Cursor session:

1. Read `project-context.md` for scope and constraints
2. Read `tasks.md` for current phase and active tasks
3. Read `spec.md` before implementing any feature
4. Check `acceptance-criteria.md` for testable definitions
5. After completing work: update `tasks.md`, log prompts in `ai-prompts/`

**Do not generate code before reading the spec.**

---

## 2. Architecture Rules

### 2.1 Layered Backend (strict)

```
Request → Route → Controller → Service → Model → MongoDB
                  ↓
              Middleware (validate, auth, errorHandler)
```

| Layer | Responsibility | Must NOT do |
|-------|---------------|-------------|
| **Routes** | Map HTTP method + path to controller | Business logic, DB queries |
| **Controllers** | Parse req, call service, format res | Validation rules, state machine |
| **Services** | Business logic, permissions, orchestration | HTTP status codes directly |
| **Models** | Schema, indexes, Mongoose config | Business rules |
| **Domain** (`domain/`) | Pure functions (status machine) | DB access, HTTP |
| **Middleware** | Cross-cutting: auth, validate, errors | Business logic |

### 2.2 State Machine Placement

- `domain/statusMachine.js` contains **only pure functions**
- Services call `canTransition(from, to)` before updating status
- Routes and controllers never contain transition logic
- React UI mirrors allowed transitions for display only — **never relies on UI alone**

### 2.3 Frontend Architecture

```
Page → Components → api/ wrappers → Express API
```

- Pages own data-fetching (or via custom hooks)
- Components are presentational where possible
- All HTTP calls go through `api/` module — no raw fetch scattered in components
- Status buttons derived from `allowedNextStatuses(currentStatus)` — shared constant or API field

### 2.4 API Design Rules

- REST JSON under `/api`
- Consistent success shape: `{ ticket }`, `{ tickets }`, `{ comment }`
- Consistent error shape: `{ error: { code, message, details? } }`
- Use correct HTTP verbs: GET (read), POST (create), PATCH (partial update)
- No `PUT` unless full replacement is genuinely needed

### 2.5 Dependency Direction

- `domain/` imports nothing from other server layers
- `services/` may import `domain/`, `models/`, `utils/`
- `controllers/` may import `services/` only
- `routes/` may import `controllers/` and `middleware/`
- Client never imports server code directly

---

## 3. Coding Standards

### 3.1 Language and Runtime

- **Node.js 20 LTS** for server
- **ES Modules** (`"type": "module"` in server package.json) OR CommonJS — pick one, stay consistent
- **React 18** with functional components and hooks only — no class components
- **JavaScript** for server (or TypeScript if explicitly chosen — stay consistent across server and client)

### 3.2 Formatting

- 2-space indentation
- Single quotes for strings (JS)
- Semicolons required
- Trailing commas in multi-line objects and arrays
- Max line length: 100 characters (soft limit)
- Run ESLint + Prettier before committing

### 3.3 File Size and Complexity

- Max ~150 lines per file; split if larger
- Max ~20 lines per function; extract helpers if larger
- One export per file for services, controllers, models
- No dead code, no commented-out blocks, no `console.log` in committed code

### 3.4 Error Handling

- All async route handlers wrapped with `asyncHandler` (or express-async-errors)
- Services throw `ApiError` with `statusCode` and `code`
- Global `errorHandler` middleware formats all errors consistently
- Never expose stack traces in production responses
- Never swallow errors silently

### 3.5 Environment and Secrets

- All config via `process.env` loaded in `config/env.js`
- `.env` in `.gitignore` — never commit
- `.env.example` with placeholder values only
- Never hardcode MongoDB URIs, JWT secrets, or passwords

---

## 4. Naming Conventions

### 4.1 Files and Folders

| Type | Convention | Example |
|------|-----------|---------|
| Server model | `{entity}.model.js` | `ticket.model.js` |
| Server service | `{entity}.service.js` | `ticket.service.js` |
| Server controller | `{entity}.controller.js` | `ticket.controller.js` |
| Server route | `{entity}.routes.js` | `ticket.routes.js` |
| Server middleware | `{name}.middleware.js` | `validate.middleware.js` |
| Domain module | `{name}.js` in `domain/` | `statusMachine.js` |
| React page | `{Name}Page.jsx` | `TicketListPage.jsx` |
| React component | `{Name}.jsx` | `StatusActions.jsx` |
| API wrapper | `{entity}.js` in `api/` | `tickets.js` |
| Test file | `{name}.test.js` | `statusMachine.test.js` |
| Integration test | `{name}.integration.test.js` | `statusMachine.integration.test.js` |

### 4.2 Variables and Functions

| Type | Convention | Example |
|------|-----------|---------|
| Variables | camelCase | `ticketId`, `assignedTo` |
| Constants | UPPER_SNAKE_CASE | `TICKET_STATUSES`, `MAX_TITLE_LENGTH` |
| Functions | camelCase, verb-first | `getTicketById`, `canTransition` |
| Classes | PascalCase | `ApiError` |
| React components | PascalCase | `TicketList` |
| MongoDB fields | camelCase | `createdBy`, `assignedTo` |
| Enum values | snake_case strings | `"in_progress"`, `"open"` |
| Boolean variables | `is`/`has`/`can` prefix | `isValid`, `hasPermission`, `canAccessTicket` |
| Express req/res | `req`, `res`, `next` | — |

### 4.3 API and Route Naming

- Plural nouns for collections: `/api/tickets`, `/api/users`
- Nested resources: `/api/tickets/:id/comments`
- Query params: camelCase — `?search=keyword&status=open`
- Error codes: UPPER_SNAKE_CASE — `INVALID_TRANSITION`, `VALIDATION_ERROR`

---

## 5. Testing Strategy

### 5.1 Test Pyramid

```
        ┌─────────────┐
        │  Manual/E2E │  ← Pre-submission checklist
        ├─────────────┤
        │ Integration │  ← Mandatory state-machine tests
        ├─────────────┤
        │    Unit     │  ← statusMachine pure functions
        └─────────────┘
```

### 5.2 Mandatory Tests (non-negotiable)

File: `server/tests/integration/statusMachine.integration.test.js`

Must use **real HTTP requests** (Supertest) against a **test MongoDB database** — no mocks for the state machine integration tier.

All 8 scenarios in `acceptance-criteria.md` AC-7 must pass.

### 5.3 Unit Tests

| Module | What to test |
|--------|-------------|
| `domain/statusMachine.js` | Every valid and invalid transition |
| `utils/` helpers | Edge cases |
| `canAccessTicket` (stretch) | Permission matrix |

### 5.4 Integration Tests (recommended)

- Ticket CRUD lifecycle
- Comment creation and 404 cases
- Search and filter query params
- Validation 400 responses
- Permission denial 403 (stretch)

### 5.5 Test Environment

- Separate test DB: `MONGODB_URI` with `/ticket-management-test` database
- Seed minimal data in `beforeAll`; clean up in `afterAll`
- Never run tests against production or development seed data

### 5.6 When to Write Tests

| Trigger | Action |
|---------|--------|
| New `domain/` function | Unit test required |
| Status machine change | Update integration tests |
| New API endpoint | Integration test recommended |
| Bug fix | Regression test required |
| UI-only change | Manual verification sufficient |

### 5.7 Running Tests

```bash
# Server unit + integration
cd server && npm test

# Watch mode during development
cd server && npm run test:watch
```

---

## 6. AI Usage Rules

### 6.1 Principles

1. **AI is a tool, not an author** — you own every line committed
2. **Read before accepting** — never commit AI output without review
3. **Challenge incorrect output** — especially state machine logic and permissions
4. **Log all significant prompts** in `ai-prompts/`
5. **Document corrections** when AI makes mistakes

### 6.2 What AI May Generate

- Boilerplate (Express setup, Mongoose schemas, React components)
- Test scaffolding
- Documentation drafts
- Refactoring suggestions

### 6.3 What Requires Human Verification

- State machine transition table (verify against `spec.md`)
- Permission matrix and RBAC logic
- Environment variable names and security config
- Error response shapes
- Seed data credentials
- Any code that handles authentication or authorization

### 6.4 Prompting Guidelines

**Do:**
- Reference `spec.md` and `acceptance-criteria.md` in prompts
- Ask for one layer at a time (model → service → controller → route)
- Request tests alongside implementation
- Ask AI to explain trade-offs before choosing an approach
- Specify "follow `cursor-rules-or-instructions.md`"

**Do not:**
- Ask AI to "build the entire app" in one prompt
- Accept generated code without reading it
- Let AI choose the tech stack (MERN is fixed)
- Skip logging prompts for significant generation sessions
- Commit AI-generated secrets or real credentials

### 6.5 Prompt Logging Format

For each significant AI interaction, append to the relevant file in `ai-prompts/`:

```markdown
## [Date] — [Topic]

**Prompt:** [what you asked]
**AI output summary:** [what it produced]
**Accepted:** [yes/no/partial]
**Changes made:** [what you modified and why]
```

### 6.6 AI Mistake Protocol

When AI generates incorrect code:

1. Do not silently fix — document in `ai-prompts/` under "Mistakes Corrected"
2. Add a regression test if the mistake was a logic error
3. Note the lesson in `final-ai-usage-summary.md`

### 6.7 Prohibited AI Patterns

- `eval()` or dynamic code execution
- Disabling TLS or CORS `*`
- Storing plaintext passwords
- Client-only permission checks without server enforcement
- In-memory arrays instead of MongoDB for persistence
- Skipping validation "for now"

---

## 7. Git and Commit Rules

### 7.1 Commit Messages

Format: `type(scope): description`

Types: `feat`, `fix`, `test`, `docs`, `refactor`, `chore`

Examples:
- `feat(tickets): add POST /api/tickets endpoint`
- `test(statusMachine): add integration tests for invalid transitions`
- `docs(readme): add database setup instructions`

### 7.2 Commit Granularity

- One logical change per commit
- Tests included in the same commit as the feature they cover
- Documentation updates in separate `docs` commits

### 7.3 Branch Naming

`cursor/<task-id>-<short-description>`

Example: `cursor/P2-3-status-machine-integration-tests`

---

## 8. Implementation Workflow

For each task in `tasks.md`:

```
1. Read relevant spec section
2. Check acceptance criteria for the task
3. Implement smallest working slice
4. Write/update tests
5. Run tests locally
6. Update tasks.md status
7. Log AI prompts if used
8. Update acceptance-criteria.md if AC is now verified
```

### 8.1 Order of Implementation

Always follow this order — do not skip ahead:

1. `domain/statusMachine.js` + unit tests
2. Mongoose models + seed script
3. Ticket service + controller + routes
4. State machine integration tests (mandatory)
5. Comment endpoints
6. React API layer
7. React pages and components
8. Stretch: auth → RBAC → user management

### 8.2 Scope Control

- Complete all 10 core ACs before starting stretch features
- Do not add pagination, audit logs, or notifications unless explicitly requested
- Do not refactor unrelated files while implementing a task

---

## 9. Documentation Rules

| Event | Update |
|-------|--------|
| New endpoint | `api-contract.md` |
| Schema change | `data-model.md`, `database/schema-overview.md` |
| UI flow change | `ui-flow.md` |
| Test run | `test-results.md` |
| Bug found and fixed | `debugging-notes.md` |
| Code review | `code-review-notes.md` |
| AI session | `ai-prompts/0X-*.md` |
| Phase complete | `tasks.md` status |

---

## 10. Quality Checklist (before every commit)

- [ ] Follows architecture layer rules
- [ ] Naming conventions applied
- [ ] No secrets in diff
- [ ] Error handling in place
- [ ] Tests pass (`npm test` in server)
- [ ] No `console.log` left in code
- [ ] `tasks.md` updated
- [ ] AI prompts logged if AI was used

---

## 11. Reference Files

| File | Role |
|------|------|
| `project-context.md` | What and why |
| `spec.md` | What to build (authoritative) |
| `tasks.md` | What to do next |
| `acceptance-criteria.md` | How to verify |
| `cursor-rules-or-instructions.md` | How to build (this file) |
