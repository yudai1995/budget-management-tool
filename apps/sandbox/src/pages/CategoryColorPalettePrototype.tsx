/**
 * CategoryColorPalettePrototype — カテゴリカラー定義 & パレット確認ページ
 *
 * SSOT: src/tokens/categoryTokens.ts
 *
 * このページでは以下を確認できる:
 *   1. 支出 / 収入カテゴリの全色スウォッチ（セマンティクキー / hex 付き）
 *   2. 使用場面プレビュー（取引行・バッジ・選択ボタン）
 *   3. 現行ページの不整合一覧（修正前の色 vs. トークン）
 */

import {
  EXPENSE_CATEGORIES,
  EXPENSE_CATEGORY_TOKENS,
  INCOME_CATEGORIES,
  INCOME_CATEGORY_TOKENS,
  type CategoryToken,
} from '../tokens/categoryTokens'

// ── ケース別対応表データ ──────────────────────────────────────────────────────

type CaseItem = {
  example: string
  categoryKey: string
  note?: string
  tag?: 'edge'   // 判断が難しいケース
}

type CaseGroup = {
  group: string
  axisLabel: string
  groupColor: string
  groupNote: string
  items: CaseItem[]
}

const CASE_MAP: CaseGroup[] = [
  {
    group: '義務的固定費',
    axisLabel: '削れない',
    groupColor: '#64748b',
    groupNote: '毎月ほぼ固定で発生し、原則として削減できない支出',
    items: [
      { example: '家賃・マンション管理費・修繕積立金',     categoryKey: 'housing' },
      { example: '電気代',                                 categoryKey: 'utility' },
      { example: 'ガス代',                                 categoryKey: 'utility' },
      { example: '水道代',                                 categoryKey: 'utility' },
      { example: 'スマホ月額料金',                         categoryKey: 'telecom' },
      { example: '自宅Wi-Fi（プロバイダ料金）',            categoryKey: 'telecom' },
      { example: 'Netflix・Spotify等のサブスク定額',       categoryKey: 'telecom', note: 'デジタルサービス月額 → 通信費に統一（趣味と迷っても）' },
      { example: '住民税・所得税の納付',                   categoryKey: 'tax' },
      { example: '自動車税・固定資産税',                   categoryKey: 'tax' },
      { example: '年末調整後の追加納税',                   categoryKey: 'tax' },
      { example: '生命保険・医療保険の月払い',             categoryKey: 'insurance' },
      { example: '火災保険・自動車保険',                   categoryKey: 'insurance' },
    ],
  },
  {
    group: '必要変動費',
    axisLabel: '必要だが量をコントロールできる',
    groupColor: '#f18840',
    groupNote: '生活に不可欠だが、量や頻度を意識することで節約できる支出',
    items: [
      { example: 'スーパー・コンビニでの食材・食品購入',   categoryKey: 'food' },
      { example: 'お弁当・総菜（持ち帰り・自宅消費）',     categoryKey: 'food',      note: '調理済みでも自宅で食べるなら食費。外で食べるなら外食' },
      { example: '電車・バス・地下鉄代',                   categoryKey: 'transport' },
      { example: 'タクシー代',                             categoryKey: 'transport' },
      { example: 'ガソリン代・駐車場代・ETC',              categoryKey: 'transport' },
      { example: '車の車検・整備費',                       categoryKey: 'transport', note: '移動手段のコストとして交通費に含める' },
      { example: '病院・クリニックの診察料',               categoryKey: 'medical' },
      { example: '処方薬・市販薬',                         categoryKey: 'medical' },
      { example: '健康診断・予防接種',                     categoryKey: 'medical' },
      { example: '洗剤・シャンプー・トイレ用品等の消耗品', categoryKey: 'daily' },
      { example: '電池・文房具・掃除用品',                 categoryKey: 'daily' },
      { example: '学校の授業料・塾・予備校代',             categoryKey: 'education' },
      { example: '参考書・教材費・資格試験の受験料',       categoryKey: 'education' },
      { example: '習い事（英会話・ピアノ等）',             categoryKey: 'education' },
    ],
  },
  {
    group: '裁量費',
    axisLabel: '意思決定で増減できる',
    groupColor: '#6366f1',
    groupNote: '必須ではなく、選択的に発生する支出。家計改善時に最初に見直す対象',
    items: [
      { example: 'レストラン・居酒屋・定食屋',             categoryKey: 'dining' },
      { example: 'カフェ（コーヒー・ランチ）',             categoryKey: 'dining' },
      { example: '友人・同僚との外食（割り勘）',           categoryKey: 'dining', note: '交際目的でも記録上は外食に統一（交際費カテゴリは今後検討）' },
      { example: '服・靴・バッグ',                         categoryKey: 'clothing' },
      { example: 'アクセサリー・時計・帽子',               categoryKey: 'clothing' },
      { example: '美容院・理髪店',                         categoryKey: 'beauty' },
      { example: '化粧品・スキンケア・香水',               categoryKey: 'beauty' },
      { example: 'ネイル・エステ・マッサージ',             categoryKey: 'beauty' },
      { example: 'ゲーム・書籍・漫画・音楽',               categoryKey: 'leisure' },
      { example: 'コンサート・映画・スポーツ観戦',         categoryKey: 'leisure' },
      { example: '旅行・宿泊・テーマパーク',               categoryKey: 'leisure', note: '旅行専用カテゴリは今後検討。現時点では趣味に統合' },
    ],
  },
  {
    group: '判断が難しいケース',
    axisLabel: '迷ったときのルール',
    groupColor: '#f59e0b',
    groupNote: 'どちらでも正解。重要なのはルールを決めて一貫させること',
    items: [
      { example: 'スポーツジム月会費（健康目的）',         categoryKey: 'medical',   note: '健康維持目的 → 医療費。趣味として楽しんでいるなら → 趣味', tag: 'edge' },
      { example: '有料アプリ購入・ゲーム内課金',           categoryKey: 'leisure',   note: '娯楽目的 → 趣味。仕事用ツール → その他', tag: 'edge' },
      { example: 'プレゼント・祝儀・香典',                 categoryKey: 'other',     note: '交際費カテゴリは今後追加予定。現時点は「その他」で管理', tag: 'edge' },
      { example: '自己研鑽（本・セミナー）',               categoryKey: 'education', note: 'スキルアップ目的 → 教育費。純粋な趣味読書 → 趣味', tag: 'edge' },
    ],
  },
]

