# AI Usage — Planning Phase

> Tool: **Cursor (Claude)**  
> Date: **20 July 2026**  
> Phase: Requirements analysis, repository scaffolding, workflow setup

This document records AI prompts used during the planning phase of the Support Ticket Management System assessment, including what was accepted, modified, or rejected.

---

## Prompt 1: Requirements Analysis

### Original Prompt

```
You are a Senior Full Stack Software Architect.

I am building a MERN Stack Support Ticket Management System for an AI Practical Assessment.

Before writing any code, analyze the following project requirements carefully.

Goals:
- Understand all functional requirements.
- Understand all non-functional requirements.
- Identify assumptions.
- Identify edge cases.
- Identify risks.
- Suggest architecture.
- Suggest folder structure.
- Suggest implementation milestones.

Important:
Do NOT generate code.

Instead generate:
1. Requirements Analysis
2. Functional Requirements
3. Non Functional Requirements
4. Assumptions
5. Edge Cases
6. Suggested Architecture
7. Suggested Tech Stack
8. Suggested Folder Structure
9. Milestone Plan
10. Risks and Mitigation

Use MongoDB, Express, React, Node.js.
```

### AI Summary

The AI analyzed assessment criteria (from related project docs) and produced a structured requirements breakdown covering ticket CRUD, comment threads, status state machine, search/filter, validation, error handling, and testing tiers. It recommended a monorepo with `client/` and `server/`, layered backend (routes → controllers → services → models), a pure domain module for the state machine, and a phased milestone plan from scaffolding through mandatory integration tests.

### Accepted

- MERN stack as the fixed technology choice
- Three core entities: User, Ticket, Comment
- Status state machine as the signature domain logic
- Service layer separation on the backend
- Phased implementation plan (models → API → UI → tests)
- Monorepo folder layout (`client/`, `server/`, `database/`, `ai-prompts/`)

### Modified

- Requirements were captured in conversation and design docs rather than fully populating `requirements-analysis.md` (left as structured TODO scaffold for candidate completion)
- Stretch features (auth, RBAC) deferred to later milestones rather than included in core scope

### Rejected

- Generating any application code at this stage (explicitly excluded by prompt)
- Alternative stacks (PostgreSQL, GraphQL, microservices) — not suitable for assessment constraints

### Reason

The prompt explicitly requested analysis only. The phased MERN architecture aligned with assessment acceptance criteria and kept scope manageable. Documentation scaffolds were preferred over premature implementation.

---

## Prompt 2: Repository Structure Scaffold

### Original Prompt

```
Create the entire repository structure exactly as required in the assessment.

Generate every markdown file.

Only generate headings and TODO placeholders.

Do not generate implementation.

Repository should include:

README
candidate-info
requirements-analysis
acceptance-criteria
implementation-plan
design-notes
api-contract
data-model
ui-flow
test-strategy
test-results
debugging-notes
code-review-notes
review-fixes
reflection
pr-description
final-ai-usage-summary

database/
ai-prompts/
tool-specific/cursor-workflow/

Generate folders and markdown files only.
```

### AI Summary

The AI created the full assessment repository tree with placeholder markdown files, subfolders for database schema/seed documentation, numbered `ai-prompts/` files, and `tool-specific/cursor-workflow/` workflow documents. No source code was generated.

### Accepted

- Complete folder hierarchy matching assessment deliverables
- TODO-placeholder pattern for traceability (candidate fills in during development)
- Separation of concerns across docs (`api-contract.md`, `data-model.md`, `ui-flow.md`, etc.)
- `ai-prompts/` and `tool-specific/cursor-workflow/` directories

### Modified

- Some design docs (`design-notes.md`, `api-contract.md`, `data-model.md`, `ui-flow.md`) were later populated by subsequent AI prompts instead of remaining as TODO-only files

### Rejected

- Pre-filling implementation details in planning docs at scaffold time
- Generating `server/` or `client/` source code in this step

### Reason

Assessment requires a documented, auditable repo structure before coding. Placeholder files establish the submission template without conflating planning artifacts with implementation.

---

## Prompt 3: Cursor Workflow Documents

### Original Prompt

```
Generate the Cursor workflow documents.

Create:

tool-specific/cursor-workflow/

project-context.md
spec.md
tasks.md
acceptance-criteria.md
cursor-rules-or-instructions.md

These should serve as persistent project memory.

Do not generate application code.

Include coding standards, naming conventions, architecture rules, testing strategy and AI usage rules.
```

### AI Summary

The AI generated persistent Cursor context files defining project goals, technical spec, task backlog, acceptance criteria mapping, and AI usage rules (validate output, no blind acceptance, security defaults, minimal diffs, test requirements).

### Accepted

- `project-context.md` as single source of project truth for AI sessions
- `spec.md` linking entities, endpoints, and state machine rules
- `tasks.md` as an implementation checklist
- `cursor-rules-or-instructions.md` with coding standards and AI guardrails
- Rule: do not generate code in workflow setup prompts

### Modified

- `tasks.md` and `acceptance-criteria.md` updated incrementally as features were implemented
- Additional files added later (`prompt-templates.md`, `session-log.md`) for session continuity

### Rejected

- Embedding secrets or environment-specific values in workflow docs
- Auto-approving terminal commands in AI rules (kept as manual approval)

### Reason

Persistent project memory reduces context loss across Cursor sessions. Coding standards and AI usage rules support responsible, reviewable development for the assessment.

---

## Prompt 4: Commit Message Suggestion

### Original Prompt

```
Suggest me commit message for above changes
```

### AI Summary

The AI suggested a conventional commit message summarizing the Mongoose model implementation (User, Ticket, Comment) with indexes, validation, enums, timestamps, and relationships.

### Accepted

- Conventional commit style (`feat:` / `chore:`)
- Message focused on *why* (data layer foundation) rather than file list

### Modified

- Message was suggested only; commit was not executed automatically (per git safety rules)

### Rejected

- Overly long multi-paragraph commit bodies
- Combining unrelated changes into one commit

### Reason

A clear, scoped commit message helps assessment reviewers trace incremental progress. The candidate retains control over when and what to commit.

---

## Planning Phase Summary

| Metric | Value |
|--------|-------|
| Prompts logged | 4 |
| Code generated | None (by design) |
| Primary artifacts | Repo scaffold, workflow docs, requirements analysis |
| Key human decision | Defer auth/RBAC to stretch; prioritize core CRUD + state machine |

## Related Artifacts

- [`../requirements-analysis.md`](../requirements-analysis.md)
- [`../implementation-plan.md`](../implementation-plan.md)
- [`../acceptance-criteria.md`](../acceptance-criteria.md)
- [`../tool-specific/cursor-workflow/project-context.md`](../tool-specific/cursor-workflow/project-context.md)
