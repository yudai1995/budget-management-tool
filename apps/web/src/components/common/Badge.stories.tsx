import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Badge } from './Badge'

const meta: Meta<typeof Badge> = {
  title: 'Common/Badge',
  component: Badge,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['safe', 'caution', 'danger', 'neutral', 'income', 'expense'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Badge>

/** 余裕（Pattern D ウォームグレー） */
export const Safe: Story = {
  args: { variant: 'safe', children: '余裕' },
}

/** 注意（Pattern D コーラル） */
export const Caution: Story = {
  args: { variant: 'caution', children: '注意' },
}

/** ピンチ（Pattern D ローズ） */
export const Danger: Story = {
  args: { variant: 'danger', children: 'ピンチ' },
}

/** 中立 */
export const Neutral: Story = {
  args: { variant: 'neutral', children: 'ラベル' },
}

/** 収入 */
export const Income: Story = {
  args: { variant: 'income', children: '収入' },
}

/** 支出 */
export const Expense: Story = {
  args: { variant: 'expense', children: '支出' },
}

/** Pattern D — 3状態を並べて比較 */
export const PinchLevelComparison: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Badge variant="safe">余裕</Badge>
      <Badge variant="caution">注意</Badge>
      <Badge variant="danger">ピンチ</Badge>
    </div>
  ),
}

/** カード上での使用例 */
export const InCardContext: Story = {
  render: () => (
    <div className="flex flex-col gap-3 w-64">
      {(['safe', 'caution', 'danger'] as const).map((v) => (
        <div
          key={v}
          className="flex items-center justify-between rounded-xl border p-3"
          style={{ borderColor: '#e8c8b0' }}
        >
          <span className="text-sm font-medium text-[#1c1410]">今日使えるお金</span>
          <Badge variant={v}>
            {v === 'safe' ? '余裕' : v === 'caution' ? '注意' : 'ピンチ'}
          </Badge>
        </div>
      ))}
    </div>
  ),
}
