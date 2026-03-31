'use client'

export function SearchHighlight({ text, query }: { text: string; query?: string | null }) {
  if (!query || query.length === 0) return <>{text}</>

  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const regex = new RegExp(`(${escaped})`, 'gi')
  const parts = text.split(regex)

  return (
    <>
      {parts.map((part, i) =>
        regex.test(part) ? (
          <mark key={i} className="bg-[var(--highlight-bg)] text-inherit font-inherit leading-inherit p-0 rounded-sm">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}
