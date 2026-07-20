# Cursor Workflow

> Persistent project memory for AI-assisted development on the Support Ticket Management System assessment.

## Purpose

This folder provides Cursor with stable, authoritative context across sessions. **Read these files before generating any code.**

## Persistent Context Files (read in order)

| # | File | Purpose |
|---|------|---------|
| 1 | [`project-context.md`](./project-context.md) | Project identity, goals, scope, layout, constraints |
| 2 | [`spec.md`](./spec.md) | Authoritative functional and technical specification |
| 3 | [`acceptance-criteria.md`](./acceptance-criteria.md) | Testable AC definitions and mandatory test tier |
| 4 | [`tasks.md`](./tasks.md) | Living task tracker — update after every session |
| 5 | [`cursor-rules-or-instructions.md`](./cursor-rules-or-instructions.md) | Architecture, coding standards, testing, AI rules |

## Supplementary Files

| File | Purpose |
|------|---------|
| [`session-log.md`](./session-log.md) | Per-session activity log |
| [`prompt-templates.md`](./prompt-templates.md) | Reusable Cursor prompt templates |

## Session Startup Checklist

1. Read `project-context.md` and `tasks.md`
2. Identify active phase and tasks
3. Read relevant section of `spec.md` before implementing
4. Follow `cursor-rules-or-instructions.md` for all code generation
5. After session: update `tasks.md`, log prompts in `../../ai-prompts/`

## How to Use in Cursor

### Option A: @ mention files
Reference files directly in prompts:
```
@tool-specific/cursor-workflow/spec.md
@tool-specific/cursor-workflow/cursor-rules-or-instructions.md
Implement P3-7: POST /api/tickets
```

### Option B: Cursor Rules
Copy key sections from `cursor-rules-or-instructions.md` into `.cursor/rules/` for automatic application.

### Option C: Always-on context
Add this folder to Cursor's project context or pin `project-context.md` at session start.

## Related Documentation

| Document | Location |
|----------|----------|
| Prompt history | [`../../ai-prompts/`](../../ai-prompts/) |
| AI usage summary | [`../../final-ai-usage-summary.md`](../../final-ai-usage-summary.md) |
| API contract | [`../../api-contract.md`](../../api-contract.md) |
| Data model | [`../../data-model.md`](../../data-model.md) |
| Test strategy | [`../../test-strategy.md`](../../test-strategy.md) |

## Current Status

**Active phase:** Phase 0 — Planning and Repository Setup

See [`tasks.md`](./tasks.md) for detailed task status.
