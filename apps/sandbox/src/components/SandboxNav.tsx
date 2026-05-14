/**
 * SandboxNav — Sandbox 全ページ共通フローティングナビ
 *
 * プロトタイプページの左下に固定表示される薄型ナビバー。
 * - ギャラリーへ戻る
 * - 前後プロトタイプへ移動
 * プロトタイプ本体のレイアウトを妨げないよう最小化可能。
 */

import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { LayoutGrid, ChevronLeft, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'

// Gallery.tsx の prototypes 配列と同期させる（SSOT ではないが Sandbox 内限定）
const PAGES: { path: string; label: string }[] = [
  { path: '/bottom-nav',              label: 'ボトムナビゲーション' },
  { path: '/quick-entry',             label: 'クイック入力フォーム' },
  { path: '/nav-layout',              label: 'ナビゲーション統合レイアウト' },
  { path: '/account-section',         label: 'アカウントセクション' },
  { path: '/onboarding',              label: 'オンボーディングウィザード' },
  { path: '/calendar-page',           label: 'カレンダーページ刷新' },
  { path: '/daily-budget-card',       label: '今日使えるお金カード' },
  { path: '/daily-budget-card-palette', label: 'カラーパレット比較' },
  { path: '/home-v3',                 label: 'ホーム V3' },
  { path: '/home-v4',                 label: 'ホーム V4' },
  { path: '/category-ab',             label: '支出カテゴリ TOP A/B' },
  { path: '/category-input-ab',       label: 'カテゴリ選択 A/B/C' },
  { path: '/asset-outlook-ab',        label: '長期指標 A/B' },
  { path: '/recent-records-ab',       label: '最近の記録 A/B' },
  { path: '/personal-settings',       label: '個人設定画面' },
]

export function SandboxNav() {
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)

  // ギャラリー自体では表示しない
  if (pathname === '/') return null

  const currentIdx = PAGES.findIndex((p) => p.path === pathname)
  const current = PAGES[currentIdx]
  const prev = currentIdx > 0 ? PAGES[currentIdx - 1] : null
  const next = currentIdx < PAGES.length - 1 ? PAGES[currentIdx + 1] : null

  return (
    <div
      className="fixed bottom-4 left-3 z-50 flex flex-col items-start gap-1"
      style={{ pointerEvents: 'none' }}
    >
      {/* ページ一覧ドロップアップ */}
      {open && (
        <div
          className="mb-1 rounded-xl border py-1 shadow-lg"
          style={{
            background: 'rgba(255,253,245,0.97)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(28,20,16,0.10)',
            boxShadow: '0 8px 24px rgba(28,20,16,0.14)',
            pointerEvents: 'auto',
            maxHeight: '60vh',
            overflowY: 'auto',
            minWidth: 200,
          }}
        >
          {PAGES.map((p) => (
            <Link
              key={p.path}
              to={p.path}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-semibold transition-colors hover:bg-[#fff6ee]"
              style={{
                color: p.path === pathname ? '#f18840' : 'rgba(28,20,16,0.7)',
              }}
            >
              {p.path === pathname && (
                <span
                  className="h-1.5 w-1.5 rounded-full shrink-0"
                  style={{ background: '#f18840' }}
                />
              )}
              {p.path !== pathname && <span className="h-1.5 w-1.5 rounded-full shrink-0" />}
              {p.label}
            </Link>
          ))}
        </div>
      )}

      {/* コントロールバー */}
      <div
        className="flex items-center gap-1 rounded-full px-2 py-1.5"
        style={{
          background: 'rgba(28,20,16,0.72)',
          backdropFilter: 'blur(10px)',
          boxShadow: '0 2px 8px rgba(28,20,16,0.25)',
          pointerEvents: 'auto',
        }}
      >
        {/* ギャラリーへ */}
        <Link
          to="/"
          title="ギャラリーへ戻る"
          className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20"
        >
          <LayoutGrid size={13} className="text-white" />
        </Link>

        <span
          className="mx-0.5 text-white/20 text-xs select-none"
          aria-hidden="true"
        >|</span>

        {/* 前へ */}
        {prev ? (
          <Link
            to={prev.path}
            title={prev.label}
            className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <ChevronLeft size={13} className="text-white" />
          </Link>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center opacity-20">
            <ChevronLeft size={13} className="text-white" />
          </span>
        )}

        {/* 現在ページ名 + ドロップアップトグル */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-1 rounded-full px-2 transition-colors hover:bg-white/20"
          style={{ maxWidth: 120 }}
        >
          <span
            className="truncate text-[11px] font-bold text-white"
            style={{ maxWidth: 90 }}
          >
            {current?.label ?? pathname}
          </span>
          {open ? (
            <ChevronDown size={11} className="shrink-0 text-white/70" />
          ) : (
            <ChevronUp size={11} className="shrink-0 text-white/70" />
          )}
        </button>

        {/* 次へ */}
        {next ? (
          <Link
            to={next.path}
            title={next.label}
            className="flex h-6 w-6 items-center justify-center rounded-full transition-colors hover:bg-white/20"
          >
            <ChevronRight size={13} className="text-white" />
          </Link>
        ) : (
          <span className="flex h-6 w-6 items-center justify-center opacity-20">
            <ChevronRight size={13} className="text-white" />
          </span>
        )}
      </div>
    </div>
  )
}
