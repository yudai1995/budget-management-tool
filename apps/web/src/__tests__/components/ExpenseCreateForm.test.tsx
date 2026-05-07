import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import * as React from 'react'
import { ExpenseCreateForm } from '../../components/expense/ExpenseCreateForm'

// Server Actionをモック
vi.mock('@/lib/actions/expense', () => ({
    createExpenseAction: vi.fn(),
}))

// ESM環境ではvi.spyOnは不可。vi.mockでuseActionStateをモックする
vi.mock('react', async (importOriginal) => {
    const actual = await importOriginal<typeof import('react')>()
    return {
        ...actual,
        useActionState: vi.fn(),
    }
})

describe('ExpenseCreateForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('初期表示: フォームが描画される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        expect(screen.getByLabelText('金額（円）')).toBeInTheDocument()
        expect(screen.getByLabelText('日付')).toBeInTheDocument()
        expect(screen.getByLabelText('カテゴリ')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '追加する' })).toBeInTheDocument()
    })

    it('fieldErrors.amount があるとき、エラーメッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false, fieldErrors: { amount: ['金額は1以上の値を入力してください'] } },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        expect(screen.getByText('金額は1以上の値を入力してください')).toBeInTheDocument()
    })

    it('state.error があるとき、エラーメッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: 'サーバーエラーが発生しました', success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument()
    })

    it('state.success=true のとき、成功メッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: true },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        expect(screen.getByText('登録しました')).toBeInTheDocument()
    })

    it('defaultDate が渡されたとき、日付入力に反映される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" defaultDate="2026-04-13" />)

        const dateInput = screen.getByLabelText('日付') as HTMLInputElement
        expect(dateInput.defaultValue).toBe('2026-04-13')
    })

    it('isPending=true のとき、ボタンが disabled になる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            true,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        const button = screen.getByRole('button', { name: '登録中...' })
        expect(button).toBeDisabled()
    })

    it('初期表示: カテゴリが「未分類」（id=0）になっている', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        const select = screen.getByLabelText('カテゴリ') as HTMLSelectElement
        expect(select.value).toBe('0')
    })

    it('defaultBalanceType=1 のとき: 収入タブが初期選択される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" defaultBalanceType={1} />)

        // 収入タブがアクティブ（style で判定）
        const incomeButton = screen.getByRole('button', { name: '収入' })
        expect(incomeButton).toHaveStyle({ color: '#fff' })
        // 支出タブは非アクティブ
        const expenseButton = screen.getByRole('button', { name: '支出' })
        expect(expenseButton).not.toHaveStyle({ color: '#fff' })
    })

    it('支出→収入に切り替えたとき: カテゴリが「未分類」（id=0）にリセットされる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseCreateForm userId="user-1" />)

        // カテゴリを食費（id=1）に変更
        const select = screen.getByLabelText('カテゴリ') as HTMLSelectElement
        fireEvent.change(select, { target: { value: '1' } })
        expect(select.value).toBe('1')

        // 収入タブに切り替え
        fireEvent.click(screen.getByRole('button', { name: '収入' }))

        // カテゴリが id=0（未分類）にリセットされる
        expect(select.value).toBe('0')
    })
})