// ── カラーチップ ─────────────────────────────────────────────────────────────

function Swatch({ token }: { token: CategoryToken }) {
  const Icon = token.icon
  return (
    <div className="flex flex-col gap-2.5 rounded-2xl border border-[rgba(28,20,16,0.08)] bg-white p-4">
      {/* アイコン + bg カラー */}
      <div className="flex items-center gap-3">
        <div
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
          style={{ background: token.bg }}
        >
          <Icon size={22} style={{ color: token.color }} strokeWidth={2} />
        </div>
        <div className="min-w-0">
          <p className="text-sm font-bold text-[#1c1410]">{token.name}</p>
          <p className="font-mono text-[10px] text-[#1c1410]/40">{token.key}</p>
        </div>
      </div>

      {/* カラー値 */}
      <div className="flex gap-2">
        <ColorChip label="fg" hex={token.color} />
        <ColorChip label="bg" hex={token.bg} />
      </div>

      {/* 使用例プレビュー（3パターン） */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* ● ドット（明細リスト用） */}
        <div className="flex items-center gap-1">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: token.color }} />
          <span className="text-[11px] font-medium text-[#1c1410]/55">{token.name}</span>
        </div>

        {/* バッジ（取引行カテゴリラベル用） */}
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: token.bg, color: token.color }}
        >
          {token.name}
        </span>
      </div>
    </div>
  )
}

