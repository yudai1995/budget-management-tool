import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MonthlyComparisonCard } from '../../components/report/MonthlyComparisonCard'
import type { MonthlyComparisonData } from '@budget/common'

/** テスト用デフォルトデータ */
const baseData: MonthlyComparisonData = {
    currentTotal: 60000,
    prevMonthTotal: 50000,
    prevYearTotal: null,
    prevMonthDiff: 10000,
    prevMonthPct: 20,
    prevYearDiff: null,
    prevYearPct: null,
}

describe('MonthlyComparisonCard', () => {
    describe('前月比の表示', () => {
        it('セクションヘッダー「前月比・前年同月比」が表示される', () => {
            render(<MonthlyComparisonCard data={baseData} />)
            expect(screen.getByText('前月比・前年同月比')).toBeInTheDocument()
        })

        it('前月の金額が表示される', () => {
            render(<MonthlyComparisonCard data={baseData} />)
            expect(screen.getByText(/前月: ¥50,000/)).toBeInTheDocument()
        })

        it('前月より増加のとき、増加額と増加率が表示される', () => {
            render(<MonthlyComparisonCard data={baseData} />)
            expect(screen.getByText(/\+¥10,000.*\+20%/)).toBeInTheDocument()
        })

        it('前月より減少のとき、減少額と減少率が表示される', () => {
            const data: MonthlyComparisonData = {
                ...baseData,
                prevMonthTotal: 70000,
                prevMonthDiff: -10000,
                prevMonthPct: -14,
            }
            render(<MonthlyComparisonCard data={data} />)
            expect(screen.getByText(/-¥10,000.*-14%/)).toBeInTheDocument()
        })

        it('前月と同額のとき「増減なし」が表示される', () => {
            const data: MonthlyComparisonData = {
                ...baseData,
                prevMonthTotal: 60000,
                prevMonthDiff: 0,
                prevMonthPct: 0,
            }
            render(<MonthlyComparisonCard data={data} />)
            expect(screen.getByText('増減なし')).toBeInTheDocument()
        })
    })

    describe('前年同月比の表示', () => {
        it('prevYearTotal=null のとき「前年同月のデータがありません」が表示される', () => {
            render(<MonthlyComparisonCard data={baseData} />)
            expect(screen.getByText('前年同月のデータがありません')).toBeInTheDocument()
        })

        it('prevYearTotal が設定されているとき前年同月の金額と増減が表示される', () => {
            const data: MonthlyComparisonData = {
                ...baseData,
                prevYearTotal: 55000,
                prevYearDiff: 5000,
                prevYearPct: 9,
            }
            render(<MonthlyComparisonCard data={data} />)
            expect(screen.getByText(/前年同月: ¥55,000/)).toBeInTheDocument()
            expect(screen.getByText(/\+¥5,000.*\+9%/)).toBeInTheDocument()
        })

        it('前年同月より減少のとき、減少額と減少率が表示される', () => {
            const data: MonthlyComparisonData = {
                ...baseData,
                prevYearTotal: 70000,
                prevYearDiff: -10000,
                prevYearPct: -14,
            }
            render(<MonthlyComparisonCard data={data} />)
            expect(screen.getByText(/-¥10,000.*-14%/)).toBeInTheDocument()
        })
    })
})
