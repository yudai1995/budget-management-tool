import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { SecurityBadges } from './SecurityBadges'

const meta: Meta<typeof SecurityBadges> = {
  title: 'Common/SecurityBadges',
  component: SecurityBadges,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof SecurityBadges>

/** ログイン・登録フォームに添える控えめなセキュリティバッジ */
export const Default: Story = {}
