import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tooltip } from './Tooltip'

const meta: Meta<typeof Tooltip> = {
  title: 'Common/Tooltip',
  component: Tooltip,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof Tooltip>

/** ホバーでツールチップが表示される */
export const Default: Story = {
  args: {
    content: 'ツールチップの内容がここに表示されます',
    children: <span className="cursor-default rounded border border-[#e8c8b0] bg-white px-3 py-1.5 text-sm font-medium text-[#1c1410]">ホバーしてください</span>,
  },
}

/** リッチなコンテンツを持つツールチップ */
export const RichContent: Story = {
  args: {
    content: (
      <span className="space-y-1 block">
        <strong className="font-bold text-[#1c1410]">セキュリティについて</strong>
        <p className="leading-relaxed">入力内容は暗号化されサーバーに安全に保存されます。</p>
      </span>
    ),
    children: <span className="cursor-default rounded border border-[#e8c8b0] bg-white px-3 py-1.5 text-sm font-medium text-[#1c1410]">リッチコンテンツ</span>,
  },
}