function ColorChip({ label, hex }: { label: string; hex: string }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg border border-[rgba(28,20,16,0.06)] px-2 py-1">
      <span
        className="h-3 w-3 rounded-sm border border-[rgba(28,20,16,0.08)]"
        style={{ background: hex }}
      />
      <span className="font-mono text-[9px] text-[#1c1410]/40 leading-none">{label}</span>
      <span className="font-mono text-[10px] font-bold text-[#1c1410]/70 leading-none">{hex}</span>
    </div>
  )
}

// ── 収入ケース対応表データ ────────────────────────────────────────────────────

type IncomeCaseItem = {
  example: string
  categoryKey: string
  note?: string
  tag?: 'edge'
}

type IncomeCaseGroup = {
  group: string
  groupColor: string
  groupNote: string
  items: IncomeCaseItem[]
}

const INCOME_CASE_MAP: IncomeCaseGroup[] = [
  {
    group: '労働収入',
    groupColor: '#35b5a2',
    groupNote: '自分が働くことで得る収入',
    items: [
      { example: '月給・週給・日給（手取り or 総支給）',      categoryKey: 'salary' },
      { example: '残業代・深夜手当・休日出勤手当',            categoryKey: 'salary', note: '給与明細の一部として同月に入金されるなら給料に含める' },
      { example: '夏季・冬季ボーナス',                        categoryKey: 'bonus' },
      { example: '決算賞与・特別賞与',                        categoryKey: 'bonus' },
      { example: 'インセンティブ報酬（営業成績連動等）',      categoryKey: 'bonus' },
      { example: 'フリーランス・業務委託の報酬',              categoryKey: 'sideJob' },
      { example: 'Webサイト・コンテンツ収益（広告等）',      categoryKey: 'sideJob' },
      { example: 'メルカリ等フリマの売上（事業的規模の場合）', categoryKey: 'sideJob', note: '単発・少額の個人売却はその他。継続的・事業的なら副業' },
    ],
  },
  {
    group: '制度・給付収入',
    groupColor: '#0891b2',
    groupNote: '会社・国・自治体などの制度から受け取る収入',
    items: [
      { example: '住宅手当（会社からの補助）',                categoryKey: 'benefit' },
      { example: '交通費支給（実費精算・定期代）',            categoryKey: 'benefit' },
      { example: '扶養手当・家族手当',                        categoryKey: 'benefit' },
      { example: '役職手当・資格手当',                        categoryKey: 'benefit' },
      { example: '老齢年金（国民・厚生）',                    categoryKey: 'pension' },
      { example: '障害年金・遺族年金',                        categoryKey: 'pension' },
      { example: '企業年金・確定拠出年金（受取時）',          categoryKey: 'pension' },
      { example: '育児休業給付金・失業給付',                  categoryKey: 'benefit', note: '雇用保険からの給付。手当に分類' },
    ],
  },
  {
    group: '資産収入',
    groupColor: '#10b981',
    groupNote: '保有資産が生む収入。労働なしに発生する',
    items: [
      { example: '株式の配当金・投資信託の分配金',            categoryKey: 'investment' },
      { example: '不動産賃貸収入（家賃収入）',                categoryKey: 'investment' },
      { example: '株・投資信託・FXの売却益',                  categoryKey: 'investment' },
      { example: '預金利息・債券利息',                        categoryKey: 'investment' },
    ],
  },
  {
    group: '判断が難しいケース',
    groupColor: '#f59e0b',
    groupNote: 'どちらでも正解。一貫性を優先する',
    items: [
      { example: 'ポイント換金・キャッシュバック',             categoryKey: 'other',      note: '少額・不定期ならその他。継続的に大きな金額なら副業', tag: 'edge' },
      { example: '懸賞当選金・宝くじ',                        categoryKey: 'other',      note: '一時所得。その他で管理', tag: 'edge' },
      { example: '祝儀・贈り物',                              categoryKey: 'other',      note: '収入として記録するかは任意。記録する場合はその他', tag: 'edge' },
      { example: 'メルカリ等の個人売却（単発・少額）',        categoryKey: 'other',      note: '事業規模でない個人売却はその他。確定申告が必要なら副業', tag: 'edge' },
    ],
  },
]

