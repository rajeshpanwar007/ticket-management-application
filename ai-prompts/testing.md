# AI Usage — Testing Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: Integration tests, unit tests, frontend component tests

This document records AI prompts used during testing, including what was accepted, modified, or rejected.

---

## Prompt 1: State Machine Integration Tests

### Original Prompt

```
Create integration tests using Jest and Supertest.

Focus on Ticket State Machine.

Verify:

Valid transitions succeed
Invalid transitions fail
Database updates correctly
HTTP status codes
Error messages

Seed test database before tests.
```

### AI Summary

The AI created `tests/integration/stateMachine.integration.test.js` with a shared test environment helper (`connectIntegrationEnvironment`, `seedIntegrationDatabase`), 19 test cases covering all valid transitions from seed data, invalid transitions returning 409 with `INVALID_TRANSITION`, DB state verification after each transition, and human-readable error messages.

### Accepted

- `mongodb-memory-server` for isolated test database
- `testEnvironment.js` helper shared across integration suites
- Seed data loaded before each test (`beforeEach`)
- Assertions on HTTP status, error code, error message, and DB state
- `maxWorkers: 1` in Jest config (memory server stability)

### Modified

- `Ticket.syncIndexes()` added to test environment setup (see debugging.md) after search tests revealed index gap
- Test timeout increased to 30s for memory server startup

### Rejected

- Hitting a real MongoDB instance in CI
- Mocking the service layer in integration tests (defeats purpose)
- Skipping DB verification (HTTP-only assertions insufficient)

### Reason

State machine integration tests are the assessment's mandatory test tier. Seeded data provides known starting states; DB verification confirms persistence, not just HTTP responses.

---

## Prompt 2: Additional Test Coverage

### Original Prompt

```
Generate additional tests.

CRUD tests
Validation tests
Comment tests
Search tests
Backend error tests
Frontend component tests where useful.
```

### AI Summary

The AI added six backend integration test files (CRUD, search, validation, comments, backend errors, users), expanded existing suites, set up Vitest + Testing Library in the client, and created 14 frontend tests for validation utils, API error helpers, retry logic, debounce hook, StatusBadge, StatusActions, and ErrorAlert components.

### Accepted

**Backend integration tests:**

| File | Coverage |
|------|----------|
| `crud.integration.test.js` | Full ticket lifecycle with seed data |
| `search.integration.test.js` | Keyword, status, combined filters, pagination |
| `validation.integration.test.js` | Field validation for tickets and comments |
| `comments.seed.integration.test.js` | Seed-based comment threads |
| `backendErrors.integration.test.js` | 404, cast errors, soft-delete 404 |
| `users.integration.test.js` | User list, role filter, get by ID |

**Backend unit tests:** `statusMachine`, `ticketQuery`, `errors`, `models`

**Frontend tests (Vitest):** `validation.test.js`, `apiError.test.js`, `retry.test.js`, `useDebounce.test.js`, `StatusBadge.test.jsx`, `ErrorAlert.test.jsx`

### Modified

- Frontend test scope limited to utilities and small components (not full page E2E)
- `StatusBadge.test.jsx` also covers `StatusActions` (combined file)
- Search integration tests required `Ticket.syncIndexes()` fix in test helper

### Rejected

- Cypress/Playwright E2E tests (time/scope constraint)
- Testing every React page component (diminishing returns)
- Snapshot testing for UI components
- 100% code coverage target

### Reason

Integration tests provide highest value for API correctness. Frontend tests focus on pure utilities and isolated components where logic is non-trivial (retry, debounce, validation). Page-level tests would mostly duplicate integration coverage.

---

## Test Results (AI-Assisted)

| Suite | Tests | Status |
|-------|-------|--------|
| Backend unit | 4 files | All passing |
| Backend integration | 11 files | 173 tests passing |
| Frontend (Vitest) | 6 files | 14 tests passing |
| **Total** | **187** | **All passing** |

### Commands

```bash
cd server && npm test        # Jest + Supertest (requires full permissions for memory server)
cd client && npm test        # Vitest
```

---

## Testing Phase Summary

| Metric | Value |
|--------|-------|
| Prompts logged | 2 |
| Backend tests | 173 |
| Frontend tests | 14 |
| Mandatory tier | State machine integration — complete |
| Test helper | `server/tests/helpers/testEnvironment.js` |

## Related Artifacts

- [`../test-strategy.md`](../test-strategy.md)
- [`../test-results.md`](../test-results.md)
- [`../server/tests/`](../server/tests/)
- [`../client/src/**/*.test.*`](../client/src/)
