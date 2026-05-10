import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { DailyBudgetCard } from '../../components/dashboard/DailyBudgetCard'
import type { DailyBudgetResult } from '@budget/common'

/** calcDailyBudget の結果ダミー（1日予算 ¥3,200 / 給料日まで12日） */
const mockBudgetResult: DailyBudgetResult = {
  dailyBudget: 3200,
  daysUntilPayday: 12,
  availableBalance: 38400,
}

describe('DailyBudgetCard', () => {
  describe('設定未完了のとき（budgetResult=null）', () => {
    it('フォールバックメッセージを表示する', () => {
      render(<DailyBudgetCard todayExpense={0} budgetResult={null} />)
      expect(screen.getByText('設定を完了すると「今日使えるお金」が表示されます')).toBeInTheDocument()
    })
  })

  describe('余裕ステート（残予算 ≥ 80%）', () => {
    it('支出が少ないとき「余裕」バッジを表示する', () => {
      // 残予算 = 3200 - 200 = 3000 → ratio = 0.9375 ≥ 0.8
      render(<DailyBudgetCard todayExpense={200} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('余裕')).toBeInTheDocument()
    })

    it('残予算をヒーローナンバーとして表示する', () => {
      render(<DailyBudgetCard todayExpense={200} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('¥3,000')).toBeInTheDocument()
    })

    it('今日の支出と1日予算の内訳を表示する', () => {
      render(<DailyBudgetCard todayExpense={200} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('¥3,200')).toBeInTheDocument()
      expect(screen.getByText('¥200')).toBeInTheDocument()
    })

    it('給料日カウントダウンを表示する', () => {
      render(<DailyBudgetCard todayExpense={200} budgetResult={mockBudgetResult} />)
      expect(screen.getByText(/あと12日/)).toBeInTheDocument()
    })
  })

  describe('注意ステート（残予算 20〜80%）', () => {
    it('残予算が50%のとき「注意」バッジを表示する', () => {
      // 残予算 = 3200 - 1600 = 1600 → ratio = 0.5 → caution
      render(<DailyBudgetCard todayExpense={1600} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('注意')).toBeInTheDocument()
    })

    it('残予算が境界値 20% ちょうどのとき「注意」バッジを表示する', () => {
      // 残予算 = 3200 - 2560 = 640 → ratio = 0.2 → caution
      render(<DailyBudgetCard todayExpense={2560} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('注意')).toBeInTheDocument()
    })
  })

  describe('ピンチステート（残予算 < 20%）', () => {
    it('残予算が 10% 未満のとき「ピンチ」バッジを表示する', () => {
      // 残予算 = 3200 - 3100 = 100 → ratio ≈ 0.03 → danger
      render(<DailyBudgetCard todayExpense={3100} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('ピンチ')).toBeInTheDocument()
    })
  })

  describe('予算超過のとき', () => {
    it('「ピンチ」バッジと超過額メッセージを表示する', () => {
      // 残予算 = 3200 - 4500 = -1300 → over budget
      render(<DailyBudgetCard todayExpense={4500} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('ピンチ')).toBeInTheDocument()
      expect(screen.getByText(/予算を.*超過/)).toBeInTheDocument()
    })

    it('マイナス残予算を負号付きで表示する', () => {
      render(<DailyBudgetCard todayExpense={4500} budgetResult={mockBudgetResult} />)
      expect(screen.getByText('-¥1,300')).toBeInTheDocument()
    })
  })

  describe('支出ゼロのとき', () => {
    it('1日予算の全額がヒーローナンバーになる', () => {
      render(<DailyBudgetCard todayExpense={0} budgetResult={mockBudgetResult} />)
      // 残予算 = 3200 - 0 = 3200 → ratio = 1.0 → safe
      // ¥3,200 はヒーローナンバーと内訳欄に2回登場するため getAllByText を使う
      expect(screen.getAllByText('¥3,200').length).toBeGreaterThanOrEqual(1)
      expect(screen.getByText('余裕')).toBeInTheDocument()
    })
  })

  describe('給料日当日のとき（daysUntilPayday=1）', () => {
    it('あと1日と表示する', () => {
      const paydayResult: DailyBudgetResult = {
        dailyBudget: 5000,
        daysUntilPayday: 1,
        availableBalance: 5000,
      }
      render(<DailyBudgetCard todayExpense={200} budgetResult={paydayResult} />)
      expect(screen.getByText(/あと1日/)).toBeInTheDocument()
    })
  })

  describe('1日予算が0円のとき', () => {
    it('ピンチと判定される', () => {
      const zeroBudgetResult: DailyBudgetResult = {
        dailyBudget: 0,
        daysUntilPayday: 5,
        availableBalance: 0,
      }
      render(<DailyBudgetCard todayExpense={0} budgetResult={zeroBudgetResult} />)
      expect(screen.getByText('ピンチ')).toBeInTheDocument()
    })
  })
})
