'use client'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { TextareaField } from './TextareaField'

const meta: Meta<typeof TextareaField> = {
  title: 'Common/TextareaField',
  component: TextareaField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof TextareaField>

export const Basic: Story = {
  render: () => {
    const form = useForm<{ memo: string }>()
    return (
      <Form {...form}>
        <form className="w-80">
          <TextareaField name="memo" label="メモ" placeholder="支出の詳細を入力..." description="任意入力" />
        </form>
      </Form>
    )
  },
}
