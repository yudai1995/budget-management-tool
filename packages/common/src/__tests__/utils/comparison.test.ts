import { describe, it, expect } from 'vitest'
import { calcMonthlyComparison } from '../../utils/comparison'

/** テスト用エントリ生成ヘルパー */
function expense(date: string, amount: number) {
    return { date, amount, balanceType: 0 }
}
function income(date: string, amount: number) {
    return { date, amount, balanceType: 1 }
}

describe('calcMonthlyComparison', () => {
    it('データがない場合、currentTotal=0、prevMonthTotal=0、prevYearTotal=null を返す', () => {
        const result = calcMonthlyComparison([], '2026-05')
        expect(result.currentTotal).toBe(0)
        expect(result.prevMonthTotal).toBe(0)
        expect(result.prevYearTotal).toBeNull()
        expect(result.prevMonthDiff).toBe(0)
        expect(result.prevMonthPct).toBeNull()
        expect(result.prevYearDiff).toBeNull()
        expect(result.prevYearPct).toBeNull()
    })

    it('当月のみデータがある場合、前月比は増加、前年同月比は null を返す', () => {
        const entries = [expense('2026-05-10', 50000), expense('2026-05-20', 30000)]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.currentTotal).toBe(80000)
        expect(result.prevMonthTotal).toBe(0)
        expect(result.prevMonthDiff).toBe(80000)
        expect(result.prevMonthPct).toBeNull() // 前月が 0 なので null
        expect(result.prevYearTotal).toBeNull()
    })

    it('当月・前月のデータがある場合、前月比を正しく計算する', () => {
        const entries = [
            expense('2026-05-10', 60000),
            expense('2026-04-15', 50000),
        ]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.currentTotal).toBe(60000)
        expect(result.prevMonthTotal).toBe(50000)
        expect(result.prevMonthDiff).toBe(10000)
        expect(result.prevMonthPct).toBe(20) // +20%
    })

    it('前月より支出が減少した場合、負の増減額・率を返す', () => {
        const entries = [
            expense('2026-05-10', 40000),
            expense('2026-04-15', 50000),
        ]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.prevMonthDiff).toBe(-10000)
        expect(result.prevMonthPct).toBe(-20) // -20%
    })

    it('前年同月のデータがある場合、前年同月比を正しく計算する', () => {
        const entries = [
            expense('2026-05-10', 60000),
            expense('2025-05-15', 50000),
        ]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.prevYearTotal).toBe(50000)
        expect(result.prevYearDiff).toBe(10000)
        expect(result.prevYearPct).toBe(20) // +20%
    })

    it('収入エントリは集計に含めない', () => {
        const entries = [
            expense('2026-05-10', 60000),
            income('2026-05-10', 200000), // 収入は除外
            expense('2026-04-15', 50000),
            income('2026-04-15', 200000), // 収入は除外
        ]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.currentTotal).toBe(60000)
        expect(result.prevMonthTotal).toBe(50000)
    })

    it('1月の場合、前月は前年12月になる', () => {
        const entries = [
            expense('2026-01-10', 50000),
            expense('2025-12-20', 40000),
        ]
        const result = calcMonthlyComparison(entries, '2026-01')
        expect(result.prevMonthTotal).toBe(40000)
        expect(result.prevMonthDiff).toBe(10000)
    })

    it('前月・前年同月ともにデータがある場合、両方の比較を返す', () => {
        const entries = [
            expense('2026-05-01', 60000),
            expense('2026-04-01', 50000),
            expense('2025-05-01', 55000),
        ]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.currentTotal).toBe(60000)
        expect(result.prevMonthTotal).toBe(50000)
        expect(result.prevMonthDiff).toBe(10000)
        expect(result.prevMonthPct).toBe(20)
        expect(result.prevYearTotal).toBe(55000)
        expect(result.prevYearDiff).toBe(5000)
        expect(result.prevYearPct).toBe(9) // Math.round(5000/55000*100)=9
    })

    it('当月と前月が同額の場合、増減額=0、増減率=0 を返す', () => {
        const entries = [
            expense('2026-05-01', 50000),
            expense('2026-04-01', 50000),
        ]
        const result = calcMonthlyComparison(entries, '2026-05')
        expect(result.prevMonthDiff).toBe(0)
        expect(result.prevMonthPct).toBe(0)
    })
})
