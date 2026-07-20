# Debugging Notes

## Overview

This document records realistic debugging sessions encountered while building the Support Ticket Management System. Each scenario follows the same structure: **Problem → Investigation → AI Suggestion → Validation → Final Fix**.

Issues span backend tests, local development setup, API behaviour, MongoDB indexing, and frontend integration. Where AI (Cursor) assisted debugging, the suggestion and whether it was accepted are noted explicitly.

**Environment:** macOS, Node.js 18+, MongoDB 6+, Cursor IDE  
**Date range:** July 2026

---

## Scenario 1: Search Integration Tests Return 500

### Problem

After adding `tests/integration/search.integration.test.js`, three keyword search tests failed:

```
expected 200 "OK", got 500 "Internal Server Error"
```

Failing queries: `search=login`, `search=password`, `search=API`. Status filter and pagination tests in the same file passed.

Server logs showed:

```
MongoServerError: text index required for $text query
    at Module.getTickets (src/services/ticket.service.js)
```

### Investigation

1. Ran the full suite: `cd server && npm test` — 3 failures, all in search tests.
2. Inspected `domain/ticketQuery.js` — alphanumeric searches use `$text: { $search: ... }`.
3. Checked `models/ticket.model.js` — text index defined on `{ title: 'text', description: 'text' }`.
4. Compared with `tests/integration/tickets.integration.test.js` search tests — those passed because they create tickets via API after the app has been running long enough for Mongoose `autoIndex` to complete.
5. New seed-based search tests call `GET /api/tickets?search=login` immediately after `seedIntegrationDatabase()` in `beforeEach`, before indexes are guaranteed to exist on the in-memory database.

**Root cause:** Mongoose schema indexes were defined but not synced on the ephemeral `mongodb-memory-server` instance before the first `$text` query.

### AI Suggestion

> Add `await Ticket.syncIndexes()` in `tests/helpers/testEnvironment.js` immediately after `connectDB()`. This forces creation of all schema-defined indexes (including the text index) before any integration test runs. Do not switch search to regex-only — that would lose relevance scoring and diverge from production behaviour.

### Validation

1. Added `syncIndexes()` to the test helper.
2. Re-ran search tests: `npm test -- --testPathPattern=search` — 12/12 passed.
3. Re-ran full suite: 173/173 passed.
4. Confirmed production/local dev unaffected — indexes are created on server start via Mongoose `autoIndex` in development.

### Final Fix

```js
// server/tests/helpers/testEnvironment.js
await connectDB();

const { Ticket } = await import('../../src/models/index.js');
await Ticket.syncIndexes();
```

**Prevention:** Any new integration test that relies on MongoDB indexes should use the shared `connectIntegrationEnvironment()` helper, not a standalone memory server setup without `syncIndexes()`.

---

## Scenario 2: Jest Tests Fail to Start — Memory Server Hangs

### Problem

Running `npm test` inside the Cursor IDE terminal produced no output for 30+ seconds, then failed with errors related to `mongodb-memory-server` binary download or process spawn permissions.

Earlier symptom when running in sandbox:

```
Error: listen EPERM: operation not permitted
```

### Investigation

1. Ran `npm test` with default sandbox — hung or failed on `MongoMemoryServer.create()`.
2. Checked `jest.config.js` — `maxWorkers: 1`, `testTimeout: 30000` already set.
3. Verified `mongodb-memory-server` needs to download a MongoDB binary on first run (network + filesystem write).
4. Confirmed sandbox restrictions block subprocess spawning and some network calls.
5. Re-ran with unrestricted permissions — tests started and completed in ~26 seconds.

**Root cause:** IDE sandbox blocked `mongodb-memory-server` from downloading/spawning the embedded MongoDB process. Not an application bug.

### AI Suggestion

> Run backend tests outside the sandbox (`required_permissions: ["all"]` in Cursor) or from a regular terminal. Document this in the README. Do not remove integration tests or replace them with mocked Mongoose models — that would eliminate coverage of real query behaviour.

### Validation

1. Ran `npm test` from a regular terminal (outside sandbox) — all 173 tests passed.
2. Ran from Cursor with full permissions — same result.
3. Second run was faster (~20s) because the MongoDB binary was cached.

### Final Fix

No application code change. Process fix:

