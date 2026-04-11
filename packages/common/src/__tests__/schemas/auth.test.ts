import { describe, it, expect } from 'vitest'
import { loginSchema } from '../../schemas/auth'

describe('loginSchema', () => {
    it('正常系: 有効なuserIdとpasswordで成功する', () => {
        const result = loginSchema.safeParse({ userId: 'user-1', password: 'password123' })
        expect(result.success).toBe(true)
    })

    it('異常系: userIdが空文字ならエラー', () => {
        const result = loginSchema.safeParse({ userId: '', password: 'password123' })
        expect(result.success).toBe(false)
        if (!result.success) {
            const userIdError = result.error.issues.find((i) => i.path[0] === 'userId')
            expect(userIdError?.message).toBe('ユーザーIDを入力してください')
        }
    })

    it('異常系: passwordが空文字ならエラー', () => {
        const result = loginSchema.safeParse({ userId: 'user-1', password: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            const pwError = result.error.issues.find((i) => i.path[0] === 'password')
            expect(pwError?.message).toBe('パスワードを入力してください')
        }
    })

    it('異常系: userIdとpasswordが両方空ならエラーが2件', () => {
        const result = loginSchema.safeParse({ userId: '', password: '' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues).toHaveLength(2)
        }
    })

    it('異常系: フィールドが未定義ならエラー', () => {
        const result = loginSchema.safeParse({})
        expect(result.success).toBe(false)
    })
})
