'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import {
  FormField as UiFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

export interface DatePickerFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  label?: string
  placeholder?: string
  rules?: RegisterOptions<TFieldValues, TName>
  description?: string
  className?: string
  disabled?: boolean
}

/**
 * Popover + Calendar + React Hook Form 統合の日付ピッカーフィールド。
 * 値は Date オブジェクト。
 */
export function DatePickerField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder = '日付を選択',
  rules,
  description,
  className,
  disabled,
}: DatePickerFieldProps<TFieldValues, TName>) {
  return (
    <UiFormField
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={cn('flex flex-col', className)}>
          {label && <FormLabel>{label}</FormLabel>}
          <Popover>
            <PopoverTrigger asChild>
              <FormControl>
                <Button
                  variant="secondary"
                  disabled={disabled}
                  className={cn(
                    'w-full justify-start text-left font-normal',
                    !field.value && 'text-[#1c1410]/40',
                  )}
                >
                  <CalendarIcon className="mr-2 size-4 shrink-0 text-[#1c1410]/50" />
                  {field.value
                    ? format(field.value as Date, 'yyyy年M月d日（eee）', { locale: ja })
                    : placeholder}
                </Button>
              </FormControl>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={field.value as Date | undefined}
                onSelect={field.onChange}
              />
            </PopoverContent>
          </Popover>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
