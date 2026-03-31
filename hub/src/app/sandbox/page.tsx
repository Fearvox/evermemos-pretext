// hub/src/app/sandbox/page.tsx
// Server Component — no 'use client', no Pretext imports
import dynamic from 'next/dynamic'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sandbox — EverMemOS Hub',
  description: 'Pretext SSR-safe hydration proof page',
}

// Dynamic import with ssr: false enforces the SSR boundary.
// SandboxBlock imports Pretext hooks which call prepare() — canvas-only, server throws.
// The fallback prop renders during SSR and before hydration completes.
const SandboxBlock = dynamic(
  () => import('@/components/sandbox/SandboxBlock'),
  {
    ssr: false,
    loading: () => (
      <div
        className="pretext-skeleton"
        style={{
          height: '120px',
          background: 'var(--skeleton-bg, #e5e7eb)',
          borderRadius: '8px',
          animation: 'pulse 1.5s ease-in-out infinite',
        }}
        aria-label="Loading text block..."
      />
    ),
  }
)

export default function SandboxPage() {
  return (
    <main className="container mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold mb-2">Pretext Sandbox</h1>
      <p className="text-sm text-gray-500 mb-8">
        SSR renders a skeleton. After hydration, Pretext{' '}
        <code>layout()</code> computes the exact pixel height.
      </p>

      <section className="space-y-6">
        <div>
          <h2 className="text-sm font-medium text-gray-400 uppercase tracking-wide mb-3">
            Multilingual Text Block
          </h2>
          {/* SandboxBlock is client-only — SSR renders the loading skeleton above */}
          <SandboxBlock />
        </div>
      </section>
    </main>
  )
}