- Run `cd server && npm test` from a terminal with full permissions.
- Document in README: integration tests require `mongodb-memory-server`, which needs network access on first run.

**Prevention:** CI pipeline must allow binary download and subprocess creation for the test job.

---

## Scenario 3: `npx jest` Fails with ESM Syntax Error

### Problem

Attempted to run a single test file directly:

```bash
npx jest tests/integration/search.integration.test.js
```

Immediate failure:

```
SyntaxError: Cannot use import statement outside a module
  at tests/integration/search.integration.test.js:1
```

### Investigation

1. Noted the project uses `"type": "module"` in `package.json`.
2. Compared with the working command: `npm test` uses `node --experimental-vm-modules node_modules/jest/bin/jest.js`.
3. Running `npx jest` directly bypasses the npm script and its ESM flags.
4. Checked Jest config — `transform: {}` (no Babel), relies on native ESM support.

**Root cause:** Jest ESM support requires `--experimental-vm-modules`, which is only set in the `npm test` script.

### AI Suggestion

> Always use `npm test` instead of `npx jest`. To run a single file: `npm test -- --testPathPattern=search`. Do not convert the project to CommonJS — the entire codebase uses ES module `import`/`export`.

### Validation

```bash
npm test -- --testPathPattern=search.integration
# PASS  tests/integration/search.integration.test.js
```

### Final Fix

No code change. Use the correct command:

```bash
npm test                                          # full suite
npm test -- --testPathPattern=stateMachine        # single suite
npm run test:watch                                # watch mode
```

**Prevention:** Add a note to `server/README.md` and developer onboarding: never invoke `npx jest` directly.

---

## Scenario 4: Server Crashes on Startup — Missing `MONGODB_URI`

### Problem

Starting the backend after a fresh clone:

```bash
cd server && npm run dev
```

Server exited immediately:

```
Error: MONGODB_URI is required. Copy .env.example to .env and set a value.
    at file:///.../server/src/config/env.js:15
```

### Investigation

1. Checked whether `.env` exists — it did not (only `.env.example` present, correctly gitignored).
2. Read `src/config/env.js` — throws at import time if `MONGODB_URI` is falsy.
3. Confirmed `.env.example` contains `MONGODB_URI=mongodb://localhost:27017/ticket-management`.
4. Verified MongoDB was running locally: `mongosh --eval "db.runCommand({ ping: 1 })"` returned `{ ok: 1 }`.

**Root cause:** `.env` file not created from `.env.example` after cloning the repository.

### AI Suggestion

> Copy `.env.example` to `.env` and set `MONGODB_URI`. Ensure MongoDB is running before starting the server. The fail-fast check in `env.js` is correct — do not remove it or default to a hardcoded URI.

### Validation

```bash
cp .env.example .env
npm run dev
# [INFO] MongoDB connected: 127.0.0.1
# [INFO] Server running on port 5000 (development)
```

`GET http://localhost:5000/health` returned `200`.

### Final Fix

```bash
cd server
cp .env.example .env
# Edit .env if MongoDB runs on a non-default host/port
npm run dev
```

**Prevention:** README installation steps include explicit `cp .env.example .env`. Consider a post-install script or startup warning if `.env` is missing.

---

## Scenario 5: Frontend Shows "Network Error" — Backend Not Running

### Problem

With the React dev server running (`npm run dev` in `client/`), the ticket list page displayed:

```
Failed to load tickets. Network Error
```

Browser Network tab showed requests to `http://localhost:5173/api/tickets` returning **502** or **ECONNREFUSED**.

### Investigation

1. Opened browser DevTools → Network — `GET /api/tickets` proxied to `localhost:5000` via Vite config.
2. Checked `client/vite.config.js` — proxy target is `http://localhost:5000`.
3. Confirmed backend was **not** running — only the Vite dev server was active.
4. Verified `httpClient.js` uses `baseURL: import.meta.env.VITE_API_URL || '/api'` — correct for dev proxy.
5. Started backend: `cd server && npm run dev` — proxy requests immediately succeeded.

**Root cause:** Vite proxies `/api` to port 5000, but the Express server was not started. The frontend error message was accurate but did not hint at the missing backend.

### AI Suggestion

> Start both servers: backend on port 5000, frontend on port 5173. Optionally improve the error message in `getErrorMessage()` to detect `ECONNREFUSED` / no response and suggest checking the API server. Do not change the proxy config — it is correct.

