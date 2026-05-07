import { describe, it, expect } from 'vitest'
import { getZeroStreakMilestone } from '../../utils/streak'

describe('getZeroStreakMilestone', () => {
    it('0日のとき achieved=null, next=3, daysToNext=3 を返す', () => {
        const result = getZeroStreakMilestone(0)
        expect(result.achieved).toBeNull()
        expect(result.next).toBe(3)
        expect(result.daysToNext).toBe(3)
    })

    it('2日のとき achieved=null, next=3, daysToNext=1 を返す', () => {
        const result = getZeroStreakMilestone(2)
        expect(result.achieved).toBeNull()
        expect(result.next).toBe(3)
        expect(result.daysToNext).toBe(1)
    })

    it('3日のとき achieved=3, next=7, daysToNext=4 を返す', () => {
        const result = getZeroStreakMilestone(3)
        expect(result.achieved).toBe(3)
        expect(result.next).toBe(7)
        expect(result.daysToNext).toBe(4)
    })

    it('7日のとき achieved=7, next=30, daysToNext=23 を返す', () => {
        const result = getZeroStreakMilestone(7)
        expect(result.achieved).toBe(7)
        expect(result.next).toBe(30)
        expect(result.daysToNext).toBe(23)
    })

    it('30日のとき achieved=30, next=100, daysToNext=70 を返す', () => {
        const result = getZeroStreakMilestone(30)
        expect(result.achieved).toBe(30)
        expect(result.next).toBe(100)
        expect(result.daysToNext).toBe(70)
    })

    it('100日のとき achieved=100, next=null, daysToNext=null を返す（全マイルストーン達成）', () => {
        const result = getZeroStreakMilestone(100)
        expect(result.achieved).toBe(100)
        expect(result.next).toBeNull()
        expect(result.daysToNext).toBeNull()
    })

    it('150日のとき achieved=100, next=null を返す', () => {
        const result = getZeroStreakMilestone(150)
        expect(result.achieved).toBe(100)
        expect(result.next).toBeNull()
    })

    it('マイルストーン境界値: 6日は achieved=3', () => {
        const result = getZeroStreakMilestone(6)
        expect(result.achieved).toBe(3)
        expect(result.next).toBe(7)
        expect(result.daysToNext).toBe(1)
    })
})
