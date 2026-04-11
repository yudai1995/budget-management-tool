import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ApiError } from '../../lib/api/client'

// serverFetch と redirect をモック
vi.mock('../../lib/api/client', () => ({
    ApiError: class ApiError extends Error {
        constructor(public readonly status: number, message: string) {
            super(message)
            this.name = 'ApiError'
        }
    },
    serverFetch: vi.fn(),
}))

vi.mock('next/navigation', () => ({
    redirect: vi.fn(),
}))

import { loginAction, guestLoginAction } from '../../lib/actions/auth'
import { serverFetch } from '../../lib/api/client'
import { redirect } from 'next/navigation'

describe('guestLoginAction', () => {
    beforeEach(() => {
        vi.clearAllMocks()
        process.env.GUEST_PASSWORD = 'guest-pass'
    })

    it('GUEST_PASSWORD を含むリクエストボディで /api/login を呼ぶ', async () => {
        vi.mocked(serverFetch).mockResolvedValue({})

        await guestLoginAction()

        expect(serverFetch).toHaveBeenCalledWith('/api/login', {
            method: 'POST',
            body: JSON.stringify({ userId: 'Guest', password: 'guest-pass' }),
        })
    })

    it('GUEST_PASSWORD が未設定のとき空文字で呼ぶ', async () => {
        delete process.env.GUEST_PASSWORD
        vi.mocked(serverFetch).mockResolvedValue({})

        await guestLoginAction()

        expect(serverFetch).toHaveBeenCalledWith('/api/login', {
            method: 'POST',
            body: JSON.stringify({ userId: 'Guest', password: '' }),
        })
    })

    it('ログイン成功後に /expenses へリダイレクトする', async () => {
        vi.mocked(serverFetch).mockResolvedValue({})

        await guestLoginAction()

        expect(redirect).toHaveBeenCalledWith('/expenses')
    })
})

describe('loginAction', () => {
    const initialState = { error: null }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('バリデーションエラー: userId が空のとき fieldErrors を返す', async () => {
        const formData = new FormData()
        formData.set('userId', '')
        formData.set('password', 'pass')

        const result = await loginAction(initialState, formData)

        expect(result.fieldErrors?.userId).toBeDefined()
        expect(serverFetch).not.toHaveBeenCalled()
    })

    it('バリデーションエラー: password が空のとき fieldErrors を返す', async () => {
        const formData = new FormData()
        formData.set('userId', 'user1')
        formData.set('password', '')

        const result = await loginAction(initialState, formData)

        expect(result.fieldErrors?.password).toBeDefined()
        expect(serverFetch).not.toHaveBeenCalled()
    })

    it('API が 401 を返すとき認証エラーメッセージを返す', async () => {
        vi.mocked(serverFetch).mockRejectedValue(new ApiError(401, '認証に失敗しました'))

        const formData = new FormData()
        formData.set('userId', 'user1')
        formData.set('password', 'wrong')

        const result = await loginAction(initialState, formData)

        expect(result.error).toBeTruthy()
        expect(redirect).not.toHaveBeenCalled()
    })

    it('ログイン成功後に /expenses へリダイレクトする', async () => {
        vi.mocked(serverFetch).mockResolvedValue({})

        const formData = new FormData()
        formData.set('userId', 'user1')
        formData.set('password', 'pass')

        await loginAction(initialState, formData)

        expect(redirect).toHaveBeenCalledWith('/expenses')
    })
})
