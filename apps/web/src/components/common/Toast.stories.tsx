import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { toast } from 'sonner'
import { Toaster } from '@/components/ui/sonner'
import { Button } from './Button'

const meta: Meta = {
  title: 'Common/Toast',
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <>
        <Story />
        <Toaster position="bottom-center" />
      </>
    ),
  ],
}

export default meta
type Story = StoryObj

export const Success: Story = {
  render: () => (
    <Button onClick={() => toast.success('記録しました', { description: '支出が正常に登録されました' })}>
      成功トーストを表示
    </Button>
  ),
}

export const Error: Story = {
  render: () => (
    <Button
      variant="destructive"
      onClick={() => toast.error('エラーが発生しました', { description: 'もう一度お試しください' })}
    >
      エラートーストを表示
    </Button>
  ),
}

export const AllTypes: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Button onClick={() => toast('お知らせ', { description: '一般的なメッセージ' })}>
        デフォルト
      </Button>
      <Button onClick={() => toast.success('保存しました')}>成功</Button>
      <Button variant="destructive" onClick={() => toast.error('失敗しました')}>エラー</Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast('削除しますか？', {
            action: { label: '削除', onClick: () => toast.success('削除しました') },
          })
        }
      >
        アクション付き
      </Button>
    </div>
  ),
}
