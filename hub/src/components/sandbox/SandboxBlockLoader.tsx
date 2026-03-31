// hub/src/components/sandbox/SandboxBlockLoader.tsx
// CLIENT ONLY — thin wrapper that uses next/dynamic with ssr:false
// to prevent SandboxBlock (and its Pretext canvas imports) from
// executing during SSR. Next.js 16 requires ssr:false to be inside
// a Client Component, not a Server Component.
'use client'

import dynamic from 'next/dynamic'

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

export default function SandboxBlockLoader() {
  return <SandboxBlock />
}
