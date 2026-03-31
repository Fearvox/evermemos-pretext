// hub/src/lib/pretext/index.ts
// CLIENT ONLY — all exports from this barrel require a 'use client' boundary.
// Do not import this barrel from Server Components or Route Handlers.
// Import individual hooks directly in 'use client' components.

export { usePrepared } from './usePrepared'
export { useLayout } from './useLayout'
export { useContainerWidth } from './useContainerWidth'
export { usePreparedWithSegments } from './usePreparedWithSegments'
export { PRETEXT_FONT, PRETEXT_LINE_HEIGHT } from './fonts'
export { collectWrapMetrics, findTightWrapMetrics, type WrapMetrics } from './shrinkwrap'

// Re-export Pretext public types for consumer convenience
export type {
  PreparedText,
  PreparedTextWithSegments,
  LayoutResult,
  LayoutLine,
  LayoutLineRange,
  LayoutLinesResult,
  LayoutCursor,
  PrepareOptions,
} from '@pretext'