// ── 不整合一覧テーブル ────────────────────────────────────────────────────────

const INCONSISTENCIES = [
  {
    category: '食費',
    pages: [
      { page: 'HomePrototype (選択グリッド)', color: '#0075FF', note: '青（意図不明）' },
      { page: 'MeisaiPrototype (取引行)',       color: '#f18840', note: '✓ ブランドオレンジ' },
      { page: 'ReportPrototype (棒グラフ)',      color: '#f18840', note: '✓ ブランドオレンジ' },
    ],
    proposed: '#f18840',
  },
  {
    category: '交通費',
    pages: [
      { page: 'HomePrototype (選択グリッド)', color: '#FF3E3E', note: '赤（医療費と混同）' },
      { page: 'MeisaiPrototype (取引行)',       color: '#8b7cf8', note: 'ソフトバイオレット' },
      { page: 'CategoryTopABPrototype',          color: '#3b82f6', note: '青' },
    ],
    proposed: '#3b82f6',
  },
  {
    category: '光熱費',
    pages: [
      { page: 'HomePrototype (選択グリッド)', color: '#D3BB08', note: '彩度高すぎる黄' },
      { page: 'MeisaiPrototype / Report',       color: '#35b5a2', note: 'ティール（収入色と混同）' },
    ],
    proposed: '#64748b',
  },
  {
    category: '日用品',
    pages: [
      { page: 'HomePrototype (選択グリッド)', color: '#F250F8', note: 'マゼンタ（目立ちすぎ）' },
      { page: 'MeisaiPrototype (取引行)',       color: '#8b7cf8', note: '交通費と同じ色' },
      { page: 'CategoryTopABPrototype',          color: '#a855f7', note: 'パープル（通信費と混同）' },
    ],
    proposed: '#0ea5e9',
  },
  {
    category: '医療費',
    pages: [
      { page: 'HomePrototype (選択グリッド)', color: '#17B10A', note: '緑（健康 = 良いのイメージ）' },
      { page: 'MeisaiPrototype / Report',       color: '#f43f5e', note: '✓ ローズ（注意色と整合）' },
    ],
    proposed: '#f43f5e',
  },
  {
    category: '衣類',
    pages: [
      { page: 'HomePrototype (選択グリッド)', color: '#10D100', note: 'ライム（趣味 / 医療との区別なし）' },
    ],
    proposed: '#6366f1',
  },
]

