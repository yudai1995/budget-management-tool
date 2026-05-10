'use client'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { SelectField } from './SelectField'
import { Button } from './Button'

const meta: Meta<typeof SelectField> = {
  title: 'Common/SelectField',
  component: SelectField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof SelectField>

const CATEGORY_OPTIONS = [
  { value: 'food', label: '食費' },
  { value: 'transport', label: '交通費' },
  { value: 'entertainment', label: '娯楽費' },
  { value: 'utility', label: '光熱費' },
  { value: 'health', label: '医療費' },
  { value: 'other', label: 'その他' },
]

export const Basic: Story = {
  render: () => {
    const form = useForm<{ category: string }>()
    return (
      <Form {...form}>
        <form className="w-80">
          <SelectField name="category" label="カテゴリ" options={CATEGORY_OPTIONS} />
        </form>
      </Form>
    )
  },
}

// デモ用インラインバリデーション（zodResolver は Zod v4 との型互換性問題のため stories では使用しない）
export const WithValidation: Story = {
  render: () => {
    const form = useForm<{ category: string }>({
      defaultValues: { category: '' },
      mode: 'onSubmit',
    })
    function onSubmit(data: { category: string }) {
      if (!data.category) {
        form.setError('category', { message: 'カテゴリを選択してください' })
      }
    }
    return (
      <Form {...form}>
        <form className="w-80 flex flex-col gap-4" onSubmit={form.handleSubmit(onSubmit)}>
          <SelectField
            name="category"
            label="カテゴリ"
            options={CATEGORY_OPTIONS}
            description="支出のカテゴリを選択してください"
          />
          <Button type="submit">送信（エラーを確認）</Button>
        </form>
      </Form>
    )
  },
}
