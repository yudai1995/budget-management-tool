'use client'

import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ja } from 'date-fns/locale'
import { ChevronLeftIcon, ChevronRightIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export type CalendarProps = React.ComponentProps<typeof DayPicker>

/**
 * react-day-picker v10 + 日本語ロケール対応カレンダー。
 * 単日選択 / 範囲選択 / 複数選択に対応。
 */
function Calendar({ className, classNames, showOutsideDays = true, ...props }: CalendarProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={ja}
      className={cn('p-3', className)}
      classNames={{
        months: 'flex flex-col gap-4',
        month: 'flex flex-col gap-4',
        month_caption: 'flex items-center justify-center h-9 relative px-9',
        caption_label: 'text-sm font-semibold text-[#1c1410]',
        nav: 'absolute inset-x-0 top-0 flex items-center justify-between h-9 px-1',
        button_previous: cn(
          'inline-flex size-9 items-center justify-center rounded-lg text-[#1c1410]/60',
          'hover:bg-[#1c1410]/5 hover:text-[#1c1410]',
          'focus:outline-none focus:ring-2 focus:ring-[#f18840]/40',
          'disabled:opacity-30 disabled:pointer-events-none',
        ),
        button_next: cn(
          'inline-flex size-9 items-center justify-center rounded-lg text-[#1c1410]/60',
          'hover:bg-[#1c1410]/5 hover:text-[#1c1410]',
          'focus:outline-none focus:ring-2 focus:ring-[#f18840]/40',
          'disabled:opacity-30 disabled:pointer-events-none',
        ),
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'flex-1 text-center text-xs font-medium text-[#1c1410]/40 py-1',
        weeks: 'w-full',
        week: 'flex w-full mt-1',
        day: 'flex-1 text-center p-0',
        day_button: cn(
          'mx-auto flex size-9 items-center justify-center rounded-lg text-sm text-[#1c1410]',
          'hover:bg-[#fff6ee] hover:text-[#1c1410]',
          'focus:outline-none focus:ring-2 focus:ring-[#f18840]/40',
          'disabled:opacity-30 disabled:pointer-events-none',
          'aria-selected:bg-[#f18840] aria-selected:text-white aria-selected:hover:bg-[#e07030]',
        ),
        selected: '[&>button]:bg-[#f18840] [&>button]:text-white [&>button]:hover:bg-[#e07030]',
        today: '[&>button]:font-bold [&>button]:border-2 [&>button]:border-[#f18840]/40',
        outside: '[&>button]:text-[#1c1410]/30',
        range_start: '[&>button]:rounded-r-none',
        range_end: '[&>button]:rounded-l-none',
        range_middle: '[&>button]:bg-[#fff6ee] [&>button]:rounded-none',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) =>
          orientation === 'left' ? (
            <ChevronLeftIcon className="size-4" />
          ) : (
            <ChevronRightIcon className="size-4" />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
