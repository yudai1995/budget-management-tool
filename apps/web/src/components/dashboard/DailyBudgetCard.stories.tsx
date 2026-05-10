import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DailyBudgetCard } from './DailyBudgetCard'

const meta: Meta<typeof DailyBudgetCard> = {
  title: 'Dashboard/DailyBudgetCard',
  component: DailyBudgetCard,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof DailyBudgetCard>

/** 設定未完了（budgetResult が null）のフォールバック表示 */
export const NotConfigured: Story = {
  args: {
    todayExpense: 0,
    budgetResult: null,
  },
}

/** 余裕あり（残予算80%以上） */
export const Safe: Story = {
  args: {
    todayExpense: 200,
    budgetResult: {
      dailyBudget: 3000,
      daysUntilPayday: 15,
      availableBalance: 45000,
    },
  },
}

/** 注意（残予算20〜80%） */
export const Caution: Story = {
  args: {
    todayExpense: 1500,
    budgetResult: {
      dailyBudget: 3000,
      daysUntilPayday: 8,
      availableBalance: 24000,
    },
  },
}

/** ピンチ（残予算20%未満） */
export const Danger: Story = {
  args: {
    todayExpense: 2700,
    budgetResult: {
      dailyBudget: 3000,
      daysUntilPayday: 3,
      availableBalance: 9000,
    },
  },
}

/** 予算超過 */
export const OverBudget: Story = {
  args: {
    todayExpense: 4200,
    budgetResult: {
      dailyBudget: 3000,
      daysUntilPayday: 1,
      availableBalance: 3000,
    },
  },
}
