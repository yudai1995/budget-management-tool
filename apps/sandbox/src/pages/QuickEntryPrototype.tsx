import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, ChevronDown, Check } from 'lucide-react'

type BalanceType = 'expense' | 'income'

export function QuickEntryPrototype() {
  const [balanceType, setBalanceType] = useState<BalanceType>('expense')
  const [amount, setAmount] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  const today = new Date().toLocaleDateString('ja-JP', { month: 'long', day: 'numeric', weekday: 'short' })

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!amount || Number(amount) <= 0) return
    setSubmitted(true)
    setTimeout(() => {
      setSubmitted(false)
      setAmount('')
      setNoteOpen(false)
    }, 1500)
  }

  const isExpense = balanceType === 'expense'
  const accentColor = isExpense ? 'var(--color-expense)' : 'var(--color-income)'

  return (
    <div className="flex flex-col items-center" style={{ background: 'var(--color-surface-default)', minHeight: '100svh' }}>
      <div className="w-full max-w-sm px-4 pt-4 pb-2">
        <Link to="/" className="flex items-center gap-1.5 text-xs text-[#1c1410]/50 hover:text-[#f08030] transition-colors">
          <ArrowLeft size={14} />
          Gallery に戻る
        </Link>
        <h1 className="mt-2 text-base font-bold text-[#1c1410]">クイック入力フォーム試作</h1>
        <p className="text-xs text-[#1c1410]/50">3タップで記録完了するUX</p>
      </div>

      {/* モバイル画面シミュレーター */}
      <div
        className="relative mx-auto flex flex-col overflow-hidden rounded-3xl border-4 border-[#1c1410]/20"
        style={{ width: 375, height: 720, background: 'var(--color-surface-default)' }}
      >
        <div className="flex-1 overflow-y-auto px-4 pt-6">
          {submitted ? (
            <SuccessScreen />
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Step 1: 種別タブ */}
              <div>
                <p className="mb-2 text-xs font-bold text-[#1c1410]/50">1. 種別</p>
                <div className="flex rounded-2xl bg-white p-1" style={{ boxShadow: 'var(--shadow-card)' }}>
                  {(['expense', 'income'] as BalanceType[]).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBalanceType(type)}
                      className="flex-1 rounded-xl py-2.5 text-sm font-bold transition-all"
                      style={
                        balanceType === type
                          ? { background: type === 'expense' ? 'var(--color-expense)' : 'var(--color-income)', color: '#fff' }
                          : { color: 'rgba(28,20,16,0.4)' }
                      }
                    >
                      {type === 'expense' ? '支出' : '収入'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: 金額入力 */}
              <div>
                <p className="mb-2 text-xs font-bold text-[#1c1410]/50">2. 金額</p>
                <div
                  className="rounded-2xl bg-white px-4 py-3"
                  style={{ boxShadow: 'var(--shadow-card)', borderBottom: `3px solid ${accentColor}` }}
                >
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-extrabold" style={{ color: accentColor }}>¥</span>
                    <input
                      type="number"
                      inputMode="numeric"
                      placeholder="0"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      min={1}
                      className="flex-1 bg-transparent text-4xl font-extrabold tabular-nums outline-none placeholder:text-[#1c1410]/20"
                      style={{ color: accentColor }}
                    />
                  </div>
                </div>
              </div>

              {/* 日付（今日がデフォルト） */}
              <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3" style={{ boxShadow: 'var(--shadow-card)' }}>
                <span className="text-xs font-bold text-[#1c1410]/50">日付</span>
                <span className="text-sm font-semibold text-[#1c1410]">{today}</span>
              </div>

              {/* 備考（折りたたみ） */}
              <div className="rounded-2xl bg-white overflow-hidden" style={{ boxShadow: 'var(--shadow-card)' }}>
                <button
                  type="button"
                  onClick={() => setNoteOpen(!noteOpen)}
                  className="flex w-full items-center justify-between px-4 py-3"
                >
                  <span className="text-xs font-bold text-[#1c1410]/50">備考（任意）</span>
                  <ChevronDown
                    size={16}
                    className="text-[#1c1410]/30 transition-transform"
                    style={{ transform: noteOpen ? 'rotate(180deg)' : 'rotate(0deg)' }}
                  />
                </button>
                {noteOpen && (
                  <div className="border-t border-[#1c1410]/6 px-4 pb-3 pt-2">
                    <input
                      type="text"
                      placeholder="例: スーパーで食材"
                      className="w-full bg-transparent text-sm text-[#1c1410] outline-none placeholder:text-[#1c1410]/30"
                    />
                  </div>
                )}
              </div>

              {/* Step 3: 送信ボタン */}
              <button
                type="submit"
                disabled={!amount || Number(amount) <= 0}
                className="w-full rounded-2xl py-4 text-base font-extrabold text-white transition-all active:scale-95 disabled:opacity-40"
                style={{ background: accentColor }}
              >
                記録する
              </button>
            </form>
          )}
        </div>
      </div>

      {/* バリアント説明 */}
      <div className="mt-4 w-full max-w-sm px-4">
        <div className="rounded-xl border border-[#1c1410]/10 bg-white p-3 text-xs text-[#1c1410]/50">
          <p className="font-bold text-[#1c1410]/70 mb-1">このプロトタイプの特徴</p>
          <ul className="list-disc list-inside space-y-0.5">
            <li>種別タブ切り替え（select 廃止）</li>
            <li>金額入力を画面の中心に大きく配置</li>
            <li>日付はデフォルト「今日」</li>
            <li>備考はアコーディオンで折りたたみ</li>
            <li>送信ボタンが全幅・目立つカラー</li>
          </ul>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-3 py-20">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ background: 'var(--color-income-light)' }}
      >
        <Check size={32} style={{ color: 'var(--color-income)' }} />
      </div>
      <p className="text-base font-bold text-[#1c1410]">記録しました</p>
      <p className="text-xs text-[#1c1410]/40">フォームに戻ります...</p>
    </div>
  )
}
