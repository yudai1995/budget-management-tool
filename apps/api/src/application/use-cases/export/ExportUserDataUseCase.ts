import type { IExpenseRepository } from '../../../domain/repositories/IExpenseRepository';
import type { Expense } from '../../../domain/models/Expense';

type ExportFormat = 'json' | 'csv';

interface ExportRow {
    id: string;
    date: string;
    amount: number;
    balanceType: number;
    categoryId: number;
    content: string | null;
    createdDate: string;
    updatedDate: string;
}

function toRow(e: Expense): ExportRow {
    return {
        id: e.id,
        date: e.date,
        amount: e.amount,
        balanceType: e.balanceType,
        categoryId: e.categoryId,
        content: e.content,
        createdDate: e.createdDate.toISOString(),
        updatedDate: e.updatedDate.toISOString(),
    };
}

function toCsv(rows: ExportRow[]): string {
    const headers = ['id', 'date', 'amount', 'balanceType', 'categoryId', 'content', 'createdDate', 'updatedDate'];
    const escapeCsvCell = (v: unknown): string => {
        const s = v == null ? '' : String(v);
        // CSVエスケープ: カンマ・改行・ダブルクォートを含む場合はダブルクォートで囲む
        return s.includes(',') || s.includes('\n') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s;
    };
    const lines = [
        headers.join(','),
        ...rows.map((r) => headers.map((h) => escapeCsvCell(r[h as keyof ExportRow])).join(',')),
    ];
    return lines.join('\n');
}

export class ExportUserDataUseCase {
    constructor(private readonly expenseRepository: IExpenseRepository) {}

    async execute(
        userId: string,
        format: ExportFormat
    ): Promise<{ content: string; mimeType: string; filename: string }> {
        const allExpenses = await this.expenseRepository.findAll();
        // 自分のデータのみフィルタ（削除済みを除く）
        const expenses = allExpenses.filter((e) => e.userId === userId && e.deletedDate === null);
        const rows = expenses.map(toRow);

        if (format === 'csv') {
            return {
                content: toCsv(rows),
                mimeType: 'text/csv; charset=utf-8',
                filename: `expenses_${userId}_${new Date().toISOString().slice(0, 10)}.csv`,
            };
        }

        return {
            content: JSON.stringify({ userId, exportedAt: new Date().toISOString(), expenses: rows }, null, 2),
            mimeType: 'application/json',
            filename: `expenses_${userId}_${new Date().toISOString().slice(0, 10)}.json`,
        };
    }
}
