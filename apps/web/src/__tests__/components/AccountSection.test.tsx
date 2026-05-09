import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AccountSection } from '../../components/settings/AccountSection'

vi.mock('@/lib/actions/auth', () => ({
    logoutAction: vi.fn(),
}))

describe('AccountSection', () => {
    it('ユーザー名が表示されること', () => {
        render(<AccountSection userName="yamamoto" />)

        expect(screen.getByText('yamamoto')).toBeInTheDocument()
    })

    it('ゲストユーザー名が渡されたとき、Guest と表示されること', () => {
        render(<AccountSection userName="Guest" />)

        expect(screen.getByText('Guest')).toBeInTheDocument()
    })

    it('ログアウトボタンが存在すること', () => {
        render(<AccountSection userName="yamamoto" />)

        expect(screen.getByRole('button', { name: /ログアウト/ })).toBeInTheDocument()
    })

    it('アカウントセクションの見出しが表示されること', () => {
        render(<AccountSection userName="yamamoto" />)

        expect(screen.getByRole('heading', { name: 'アカウント' })).toBeInTheDocument()
    })

    it('ログアウトボタンが form 内に配置されていること', () => {
        render(<AccountSection userName="yamamoto" />)

        const button = screen.getByRole('button', { name: /ログアウト/ })
        expect(button.closest('form')).toBeInTheDocument()
    })
})
