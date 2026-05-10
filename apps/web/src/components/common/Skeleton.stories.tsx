import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Skeleton, DailyBudgetCardSkeleton } from './Skeleton'

const meta: Meta<typeof Skeleton> = {
  title: 'Common/Skeleton',
  component: Skeleton,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
  argTypes: {
    rounded: {
      control: 'select',
      options: ['none', 'sm', 'md', 'lg', 'xl', '2xl', 'full'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Skeleton>

/** テキスト1行 */
export const TextLine: Story = {
  args: {
    className: 'w-48',
    height: 16,
    rounded: 'full',
  },
}

/** 四角いブロック */
export const Block: Story = {
  args: {
    className: 'w-full',
    height: 80,
    rounded: 'xl',
  },
}

/** アバター円形 */
export const Avatar: Story = {
  args: {
    className: 'w-12',
    height: 48,
    rounded: 'full',
  },
}

/** テキスト複数行（記事カードのローディング） */
export const TextLines: Story = {
  render: () => (
    <div className="flex flex-col gap-2 w-80">
      <Skeleton className="w-3/4" height={16} rounded="full" />
      <Skeleton className="w-full" height={12} rounded="full" />
      <Skeleton className="w-full" height={12} rounded="full" />
      <Skeleton className="w-2/3" height={12} rounded="full" />
    </div>
  ),
}

/** 支出カード行のスケルトン */
export const ExpenseRow: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-80">
      {[0, 1, 2].map((i) => (
        <div key={i} className="flex items-center gap-3 p-3 rounded-xl border" style={{ borderColor: '#e8c8b0' }}>
          <Skeleton className="w-10 shrink-0" height={40} rounded="xl" />
          <div className="flex-1 flex flex-col gap-1.5">
            <Skeleton className="w-24" height={12} rounded="full" />
            <Skeleton className="w-16" height={10} rounded="full" />
          </div>
          <Skeleton className="w-16 shrink-0" height={16} rounded="full" />
        </div>
      ))}
    </div>
  ),
}

/** DailyBudgetCard のローディング状態 */
export const DailyBudgetCard: Story = {
  render: () => (
    <div className="max-w-sm">
      <DailyBudgetCardSkeleton />
    </div>
  ),
}