function InconsistencyRow({ item }: { item: typeof INCONSISTENCIES[number] }) {
  return (
    <div className="rounded-xl border border-[rgba(28,20,16,0.08)] bg-white overflow-hidden">
      <div className="flex items-center gap-2 px-4 py-2.5 border-b border-[rgba(28,20,16,0.06)] bg-[#fafaf8]">
        <span className="font-bold text-sm text-[#1c1410]">{item.category}</span>
        <span className="text-xs text-[#1c1410]/40">→ 提案: </span>
        <span className="h-4 w-4 rounded-full border border-[rgba(28,20,16,0.1)]" style={{ background: item.proposed }} />
        <span className="font-mono text-xs text-[#1c1410]/55">{item.proposed}</span>
      </div>
      <div className="divide-y divide-[rgba(28,20,16,0.04)]">
        {item.pages.map((p) => (
          <div key={p.page} className="flex items-center gap-3 px-4 py-2">
            <span className="h-3 w-3 rounded-full shrink-0 border border-[rgba(28,20,16,0.08)]" style={{ background: p.color }} />
            <span className="font-mono text-[11px] text-[#1c1410]/50 shrink-0">{p.color}</span>
            <span className="text-xs text-[#1c1410]/40 truncate">{p.page}</span>
            <span className="ml-auto text-[11px] text-[#1c1410]/40 shrink-0">{p.note}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── 使い方コードスニペット ────────────────────────────────────────────────────

const CODE_SNIPPET = `import {
  getExpenseCategoryToken,
  getIncomeCategoryToken,
} from '../tokens/categoryTokens'

// カテゴリ名 → トークン取得
const token = getExpenseCategoryToken('食費')
// → { key: 'food', name: '食費', color: '#f18840', bg: '#fef5ee', icon: ShoppingBasket }

// JSX での使用例（取引行・バッジ）
<span
  className="rounded-full px-2 py-0.5 text-xs font-bold"
  style={{ background: token.bg, color: token.color }}
>
  {token.name}
</span>

// アイコン表示
const Icon = token.icon
<Icon size={20} style={{ color: token.color }} />`

// ── メインページ ──────────────────────────────────────────────────────────────

export function CategoryColorPalettePrototype() {
  return (
    <div
      className="min-h-screen p-6 pb-24"
      style={{ background: '#fffdf5', fontFamily: 'sans-serif' }}
    >
      <div className="mx-auto max-w-4xl">

        {/* ヘッダー */}
        <div className="mb-8">
          <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-[rgba(28,20,16,0.10)] bg-white px-3 py-1 text-xs font-bold text-[#1c1410]/50">
            <span className="h-2 w-2 rounded-full bg-[#f18840]" />
            src/tokens/categoryTokens.ts
          </div>
          <h1 className="text-2xl font-extrabold text-[#1c1410]">カテゴリカラー定義</h1>
          <p className="mt-1.5 text-sm text-[#1c1410]/50 max-w-lg">
            各ページで独自に定義されていたカテゴリ色を SSOT に統一。
            セマンティクキーで意図を明示し、カテゴリ名変更への耐性を高めます。
          </p>
        </div>

        {/* ── 支出カテゴリ ── */}
        <section className="mb-10">
          <SectionHeader
            label="支出カテゴリ"
            count={EXPENSE_CATEGORIES.length}
            colorDot="#f18840"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {EXPENSE_CATEGORIES.map((token) => (
              <Swatch key={token.key} token={token} />
            ))}
          </div>
        </section>

        {/* 色相環サマリー（支出） */}
        <div className="mb-10 rounded-2xl border border-[rgba(28,20,16,0.08)] bg-white p-5">
          <p className="mb-3 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wider">カラーグループ</p>
          <div className="flex flex-wrap gap-3">
            {[
              { label: '食系 — orange',                               colors: ['#f18840', '#e8622a'] },
              { label: '日常 — blue / sky',                           colors: ['#3b82f6', '#0ea5e9'] },
              { label: 'インフラ — amber / blue / brick / charcoal',  colors: ['#b45309', '#1e40af', '#7c2d12', '#1f2937'] },
              { label: '健康 — rose / pink',                          colors: ['#f43f5e', '#ec4899'] },
              { label: 'ライフスタイル — indigo / fuchsia / violet',  colors: ['#6366f1', '#d946ef', '#8b5cf6'] },
              { label: '教育 — amber',                                colors: ['#f59e0b'] },
              { label: '中立 — slate',                                colors: ['#94a3b8'] },
            ].map((g) => (
              <div key={g.label} className="flex items-center gap-2 rounded-xl bg-[#fafaf8] px-3 py-2">
                <div className="flex gap-1">
                  {g.colors.map((c) => (
                    <span key={c} className="h-4 w-4 rounded-full border border-[rgba(28,20,16,0.08)]" style={{ background: c }} />
                  ))}
                </div>
                <span className="text-xs text-[#1c1410]/55">{g.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── 収入カテゴリ ── */}
        <section className="mb-10">
          <SectionHeader
            label="収入カテゴリ"
            count={INCOME_CATEGORIES.length}
            colorDot="#35b5a2"
          />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {INCOME_CATEGORIES.map((token) => (
              <Swatch key={token.key} token={token} />
            ))}
          </div>
        </section>

        {/* ── 収入ケース別対応表 ── */}
        <section className="mb-10">
          <SectionHeader label="収入 — ケース別カテゴリ対応表" colorDot="#35b5a2" note="「これはどこに入れる？」の網羅的な対応表" />
          <div className="flex flex-col gap-6">
            {INCOME_CASE_MAP.map((group) => (
              <div key={group.group} className="rounded-2xl border border-[rgba(28,20,16,0.08)] overflow-hidden">
                <div
                  className="flex items-center gap-3 px-5 py-3 border-b border-[rgba(28,20,16,0.06)]"
                  style={{ background: `${group.groupColor}10` }}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: group.groupColor }} />
                  <span className="text-sm font-extrabold" style={{ color: group.groupColor }}>{group.group}</span>
                  <span className="ml-auto text-[11px] text-[#1c1410]/40 hidden sm:block">{group.groupNote}</span>
                </div>
                <div className="divide-y divide-[rgba(28,20,16,0.05)] bg-white">
                  {group.items.map((item) => {
                    const tok = INCOME_CATEGORY_TOKENS[item.categoryKey] ?? INCOME_CATEGORY_TOKENS.other
                    const CatIcon = tok.icon
                    return (
                      <div
                        key={item.example}
                        className="flex items-start gap-4 px-5 py-3"
                        style={{ background: item.tag === 'edge' ? '#fffbf0' : 'transparent' }}
                      >
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-[#1c1410]/80">{item.example}</span>
                          {item.note && (
                            <p className="mt-0.5 text-[11px] text-[#1c1410]/40 leading-relaxed">{item.note}</p>
                          )}
                        </div>
                        <div className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: tok.bg }}>
                          <CatIcon size={11} style={{ color: tok.color }} strokeWidth={2.5} />
                          <span className="text-[11px] font-bold" style={{ color: tok.color }}>{tok.name}</span>
                        </div>
                        {item.tag === 'edge' && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">要判断</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 未分類 vs その他 ── */}
        <section className="mb-10">
          <SectionHeader label="「未分類」と「その他」の違い" colorDot="#94a3b8" />
          <div className="grid gap-3 md:grid-cols-2">
            {[
              {
                tok: EXPENSE_CATEGORY_TOKENS.unclassified,
                role: 'システムが自動付与する一時的な状態',
                desc: 'AIがカテゴリを判定できなかった、またはユーザーがまだカテゴリを割り当てていない記録。「未処理」を意味し、後から正しいカテゴリに変更することを前提とする。',
                when: ['銀行明細インポート直後', 'AI判定の信頼度が低かった記録', '一括取込後の確認待ち'],
              },
              {
                tok: EXPENSE_CATEGORY_TOKENS.other,
                role: 'ユーザーが意図的に選ぶ確定カテゴリ',
                desc: '上記のどのカテゴリにも当てはまらないと判断した支出に明示的に割り当てる。「未分類」と違い処理完了状態であり、集計対象になる。',
                when: ['祝儀・香典・プレゼント（交際費）', '引越し費用・家具購入（大型一時出費）', '特定カテゴリ未設定の雑費'],
              },
            ].map(({ tok, role, desc, when }) => {
              const Icon = tok.icon
              return (
                <div key={tok.key} className="rounded-2xl border border-[rgba(28,20,16,0.08)] bg-white p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl" style={{ background: tok.bg }}>
                      <Icon size={20} style={{ color: tok.color }} strokeWidth={2} />
                    </div>
                    <div>
                      <p className="font-bold text-sm text-[#1c1410]">{tok.name}</p>
                      <p className="text-[10px] font-semibold" style={{ color: tok.color }}>{role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-[#1c1410]/55 leading-relaxed mb-3">{desc}</p>
                  <div className="flex flex-col gap-1">
                    {when.map((w) => (
                      <div key={w} className="flex items-start gap-1.5">
                        <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: tok.color }} />
                        <span className="text-[11px] text-[#1c1410]/60">{w}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── ケース別カテゴリ対応表 ── */}
        <section className="mb-10">
          <SectionHeader label="ケース別カテゴリ対応表" colorDot="#6366f1" note="「これはどこに入れる？」の網羅的な対応表" />
          <div className="flex flex-col gap-6">
            {CASE_MAP.map((group) => (
              <div key={group.group} className="rounded-2xl border border-[rgba(28,20,16,0.08)] overflow-hidden">
                {/* グループヘッダー */}
                <div
                  className="flex items-center gap-3 px-5 py-3 border-b border-[rgba(28,20,16,0.06)]"
                  style={{ background: `${group.groupColor}10` }}
                >
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: group.groupColor }} />
                  <span className="text-sm font-extrabold" style={{ color: group.groupColor }}>{group.group}</span>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full" style={{ background: `${group.groupColor}18`, color: group.groupColor }}>
                    {group.axisLabel}
                  </span>
                  <span className="ml-auto text-[11px] text-[#1c1410]/40 hidden sm:block">{group.groupNote}</span>
                </div>
                {/* 行 */}
                <div className="divide-y divide-[rgba(28,20,16,0.05)] bg-white">
                  {group.items.map((item) => {
                    const tok = EXPENSE_CATEGORY_TOKENS[item.categoryKey] ?? EXPENSE_CATEGORY_TOKENS.other
                    const CatIcon = tok.icon
                    return (
                      <div
                        key={item.example}
                        className="flex items-start gap-4 px-5 py-3"
                        style={{ background: item.tag === 'edge' ? '#fffbf0' : 'transparent' }}
                      >
                        {/* 具体例 */}
                        <div className="flex-1 min-w-0">
                          <span className="text-[13px] text-[#1c1410]/80">{item.example}</span>
                          {item.note && (
                            <p className="mt-0.5 text-[11px] text-[#1c1410]/40 leading-relaxed">{item.note}</p>
                          )}
                        </div>
                        {/* カテゴリバッジ */}
                        <div className="shrink-0 flex items-center gap-1.5 rounded-full px-2.5 py-1" style={{ background: tok.bg }}>
                          <CatIcon size={11} style={{ color: tok.color }} strokeWidth={2.5} />
                          <span className="text-[11px] font-bold" style={{ color: tok.color }}>{tok.name}</span>
                        </div>
                        {item.tag === 'edge' && (
                          <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#fef3c7] text-[#92400e]">要判断</span>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ── 現行の不整合 ── */}
        <section className="mb-10">
          <SectionHeader
            label="現行の不整合（修正要）"
            colorDot="#f43f5e"
            note="以下のページでは同じカテゴリに異なる色が使われています"
          />
          <div className="flex flex-col gap-3">
            {INCONSISTENCIES.map((item) => (
              <InconsistencyRow key={item.category} item={item} />
            ))}
          </div>
        </section>

        {/* ── 使い方 ── */}
        <section>
          <SectionHeader label="使い方" colorDot="#8b5cf6" />
          <div className="rounded-2xl border border-[rgba(28,20,16,0.08)] bg-[#1c1410] overflow-hidden">
            <div className="flex items-center gap-2 px-4 py-2.5 border-b border-white/10">
              <span className="h-2.5 w-2.5 rounded-full bg-[#f43f5e]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b]" />
              <span className="h-2.5 w-2.5 rounded-full bg-[#10b981]" />
              <span className="ml-2 text-[11px] font-mono text-white/30">TypeScript</span>
            </div>
            <pre className="overflow-x-auto p-5 text-[12px] leading-relaxed text-[#e2e8f0] font-mono">
              <code>{CODE_SNIPPET}</code>
            </pre>
          </div>
        </section>

      </div>
    </div>
  )
}

// ── 共通ヘルパー ─────────────────────────────────────────────────────────────

function SectionHeader({
  label,
  count,
  colorDot,
  note,
}: {
  label: string
  count?: number
  colorDot: string
  note?: string
}) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className="h-3 w-3 rounded-full shrink-0" style={{ background: colorDot }} />
      <h2 className="text-base font-extrabold text-[#1c1410]">{label}</h2>
      {count !== undefined && (
        <span className="rounded-full bg-[rgba(28,20,16,0.07)] px-2 py-0.5 text-xs font-bold text-[#1c1410]/50">
          {count}
        </span>
      )}
      {note && <span className="text-xs text-[#1c1410]/40">{note}</span>}
    </div>
  )
}
