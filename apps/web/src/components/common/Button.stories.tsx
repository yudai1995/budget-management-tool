import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { Button } from './Button'

const meta: Meta<typeof Button> = {
  title: 'Common/Button',
  component: Button,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['primary', 'secondary', 'ghost', 'destructive'],
    },
    size: {
      control: 'select',
      options: ['sm', 'md', 'lg'],
    },
  },
}

export default meta

type Story = StoryObj<typeof Button>

/** メインのアクションボタン。オレンジ + 2px ハードシャドウ */
export const Primary: Story = {
  args: {
    variant: 'primary',
    children: '記録する',
  },
}

/** サブアクション用。白背景 + 細ボーダー */
export const Secondary: Story = {
  args: {
    variant: 'secondary',
    children: 'キャンセル',
  },
}

/** テキストリンク的な用途 */
export const Ghost: Story = {
  args: {
    variant: 'ghost',
    children: '詳細を見る',
  },
}

/** 削除・ログアウトなど危険操作 */
export const Destructive: Story = {
  args: {
    variant: 'destructive',
    children: 'アカウントを削除',
  },
}

/** ローディング状態 */
export const Loading: Story = {
  args: {
    variant: 'primary',
    loading: true,
    children: '保存する',
  },
}

/** disabled 状態 */
export const Disabled: Story = {
  args: {
    variant: 'primary',
    disabled: true,
    children: '保存する',
  },
}

/** 幅いっぱいに広げる */
export const FullWidth: Story = {
  args: {
    variant: 'primary',
    fullWidth: true,
    children: 'ログインする',
  },
  parameters: {
    layout: 'padded',
  },
}

/** サイズ比較 */
export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Button variant="primary" size="sm">小（sm）</Button>
      <Button variant="primary" size="md">中（md）</Button>
      <Button variant="primary" size="lg">大（lg）</Button>
    </div>
  ),
}

/** variant 全種比較 */
export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <Button variant="primary">Primary — 記録する</Button>
      <Button variant="secondary">Secondary — キャンセル</Button>
      <Button variant="ghost">Ghost — 詳細を見る</Button>
      <Button variant="destructive">Destructive — 削除する</Button>
    </div>
  ),
}
