import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthlyOverviewCard } from '../../components/dashboard/MonthlyOverviewCard'
import type { ExpenseResponse } from '../../lib/api/types'

function makeExpense(overrides: Partial<ExpenseResponse>): ExpenseResponse {
  return {
    id: 'test-id',
    amount: 0,
    balanceType: 0,
    userId: 'user1',
    categoryId: 0,
    content: null,
    date: '2024-03-01',
    createdDate: '2024-03-01T00:00:00.000Z',
    updatedDate: '2024-03-01T00:00:00.000Z',
    deletedDate: null,
    ...overrides,
  }
}

describe('MonthlyOverviewCard', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-03-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('当月の月番号をヘッダーに表示する', () => {
    render(<MonthlyOverviewCard expenses={[]} />)
    expect(screen.getByText('3月の収支')).toBeInTheDocument()
  })

  it('記録がないとき、支出・収入・残りがすべて¥0になる', () => {
    render(<MonthlyOverviewCard expenses={[]} />)
    const zeros = screen.getAllByText('¥0')
    expect(zeros.length).toBeGreaterThanOrEqual(3)
  })

  it('当月の支出合計を正しく集計して表示する', () => {
    const expenses = [
      makeExpense({ balanceType: 0, amount: 3000, date: '2024-03-10' }),
      makeExpense({ balanceType: 0, amount: 2000, date: '2024-03-12' }),
      makeExpense({ balanceType: 0, amount: 9999, date: '2024-02-28' }), // 前月は除外
    ]
    render(<MonthlyOverviewCard expenses={expenses} />)
    expect(screen.getByText('¥5,000')).toBeInTheDocument()
  })

  it('当月の収入合計を正しく集計して表示する', () => {
    const expenses = [
      makeExpense({ balanceType: 1, amount: 200000, date: '2024-03-25' }),
    ]
    render(<MonthlyOverviewCard expenses={expenses} />)
    expect(screen.getByText('¥200,000')).toBeInTheDocument()
  })

  it('残り = 収入 - 支出 がプラスのとき +¥ 形式で表示する', () => {
    const expenses = [
      makeExpense({ balanceType: 1, amount: 100000, date: '2024-03-25' }),
      makeExpense({ balanceType: 0, amount: 40000, date: '2024-03-10' }),
    ]
    render(<MonthlyOverviewCard expenses={expenses} />)
    expect(screen.getByText('+¥60,000')).toBeInTheDocument()
  })

  it('残りがマイナスのとき -¥ 形式で表示する', () => {
    const expenses = [
      makeExpense({ balanceType: 0, amount: 80000, date: '2024-03-10' }),
      makeExpense({ balanceType: 1, amount: 50000, date: '2024-03-25' }),
    ]
    render(<MonthlyOverviewCard expenses={expenses} />)
    expect(screen.getByText('-¥30,000')).toBeInTheDocument()
  })

  it('前月・翌月の記録は集計に含めない', () => {
    const expenses = [
      makeExpense({ balanceType: 0, amount: 5000, date: '2024-03-15' }), // 当月
      makeExpense({ balanceType: 0, amount: 99999, date: '2024-02-28' }), // 前月
      makeExpense({ balanceType: 0, amount: 99999, date: '2024-04-01' }), // 翌月
    ]
    render(<MonthlyOverviewCard expenses={expenses} />)
    expect(screen.getByText('¥5,000')).toBeInTheDocument()
  })
})
