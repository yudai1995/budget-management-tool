import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { OnboardingWizard } from '../../components/onboarding/OnboardingWizard'

vi.mock('@/lib/actions/settings', () => ({
    saveUserSettingsAction: vi.fn().mockResolvedValue(null),
}))

vi.mock('@budget/common', () => ({
    calcDailyBudget: vi.fn().mockReturnValue({
        dailyBudget: 3000,
        daysUntilPayday: 10,
        availableBalance: 30000,
    }),
}))

import { saveUserSettingsAction } from '../../lib/actions/settings'

describe('OnboardingWizard', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(saveUserSettingsAction).mockResolvedValue(null)
    })

    it('初期表示: ステップ1（給料日・月収）が表示されること', () => {
        render(<OnboardingWizard />)

        expect(screen.getByText('給料日と月収を教えてください')).toBeInTheDocument()
        expect(screen.getByRole('spinbutton', { name: '給料日' })).toBeInTheDocument()
        expect(screen.getByRole('spinbutton', { name: '月収' })).toBeInTheDocument()
    })

    it('「次へ」ボタンを押すとステップ2（固定費）に進むこと', () => {
        render(<OnboardingWizard />)

        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))

        expect(screen.getByText('月の固定費を教えてください')).toBeInTheDocument()
        expect(screen.getByRole('spinbutton', { name: '固定費' })).toBeInTheDocument()
    })

    it('ステップ2 → ステップ3（現在残高）に進めること', () => {
        render(<OnboardingWizard />)

        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))

        expect(screen.getByText('今の残高を教えてください')).toBeInTheDocument()
        expect(screen.getByRole('spinbutton', { name: '現在の残高' })).toBeInTheDocument()
    })

    it('ステップ3 → 完了サマリーに進めること', () => {
        render(<OnboardingWizard />)

        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /計算する/ }))

        expect(screen.getByText('あなたの1日予算')).toBeInTheDocument()
        expect(screen.getByLabelText('1日予算')).toBeInTheDocument()
    })

    it('戻るボタンで前のステップに戻れること', () => {
        render(<OnboardingWizard />)

        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        expect(screen.getByText('月の固定費を教えてください')).toBeInTheDocument()

        fireEvent.click(screen.getByRole('button', { name: '' })) // ChevronLeft のみのボタン
        expect(screen.getByText('給料日と月収を教えてください')).toBeInTheDocument()
    })

    it('「はじめる」を押すと saveUserSettingsAction が呼ばれること', async () => {
        render(<OnboardingWizard />)

        // 3ステップ進んでサマリーへ
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /計算する/ }))

        fireEvent.click(screen.getByRole('button', { name: /はじめる/ }))

        await waitFor(() => {
            expect(saveUserSettingsAction).toHaveBeenCalledOnce()
        })
    })

    it('saveUserSettingsAction がエラーを返したとき、エラーメッセージを表示すること', async () => {
        vi.mocked(saveUserSettingsAction).mockResolvedValue({ error: '保存に失敗しました' })

        render(<OnboardingWizard />)

        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /計算する/ }))

        fireEvent.click(screen.getByRole('button', { name: /はじめる/ }))

        await waitFor(() => {
            expect(screen.getByText('保存に失敗しました')).toBeInTheDocument()
        })
    })

    it('「あとで設定する」ボタンを押すと saveUserSettingsAction が呼ばれること', async () => {
        render(<OnboardingWizard />)

        fireEvent.click(screen.getByRole('button', { name: 'あとで設定する' }))

        await waitFor(() => {
            expect(saveUserSettingsAction).toHaveBeenCalledOnce()
        })
    })

    it('完了サマリーに入力値が表示されること', () => {
        render(<OnboardingWizard />)

        // デフォルト値で進む
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /次へ/ }))
        fireEvent.click(screen.getByRole('button', { name: /計算する/ }))

        // 給料日（デフォルト25日）が表示されること
        expect(screen.getByText('毎月 25 日')).toBeInTheDocument()
    })
})
