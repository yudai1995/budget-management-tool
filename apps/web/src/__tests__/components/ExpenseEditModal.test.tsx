import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { ExpenseEditModal } from '../../components/expense/ExpenseEditModal'
import type { ExpenseResponse } from '@/lib/api/types'

// Server Action をモック
vi.mock('@/lib/actions/expense', () => ({
    updateExpenseAction: vi.fn(),
}))

// useActionState をモック
vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>()
    return {
        ...actual,
        useActionState: vi.fn(),
    }
})

const mockExpense: ExpenseResponse = {
    id: 'expense-001',
    amount: 1500,
    balanceType: 0,
    userId: 'user-001',
    categoryId: 1,
    content: '昼食代',
    date: '2026-05-01',
    createdDate: '2026-05-01T12:00:00.000Z',
    updatedDate: '2026-05-01T12:00:00.000Z',
    deletedDate: null,
}

describe('ExpenseEditModal', () => {
    const defaultProps = {
        expense: mockExpense,
        onClose: vi.fn(),
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('初期表示: 既存の balanceType が選択されている', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        // balanceType select は最初の combobox
        const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
        expect(selects[0].value).toBe('0')
    })

    it('初期表示: 既存の categoryId が選択されている', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        // categoryId select は2番目の combobox
        const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
        expect(selects[1].value).toBe('1')
    })

    it('初期表示: 収入データを開いたとき、収入のカテゴリ一覧が表示される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} expense={{ ...mockExpense, balanceType: 1, categoryId: 1 }} />)

        // 収入カテゴリ「給料」が表示される
        expect(screen.getByText('給料')).toBeInTheDocument()
        // 支出専用カテゴリ「食費」は表示されない
        expect(screen.queryByText('食費')).not.toBeInTheDocument()
    })

    it('balanceType を切り替えたとき: カテゴリが「未分類」（id=0）にリセットされる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        const selects = screen.getAllByRole('combobox') as HTMLSelectElement[]
        const balanceTypeSelect = selects[0]
        const categorySelect = selects[1]

        // 初期は categoryId=1（食費）
        expect(categorySelect.value).toBe('1')

        // balanceType を 収入（1）に切り替え
        fireEvent.change(balanceTypeSelect, { target: { value: '1' } })

        // カテゴリが id=0（未分類）にリセットされる
        expect(categorySelect.value).toBe('0')
    })

    it('balanceType を切り替えたとき: 収入カテゴリ一覧に切り替わる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        // 支出カテゴリ「食費」が表示されている
        expect(screen.getByText('食費')).toBeInTheDocument()

        // balanceType を 収入に切り替え
        const selects = screen.getAllByRole('combobox')
        fireEvent.change(selects[0], { target: { value: '1' } })

        // 支出カテゴリ「食費」は消え、収入カテゴリ「給料」が表示される
        expect(screen.queryByText('食費')).not.toBeInTheDocument()
        expect(screen.getByText('給料')).toBeInTheDocument()
    })

    it('state.error があるとき、エラーメッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: '支出の更新に失敗しました', success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        expect(screen.getByText('支出の更新に失敗しました')).toBeInTheDocument()
    })

    it('isPending=true のとき、ボタンが disabled になる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            true,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        expect(screen.getByRole('button', { name: '更新中...' })).toBeDisabled()
    })

    it('閉じるボタン押下: onClose が呼ばれる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseEditModal {...defaultProps} />)

        fireEvent.click(screen.getByRole('button', { name: '閉じる' }))

        expect(defaultProps.onClose).toHaveBeenCalledOnce()
    })
})
