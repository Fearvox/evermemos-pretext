'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from '@/components/ui/sheet'

const NAV_LINKS = [
  { href: '/memories', label: 'Memories' },
  { href: '/sandbox', label: 'Sandbox' },
]

export function MemoriesNav() {
  const [open, setOpen] = useState(false)

  return (
    <nav className="flex items-center justify-between px-4 sm:px-8 py-3 border-b border-[var(--border)] bg-[var(--surface-dominant)]">
      <div className="flex items-center gap-6">
        <Link
          href="/memories"
          className="text-lg font-semibold text-[var(--text-primary)] leading-6"
        >
          Memories
        </Link>
        <div className="hidden sm:flex items-center gap-4">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="sm:hidden">
        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger
            render={
              <Button
                variant="ghost"
                size="icon"
                className="text-[var(--text-muted)]"
                aria-label="Open navigation menu"
              />
            }
          >
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent
            side="right"
            className="w-64 bg-[var(--surface-secondary)] border-[var(--border)]"
          >
            <SheetTitle className="text-[var(--text-primary)]">Navigation</SheetTitle>
            <div className="flex flex-col gap-4 mt-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-base text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors"
                  onClick={() => setOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  )
}