### Validation

1. Started backend → refreshed browser → ticket list loaded with 8 seeded tickets.
2. Stopped backend → error reappeared — confirms diagnosis.
3. Restarted backend → recovered without frontend restart.

### Final Fix

Operational — both servers must run:

```bash
# Terminal 1
cd server && npm run dev

# Terminal 2
cd client && npm run dev
```

Optional UX improvement (not yet implemented): detect network errors in `utils/apiError.js` and return *"Cannot reach API server. Is the backend running on port 5000?"*

**Prevention:** Document two-terminal setup in README Quick Start.

---

## Scenario 6: Status Update Returns 409 — Invalid Transition

### Problem

While testing the ticket detail page, clicking **Close** on a ticket with status **Open** showed an inline error:

```
Cannot change status from Open to Closed. Allowed transitions from Open: In Progress, Cancelled.
```

HTTP response: `409 Conflict`, error code `INVALID_TRANSITION`.

### Investigation

1. Checked browser Network tab — `PATCH /api/tickets/:id/status` with body `{ "status": "closed" }`.
2. Read `domain/statusMachine.js` — valid transitions from `open` are only `in_progress` and `cancelled`.
3. Inspected `StatusActions.jsx` — buttons are rendered from `allowedNextStatuses` returned by the API, so a **Close** button should not appear on an open ticket.
4. Reproduced via curl with a direct API call (bypassing UI) — same 409, confirming server enforcement is correct.
5. Found the UI bug: during development, a temporary test button was added to `StatusActions` that called `onTransition('closed')` regardless of allowed statuses. Removed before submission.

**Root cause (API):** Not a bug — server correctly rejected `open → closed`.  
**Root cause (UI, during dev):** A test button bypassed `allowedNextStatuses` filtering.

### AI Suggestion

> The 409 response is correct server behaviour. Ensure `StatusActions` only renders buttons for statuses in `allowedNextStatuses` from the ticket response. Add an integration test for `open → closed` expecting 409. Do not weaken the state machine to allow skipping states.

### Validation

1. Integration test added in `stateMachine.integration.test.js`:

   ```js
   it('rejects open → closed with 409', async () => {
     const response = await request(app)
       .patch(`/api/tickets/${openTicketId}/status`)
       .send({ status: 'closed' })
       .expect(409);

     expect(response.body.error.code).toBe('INVALID_TRANSITION');
   });
   ```

2. UI verified — only **Start Progress** and **Cancel** buttons shown for open tickets.
3. Full transition path tested: `open → in_progress → resolved → closed` — all 200.

### Final Fix

- **Server:** No change needed — state machine working as designed.
- **Frontend:** `StatusActions` renders buttons exclusively from `allowedNextStatuses` prop.
- **Tests:** Integration test confirms `open → closed` returns 409.

**Prevention:** Never hardcode status buttons; always derive from server-provided `allowedNextStatuses`.

---

## Scenario 7: CORS Error After Changing Frontend Port

### Problem

Changed Vite dev server port to `3000` in `vite.config.js` for a local port conflict. Browser console showed:

```
Access to XMLHttpRequest at 'http://localhost:5000/api/tickets' from origin
'http://localhost:3000' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

### Investigation

1. Noted the error only appeared after setting `VITE_API_URL=http://localhost:5000/api` in `client/.env` (bypassing the Vite proxy).
2. Read `server/src/app.js` — `cors({ origin: env.clientUrl })` where `CLIENT_URL` defaults to `http://localhost:5173`.
3. With direct API URL, requests go from origin `http://localhost:3000` to `http://localhost:5000` — cross-origin.
4. Server CORS only allows `http://localhost:5173` — request blocked.

**Root cause:** Mismatch between frontend origin (`localhost:3000`) and `CLIENT_URL` in server `.env` (`localhost:5173`). Triggered by bypassing the Vite proxy with `VITE_API_URL`.

### AI Suggestion

> Either (a) revert to using the Vite proxy (remove `VITE_API_URL`, keep default `/api` base URL) and only change the Vite port, or (b) update `CLIENT_URL=http://localhost:3000` in `server/.env` to match. Option (a) is preferred for local development — the proxy avoids CORS entirely.

### Validation

**Option A (preferred):**

