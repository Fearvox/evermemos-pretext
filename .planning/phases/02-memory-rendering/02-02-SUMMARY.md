# 02-02 Summary: UI Foundation Setup

## Status: COMPLETE

## What was done

### Task 1: npm dependencies installed
- `@tanstack/react-virtual`, `@tanstack/react-query`, `next-themes`, `lucide-react`, `date-fns`

### Task 2: shadcn/ui initialized + components installed
- `npx shadcn@latest init --defaults --yes` ran successfully (Tailwind v4 detected)
- Components installed: badge, button, card, input, popover, calendar, skeleton, sheet
- `cn()` utility confirmed at `hub/src/lib/utils.ts`
- Fixed `--font-sans` circular reference in `@theme inline` (shadcn set `var(--font-sans)`, restored to `var(--font-inter)`)
- Removed shadcn's Geist font injection from layout (project uses Inter)

### Task 3: OKLCH CSS variable contract added
- Surface palette (9 vars), type badge colors (6 vars), bubble colors (4 vars), search highlight (1 var)
- All added to `:root` block alongside shadcn's own OKLCH variables
- Existing `.pretext-block`, `@keyframes shimmer`, `@keyframes pulse` preserved

### Task 4: Providers wired into root layout
- Created `hub/src/components/providers.tsx` with ThemeProvider (dark default, class-based) + QueryClientProvider
- Updated `hub/src/app/layout.tsx`: added `suppressHydrationWarning`, wrapped children in `<Providers>`

## Verification
- 19/19 checks passed
- `tsc --noEmit` clean (zero errors)

## Commits
1. `97fe027` feat(02-02): install Phase 2 npm dependencies
2. `05c6932` feat(02-02): initialize shadcn/ui and install components
3. `8a6115f` feat(02-02): add OKLCH CSS variable contract from UI spec
4. `69796bc` feat(02-02): wire ThemeProvider and QueryClientProvider into root layout
