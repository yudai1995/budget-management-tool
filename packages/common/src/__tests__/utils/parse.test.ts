import { describe, it, expect } from 'vitest';
import { extractAmount, extractCategoryId } from '../../utils/parse';

describe('extractAmount', () => {
    it('正常系: ¥1500 から 1500 を抽出できる', () => {
        expect(extractAmount('¥1500')).toBe(1500);
    });

    it('正常系: ¥1,500 から 1500 を抽出できる', () => {
        expect(extractAmount('¥1,500')).toBe(1500);
    });

    it('正常系: ￥1500 から 1500 を抽出できる（全角円マーク）', () => {
        expect(extractAmount('￥1500')).toBe(1500);
    });

    it('正常系: 1500円 から 1500 を抽出できる', () => {
        expect(extractAmount('1500円')).toBe(1500);
    });

    it('正常系: 1,500円 から 1500 を抽出できる', () => {
        expect(extractAmount('1,500円')).toBe(1500);
    });

    it('正常系: 文中に埋め込まれた「スーパーで1200円」から 1200 を抽出できる', () => {
        expect(extractAmount('スーパーで1200円')).toBe(1200);
    });

    it('正常系: 文中に埋め込まれた「ランチ代¥900」から 900 を抽出できる', () => {
        expect(extractAmount('ランチ代¥900')).toBe(900);
    });

    it('境界値: 金額が1のとき、1 を返す', () => {
        expect(extractAmount('1円')).toBe(1);
    });

    it('境界値: 金額情報がないとき、null を返す', () => {
        expect(extractAmount('ランチ食べた')).toBeNull();
    });

    it('境界値: 空文字のとき、null を返す', () => {
        expect(extractAmount('')).toBeNull();
    });
});

describe('extractCategoryId', () => {
    it('正常系: 「ランチ」→ 食費（1）', () => {
        expect(extractCategoryId('ランチ代')).toBe(1);
    });

    it('正常系: 「スーパー」→ 食費（1）', () => {
        expect(extractCategoryId('スーパーで買い物')).toBe(1);
    });

    it('正常系: 「電車」→ 交通費（2）', () => {
        expect(extractCategoryId('電車代')).toBe(2);
    });

    it('正常系: 「ガス」→ 光熱費（3）', () => {
        expect(extractCategoryId('ガス代')).toBe(3);
    });

    it('正常系: 「スマホ」→ 通信費（4）', () => {
        expect(extractCategoryId('スマホ代')).toBe(4);
    });

    it('正常系: 「家賃」→ 住宅費（5）', () => {
        expect(extractCategoryId('家賃')).toBe(5);
    });

    it('正常系: 「病院」→ 医療費（6）', () => {
        expect(extractCategoryId('病院代')).toBe(6);
    });

    it('正常系: 「保険」→ 保険（7）', () => {
        expect(extractCategoryId('保険料')).toBe(7);
    });

    it('正常系: 「日用品」→ 日用品（8）', () => {
        expect(extractCategoryId('日用品')).toBe(8);
    });

    it('正常系: 「服」→ 衣類（9）', () => {
        expect(extractCategoryId('服を買った')).toBe(9);
    });

    it('正常系: 「映画」→ 趣味（10）', () => {
        expect(extractCategoryId('映画代')).toBe(10);
    });

    it('境界値: マッチするキーワードがないとき、0（未分類）を返す', () => {
        expect(extractCategoryId('謎の支出')).toBe(0);
    });

    it('境界値: 空文字のとき、0（未分類）を返す', () => {
        expect(extractCategoryId('')).toBe(0);
    });
});
