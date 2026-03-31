'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'
import type { DateRange } from 'react-day-picker'

type DateRangePickerProps = {
  dateRange: DateRange | undefined
  onDateRangeChange: (range: DateRange | undefined) => void
}

export function DateRangePicker({
  dateRange,
  onDateRangeChange,
}: DateRangePickerProps) {
  const [open, setOpen] = useState(false)

  const label = dateRange?.from
    ? dateRange.to
      ? `${format(dateRange.from, 'MMM d')} - ${format(dateRange.to, 'MMM d')}`
      : format(dateRange.from, 'MMM d')
    : 'Filter by date'

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            variant="outline"
            size="sm"
            className={cn(
              'text-xs font-medium border-[var(--border)] bg-transparent',
              dateRange?.from
                ? 'text-[var(--text-primary)]'
                : 'text-[var(--text-muted)]',
            )}
          />
        }
      >
        <CalendarDays className="mr-1.5 h-3.5 w-3.5" />
        {label}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 bg-[var(--surface-secondary)] border-[var(--border)]" align="start">
        <Calendar
          mode="range"
          selected={dateRange}
          onSelect={(range) => {
            onDateRangeChange(range)
            if (range?.to) setOpen(false)
          }}
          numberOfMonths={1}
        />
        {dateRange?.from && (
          <div className="border-t border-[var(--border)] p-2">
            <Button
              variant="ghost"
              size="sm"
              className="w-full text-xs text-[var(--text-muted)]"
              onClick={() => {
                onDateRangeChange(undefined)
                setOpen(false)
              }}
            >
              Clear dates
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
