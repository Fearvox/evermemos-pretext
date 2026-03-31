---
phase: 2
plan: 03
status: complete
completed_at: 2026-03-31
commits:
  - 471118e feat(02-03): add multilingual mock episode data
  - 469bbe0 feat(02-03): add multilingual mock profile data
  - e6ced55 feat(02-03): add multilingual mock knowledge data
  - 29e3625 feat(02-03): add mock data barrel export
  - 173c00d feat(02-03): create API client with mock toggle
---

# Summary: Plan 02-03 — API Client, Mock Data, and Path Aliases

## What Was Done

### T1: Path Aliases (pre-existing)
- `@shared/*` alias already configured in `hub/tsconfig.json` and `hub/next.config.ts`

### T2: Mock Episodes (`hub/src/lib/mock/episodes.json`)
- 3 episodes: English planning session (6 turns), CJK multilingual discussion (Chinese + Japanese, 4 turns), Arabic + emoji + bidi (3 turns)
- Covers all required languages: English, Chinese, Japanese, Arabic, emoji, mixed-bidi

### T3: Mock Profiles (`hub/src/lib/mock/profiles.json`)
- 2 profiles: English researcher (Dr. Sarah Chen), Japanese engineer (田中太郎)
- Each has structured fields matching `ProfileField` schema

### T4: Mock Knowledge (`hub/src/lib/mock/knowledge.json`)
- 2 knowledge entries: English (Pretext architecture), Chinese (multilingual rendering with Unicode details)

### T5: Mock Barrel (`hub/src/lib/mock/index.ts`)
- Typed re-exports for all mock collections
- `mockAllMemories` sorted by `createdAt` descending

### T6: API Client (`shared/api/client.ts` + `shared/api/index.ts`)
- `fetchMemories()` with cursor pagination, type/tag/query/date filtering
- `fetchMemoryById()` for single item lookup
- `USE_MOCK` toggle via `NEXT_PUBLIC_USE_MOCK` env var (defaults to true)
- Mock path uses lazy dynamic imports for tree-shaking
- Real path builds URL against `NEXT_PUBLIC_API_BASE`

## Verification
All 11 checks passed: file existence, function definitions, mock toggle, CJK content, Arabic content.

## Notes
- Mock data import path in `shared/api/client.ts` uses `../../hub/src/lib/mock/` relative traversal — works because Next.js resolves from the project root during bundling
- `total` field in `PaginatedResponse` is optional per the schema; mock client always provides it
