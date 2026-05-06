import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ExpenseInputModal } from '../../components/input/ExpenseInputModal'

// Server Action をモック
const mockCreateExpenseAction = vi.fn().mockResolvedValue({ error: null, success: true })
vi.mock('@/lib/actions/expense', () => ({
    createExpenseAction: (...args: unknown[]) => mockCreateExpenseAction(...args),
}))

// calcExpenseImpact をモック
vi.mock('@budget/common', () => ({
    calcExpenseImpact: vi.fn().mockReturnValue({ label: '約10分' }),
}))

describe('ExpenseInputModal', () => {
    const defaultProps = {
        userId: 'user-1',
        minutesPerYen: 0.1,
        onClose: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('初期表示: STEP1 が表示され、支出タブがアクティブである', () => {
        render(<ExpenseInputModal {...defaultProps} />)

        expect(screen.getByText(/STEP 1 \/ 3.*金額/)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '支出' })).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '収入' })).toBeInTheDocument()
        // 支出ボタンがアクティブスタイルを持つ（text-white クラス）
        const expenseBtn = screen.getByRole('button', { name: '支出' })
        expect(expenseBtn.className).toContain('text-white')
    })

    it('収入タブをクリックしたとき: 収入ボタンがアクティブになる', () => {
        render(<ExpenseInputModal {...defaultProps} />)

        const incomeBtn = screen.getByRole('button', { name: '収入' })
        fireEvent.click(incomeBtn)

        expect(incomeBtn.className).toContain('text-white')
        // 支出ボタンは非アクティブ
        const expenseBtn = screen.getByRole('button', { name: '支出' })
        expect(expenseBtn.className).not.toContain('text-white')
    })

    it('支出のとき: 金額入力後に家計への影響が表示される', () => {
        render(<ExpenseInputModal {...defaultProps} />)

        // 支出タブはデフォルトで選択済み
        fireEvent.click(screen.getByRole('button', { name: '1' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))

        expect(screen.getByText('家計への影響: 約10分')).toBeInTheDocument()
    })

    it('収入のとき: 金額を入力しても家計への影響は表示されない', () => {
        render(<ExpenseInputModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: '収入' }))
        fireEvent.click(screen.getByRole('button', { name: '1' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))

        expect(screen.queryByText(/家計への影響/)).not.toBeInTheDocument()
    })

    it('STEP3 確認画面: 支出選択時に「支出」が表示される', async () => {
        render(<ExpenseInputModal {...defaultProps} />)

        // 金額入力
        fireEvent.click(screen.getByRole('button', { name: '1' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        // カテゴリ選択へ
        fireEvent.click(screen.getByRole('button', { name: 'カテゴリへ →' }))
        // カテゴリ選択
        fireEvent.click(screen.getByRole('button', { name: '食費' }))

        // STEP3 確認画面
        expect(screen.getByText(/STEP 3 \/ 3.*確定/)).toBeInTheDocument()
        expect(screen.getByText(/食費 \/ 支出/)).toBeInTheDocument()
    })

    it('STEP3 確認画面: 収入選択時に「収入」が表示される', async () => {
        render(<ExpenseInputModal {...defaultProps} />)

        // 収入タブを選択
        fireEvent.click(screen.getByRole('button', { name: '収入' }))
        // 金額入力
        fireEvent.click(screen.getByRole('button', { name: '1' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        // カテゴリ選択へ
        fireEvent.click(screen.getByRole('button', { name: 'カテゴリへ →' }))
        // カテゴリ選択
        fireEvent.click(screen.getByRole('button', { name: '食費' }))

        expect(screen.getByText(/食費 \/ 収入/)).toBeInTheDocument()
    })

    it('確定ボタン押下（支出）: balanceType=0 で createExpenseAction が呼ばれる', async () => {
        render(<ExpenseInputModal {...defaultProps} />)

        // 金額入力
        fireEvent.click(screen.getByRole('button', { name: '1' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        // カテゴリ選択へ → 選択
        fireEvent.click(screen.getByRole('button', { name: 'カテゴリへ →' }))
        fireEvent.click(screen.getByRole('button', { name: '食費' }))
        // 確定
        fireEvent.click(screen.getByRole('button', { name: '確定' }))

        // createExpenseAction が呼ばれるまで待つ
        await vi.waitFor(() => {
            expect(mockCreateExpenseAction).toHaveBeenCalledOnce()
        })

        const [, formData] = mockCreateExpenseAction.mock.calls[0] as [unknown, FormData]
        expect(formData.get('balanceType')).toBe('0')
    })

    it('確定ボタン押下（収入）: balanceType=1 で createExpenseAction が呼ばれる', async () => {
        render(<ExpenseInputModal {...defaultProps} />)

        // 収入タブを選択
        fireEvent.click(screen.getByRole('button', { name: '収入' }))
        // 金額入力
        fireEvent.click(screen.getByRole('button', { name: '5' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        fireEvent.click(screen.getByRole('button', { name: '0' }))
        // カテゴリ選択へ → 選択
        fireEvent.click(screen.getByRole('button', { name: 'カテゴリへ →' }))
        fireEvent.click(screen.getByRole('button', { name: '他' }))
        // 確定
        fireEvent.click(screen.getByRole('button', { name: '確定' }))

        await vi.waitFor(() => {
            expect(mockCreateExpenseAction).toHaveBeenCalledOnce()
        })

        const [, formData] = mockCreateExpenseAction.mock.calls[0] as [unknown, FormData]
        expect(formData.get('balanceType')).toBe('1')
    })

    it('キャンセルボタン押下: onClose が呼ばれる', () => {
        render(<ExpenseInputModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: 'キャンセル' }))

        expect(defaultProps.onClose).toHaveBeenCalledOnce()
    })
})
