'use client'

import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
  useFormContext,
} from 'react-hook-form'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export interface FormFieldProps<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> {
  /** フィールド名（RHF の name） */
  name: TName
  /** ラベルテキスト */
  label?: string
  /** プレースホルダー */
  placeholder?: string
  /** input type */
  type?: React.InputHTMLAttributes<HTMLInputElement>['type']
  /** RHF バリデーションオプション */
  rules?: RegisterOptions<TFieldValues, TName>
  /** 補助テキスト */
  description?: string
  /** 追加クラス（ラッパー div） */
  className?: string
  disabled?: boolean
}

/**
 * React Hook Form + Radix Label + shadcn/ui Input を統合したフィールドコンポーネント。
 * useFormContext() を使用するため FormProvider の内側に配置すること。
 *
 * @example
 * ```tsx
 * const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
 * <FormProvider {...form}>
 *   <FormField name="email" label="メールアドレス" type="email" />
 * </FormProvider>
 * ```
 */
export function FormField<
  TFieldValues extends FieldValues = FieldValues,
  TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
>({
  name,
  label,
  placeholder,
  type = 'text',
  rules,
  description,
  className,
  disabled,
}: FormFieldProps<TFieldValues, TName>) {
  const {
    register,
    formState: { errors },
  } = useFormContext<TFieldValues>()

  const error = errors[name]
  const errorMessage = error?.message as string | undefined

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      {label && <Label htmlFor={name}>{label}</Label>}
      <Input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : description ? `${name}-desc` : undefined}
        {...register(name, rules)}
      />
      {description && !error && (
        <p id={`${name}-desc`} className="text-xs text-[#1c1410]/50">
          {description}
        </p>
      )}
      {errorMessage && (
        <p id={`${name}-error`} role="alert" className="text-xs font-medium text-[#f43f5e]">
          {errorMessage}
        </p>
      )}
    </div>
  )
}
