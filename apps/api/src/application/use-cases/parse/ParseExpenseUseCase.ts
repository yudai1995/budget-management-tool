import { extractAmount, extractCategoryId } from '@budget/common';
import type { IExpenseParser, ParsedExpense } from '../../../domain/services/IExpenseParser';

export type ParseExpenseInput = {
    /** パース対象テキスト */
    text: string;
};

export class ParseExpenseUseCase {
    constructor(private readonly parser: IExpenseParser) {}

    execute(input: ParseExpenseInput): ParsedExpense {
        return this.parser.parse(input.text);
    }
}

/**
 * ルールベースの簡易パース実装。
 * 将来的に AI モデル（Claude API 等）に差し替えられる設計。
 */
export class RuleBasedExpenseParser implements IExpenseParser {
    parse(text: string): ParsedExpense {
        const amount = extractAmount(text);
        const categoryId = extractCategoryId(text);
        const date = new Date().toISOString().slice(0, 10);

        return {
            amount,
            categoryId,
            content: text,
            date,
        };
    }
}
