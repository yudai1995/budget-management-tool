import { Link } from 'react-router-dom'
import { Smartphone, PenLine, ArrowRight, Layout, User, PlayCircle, CalendarDays, Wallet, Palette } from 'lucide-react'

type PrototypeCard = {
  path: string
  title: string
  description: string
  icon: React.ElementType
  issue: string
  status: 'ready' | 'wip'
}

const prototypes: PrototypeCard[] = [
  {
    path: '/bottom-nav',
    title: 'ボトムナビゲーション',
    description: 'モバイル向け固定ボトムバー。タブ切り替え・FABボタンの試作。',
    icon: Smartphone,
    issue: '#119',
    status: 'ready',
  },
  {
    path: '/quick-entry',
    title: 'クイック入力フォーム',
    description: '3タップで記録完了する入力UXの試作。金額中心レイアウト。',
    icon: PenLine,
    issue: '#121',
    status: 'ready',
  },
  {
    path: '/nav-layout',
    title: 'ナビゲーション統合レイアウト',
    description: 'PC:左サイドバー / モバイル:ボトムナビ。NAV_ITEMSを1箇所で定義。',
    icon: Layout,
    issue: '#141',
    status: 'ready',
  },
  {
    path: '/account-section',
    title: 'アカウントセクション（設定ページ）',
    description: 'モバイル向けユーザー名表示・ログアウト導線の試作。',
    icon: User,
    issue: '#179',
    status: 'ready',
  },
  {
    path: '/onboarding',
    title: 'オンボーディングウィザード',
    description: '3ステップで給料日・固定費・残高を入力し1日予算を即時提示するフリップUI。',
    icon: PlayCircle,
    issue: '#132',
    status: 'ready',
  },
  {
    path: '/calendar-page',
    title: 'カレンダーページ刷新',
    description: 'ドット表示・日付タップで明細表示・クイック入力ボトムシート。モバイルファーストレイアウト。',
    icon: CalendarDays,
    issue: '#183 #184',
    status: 'ready',
  },
  {
    path: '/daily-budget-card',
    title: '今日使えるお金カード',
    description: '給料日までの1日予算をヒーローナンバーで表示。信号機カラーによるピンチ度の視覚化。',
    icon: Wallet,
    issue: '#133',
    status: 'ready',
  },
  {
    path: '/daily-budget-card-palette',
    title: 'カラーパレット比較（DailyBudgetCard）',
    description: 'SAFE/CAUTION/DANGER の3ステートを3パレットパターンで横並び比較。現行との対比も掲載。',
    icon: Palette,
    issue: '#133',
    status: 'wip',
  },
]

export function Gallery() {
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-surface-default)' }}>
      {/* ヘッダー */}
      <div className="mb-8">
        <div
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border-2 border-[#1c1410] text-sm font-extrabold text-white mb-3"
          style={{ background: 'var(--color-brand-primary)', boxShadow: 'var(--shadow-pop-sm)' }}
        >
          S
        </div>
        <h1 className="text-2xl font-extrabold text-[#1c1410]">デザイン Sandbox</h1>
        <p className="mt-1 text-sm text-[#1c1410]/50">
          試作コンポーネントの一覧。本番実装前に自由にカスタマイズできます。
        </p>
      </div>

      {/* プロトタイプ一覧 */}
      <div className="flex flex-col gap-3 max-w-lg">
        {prototypes.map((p) => {
          const Icon = p.icon
          return (
            <Link
              key={p.path}
              to={p.path}
              className="group flex items-center gap-4 rounded-2xl border border-[#1c1410]/12 bg-white p-4 transition-colors hover:border-[#1c1410]/30"
            >
              <div
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'var(--color-surface-default)' }}
              >
                <Icon size={20} style={{ color: 'var(--color-brand-primary)' }} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-[#1c1410]">{p.title}</span>
                  <span className="rounded-full bg-[#f0fdf6] px-2 py-0.5 text-xs font-bold text-[#4caf82]">
                    {p.issue}
                  </span>
                </div>
                <p className="mt-0.5 text-xs text-[#1c1410]/50 truncate">{p.description}</p>
              </div>
              <ArrowRight
                size={16}
                className="shrink-0 text-[#1c1410]/30 transition-colors group-hover:text-[var(--color-brand-primary)]"
              />
            </Link>
          )
        })}
      </div>

      {/* 使い方 */}
      <div className="mt-8 rounded-xl border border-[#1c1410]/10 bg-white p-4 max-w-lg text-xs text-[#1c1410]/50">
        <p className="font-bold text-[#1c1410]/70 mb-1">新しいプロトタイプを追加するには</p>
        <ol className="list-decimal list-inside space-y-1">
          <li><code className="bg-[#fef5ee] px-1 rounded">src/pages/</code> に新しいコンポーネントを作成</li>
          <li><code className="bg-[#fef5ee] px-1 rounded">main.tsx</code> に Route を追加</li>
          <li>この Gallery の <code className="bg-[#fef5ee] px-1 rounded">prototypes</code> 配列にエントリを追加</li>
        </ol>
      </div>
    </div>
  )
}
