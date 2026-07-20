# AI Usage — Code Review Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: Self-review during and after implementation

This document records AI-assisted code review observations — strengths identified, issues found, and decisions on what to fix vs defer.

---

## Review 1: Architecture Compliance

### Original Prompt

```
(Implicit — continuous review during implementation against design-notes.md and cursor-rules)
```

### AI Summary

During implementation, the AI self-reviewed each feature against the architecture document: state machine in domain layer only, validation at route boundary, business rules in services, consistent error envelope, no secrets in code.

### Accepted

- Layer separation maintained across all implemented features
- `domain/statusMachine.js` has zero Mongoose imports
- Controllers are thin delegators to services
- Validators do not contain business logic

### Modified

- Legacy `utils/ApiError.js` coexists briefly with new `errors/` module — new code uses `errors/`

### Rejected

- Moving state machine checks to Mongoose middleware
- Adding Redux for state management

### Reason

Architecture compliance is an assessment evaluation criterion. Self-review during each prompt prevents drift from design decisions.

---

## Review 2: Security Review

### Original Prompt

```
(Implicit — security defaults in cursor-rules and workspace rules)
```

### AI Summary

Review covered: no hardcoded credentials, bcrypt for seed passwords, password excluded from JSON serialization, CORS restricted to `CLIENT_URL`, no `eval`, input validation on all write endpoints, ObjectId format validation.

### Accepted

- bcrypt hashing in seed script
- `toJSON` transform hiding password field
- express-validator sanitization (trim, escape where applicable)
- CORS origin from environment variable

### Modified

- Auth middleware left as TODO stub (stretch feature)

### Rejected

- Disabling CORS entirely
- Returning stack traces in API error responses (production)
- Storing plaintext passwords

### Reason

Auth is explicitly out of core scope. Other security defaults follow secure-by-default principles without over-engineering.

---

## Review 3: Error Handling Consistency

### Original Prompt

```
(Implicit — review after centralized error handling implementation)
```

### AI Summary

Review verified all error paths return `{ error: { code, message, details } }`, HTTP status codes match error types, and frontend `apiError.js` correctly parses the envelope.

### Accepted

- Typed error classes with `statusCode` and `code`
- Mongoose error mapping in global handler
- Frontend `getErrorMessage` and `getFieldErrors` utilities
- Integration tests asserting error codes

### Modified

- Standardized on `errors/errorCodes.js` constants instead of string literals

### Rejected

- Per-endpoint custom error formats
- HTML error pages from API

### Reason

Consistent errors reduce frontend complexity and make integration tests deterministic.

---

## Review 4: Test Coverage Gaps

### Original Prompt

```
Generate additional tests.
(followed by review of coverage gaps)
```

### AI Summary

Review identified gaps after initial state machine tests: no dedicated CRUD lifecycle test, no search combination tests, no frontend utility tests, no seed-based comment thread tests.

### Accepted

- Added 6 new integration test files
- Added Vitest setup for frontend
- 187 total tests all passing

### Modified

- Frontend limited to utility/component tests (not page E2E)

### Rejected

- Full E2E browser test suite
- Mocking database in integration tests

### Reason

Targeted gap filling provides best coverage-to-effort ratio for assessment submission.

---

## Review 5: Code Quality and Duplication

### Original Prompt

```
(Implicit — review during hook and service layer implementation)
```

### AI Summary

Review checked for duplicated API call logic, inconsistent naming, and missing error handling in React hooks.

### Accepted

- `useAsync` and `useMutation` base hooks reduce duplication
- Service layer centralizes HTTP + retry logic
- Shared field validators reduce validator duplication

### Modified

- Consolidated ticket mutation hooks into `useTicketMutations.js`

### Rejected

- Abstracting every component into HOCs
- Creating a generic CRUD hook factory (over-abstraction)

### Reason

Reusable hooks and services follow DRY without introducing unnecessary abstraction layers.

---

## Issues Found and Disposition

| Severity | Finding | Action |
|----------|---------|--------|
| High | Text index missing in test DB | Fixed — `syncIndexes()` in test helper |
| High | No auth on API endpoints | Deferred — stretch feature, documented in README |
| Medium | `requirements-analysis.md` still TODO placeholders | Deferred — candidate artifact |
| Medium | Logger noise in test output | Accepted — informational only |
| Low | Legacy `ApiError` utility | Deferred — no runtime impact |
| Low | No comment edit/delete | Deferred — out of scope |

---

## Code Review Phase Summary

| Metric | Value |
|--------|-------|
| Review passes | 5 |
| Fixes applied | 1 (test index sync) |
| Deferred items | 4 (auth, docs, legacy util, comment CRUD) |
| Security issues | 0 critical (auth deferred by design) |

## Related Artifacts

- [`../code-review-notes.md`](../code-review-notes.md)
- [`../review-fixes.md`](../review-fixes.md)
- [`../tool-specific/cursor-workflow/cursor-rules-or-instructions.md`](../tool-specific/cursor-workflow/cursor-rules-or-instructions.md)
