# AI Usage — Documentation Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: README, AI usage logs, project documentation

This document records AI prompts used to generate project documentation, including what was accepted, modified, or rejected.

---

## Prompt 1: Complete README

### Original Prompt

```
Generate complete README.

Include:

Project Overview
Architecture
Features
Installation
Environment Variables
Database Setup
Running Backend
Running Frontend
Running Tests
Seed Data
Folder Structure
Known Limitations
```

### AI Summary

The AI replaced the TODO-placeholder root `README.md` with a comprehensive guide (~300 lines) including Mermaid architecture diagram, feature tables, status transition rules, step-by-step installation, environment variable tables for server and client, database setup and seeding instructions, API endpoint summary, test commands with counts (173 backend + 14 frontend), demo credentials, annotated folder structure, known limitations table, tech stack, and documentation index.

### Accepted

- All 12 requested sections populated
- Mermaid architecture diagram
- Demo credentials table with `Demo@1234` password
- Test counts and run commands
- Known limitations table (auth, RBAC, real-time, attachments, etc.)
- Links to `api-contract.md`, `ui-flow.md`, and sub-READMEs
- Health check endpoint corrected to `/health`

### Modified

- Added supplementary sections: Tech Stack, Documentation Index, License (improve navigability)
- Corrected health endpoint path from `/api/health` to `/health` after verifying `app.js`

### Rejected

- Auto-generating all assessment markdown TODOs in this prompt (README only requested)
- Including internal AI prompt logs in README (kept in `ai-prompts/`)
- Adding deployment guides (Docker, AWS) — out of assessment scope

### Reason

README is the first document assessors read. Comprehensive setup instructions reduce friction for cloning and running the project.

---

## Prompt 2: AI Usage Documentation (This Request)

### Original Prompt

```
Generate documentation for AI usage.

Populate:

planning.md
design.md
implementation.md
testing.md
debugging.md
code-review.md
documentation.md

For each prompt include:

Original Prompt
AI Summary
Accepted
Modified
Rejected
Reason
```

### AI Summary

The AI created seven structured log files in `ai-prompts/` documenting every major prompt from the assessment lifecycle, with consistent fields (Original Prompt, AI Summary, Accepted, Modified, Rejected, Reason) organized by phase.

### Accepted

- Seven phase-based files matching requested names
- Consistent prompt log format across all files
- Cross-references to related project artifacts
- Phase summary tables with metrics
- Honest recording of deferred/rejected items (auth, E2E tests, etc.)

### Modified

- Organized multiple related prompts under phase files rather than one file per prompt
- Debugging framed as issues discovered (not always explicit user prompts)
- Code review framed as continuous self-review during implementation

### Rejected

- Fabricating prompts that were not in the conversation transcript
- Claiming 100% AI acceptance with no modifications
- Populating `final-ai-usage-summary.md` in this same step (separate artifact)

### Reason

Structured AI usage logs demonstrate responsible AI practices for the assessment: traceable prompts, explicit accept/reject decisions, and honest attribution of human vs AI contributions.

---

## Documentation Status

| Document | Status | AI-Assisted |
|----------|--------|-------------|
| `README.md` | Complete | Yes |
| `design-notes.md` | Complete | Yes |
| `api-contract.md` | Complete | Yes |
| `data-model.md` | Complete | Yes |
| `ui-flow.md` | Complete | Yes |
| `database/schema/*` | Complete | Yes |
| `database/seed-data/*` | Complete | Yes |
| `tool-specific/cursor-workflow/*` | Complete | Yes |
| `ai-prompts/planning.md` | Complete | Yes |
| `ai-prompts/design.md` | Complete | Yes |
| `ai-prompts/implementation.md` | Complete | Yes |
| `ai-prompts/testing.md` | Complete | Yes |
| `ai-prompts/debugging.md` | Complete | Yes |
| `ai-prompts/code-review.md` | Complete | Yes |
| `ai-prompts/documentation.md` | Complete | Yes |
| `requirements-analysis.md` | TODO placeholders | Partial |
| `implementation-plan.md` | TODO placeholders | Partial |
| `test-strategy.md` | TODO placeholders | Partial |
| `test-results.md` | TODO placeholders | Partial |
| `final-ai-usage-summary.md` | TODO placeholders | Pending |

---

## Human vs AI Contribution

| Area | AI Generated | Human Reviewed |
|------|-------------|--------------|
| Architecture docs | Primary | Accepted with modifications |
| Source code | Primary | Reviewed via cursor rules |
| Tests | Primary | Verified by running suite |
| README | Primary | Accepted |
| AI usage logs | Primary | This document |
| Candidate-specific docs | Scaffold only | Candidate to complete |

---

## Responsible AI Practices Applied

1. **No blind acceptance** — architecture decisions reviewed against assessment criteria
2. **Incremental prompts** — scaffolding before implementation, design before code
3. **Verification** — all 187 tests run and passing after AI-generated code
4. **Security defaults** — no secrets in code, bcrypt for seed passwords
5. **Traceability** — every major prompt logged with accept/modify/reject rationale
6. **Honest scope** — limitations and deferred features documented explicitly

---

## Documentation Phase Summary

| Metric | Value |
|--------|-------|
| Prompts logged | 2 |
| README sections | 12 requested + 3 supplementary |
| AI log files | 7 |
| Remaining TODO docs | 5 candidate artifacts |

## Related Artifacts

- [`../README.md`](../README.md)
- [`../final-ai-usage-summary.md`](../final-ai-usage-summary.md)
- [`./README.md`](./README.md)
