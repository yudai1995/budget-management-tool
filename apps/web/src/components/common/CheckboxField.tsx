'use client'

import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form'
import { Checkbox } from '@/components/ui/checkbox'
import {
  FormField as UiFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { cn } from '@/lib/utils'

export interface CheckboxFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  label: string
  rules?: RegisterOptions<TFieldValues, TName>
  description?: string
  className?: string
  disabled?: boolean
}

/**
 * shadcn/ui Checkbox + React Hook Form 統合フィールド。
 */
export function CheckboxField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  rules,
  description,
  className,
  disabled,
}: CheckboxFieldProps<TFieldValues, TName>) {
  return (
    <UiFormField
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={cn('flex flex-row items-start gap-3', className)}>
          <FormControl>
            <Checkbox
              checked={field.value}
              onCheckedChange={field.onChange}
              disabled={disabled}
            />
          </FormControl>
          <div className="flex flex-col gap-1 leading-none">
            <FormLabel className="cursor-pointer">{label}</FormLabel>
            {description && <FormDescription>{description}</FormDescription>}
            <FormMessage />
          </div>
        </FormItem>
      )}
    />
  )
}
