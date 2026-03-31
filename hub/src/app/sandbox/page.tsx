// hub/src/app/sandbox/page.tsx
// Server Component — no 'use client', no Pretext imports
import type { Metadata } from 'next'
import SandboxBlockLoader from '@/components/sandbox/SandboxBlockLoader'

export const metadata: Metadata = {
  title: 'Sandbox — EverMemOS Hub',
  description: 'Pretext SSR-safe hydration proof page',
}

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
          {/* SandboxBlockLoader is a Client Component that uses dynamic(ssr:false)
              to defer SandboxBlock to the client — SSR renders a skeleton */}
          <SandboxBlockLoader />
        </div>
      </section>
    </main>
  )
}
