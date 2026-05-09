/** パース結果の候補 */
export type ParsedExpense = {
    /** 抽出された金額（円）。見つからない場合は null */
    amount: number | null;
    /** 推定カテゴリ ID（0: 未分類） */
    categoryId: number;
    /** パース対象テキストをそのまま content として使用 */
    content: string;
    /** パース実行日（YYYY-MM-DD 形式） */
    date: string;
};

/**
 * テキスト/画像から支出情報を抽出するインターフェース。
 * ルールベース実装と AI モデル実装を差し替え可能にするための抽象。
 */
export interface IExpenseParser {
    parse(text: string): ParsedExpense;
}
