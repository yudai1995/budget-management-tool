import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Tooltip } from './Tooltip'
import { Button } from './Button'

const meta: Meta<typeof Tooltip> = {
  title: 'Common/Tooltip',
  component: Tooltip,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta
type Story = StoryObj<typeof Tooltip>

export const Basic: Story = {
  render: () => (
    <Tooltip content="ホバー / フォーカスで表示されます">
      <Button variant="secondary">ホバーしてみて</Button>
    </Tooltip>
  ),
}

export const IconButton: Story = {
  render: () => (
    <Tooltip content="セキュリティバッジについて詳しく見る">
      <button className="inline-flex size-6 items-center justify-center rounded-full bg-[#1c1410]/10 text-xs font-bold text-[#1c1410]/60 hover:bg-[#1c1410]/20">
        ?
      </button>
    </Tooltip>
  ),
}

export const LongText: Story = {
  render: () => (
    <Tooltip content="このカードには直近30日間の収支バランスが表示されます。緑色は収入超過、赤色は支出超過を示します。">
      <Button variant="ghost">説明を見る</Button>
    </Tooltip>
  ),
}
