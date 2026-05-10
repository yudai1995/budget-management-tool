'use client'

import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { useForm } from 'react-hook-form'
import { Form } from '@/components/ui/form'
import { DatePickerField } from './DatePickerField'
import { Button } from './Button'

const meta: Meta<typeof DatePickerField> = {
  title: 'Common/DatePickerField',
  component: DatePickerField,
  parameters: { layout: 'padded' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof DatePickerField>

export const Basic: Story = {
  render: () => {
    const form = useForm<{ date: Date }>({ defaultValues: { date: new Date() } })
    return (
      <Form {...form}>
        <form className="w-80 flex flex-col gap-4">
          <DatePickerField name="date" label="支出日" description="支出が発生した日付を選択" />
          <Button type="submit" onClick={form.handleSubmit((d) => console.log(d))}>確定</Button>
        </form>
      </Form>
    )
  },
}
