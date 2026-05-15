export type CategoryType = 'fixed' | 'variable_essential' | 'discretionary' | 'other';

export type Category = {
  id: number;
  name: string;
  color: string;
  type: CategoryType;
  badge?: '削減ポイント' | '見直し対象';
  displayOrder: number;
  description: string;
};

/** 支出カテゴリ（balanceType: 0） — 行動変容を促す10分類 */
export const OUTGO_CATEGORIES: Category[] = [
  {
    id: 1,
    name: '食費・スーパー',
    color: '#0075FF',
    type: 'variable_essential',
    displayOrder: 1,
    description: '自炊・食材・スーパーでの買い物',
  },
  {
    id: 2,
    name: '外食・カフェ',
    color: '#FF3E3E',
    type: 'discretionary',
    badge: '削減ポイント',
    displayOrder: 2,
    description: '外食・テイクアウト・カフェ・コンビニ食',
  },
  {
    id: 3,
    name: '日用品',
    color: '#F250F8',
    type: 'variable_essential',
    displayOrder: 3,
    description: 'ドラッグストア・消耗品・洗剤など',
  },
  {
    id: 5,
    name: '住居・光熱費',
    color: '#2BBAE5',
    type: 'fixed',
    displayOrder: 4,
    description: '家賃・電気・ガス・水道',
  },
  {
    id: 4,
    name: '通信・サブスク',
    color: '#784EFF',
    type: 'fixed',
    badge: '見直し対象',
    displayOrder: 5,
    description: 'スマホ・ネット・Netflixなど定額サービス',
  },
  {
    id: 6,
    name: '教育・こども',
    color: '#17B10A',
    type: 'fixed',
    displayOrder: 6,
    description: '習い事・保育・学用品・塾',
  },
  {
    id: 7,
    name: '美容・衣類',
    color: '#10D100',
    type: 'discretionary',
    displayOrder: 7,
    description: '美容院・化粧品・服',
  },
  {
    id: 8,
    name: 'クルマ・交通',
    color: '#BE8529',
    type: 'variable_essential',
    displayOrder: 8,
    description: '交通費・ガソリン・駐車場',
  },
  {
    id: 9,
    name: '医療・保険',
    color: '#0139D1',
    type: 'variable_essential',
    displayOrder: 9,
    description: '病院・薬・保険料',
  },
  {
    id: 0,
    name: 'その他・不明',
    color: '#333333',
    type: 'other',
    displayOrder: 10,
    description: '上記に当てはまらないもの',
  },
];

/** 収入カテゴリ（balanceType: 1） */
export const INCOME_CATEGORIES: Category[] = [
  { id: 1, name: '給料', color: '#10B702', type: 'fixed', displayOrder: 1, description: '毎月の給与収入' },
  { id: 2, name: '賞与', color: '#C93737', type: 'fixed', displayOrder: 2, description: 'ボーナス・賞与' },
  { id: 3, name: '副業', color: '#FF6505', type: 'variable_essential', displayOrder: 3, description: 'フリーランス・アルバイトなど' },
  { id: 4, name: '所得', color: '#04BEA1', type: 'variable_essential', displayOrder: 4, description: '配当・利子・臨時収入' },
  { id: 5, name: '年金', color: '#865AFF', type: 'fixed', displayOrder: 5, description: '公的年金・個人年金' },
  { id: 6, name: 'おこづかい', color: '#D9BB69', type: 'other', displayOrder: 6, description: '家族からのおこづかいなど' },
  { id: 0, name: 'その他', color: '#FF9D42', type: 'other', displayOrder: 7, description: '上記に当てはまらない収入' },
];

/** balanceType に対応するカテゴリ一覧を displayOrder 順で返す */
export function getCategoriesByType(balanceType: 0 | 1): Category[] {
  const list = balanceType === 0 ? OUTGO_CATEGORIES : INCOME_CATEGORIES;
  return [...list].sort((a, b) => a.displayOrder - b.displayOrder);
}

/** カテゴリ ID からカテゴリを取得する */
export function getCategoryById(
  balanceType: 0 | 1,
  categoryId: number,
): Category | undefined {
  return getCategoriesByType(balanceType).find((c) => c.id === categoryId);
}
