# AI Usage — Debugging Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: Test failures, environment issues, integration debugging

This document records issues discovered and resolved during AI-assisted development, framed as debugging prompts and outcomes.

---

## Issue 1: MongoDB Text Index Missing in Tests

### Original Prompt

```
(Implicit — surfaced when running search integration tests after Prompt 2 in testing.md)

Generate additional tests including search tests.
```

### AI Summary

Three search integration tests failed with `500 Internal Server Error`. Root cause: `MongoServerError: text index required for $text query`. The in-memory MongoDB instance did not have the text index created before search queries ran, even though indexes were defined on the Mongoose schema.

### Accepted

- Fix: add `await Ticket.syncIndexes()` in `tests/helpers/testEnvironment.js` after `connectDB()`
- Re-run full suite to confirm 173/173 passing

### Modified

- Test environment helper now syncs indexes on every integration suite connect
- Documented in README under known limitations (text index requirement)

### Rejected

- Changing search implementation to regex-only (loses text relevance scoring)
- Skipping search integration tests
- Using real MongoDB for tests instead of memory server

### Reason

`syncIndexes()` ensures schema-defined indexes exist in the ephemeral test database. `deleteMany` in seed does not drop indexes, but memory server cold starts may not auto-build them before first query.

---

## Issue 2: MongoMemoryServer Sandbox Failure

### Original Prompt

```
(Implicit — Jest test run in sandboxed terminal)

npm test
```

### AI Summary

`mongodb-memory-server` failed to download/start inside the Cursor sandbox due to restricted syscalls and network. Tests appeared to fail or hang on `beforeAll` connect.

### Accepted

- Run tests with `required_permissions: ["all"]` to disable sandbox
- Document in README that integration tests need unrestricted permissions

### Modified

- Jest config: `maxWorkers: 1`, `testTimeout: 30000` for stability

### Rejected

- Removing integration tests
- Switching to mocked Mongoose models for all integration tests

### Reason

Memory server needs process spawning and binary download outside sandbox constraints. This is an environment limitation, not an application bug.

---

## Issue 3: Duplicate Ticket CRUD Prompt

### Original Prompt

```
Implement complete Ticket CRUD.
(sent twice in succession)
```

### AI Summary

The same CRUD implementation prompt was submitted twice. The AI verified existing implementation rather than duplicating code.

### Accepted

- Idempotent response: confirmed CRUD already implemented
- No duplicate service methods or routes created

### Modified

- None required

### Rejected

- Re-implementing CRUD from scratch (would cause merge conflicts)

### Reason

Duplicate prompts are a common AI workflow issue. Verifying existing code before regenerating prevents unnecessary diffs.

---

## Issue 4: Direct `npx jest` vs `npm test`

### Original Prompt

```
(Implicit — running single test file with npx jest)
```

### AI Summary

Running `npx jest tests/integration/search.integration.test.js` directly failed with `SyntaxError: Cannot use import statement outside a module` because it bypassed the `npm test` script which uses `node --experimental-vm-modules`.

### Accepted

- Always use `npm test` or `npm run test:watch` for backend tests
- Use `npm test -- --testPathPattern=search` for single-file runs

### Modified

- None to application code

### Rejected

- Converting project to CommonJS

### Reason

ES module Jest configuration requires the experimental VM modules flag defined in `package.json` scripts.

---

## Issue 5: Logger Noise in Test Output

### Original Prompt

```
(Implicit — observed during test runs)
```

### AI Summary

Integration tests produced verbose `[INFO]` and `[WARN]` console output from the request logger and error handler, cluttering test results.

### Accepted

- Logger suppresses debug in non-development environments
- Test `NODE_ENV=test` set in test environment helper
- Console output is informational only — tests still pass

### Modified

- Considered muting logger in test env (deferred — output helps debug failures)

### Rejected

- Disabling all logging in tests (reduces debuggability)

### Reason

Request logs aid debugging integration test failures. Noise is acceptable for local development; CI can pipe stderr separately.

---

## Debugging Tools Used

| Tool | Purpose |
|------|---------|
| Jest verbose output | Identify failing test file and assertion |
| Supertest response bodies | Inspect error envelopes and status codes |
| MongoDB error messages | Diagnose missing index (`$text query`) |
| `rg` / grep on codebase | Trace search filter construction |
| Terminal permission flags | Resolve memory server sandbox issues |

---

## Debugging Phase Summary

| Metric | Value |
|--------|-------|
| Issues logged | 5 |
| Code fixes | 1 (`syncIndexes` in test helper) |
| Config fixes | 2 (Jest timeout, npm test script) |
| Process fixes | 2 (sandbox permissions, duplicate prompt) |

## Related Artifacts

- [`../debugging-notes.md`](../debugging-notes.md)
- [`../server/tests/helpers/testEnvironment.js`](../server/tests/helpers/testEnvironment.js)
