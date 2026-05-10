'use client'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { CheckboxField } from './CheckboxField'
import { Button } from './Button'

const meta: Meta<typeof CheckboxField> = {
  title: 'Common/CheckboxField',
  component: CheckboxField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof CheckboxField>

export const Basic: Story = {
  render: () => {
    const form = useForm<{ agree: boolean }>({ defaultValues: { agree: false } })
    return (
      <Form {...form}>
        <form className="w-80 flex flex-col gap-4">
          <CheckboxField
            name="agree"
            label="利用規約に同意する"
            description="同意しないとサービスを利用できません"
          />
          <Button type="submit" onClick={form.handleSubmit(() => {})}>送信</Button>
        </form>
      </Form>
    )
  },
}

export const Multiple: Story = {
  render: () => {
    const form = useForm<{ food: boolean; transport: boolean; entertainment: boolean }>({
      defaultValues: { food: true, transport: false, entertainment: false },
    })
    return (
      <Form {...form}>
        <form className="w-80 flex flex-col gap-3">
          <p className="text-sm font-semibold text-[#1c1410]">表示するカテゴリ</p>
          <CheckboxField name="food" label="食費" />
          <CheckboxField name="transport" label="交通費" />
          <CheckboxField name="entertainment" label="娯楽費" />
        </form>
      </Form>
    )
  },
}
