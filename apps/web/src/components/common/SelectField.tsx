'use client'

import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import {
  FormField as UiFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

export interface SelectOption {
  value: string
  label: string
}

export interface SelectFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  name: TName
  label?: string
  placeholder?: string
  options: SelectOption[]
  rules?: RegisterOptions<TFieldValues, TName>
  description?: string
  className?: string
  disabled?: boolean
}

/**
 * shadcn/ui Select + React Hook Form 統合フィールド。
 * Form（= FormProvider）の内側に配置すること。
 */
export function SelectField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder = '選択してください',
  options,
  rules,
  description,
  className,
  disabled,
}: SelectFieldProps<TFieldValues, TName>) {
  return (
    <UiFormField
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <Select
            onValueChange={field.onChange}
            defaultValue={field.value}
            disabled={disabled}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder={placeholder} />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {description && <FormDescription>{description}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  )
}
