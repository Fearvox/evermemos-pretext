# Phase 1: Foundation - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 01-foundation
**Areas discussed:** Submodule consumption, Font configuration, Sandbox page, Hook API design
**Mode:** Auto (all recommended options selected)

---

## Submodule Consumption

| Option | Description | Selected |
|--------|-------------|----------|
| Path alias + transpilePackages | Turbopack resolveAlias, direct source import, no bun build during dev | ✓ |
| npm link | Symlink pretext into node_modules | |
| dist/ import only | Require bun build:package before every dev session | |

**User's choice:** Path alias + transpilePackages (auto-selected: recommended from Stack research)
**Notes:** Turbopack has known issues with symlinked packages outside project root (Next.js #82717)

---

## Font Configuration

| Option | Description | Selected |
|--------|-------------|----------|
| Inter via next/font/google | Named font, PRETEXT_FONT = '16px Inter' | ✓ |
| Geist Sans | Modern, but less CJK coverage | |
| system-ui | Dangerous — canvas/DOM mismatch on macOS | |

**User's choice:** Inter (auto-selected: recommended, avoids system-ui trap documented in Pretext CLAUDE.md)
**Notes:** CJK subsets deferred to Phase 2

---

## Sandbox Test Page

| Option | Description | Selected |
|--------|-------------|----------|
| Multilingual text block | English + CJK + Arabic + emoji with height display | ✓ |
| Simple English-only | Minimal proof, doesn't test edge cases | |
| Full demo port | Too much scope for Phase 1 | |

**User's choice:** Multilingual text block (auto-selected: recommended, proves key constraints)
**Notes:** None

---

## Hook API Design

| Option | Description | Selected |
|--------|-------------|----------|
| Module-level Map cache + fonts.ready guard | Survives unmount, shared across components | ✓ |
| React context + provider | Requires wrapper, global state overhead | |
| Per-component useRef cache | Doesn't share across instances | |

**User's choice:** Module-level Map cache (auto-selected: recommended from Architecture research)
**Notes:** None

---

## Claude's Discretion

- Tailwind v4 theme configuration (OKLCH tokens, dark mode palette)
- shadcn/ui component selection for sandbox page
- ESLint configuration for hub

## Deferred Ideas

None — discussion stayed within phase scope.