```bash
# client/.env — remove or comment out VITE_API_URL
# client/vite.config.js — port: 3000, proxy unchanged
# server/.env — CLIENT_URL=http://localhost:3000
```

Requests to `http://localhost:3000/api/tickets` proxied to backend — no CORS error.

**Option B:**

```bash
# server/.env
CLIENT_URL=http://localhost:3000
```

Direct requests to `http://localhost:5000/api` allowed — no CORS error.

### Final Fix

Reverted to Vite proxy approach (no `VITE_API_URL` in dev). Updated `CLIENT_URL` in `server/.env` to match the Vite port when changed:

```env
CLIENT_URL=http://localhost:3000
```

**Prevention:** In development, prefer the Vite `/api` proxy over setting `VITE_API_URL`. Reserve `VITE_API_URL` for production builds behind a reverse proxy.

---

## Common Errors Quick Reference

### API Errors

| Status | Code | Typical Cause | How to Debug |
|--------|------|---------------|--------------|
| 400 | `VALIDATION_ERROR` | Missing/invalid field | Check `error.details` for field messages |
| 400 | `BAD_REQUEST` | Invalid ObjectId in URL | Verify ID format (24-char hex) |
| 404 | `NOT_FOUND` | Ticket/user not found or soft-deleted | Confirm ticket exists and `deletedAt` is null |
| 409 | `INVALID_TRANSITION` | Status change violates state machine | Check `allowedNextStatuses` on ticket response |
| 409 | `DUPLICATE_KEY` | Duplicate email on user create | Unique index violation |
| 500 | `INTERNAL_ERROR` | Unhandled server error | Check server logs for stack trace |

### Database

| Error | Cause | Fix |
|-------|-------|-----|
| `MONGODB_URI is required` | Missing `.env` | `cp .env.example .env` |
| `ECONNREFUSED 27017` | MongoDB not running | Start `mongod` or `brew services start mongodb-community` |
| `text index required for $text query` | Index not created | `Ticket.syncIndexes()` or restart server |
| Memory server hang | Sandbox restrictions | Run tests outside sandbox |

### Frontend

| Symptom | Cause | Fix |
|---------|-------|-----|
| Network Error | Backend not running | Start `server/npm run dev` |
| CORS blocked | `CLIENT_URL` mismatch | Align server `.env` with frontend origin, or use Vite proxy |
| Empty user dropdown | Users not seeded | Run `npm run seed` in server |
| 409 on status click | Invalid transition | Use buttons from `allowedNextStatuses` only |

---

## Debugging Tools Used

| Tool | Used For |
|------|----------|
| **Jest / Supertest** | Reproducing API failures with exact status codes and response bodies |
| **Browser DevTools (Network)** | Tracing proxied requests, CORS errors, response payloads |
| **Browser DevTools (Console)** | React errors, Axios rejection messages |
| **Server request logs** | `[INFO]` / `[WARN]` lines with method, path, status, duration |
| **`mongosh`** | Verifying MongoDB connectivity and index existence (`db.tickets.getIndexes()`) |
| **`curl`** | Isolating API behaviour from frontend (`curl -X PATCH ...`) |
| **`rg` / grep** | Tracing error codes and filter construction across codebase |
| **Cursor AI** | Suggesting root causes; always validated by re-running tests |

---

## Lessons Learned

1. **Reproduce before fixing** — run the failing test or curl command in isolation before changing code.
2. **Read the error message literally** — `text index required for $text query` pointed directly to the fix.
3. **Distinguish environment from application bugs** — sandbox and missing `.env` are not code defects.
4. **Validate AI suggestions by running tests** — the `syncIndexes()` fix was confirmed by 173/173 passing, not assumed correct.
5. **Trust the state machine** — 409 responses during status testing usually mean the client sent an invalid transition, not a server bug.
6. **Use the Vite proxy in dev** — avoids an entire class of CORS issues.
7. **Use `npm test`, not `npx jest`** — ESM projects need the script-defined Node flags.

## Related Artifacts

- [`ai-prompts/debugging.md`](ai-prompts/debugging.md) — AI-assisted debugging log
- [`code-review-notes.md`](code-review-notes.md) — issues found during code review
- [`server/tests/helpers/testEnvironment.js`](server/tests/helpers/testEnvironment.js) — test setup with `syncIndexes()`
