// hub/src/lib/pretext/fonts.ts
// CLIENT ONLY — do not import from Server Components
//
// Single source of truth for the Pretext font string.
// Must exactly match the CSS font applied to text blocks.
//
// Rules:
//   - Must be a CSS font shorthand: '<size>px <family>'
//   - Size must match the actual rendered font size in DOM (default body: 16px)
//   - Family must match what the browser resolved — 'Inter' (capital I, next/font/google)
//   - NEVER use system-ui, -apple-system, or CSS variables here.
//     Canvas and DOM resolve system-ui to different optical variants on macOS.
export const PRETEXT_FONT = '16px Inter'

// Line height used with layout() calls. Must match the CSS line-height of text blocks.
// 1.5 * 16px = 24px
export const PRETEXT_LINE_HEIGHT = 24
