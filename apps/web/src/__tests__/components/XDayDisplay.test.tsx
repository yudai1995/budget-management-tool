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

        it('initialAssets=null（未設定）のとき設定促進フォールバックが表示されバッジは表示されない', () => {
            render(<XDayDisplay {...defaultProps} initialAssets={null} recordingStreak={5} />)
            // 設定促進フォールバックが表示されているので連続記録バッジは表示されない
            expect(screen.getByText('設定を完了すると「家計の寿命」が表示されます')).toBeInTheDocument()
            expect(screen.queryByText('5日連続記録中')).not.toBeInTheDocument()
        })
    })

    describe('支出ゼロ日マイルストーンバッジ', () => {
        it('zeroStreakDays=0 のときゼロストリークメッセージを表示しない', () => {
            render(<XDayDisplay {...defaultProps} zeroStreakDays={0} />)
            expect(screen.queryByText(/日連続で支出ゼロ/)).not.toBeInTheDocument()
        })

        it('zeroStreakDays=2 のとき連続ゼロメッセージを表示する', () => {
            render(<XDayDisplay {...defaultProps} zeroStreakDays={2} />)
            expect(screen.getByText(/2日連続で支出ゼロ/)).toBeInTheDocument()
        })

        it('zeroStreakDays=3 のとき「3日達成」バッジを表示する', () => {
            render(<XDayDisplay {...defaultProps} zeroStreakDays={3} />)
            expect(screen.getByText('3日達成')).toBeInTheDocument()
        })

        it('zeroStreakDays=7 のとき「7日達成」バッジと次の目標を表示する', () => {
            render(<XDayDisplay {...defaultProps} zeroStreakDays={7} />)
            expect(screen.getByText('7日達成')).toBeInTheDocument()
            expect(screen.getByText(/次の目標: 30日まであと23日/)).toBeInTheDocument()
        })

        it('zeroStreakDays=100 のとき「100日達成」バッジを表示し次の目標は表示しない', () => {
            render(<XDayDisplay {...defaultProps} zeroStreakDays={100} />)
            expect(screen.getByText('100日達成')).toBeInTheDocument()
            expect(screen.queryByText(/次の目標/)).not.toBeInTheDocument()
        })
    })

    describe('家計の寿命カード', () => {
        it('initialAssets が設定済みのとき「家計の寿命」ヘッダーが表示される', () => {
            render(<XDayDisplay {...defaultProps} />)
            expect(screen.getByText('家計の寿命')).toBeInTheDocument()
        })

        it('initialAssets=null のとき設定促進フォールバックが表示される', () => {
            render(<XDayDisplay {...defaultProps} initialAssets={null} />)
            // 設定促進フォールバックメッセージが表示される
            expect(screen.getByText('設定を完了すると「家計の寿命」が表示されます')).toBeInTheDocument()
        })
    })
})
