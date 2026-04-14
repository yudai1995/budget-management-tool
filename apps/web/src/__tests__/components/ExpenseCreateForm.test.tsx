import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
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

        expect(screen.getByLabelText('金額')).toBeInTheDocument()
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
})
