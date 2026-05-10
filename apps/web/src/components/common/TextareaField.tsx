'use client'

import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form'
import { Textarea } from '@/components/ui/textarea'
import {
  FormField as UiFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

export interface TextareaFieldProps<
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
  rows?: number
}

/**
 * shadcn/ui Textarea + React Hook Form 統合フィールド。
 */
export function TextareaField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder,
  rules,
  description,
  className,
  disabled,
  rows,
}: TextareaFieldProps<TFieldValues, TName>) {
  return (
    <UiFormField
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Textarea
              placeholder={placeholder}
              disabled={disabled}
              rows={rows}
              {...field}
            />
          </FormControl>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
