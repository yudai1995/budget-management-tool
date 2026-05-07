/** 月次比較の計算結果 */
export type MonthlyComparisonData = {
    /** 当月の支出合計 */
    currentTotal: number;
    /** 前月の支出合計 */
    prevMonthTotal: number;
    /** 前年同月の支出合計（データがなければ null） */
    prevYearTotal: number | null;
    /** 前月比増減額（正 = 増加、負 = 減少） */
    prevMonthDiff: number;
    /** 前月比増減率（前月が 0 なら null） */
    prevMonthPct: number | null;
    /** 前年同月比増減額（データがなければ null） */
    prevYearDiff: number | null;
    /** 前年同月比増減率（データがなければ null） */
    prevYearPct: number | null;
};

type ExpenseEntry = {
    /** YYYY-MM-DD 形式の日付 */
    date: string;
    /** 金額 */
    amount: number;
    /** 0 = 支出、1 = 収入 */
    balanceType: number;
};

/**
 * 月次比較データを計算する。
 * 支出のみ（balanceType === 0）を集計対象とする。
 *
 * @param allEntries - 全期間の支出・収入エントリ
 * @param currentMonthPrefix - 当月の YYYY-MM プレフィックス（例: "2026-05"）
 */
export function calcMonthlyComparison(
    allEntries: ExpenseEntry[],
    currentMonthPrefix: string,
): MonthlyComparisonData {
    const [yearStr, monthStr] = currentMonthPrefix.split('-');
    const year = parseInt(yearStr, 10);
    const month = parseInt(monthStr, 10);

    // 前月（月が 1 の場合は前年の 12 月）
    const prevMonthDate = new Date(year, month - 2, 1);
    const prevMonthPrefix = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(2, '0')}`;

    // 前年同月
    const prevYearPrefix = `${year - 1}-${monthStr}`;

    const sumExpenses = (prefix: string): number =>
        allEntries
            .filter((e) => e.balanceType === 0 && e.date.startsWith(prefix))
            .reduce((s, e) => s + e.amount, 0);

    const hasPrevYear = allEntries.some(
        (e) => e.balanceType === 0 && e.date.startsWith(prevYearPrefix),
    );

    const currentTotal = sumExpenses(currentMonthPrefix);
    const prevMonthTotal = sumExpenses(prevMonthPrefix);
    const prevYearTotal = hasPrevYear ? sumExpenses(prevYearPrefix) : null;

    const prevMonthDiff = currentTotal - prevMonthTotal;
    const prevMonthPct = prevMonthTotal > 0
        ? Math.round((prevMonthDiff / prevMonthTotal) * 100)
        : null;

    const prevYearDiff = prevYearTotal !== null ? currentTotal - prevYearTotal : null;
    const prevYearPct =
        prevYearTotal !== null && prevYearTotal > 0
            ? Math.round(((currentTotal - prevYearTotal) / prevYearTotal) * 100)
            : null;

    return {
        currentTotal,
        prevMonthTotal,
        prevYearTotal,
        prevMonthDiff,
        prevMonthPct,
        prevYearDiff,
        prevYearPct,
    };
}
