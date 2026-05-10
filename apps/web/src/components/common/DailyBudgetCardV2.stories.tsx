import type { Meta, StoryObj } from '@storybook/nextjs-vite'
import { DailyBudgetCardV2 } from './DailyBudgetCardV2'
import { DailyBudgetCard } from '../dashboard/DailyBudgetCard'

const meta: Meta<typeof DailyBudgetCardV2> = {
  title: 'Catalog/DailyBudgetCardV2 (Pattern D)',
  component: DailyBudgetCardV2,
  parameters: {
    layout: 'padded',
  },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof DailyBudgetCardV2>

/** 設定未完了のフォールバック */
export const NotConfigured: Story = {
  args: {
    todayExpense: 0,
    budgetResult: null,
  },
}

/** 余裕あり — ウォームグレー（控えめな通常色） */
export const Safe: Story = {
  args: {
    todayExpense: 200,
    budgetResult: { dailyBudget: 3000, daysUntilPayday: 15, availableBalance: 45000 },
  },
}

/** 注意 — コーラル #f87171 */
export const Caution: Story = {
  args: {
    todayExpense: 1500,
    budgetResult: { dailyBudget: 3000, daysUntilPayday: 8, availableBalance: 24000 },
  },
}

/** ピンチ — ローズ #f43f5e */
export const Danger: Story = {
  args: {
    todayExpense: 2700,
    budgetResult: { dailyBudget: 3000, daysUntilPayday: 3, availableBalance: 9000 },
  },
}

/** 予算超過 */
export const OverBudget: Story = {
  args: {
    todayExpense: 4200,
    budgetResult: { dailyBudget: 3000, daysUntilPayday: 1, availableBalance: 3000 },
  },
}

/**
 * Before / After 比較
 * 左: 現行（ブランドオレンジ系）/ 右: Pattern D（ローズ系）
 */
export const BeforeAfterComparison: Story = {
  render: () => (
    <div className="grid grid-cols-1 gap-6 max-w-2xl">
      <p className="text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide col-span-1">
        ─ Before / After 比較（CAUTION 状態） ─
      </p>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-[#1c1410]/50 mb-2">現行（ブランドオレンジ）</p>
          <DailyBudgetCard
            todayExpense={1500}
            budgetResult={{ dailyBudget: 3000, daysUntilPayday: 8, availableBalance: 24000 }}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-[#1c1410]/50 mb-2">Pattern D（コーラル）</p>
          <DailyBudgetCardV2
            todayExpense={1500}
            budgetResult={{ dailyBudget: 3000, daysUntilPayday: 8, availableBalance: 24000 }}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs font-medium text-[#1c1410]/50 mb-2">現行（DANGER）</p>
          <DailyBudgetCard
            todayExpense={2700}
            budgetResult={{ dailyBudget: 3000, daysUntilPayday: 3, availableBalance: 9000 }}
          />
        </div>
        <div>
          <p className="text-xs font-medium text-[#1c1410]/50 mb-2">Pattern D（ローズ）</p>
          <DailyBudgetCardV2
            todayExpense={2700}
            budgetResult={{ dailyBudget: 3000, daysUntilPayday: 3, availableBalance: 9000 }}
          />
        </div>
      </div>
    </div>
  ),
}

/** 3状態を縦に並べて確認 */
export const AllStates: Story = {
  render: () => (
    <div className="flex flex-col gap-4 max-w-sm">
      <DailyBudgetCardV2
        todayExpense={200}
        budgetResult={{ dailyBudget: 3000, daysUntilPayday: 15, availableBalance: 45000 }}
      />
      <DailyBudgetCardV2
        todayExpense={1500}
        budgetResult={{ dailyBudget: 3000, daysUntilPayday: 8, availableBalance: 24000 }}
      />
      <DailyBudgetCardV2
        todayExpense={2700}
        budgetResult={{ dailyBudget: 3000, daysUntilPayday: 3, availableBalance: 9000 }}
      />
    </div>
  ),
}
