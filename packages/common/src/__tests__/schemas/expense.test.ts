import { describe, it, expect } from 'vitest'
import { createExpenseSchema } from '../../schemas/expense'

describe('createExpenseSchema', () => {
    const validInput = {
        amount: 1000,
        balanceType: 0 as const,
        userId: 'user-1',
        date: '2024-01-01',
        content: 'テスト支出',
    }

    it('正常系: 有効なデータで成功する', () => {
        const result = createExpenseSchema.safeParse(validInput)
        expect(result.success).toBe(true)
    })

    it('正常系: contentがnullでも成功する', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, content: null })
        expect(result.success).toBe(true)
    })

    it('正常系: contentが未指定でも成功する', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, content: undefined })
        expect(result.success).toBe(true)
    })

    it('異常系: amountが0以下ならエラー', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, amount: 0 })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('金額は1以上の値を入力してください')
        }
    })

    it('異常系: amountが文字列ならエラー', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, amount: 'abc' })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('金額は数値で入力してください')
        }
    })

    it('異常系: balanceTypeが0/1以外ならエラー', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, balanceType: 2 })
        expect(result.success).toBe(false)
        if (!result.success) {
            expect(result.error.issues[0].message).toBe('種別を選択してください')
        }
    })

    it('異常系: userIdが空文字ならエラー', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, userId: '' })
        expect(result.success).toBe(false)
    })

    it('異常系: dateが空文字ならエラー', () => {
        const result = createExpenseSchema.safeParse({ ...validInput, date: '' })
        expect(result.success).toBe(false)
    })
})
