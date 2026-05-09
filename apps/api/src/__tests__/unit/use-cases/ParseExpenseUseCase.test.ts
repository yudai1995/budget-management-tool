import { describe, it, expect } from 'vitest';
import { ParseExpenseUseCase, RuleBasedExpenseParser } from '../../../application/use-cases/parse/ParseExpenseUseCase';

describe('RuleBasedExpenseParser', () => {
    const parser = new RuleBasedExpenseParser();

    it('正常系: 「ランチ代¥900」から amount=900, categoryId=1（食費）を抽出できる', () => {
        const result = parser.parse('ランチ代¥900');
        expect(result.amount).toBe(900);
        expect(result.categoryId).toBe(1);
        expect(result.content).toBe('ランチ代¥900');
        expect(result.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    it('正常系: 「スーパーで1,200円」から amount=1200, categoryId=1（食費）を抽出できる', () => {
        const result = parser.parse('スーパーで1,200円');
        expect(result.amount).toBe(1200);
        expect(result.categoryId).toBe(1);
    });

    it('正常系: 「電車代500円」から categoryId=2（交通費）を抽出できる', () => {
        const result = parser.parse('電車代500円');
        expect(result.amount).toBe(500);
        expect(result.categoryId).toBe(2);
    });

    it('正常系: 金額のないテキストのとき amount=null を返す', () => {
        const result = parser.parse('ランチを食べた');
        expect(result.amount).toBeNull();
        expect(result.categoryId).toBe(1);
    });

    it('境界値: 空文字のとき amount=null, categoryId=0（未分類）を返す', () => {
        const result = parser.parse('謎の支出');
        expect(result.amount).toBeNull();
        expect(result.categoryId).toBe(0);
    });
});

describe('ParseExpenseUseCase', () => {
    const useCase = new ParseExpenseUseCase(new RuleBasedExpenseParser());

    it('正常系: テキストをパースして ParsedExpense を返す', () => {
        const result = useCase.execute({ text: 'ランチ代¥900' });
        expect(result.amount).toBe(900);
        expect(result.categoryId).toBe(1);
        expect(result.content).toBe('ランチ代¥900');
    });
});
