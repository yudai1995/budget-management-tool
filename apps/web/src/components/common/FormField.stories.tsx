'use client'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import {
  Form,
  FormField as UiFormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
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

/** テキスト入力（基本） */
export const Text: Story = {
  render: () => {
    const form = useForm<{ username: string }>()
    return (
      <Form {...form}>
        <form className="w-80">
          <FormField name="username" label="ユーザー名" placeholder="yamamoto" />
        </form>
      </Form>
    )
  },
}

/** メールアドレス + description */
export const Email: Story = {
  render: () => {
    const form = useForm<{ email: string }>()
    return (
      <Form {...form}>
        <form className="w-80">
          <FormField
            name="email"
            label="メールアドレス"
            type="email"
            placeholder="you@example.com"
            description="ログインに使用します"
          />
        </form>
      </Form>
    )
  },
}

/** パスワード */
export const Password: Story = {
  render: () => {
    const form = useForm<{ password: string }>()
    return (
      <Form {...form}>
        <form className="w-80">
          <FormField name="password" label="パスワード" type="password" placeholder="8文字以上" />
        </form>
      </Form>
    )
  },
}

/** disabled 状態 */
export const Disabled: Story = {
  render: () => {
    const form = useForm<{ email: string }>({ defaultValues: { email: 'yamamoto@example.com' } })
    return (
      <Form {...form}>
        <form className="w-80">
          <FormField name="email" label="メールアドレス" type="email" disabled />
        </form>
      </Form>
    )
  },
}

/** バリデーション付き（送信ボタンを押すとエラー表示） */
export const WithValidation: Story = {
  render: () => {
    const form = useForm<{ email: string; password: string }>({
      defaultValues: { email: '', password: '' },
      mode: 'onSubmit',
    })
    function onSubmit(data: { email: string; password: string }) {
      // デモ用インラインバリデーション（zodResolver は Zod v4 との型互換性問題のため stories では使用しない）
      if (!data.email.includes('@')) {
        form.setError('email', { message: '有効なメールアドレスを入力してください' })
      }
      if (data.password.length < 8) {
        form.setError('password', { message: 'パスワードは8文字以上必要です' })
      }
    }
    return (
      <Form {...form}>
        <form
          className="w-80 flex flex-col gap-4"
          onSubmit={form.handleSubmit(onSubmit)}
        >
          <FormField name="email" label="メールアドレス" type="email" placeholder="you@example.com" />
          <FormField name="password" label="パスワード" type="password" placeholder="8文字以上" />
          <Button type="submit">送信（エラーを確認）</Button>
        </form>
      </Form>
    )
  },
}

/** shadcn/ui プリミティブを直接使う例（上級者向け） */
export const PrimitivesDirectly: Story = {
  render: () => {
    const form = useForm<{ bio: string }>({ defaultValues: { bio: '' } })
    return (
      <Form {...form}>
        <form className="w-80">
          <UiFormField
            control={form.control}
            name="bio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>自己紹介</FormLabel>
                <FormControl>
                  <Input placeholder="100文字以内で入力" {...field} />
                </FormControl>
                <FormDescription>プロフィールに表示されます</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </form>
      </Form>
    )
  },
}
