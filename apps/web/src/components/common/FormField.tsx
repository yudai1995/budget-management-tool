'use client'

import {
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from 'react-hook-form'
import { Input } from '@/components/ui/input'
import {
  FormField as UiFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'

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
  /** RHF バリデーションオプション（useForm の rules）*/
  rules?: RegisterOptions<TFieldValues, TName>
  /** 補助テキスト */
  description?: string
  /** 追加クラス（FormItem ラッパー） */
  className?: string
  disabled?: boolean
}

/**
 * shadcn/ui Form プリミティブ（FormField / FormItem / FormLabel / FormControl /
 * FormDescription / FormMessage）を組み合わせた便利コンポーネント。
 * Form（= FormProvider）の内側に配置すること。
 *
 * @example
 * ```tsx
 * const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) })
 * <Form {...form}>
 *   <form onSubmit={form.handleSubmit(onSubmit)}>
 *     <FormField name="email" label="メールアドレス" type="email" />
 *   </form>
 * </Form>
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
  return (
    <UiFormField
      name={name}
      rules={rules}
      render={({ field }) => (
        <FormItem className={className}>
          {label && <FormLabel>{label}</FormLabel>}
          <FormControl>
            <Input
              type={type}
              placeholder={placeholder}
              disabled={disabled}
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
