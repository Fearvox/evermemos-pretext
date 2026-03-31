// hub/src/components/sandbox/SandboxBlock.tsx
// CLIENT ONLY — imports Pretext hooks, uses canvas measurement
'use client'

import { useRef } from 'react'
import {
  usePrepared,
  useLayout,
  useContainerWidth,
  usePreparedWithSegments,
  PRETEXT_FONT,
  PRETEXT_LINE_HEIGHT,
} from '@/lib/pretext'

// Multilingual sample text — English, Chinese (CJK), Arabic (RTL), emoji
// This exercises all code paths in Pretext: normal text, CJK per-character breaks,
// bidi metadata, emoji correction.
const SAMPLE_TEXT =
  'Hello, Pretext! 你好，世界。This text spans multiple languages: ' +
  'مرحبا بالعالم 🌍 and includes emoji correction. ' +
  'The layout engine handles CJK line-breaking (日本語テスト), ' +
  'Arabic bidi (عربي), and mixed scripts seamlessly.'

export default function SandboxBlock() {
  const containerRef = useRef<HTMLDivElement>(null)

  // Step 1: Measure container width (reactive to resize)
  const width = useContainerWidth(containerRef)

  // Step 2: Prepare text (fast path — opaque handle, no segment arrays)
  const { prepared, isLoading } = usePrepared(SAMPLE_TEXT, PRETEXT_FONT)

  // Step 3: Compute layout (pure arithmetic, reruns on width change)
  const layoutResult = useLayout(prepared, width, PRETEXT_LINE_HEIGHT)

  // Step 4: Also prepare with segments for the rich path demo (PTXT-04)
  const { prepared: preparedWithSegs, isLoading: isLoadingSegs } =
    usePreparedWithSegments(SAMPLE_TEXT, PRETEXT_FONT)

  const isReady = !isLoading && layoutResult !== null
  const height = layoutResult?.height ?? null
  const lineCount = layoutResult?.lineCount ?? null

  return (
    <div className="space-y-4">
      {/* Main measured text block */}
      <div
        ref={containerRef}
        className="pretext-block relative w-full rounded-lg border border-gray-200 bg-white p-4 transition-all duration-150 dark:border-gray-700 dark:bg-gray-900"
        style={
          height !== null
            ? { height: `${height + 32}px` } // +32px for padding (2×16px)
            : { minHeight: '120px' }
        }
      >
        {/* Skeleton overlay — visible during loading, hidden after measurement */}
        {!isReady && (
          <div
            className="absolute inset-0 rounded-lg"
            style={{
              background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)',
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
            aria-hidden="true"
          />
        )}

        {/* Text content — visible after hydration */}
        <p
          className="pretext-block text-gray-800 dark:text-gray-200"
          style={{ opacity: isReady ? 1 : 0, transition: 'opacity 0.2s' }}
        >
          {SAMPLE_TEXT}
        </p>
      </div>

      {/* Debug badge — confirms measurement fired with exact values */}
      <div
        className="flex flex-wrap gap-3 text-xs font-mono"
        aria-label="Pretext measurement results"
      >
        <span
          className="rounded bg-blue-50 px-2 py-1 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
          data-testid="pretext-height"
        >
          height: {height !== null ? `${height}px` : 'measuring…'}
        </span>
        <span
          className="rounded bg-green-50 px-2 py-1 text-green-700 dark:bg-green-950 dark:text-green-300"
          data-testid="pretext-line-count"
        >
          lineCount: {lineCount ?? 'measuring…'}
        </span>
        <span
          className="rounded bg-gray-50 px-2 py-1 text-gray-600 dark:bg-gray-800 dark:text-gray-400"
          data-testid="pretext-container-width"
        >
          containerWidth: {width > 0 ? `${width}px` : 'measuring…'}
        </span>
        <span
          className="rounded bg-purple-50 px-2 py-1 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
          data-testid="pretext-segments"
        >
          segments (rich): {preparedWithSegs?.segments?.length ?? (isLoadingSegs ? 'loading…' : '—')}
        </span>
        <span
          className="rounded bg-yellow-50 px-2 py-1 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-300"
          data-testid="pretext-font"
        >
          font: {PRETEXT_FONT}
        </span>
      </div>
    </div>
  )
}
