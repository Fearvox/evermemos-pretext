# Phase 2: Memory Rendering - Discussion Log

> **Audit trail only.** Do not use as input to planning, research, or execution agents.
> Decisions are captured in CONTEXT.md — this log preserves the alternatives considered.

**Date:** 2026-03-31
**Phase:** 02-memory-rendering
**Areas discussed:** Card Visual Style, API Data Integration, Virtualization & Scrolling, Search & Filtering, Navigation, Loading States

---

## Card Visual Style

### Card Type Presentation

| Option | Description | Selected |
|--------|-------------|----------|
| Unified card + type badge | Same shell, type badge differentiates. Simple. | ✓ |
| Three independent designs | Episode=bubbles, Profile=split, Knowledge=graph node. 3x work. | |
| Minimal list rows | Email-list style, click to expand. Highest density. | |

**User's choice:** Unified card + type badge
**Notes:** Recommended option accepted.

### Information Density

| Option | Description | Selected |
|--------|-------------|----------|
| Preview mode | 3-4 lines + metadata, click to expand | |
| Full display | Always show complete content | |
| Dual-mode toggle | compact/expanded switch, user can toggle globally | ✓ |

**User's choice:** Dual-mode toggle
**Notes:** User wants flexibility for both compact scanning and full reading.

### Color Scheme

| Option | Description | Selected |
|--------|-------------|----------|
| Zinc neutral | zinc-900 card + zinc-950 page, weak badge colors | |
| High contrast | slate-950 + bright borders, saturated badges | |
| Claude decides | Claude picks appropriate OKLCH scheme | ✓ |

**User's choice:** Claude decides

### Episode Conversation Layout

| Option | Description | Selected |
|--------|-------------|----------|
| Bubble-style chat | User left, Agent right, chat app style | ✓ |
| Linear document | All turns left-aligned, color blocks for roles | |
| Compact timeline | Left timeline + right content, git log style | |

**User's choice:** Bubble-style chat
**Notes:** Recommended option. walkLineRanges() for shrinkwrap bubble width.

---

## API Data Integration

### Mock Strategy

| Option | Description | Selected |
|--------|-------------|----------|
| Local JSON mock | Static fixtures in hub/src/lib/mock/, useMock flag | ✓ |
| MSW | Mock Service Worker intercepts, more realistic network | |
| Assume backend available | Direct API, show errors if unavailable | |

**User's choice:** Local JSON mock

### Schema Location

| Option | Description | Selected |
|--------|-------------|----------|
| shared/ directory | Reusable across frontends | ✓ |
| hub/src/lib/api/ | Hub-internal, simpler | |

**User's choice:** shared/ directory

### API Structure

| Option | Description | Selected |
|--------|-------------|----------|
| Self-defined RESTful | Assume standard REST, align later | |
| Existing docs | User provides documentation | ✓ |

**User's choice:** Has existing docs
**Notes:** GitHub repo: https://github.com/EverMind-AI/EverMemOS, API docs: https://docs.evermind.ai/api-reference/introduction

---

## Virtualization & Scrolling

### Loading Behavior

| Option | Description | Selected |
|--------|-------------|----------|
| Infinite scroll | Auto-load on scroll bottom, cursor-based | ✓ |
| Manual "load more" | Button at bottom | |
| Traditional pagination | Page numbers | |

**User's choice:** Infinite scroll

### Scroll Position on Filter Change

| Option | Description | Selected |
|--------|-------------|----------|
| Reset to top | New query = top of list | ✓ |
| Keep position | Try to maintain scroll offset | |
| Claude decides | | |

**User's choice:** Reset to top

---

## Search & Filtering

### Search UI Position

| Option | Description | Selected |
|--------|-------------|----------|
| Top-fixed bar | Search + filters always visible above list | ✓ |
| Sidebar facet | Left sidebar filters, right list | |
| Collapsible panel | Search visible, filters hidden by default | |

**User's choice:** Top-fixed bar

### Search Trigger

| Option | Description | Selected |
|--------|-------------|----------|
| Real-time + debounce | 300ms debounce, live results | ✓ |
| Enter to search | Manual trigger | |

**User's choice:** Real-time + debounce

### Match Highlighting

| Option | Description | Selected |
|--------|-------------|----------|
| HTML mark tag | Backend returns positions, frontend highlights | |
| Claude decides | | ✓ |

**User's choice:** Claude decides

---

## Navigation Structure

### Route Structure

| Option | Description | Selected |
|--------|-------------|----------|
| /memories list + /memories/:id detail | Two-level, / redirects | ✓ |
| / is list page | Root = list, /memories/:id detail | |
| Three-level with type grouping | /memories + /memories/:type + /memories/:id | |

**User's choice:** /memories list + /memories/:id detail

---

## Loading & Empty States

| Option | Description | Selected |
|--------|-------------|----------|
| Skeleton + illustration | Skeleton cards loading, illustration empty | |
| Spinner + text | Simple loading, text-only empty | |
| Claude decides | | ✓ |

**User's choice:** Claude decides

---

## Claude's Discretion

- Dark mode OKLCH color palette
- Search match highlighting implementation
- Loading/empty state visual treatment
- CJK font lazy loading strategy

## Deferred Ideas

None — all discussion stayed within phase scope.
