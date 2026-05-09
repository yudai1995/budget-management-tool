/**
 * テキストから支出情報を抽出するユーティリティ。
 * ルールベースの簡易パース（将来的に AI モデルへ差し替え可能）。
 */

/**
 * テキストから金額（円）を抽出する。
 *
 * 対応フォーマット:
 *   ¥1500 / ¥1,500 / 1500円 / 1,500円
 *
 * @param text - パース対象テキスト
 * @returns 抽出された金額（正の整数）。見つからない場合は null
 */
export function extractAmount(text: string): number | null {
    const patterns = [
        /[¥￥]([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)/,
        /([0-9]{1,3}(?:,[0-9]{3})+|[0-9]+)円/,
    ];

    for (const pattern of patterns) {
        const m = text.match(pattern);
        if (m) {
            const n = Number(m[1].replace(/,/g, ''));
            if (!Number.isNaN(n) && n > 0) return n;
        }
    }

    return null;
}

/** カテゴリキーワードマッピング。順序は優先度を表す（先に一致したものを採用）。 */
const CATEGORY_KEYWORDS: ReadonlyArray<{ readonly keywords: readonly string[]; readonly categoryId: number }> = [
    { keywords: ['ランチ', '昼食', '夕食', '朝食', '食事', 'スーパー', 'コンビニ', '外食', 'カフェ', '食費', 'レストラン', '弁当'], categoryId: 1 },
    { keywords: ['電車', 'バス', 'タクシー', '地下鉄', '新幹線', '交通', '運賃'], categoryId: 2 },
    { keywords: ['ガス', '電気', '水道', '光熱'], categoryId: 3 },
    { keywords: ['スマホ', '携帯', 'WiFi', 'Wi-Fi', 'インターネット', '通信'], categoryId: 4 },
    { keywords: ['家賃', '住宅', '家代'], categoryId: 5 },
    { keywords: ['薬', '病院', '医療', 'クリニック', '歯医者'], categoryId: 6 },
    { keywords: ['保険'], categoryId: 7 },
    { keywords: ['洗剤', 'シャンプー', '日用品', '消耗品', 'ティッシュ'], categoryId: 8 },
    { keywords: ['服', '洋服', '衣類', 'ファッション'], categoryId: 9 },
    { keywords: ['ゲーム', '映画', '趣味', 'エンタメ', '娯楽'], categoryId: 10 },
];

/** 未分類カテゴリ ID */
const CATEGORY_ID_UNCATEGORIZED = 0;

/**
 * テキストからカテゴリ ID を推定する。
 *
 * @param text - パース対象テキスト
 * @returns 推定されたカテゴリ ID。一致するキーワードがない場合は 0（未分類）
 */
export function extractCategoryId(text: string): number {
    for (const { keywords, categoryId } of CATEGORY_KEYWORDS) {
        if (keywords.some((k) => text.includes(k))) {
            return categoryId;
        }
    }
    return CATEGORY_ID_UNCATEGORIZED;
}
