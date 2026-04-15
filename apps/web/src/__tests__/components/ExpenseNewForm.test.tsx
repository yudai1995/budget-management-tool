import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import * as React from 'react'
import { ExpenseNewForm } from '../../components/expense/ExpenseNewForm'

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

describe('ExpenseNewForm', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('初期表示: フォームが描画される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        expect(screen.getByLabelText('金額')).toBeInTheDocument()
        expect(screen.getByLabelText('日付')).toBeInTheDocument()
        expect(screen.getByLabelText('内容')).toBeInTheDocument()
        expect(screen.getByRole('button', { name: '追加する' })).toBeInTheDocument()
    })

    it('初期表示: カテゴリボタングリッドが表示される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        // 支出カテゴリの「食費」が表示される
        expect(screen.getByRole('button', { name: '食費' })).toBeInTheDocument()
        // 支出カテゴリの「未分類」が表示される
        expect(screen.getByRole('button', { name: '未分類' })).toBeInTheDocument()
    })

    it('スライドタブをクリックすると収入カテゴリに切り替わる', async () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        const tab = screen.getByRole('switch')
        await userEvent.click(tab)

        // 収入カテゴリの「給料」が表示される
        expect(screen.getByRole('button', { name: '給料' })).toBeInTheDocument()
        // 支出カテゴリの「食費」が非表示になる
        expect(screen.queryByRole('button', { name: '食費' })).not.toBeInTheDocument()
    })

    it('カテゴリボタンをクリックすると選択状態になる', async () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        const shokuhi = screen.getByRole('button', { name: '食費' })
        await userEvent.click(shokuhi)

        // 選択されたボタンはブランドカラーのクラスを持つ
        expect(shokuhi.className).toContain('bg-[var(--color-brand-primary)]')
    })

    it('fieldErrors.amount があるとき、エラーメッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false, fieldErrors: { amount: ['金額は1以上の値を入力してください'] } },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        expect(screen.getByText('金額は1以上の値を入力してください')).toBeInTheDocument()
    })

    it('state.error があるとき、エラーメッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: 'サーバーエラーが発生しました', success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        expect(screen.getByText('サーバーエラーが発生しました')).toBeInTheDocument()
    })

    it('state.success=true のとき、成功メッセージを表示する', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: true },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        expect(screen.getByText('登録しました')).toBeInTheDocument()
    })

    it('defaultDate が渡されたとき、日付入力に反映される', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            false,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" defaultDate="2026-04-13" />)

        const dateInput = screen.getByLabelText('日付') as HTMLInputElement
        expect(dateInput.defaultValue).toBe('2026-04-13')
    })

    it('isPending=true のとき、ボタンが disabled になる', () => {
        vi.mocked(React.useActionState).mockReturnValue([
            { error: null, success: false },
            vi.fn(),
            true,
        ] as unknown as ReturnType<typeof React.useActionState>)

        render(<ExpenseNewForm userId="user-1" />)

        const button = screen.getByRole('button', { name: '登録中...' })
        expect(button).toBeDisabled()
    })
})
