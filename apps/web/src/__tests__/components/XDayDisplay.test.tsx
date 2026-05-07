import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { XDayDisplay } from '../../components/dashboard/XDayDisplay'

// upsertSettingsAction をモック（useActionState 内で使用）
vi.mock('../../lib/actions/settings', () => ({
    upsertSettingsAction: vi.fn(),
}))

/** XDayDisplay のデフォルト props（SetupModal が表示されない最低限の値） */
const defaultProps = {
    todayExpense: 0,
    yesterdayExpense: 0,
    zeroStreakDays: 0,
    avgDailyExpense: 1000,
    recordedDays: 10,
    recordingStreak: 0,
    initialAssets: 1000000,
    initialIncome: 200000,
}

describe('XDayDisplay', () => {
    beforeEach(() => {
        vi.useFakeTimers()
        vi.setSystemTime(new Date('2024-03-15T12:00:00Z'))
    })

    afterEach(() => {
        vi.useRealTimers()
    })

    describe('連続記録バッジ', () => {
        it('recordingStreak=0 のとき連続記録バッジを表示しない', () => {
            render(<XDayDisplay {...defaultProps} recordingStreak={0} />)
            expect(screen.queryByText(/日連続記録中/)).not.toBeInTheDocument()
        })

        it('recordingStreak=1 のとき「1日連続記録中」バッジを表示する', () => {
            render(<XDayDisplay {...defaultProps} recordingStreak={1} />)
            expect(screen.getByText('1日連続記録中')).toBeInTheDocument()
        })

        it('recordingStreak=30 のとき「30日連続記録中」バッジを表示する', () => {
            render(<XDayDisplay {...defaultProps} recordingStreak={30} />)
            expect(screen.getByText('30日連続記録中')).toBeInTheDocument()
        })

        it('initialAssets=null（未設定）のとき SetupModal が表示されバッジは表示されない', () => {
            render(<XDayDisplay {...defaultProps} initialAssets={null} recordingStreak={5} />)
            // SetupModal が表示されているので連続記録バッジは表示されない
            expect(screen.queryByText('5日連続記録中')).not.toBeInTheDocument()
        })
    })

    describe('家計の寿命カード', () => {
        it('initialAssets が設定済みのとき「家計の寿命」ヘッダーが表示される', () => {
            render(<XDayDisplay {...defaultProps} />)
            expect(screen.getByText('家計の寿命')).toBeInTheDocument()
        })

        it('initialAssets=null のとき SetupModal が表示される', () => {
            render(<XDayDisplay {...defaultProps} initialAssets={null} />)
            // SetupModal に含まれるテキストが表示される
            expect(screen.getByText(/総資産|月次収入|設定/)).toBeInTheDocument()
        })
    })
})
