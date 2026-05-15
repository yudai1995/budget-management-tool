import { describe, it, expect } from 'vitest'
import {
  OUTGO_CATEGORIES,
  INCOME_CATEGORIES,
  getCategoriesByType,
  getCategoryById,
} from '../../constants/categories'

describe('OUTGO_CATEGORIES', () => {
  it('10 分類が定義されている', () => {
    expect(OUTGO_CATEGORIES).toHaveLength(10)
  })

  it('すべての ID が 0〜9 の範囲内である', () => {
    const ids = OUTGO_CATEGORIES.map((c) => c.id)
    ids.forEach((id) => expect(id).toBeGreaterThanOrEqual(0))
    ids.forEach((id) => expect(id).toBeLessThanOrEqual(9))
  })

  it('ID が重複していない', () => {
    const ids = OUTGO_CATEGORIES.map((c) => c.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('badge は「削減ポイント」または「見直し対象」のみ', () => {
    const validBadges = ['削減ポイント', '見直し対象']
    OUTGO_CATEGORIES.forEach((c) => {
      if (c.badge !== undefined) {
        expect(validBadges).toContain(c.badge)
      }
    })
  })

  it('すべてのカテゴリに description が設定されている', () => {
    OUTGO_CATEGORIES.forEach((c) => {
      expect(c.description).toBeTruthy()
    })
  })

  it('displayOrder が 1〜10 の連番である', () => {
    const orders = OUTGO_CATEGORIES.map((c) => c.displayOrder).sort((a, b) => a - b)
    expect(orders).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  })
})

describe('getCategoriesByType', () => {
  it('balanceType=0 のとき支出カテゴリを返す', () => {
    const result = getCategoriesByType(0)
    expect(result).toHaveLength(OUTGO_CATEGORIES.length)
  })

  it('balanceType=1 のとき収入カテゴリを返す', () => {
    const result = getCategoriesByType(1)
    expect(result).toHaveLength(INCOME_CATEGORIES.length)
  })

  it('displayOrder 昇順で返す', () => {
    const result = getCategoriesByType(0)
    for (let i = 1; i < result.length; i++) {
      expect(result[i].displayOrder).toBeGreaterThan(result[i - 1].displayOrder)
    }
  })

  it('元の配列を変更しない（immutability）', () => {
    const before = [...OUTGO_CATEGORIES]
    getCategoriesByType(0)
    expect(OUTGO_CATEGORIES).toEqual(before)
  })
})

describe('getCategoryById', () => {
  it('存在するカテゴリ ID を指定するとカテゴリを返す', () => {
    const cat = getCategoryById(0, 1)
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('食費・スーパー')
  })

  it('ID=0 (その他・不明) を返す', () => {
    const cat = getCategoryById(0, 0)
    expect(cat).toBeDefined()
    expect(cat?.name).toBe('その他・不明')
  })

  it('存在しない ID を指定すると undefined を返す', () => {
    const cat = getCategoryById(0, 99)
    expect(cat).toBeUndefined()
  })

  it('balanceType=1 のとき収入カテゴリから検索する', () => {
    const cat = getCategoryById(1, 1)
    expect(cat?.name).toBe('給料')
  })

  it('badge のあるカテゴリが正しく取得できる', () => {
    const cat = getCategoryById(0, 2)
    expect(cat?.badge).toBe('削減ポイント')

    const sub = getCategoryById(0, 4)
    expect(sub?.badge).toBe('見直し対象')
  })
})

describe('新旧カテゴリ ID マッピング検証', () => {
  it('旧 ID に相当する値が新体系で適切なカテゴリにマッピングされている', () => {
    // 旧2=交通費 → 新8=クルマ・交通
    expect(getCategoryById(0, 8)?.name).toBe('クルマ・交通')
    // 旧3=光熱費・旧5=住宅費 → 新5=住居・光熱費
    expect(getCategoryById(0, 5)?.name).toBe('住居・光熱費')
    // 旧6=医療費・旧7=保険 → 新9=医療・保険
    expect(getCategoryById(0, 9)?.name).toBe('医療・保険')
    // 旧8=日用品 → 新3=日用品
    expect(getCategoryById(0, 3)?.name).toBe('日用品')
    // 旧9=衣類 → 新7=美容・衣類
    expect(getCategoryById(0, 7)?.name).toBe('美容・衣類')
  })
})
