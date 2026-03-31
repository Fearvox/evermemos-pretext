# EverMemOS-Pretext

## What This Is

A deep integration of [Pretext](https://github.com/chenglou/pretext) — a pure TypeScript multiline text measurement and layout engine — into the EverMemOS Hub page. The project delivers both a Pretext-powered memory content rendering system (conversations, notes, user profiles) and interactive Pretext demos (bubbles, masonry, dynamic layout) as part of the Hub experience.

## Core Value

Memory content in EverMemOS Hub must render beautifully with proper text layout — supporting all languages (CJK, Arabic, emoji, mixed-bidi), enabling virtualization without guesstimates, and unlocking advanced layouts (masonry, shrinkwrap, obstacle-aware flow) that DOM reflow alone cannot achieve efficiently.

## Requirements

### Validated

- [x] Pretext integration layer: React hooks and wrappers around prepare/layout APIs — Validated in Phase 01: Foundation
- [x] Performance: prepare() cached per text, layout() on resize only — Validated in Phase 01: Foundation
- [x] SSR-safe: server components skip Pretext measurement, hydrate client-side — Validated in Phase 01: Foundation

### Active

- [ ] Memory content rendering: conversations, notes, profiles displayed via Pretext layout
- [ ] Interactive demo pages: bubbles, dynamic-layout, masonry ported to Hub
- [ ] Multilingual text support: CJK, Arabic, emoji, mixed-bidi all correct
- [ ] EverMemOS API integration: fetch memory data from FastAPI backend
- [ ] Responsive Hub UI: shadcn/ui + Tailwind, dark mode, mobile-friendly

### Out of Scope

- Modifying Pretext core library — changes go upstream to chenglou/pretext
- EverMemOS backend development — consume existing API only
- Authentication/authorization — defer to EverMemOS's existing auth system
- Mobile native app — web-first

## Context

**EverMemOS** is an enterprise-grade long-term memory system for conversational AI agents. Python 3.12, FastAPI, LangChain, multi-tenant. Its Hub page needs a frontend that visualizes stored memories (episodes, profiles, knowledge graphs).

**Pretext** is a pure TS library (v0.0.3) for multiline text measurement and layout. It avoids DOM reflow by doing its own text measurement via canvas. Core APIs: `prepare()` (expensive, one-time) and `layout()` (cheap, pure arithmetic). Rich path: `prepareWithSegments()`, `layoutWithLines()`, `walkLineRanges()`, `layoutNextLine()`. Uses Bun as runtime, oxlint for linting, TypeScript 6.

**Integration approach**: Pretext is a git submodule (read-only). Hub is a Next.js 16 App Router frontend with React, Tailwind, shadcn/ui. Two separate dependency trees: npm for Hub, bun for Pretext submodule.

## Constraints

- **Runtime**: Pretext requires browser Canvas API for measurement — SSR must defer to client
- **Submodule**: Pretext source is read-only; changes must go through upstream PR
- **Dual package managers**: npm (Hub) and bun (Pretext) coexist
- **Port allocation**: Pretext dev server uses :3000, Hub must use :3001
- **Font safety**: `system-ui` is unsafe for accuracy on macOS (canvas vs DOM resolve differently)

## Key Decisions

| Decision | Rationale | Outcome |
|----------|-----------|---------|
| Next.js 16 App Router for Hub | Best SSR + client hydration for Pretext integration | ✅ Validated Phase 01 |
| Git submodule for Pretext | Allows tracking upstream while keeping read-only boundary | ✅ Validated Phase 01 |
| shadcn/ui + Tailwind for UI | Consistent with modern React ecosystem, good dark mode | — Pending |
| Separate npm/bun dependency trees | Pretext is Bun-native; forcing npm would break its build system | ✅ Validated Phase 01 |
| Pretext as local npm file dep | Turbopack resolveAlias can't use absolute paths; `file:../pretext` resolves it | ✅ Discovered Phase 01 |
| PRETEXT_LINE_HEIGHT = 24 (px) | Pretext layout() expects pixel values, not ratios | ✅ Discovered Phase 01 |

## Evolution

This document evolves at phase transitions and milestone boundaries.

**After each phase transition** (via `/gsd:transition`):
1. Requirements invalidated? → Move to Out of Scope with reason
2. Requirements validated? → Move to Validated with phase reference
3. New requirements emerged? → Add to Active
4. Decisions to log? → Add to Key Decisions
5. "What This Is" still accurate? → Update if drifted

**After each milestone** (via `/gsd:complete-milestone`):
1. Full review of all sections
2. Core Value check — still the right priority?
3. Audit Out of Scope — reasons still valid?
4. Update Context with current state

---
*Last updated: 2026-03-31 after Phase 01 (Foundation) completion*
