'use client'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm, FormProvider } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { FormField } from './FormField'
import { Button } from './Button'

const meta: Meta<typeof FormField> = {
  title: 'Common/FormField',
  component: FormField,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof FormField>

// ストーリー用ラッパー: FormProvider が必要なため render で包む
function FormWrapper({ children }: { children: React.ReactNode }) {
  const form = useForm()
  return <FormProvider {...form}><form className="w-80 flex flex-col gap-4">{children}</form></FormProvider>
}

/** テキスト入力（基本） */
export const Text: Story = {
  render: () => (
    <FormWrapper>
      <FormField name="username" label="ユーザー名" placeholder="yamamoto" />
    </FormWrapper>
  ),
}

/** メールアドレス */
export const Email: Story = {
  render: () => (
    <FormWrapper>
      <FormField name="email" label="メールアドレス" type="email" placeholder="you@example.com" description="ログインに使用します" />
    </FormWrapper>
  ),
}

/** パスワード */
export const Password: Story = {
  render: () => (
    <FormWrapper>
      <FormField name="password" label="パスワード" type="password" placeholder="8文字以上" />
    </FormWrapper>
  ),
}

/** disabled 状態 */
export const Disabled: Story = {
  render: () => (
    <FormWrapper>
      <FormField name="email" label="メールアドレス" type="email" placeholder="変更不可" disabled />
    </FormWrapper>
  ),
}

// バリデーションエラー表示用ストーリー
const schema = z.object({
  email: z.string().email('有効なメールアドレスを入力してください'),
  password: z.string().min(8, 'パスワードは8文字以上必要です'),
})

function ValidationForm() {
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { email: '', password: '' },
  })
  return (
    <FormProvider {...form}>
      <form
        className="w-80 flex flex-col gap-4"
        onSubmit={form.handleSubmit(() => {})}
      >
        <FormField name="email" label="メールアドレス" type="email" placeholder="you@example.com" />
        <FormField name="password" label="パスワード" type="password" placeholder="8文字以上" />
        <Button type="submit" variant="primary">送信（エラーを確認）</Button>
      </form>
    </FormProvider>
  )
}

/** バリデーションエラー（送信ボタンを押すとエラー表示） */
export const WithValidation: Story = {
  render: () => <ValidationForm />,
}
