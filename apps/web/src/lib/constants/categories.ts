export type Category = {
  id: number;
  name: string;
  color: string;
};

/** 支出カテゴリ（balanceType: 0） */
export const OUTGO_CATEGORIES: Category[] = [
  { id: 0, name: "未分類", color: "#333333" },
  { id: 1, name: "食費", color: "#0075FF" },
  { id: 2, name: "交通費", color: "#FF3E3E" },
  { id: 3, name: "光熱費", color: "#D3BB08" },
  { id: 4, name: "通信費", color: "#784EFF" },
  { id: 5, name: "住宅費", color: "#2BBAE5" },
  { id: 6, name: "医療費", color: "#17B10A" },
  { id: 7, name: "保険", color: "#0139D1" },
  { id: 8, name: "日用品", color: "#F250F8" },
  { id: 9, name: "衣類", color: "#10D100" },
  { id: 10, name: "趣味", color: "#BE8529" },
  { id: 11, name: "その他", color: "#FF9D42" },
];

/** 収入カテゴリ（balanceType: 1） */
export const INCOME_CATEGORIES: Category[] = [
  { id: 0, name: "未分類", color: "#333333" },
  { id: 1, name: "給料", color: "#10B702" },
  { id: 2, name: "賞与", color: "#C93737" },
  { id: 3, name: "副業", color: "#FF6505" },
  { id: 4, name: "所得", color: "#04BEA1" },
  { id: 5, name: "年金", color: "#865AFF" },
  { id: 6, name: "おこづかい", color: "#D9BB69" },
  { id: 7, name: "その他", color: "#FF9D42" },
];

/** balanceType に対応するカテゴリ一覧を返す */
export function getCategoriesByType(balanceType: 0 | 1): Category[] {
  return balanceType === 0 ? OUTGO_CATEGORIES : INCOME_CATEGORIES;
}

/** カテゴリ ID からカテゴリを取得する */
export function getCategoryById(
  balanceType: 0 | 1,
  categoryId: number,
): Category | undefined {
  return getCategoriesByType(balanceType).find((c) => c.id === categoryId);
}
