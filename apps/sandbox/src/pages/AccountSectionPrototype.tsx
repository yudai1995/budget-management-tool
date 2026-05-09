import { User, LogOut } from 'lucide-react'

/** #179 設定ページ アカウントセクション プロトタイプ */
export function AccountSectionPrototype() {
  return (
    <div className="min-h-screen p-6" style={{ background: 'var(--color-surface-default)' }}>
      <h1 className="mb-6 text-xl font-extrabold text-[#1c1410]">
        設定ページ — アカウントセクション (#179)
      </h1>

      {/* モバイル幅（375px）でのプレビュー */}
      <div className="w-full max-w-sm mx-auto space-y-4">
        {/* アカウントセクション */}
        <div
          className="rounded-2xl border-2 border-[#1c1410] bg-white p-6 space-y-4"
          style={{ boxShadow: 'var(--shadow-pop)' }}
        >
          <h2 className="text-base font-extrabold text-[#1c1410]">アカウント</h2>
          <div className="flex items-center gap-3">
            <User size={18} className="text-[#1c1410]/40" />
            <span className="text-sm font-bold text-[#1c1410]">yamamoto</span>
          </div>
          <form>
            <button type="submit" className="btn-ghost flex items-center gap-2">
              <LogOut size={16} />
              ログアウト
            </button>
          </form>
        </div>

        {/* データエクスポートセクション（既存・参照用） */}
        <div
          className="rounded-2xl border-2 border-[#1c1410] bg-white p-6 space-y-4 opacity-50"
          style={{ boxShadow: 'var(--shadow-pop)' }}
        >
          <h2 className="text-base font-extrabold text-[#1c1410]">全データのバックアップ</h2>
          <p className="text-sm text-[#1c1410]/60">既存の DataExportSection（変更なし）</p>
        </div>
      </div>
    </div>
  )
}
