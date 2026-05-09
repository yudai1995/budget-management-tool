import { useState } from 'react'
import { ChevronRight, ChevronLeft, Check, Calendar, Receipt, Wallet, Banknote } from 'lucide-react'

type FormData = {
  paydayDay: number
  monthlyIncome: number
  fixedExpenses: number
  totalAssets: number
}

const INITIAL: FormData = { paydayDay: 25, monthlyIncome: 250000, fixedExpenses: 80000, totalAssets: 150000 }

function formatAmount(v: number) {
  return `¥${v.toLocaleString('ja-JP')}`
}

function calcDailyBudget(data: FormData): { dailyBudget: number; daysUntilPayday: number } {
  const today = new Date()
  const todayDate = today.getDate()
  const currentMonth = today.getMonth()
  const currentYear = today.getFullYear()
  let payday = new Date(currentYear, currentMonth, data.paydayDay)
  if (todayDate >= data.paydayDay) {
    payday = new Date(currentYear, currentMonth + 1, data.paydayDay)
  }
  const msPerDay = 24 * 60 * 60 * 1000
  const daysUntilPayday = Math.max(1, Math.ceil((payday.getTime() - today.getTime()) / msPerDay))
  const available = data.totalAssets - data.fixedExpenses
  return {
    dailyBudget: available > 0 ? Math.floor(available / daysUntilPayday) : 0,
    daysUntilPayday,
  }
}

/** #132 フリップ形式オンボーディング プロトタイプ */
export function OnboardingPrototype() {
  const [step, setStep] = useState(0)
  const [data, setData] = useState<FormData>(INITIAL)

  const { dailyBudget, daysUntilPayday } = calcDailyBudget(data)

  const STEPS = [
    { label: '給料日', icon: Calendar },
    { label: '固定費', icon: Receipt },
    { label: '残高', icon: Wallet },
  ]

  return (
    <div className="min-h-screen p-6 flex items-center justify-center" style={{ background: 'var(--color-surface-default)' }}>
      <style>{`@keyframes slideIn { from { opacity: 0; transform: translateX(12px); } to { opacity: 1; transform: translateX(0); } }`}</style>
      <div className="w-full max-w-sm">
        {/* ヘッダー */}
        <div className="mb-8 text-center">
          <div
            className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border-2 border-[#1c1410] text-white text-lg font-extrabold mb-4"
            style={{ background: 'var(--color-brand-primary)', boxShadow: 'var(--shadow-pop-sm)' }}
          >
            家
          </div>
          <h1 className="text-xl font-extrabold text-[#1c1410]">はじめましょう</h1>
          <p className="mt-1 text-sm text-[#1c1410]/50">3つの数字で、あなたの1日予算がわかります</p>
        </div>

        {/* ステップインジケーター */}
        <div className="mb-6 flex gap-1.5 justify-center">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className="h-1.5 w-8 rounded-full transition-colors duration-300"
              style={{ background: i <= step && step < 3 ? 'var(--color-brand-primary)' : '#e5e7eb' }}
            />
          ))}
        </div>

        {/* ステップコンテンツ */}
        <div key={step} style={{ animation: 'slideIn 0.25s ease' }} className="rounded-2xl border-2 border-[#1c1410] bg-white p-6 space-y-5">
          {step === 0 && (
            <>
              <div className="flex items-center gap-2">
                <Calendar size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 className="font-extrabold text-[#1c1410]">給料日と月収を教えてください</h2>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold text-[#1c1410]/60 block mb-1">給料日</label>
                  <div className="flex items-center gap-2">
                    <input type="number" min={1} max={31} value={data.paydayDay}
                      onChange={(e) => setData(d => ({ ...d, paydayDay: Number(e.target.value) }))}
                      className="input-field w-24 text-center font-bold text-lg" />
                    <span className="text-sm font-bold text-[#1c1410]/60">日</span>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#1c1410]/60 block mb-1">月収（手取り）</label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-[#1c1410]/60">¥</span>
                    <input type="number" min={0} step={1000} value={data.monthlyIncome}
                      onChange={(e) => setData(d => ({ ...d, monthlyIncome: Number(e.target.value) }))}
                      className="input-field flex-1 font-bold" />
                  </div>
                </div>
              </div>
              <button type="button" onClick={() => setStep(1)} className="btn-candy w-full">
                <span>次へ</span><ChevronRight size={18} />
              </button>
            </>
          )}

          {step === 1 && (
            <>
              <div className="flex items-center gap-2">
                <Receipt size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 className="font-extrabold text-[#1c1410]">月の固定費を教えてください</h2>
              </div>
              <p className="text-xs text-[#1c1410]/50">家賃・光熱費・サブスクなど毎月出ていく金額の合計</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1c1410]/60">¥</span>
                <input type="number" min={0} step={1000} value={data.fixedExpenses}
                  onChange={(e) => setData(d => ({ ...d, fixedExpenses: Number(e.target.value) }))}
                  className="input-field flex-1 font-bold" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(0)} className="btn-ghost"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => setStep(2)} className="btn-candy flex-1">
                  <span>次へ</span><ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="flex items-center gap-2">
                <Wallet size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 className="font-extrabold text-[#1c1410]">今の残高を教えてください</h2>
              </div>
              <p className="text-xs text-[#1c1410]/50">銀行口座・財布の合計でだいたいの金額で大丈夫です</p>
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-[#1c1410]/60">¥</span>
                <input type="number" min={0} step={1000} value={data.totalAssets}
                  onChange={(e) => setData(d => ({ ...d, totalAssets: Number(e.target.value) }))}
                  className="input-field flex-1 font-bold" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(1)} className="btn-ghost"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => setStep(3)} className="btn-candy flex-1">
                  <span>計算する</span><ChevronRight size={18} />
                </button>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="flex items-center gap-2">
                <Banknote size={20} style={{ color: 'var(--color-brand-primary)' }} />
                <h2 className="font-extrabold text-[#1c1410]">あなたの1日予算</h2>
              </div>
              <div
                className="rounded-xl border-2 border-[#1c1410] py-5 text-center"
                style={{ background: 'var(--color-surface-subtle)', boxShadow: 'var(--shadow-pop-sm)' }}
              >
                <p className="text-xs font-bold text-[#1c1410]/50 mb-1">今日から給料日まで、1日に使えるお金</p>
                <p className="text-3xl font-extrabold text-[#1c1410]">{formatAmount(dailyBudget)}</p>
                <p className="text-xs text-[#1c1410]/40 mt-1">給料日まで あと {daysUntilPayday} 日</p>
              </div>
              <ul className="space-y-2 text-sm">
                <li className="flex justify-between">
                  <span className="text-[#1c1410]/60">給料日</span>
                  <span className="font-bold text-[#1c1410]">毎月 {data.paydayDay} 日</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#1c1410]/60">月収</span>
                  <span className="font-bold text-[#1c1410]">{formatAmount(data.monthlyIncome)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#1c1410]/60">固定費</span>
                  <span className="font-bold text-[#1c1410]">{formatAmount(data.fixedExpenses)}</span>
                </li>
                <li className="flex justify-between">
                  <span className="text-[#1c1410]/60">現在の残高</span>
                  <span className="font-bold text-[#1c1410]">{formatAmount(data.totalAssets)}</span>
                </li>
              </ul>
              <div className="flex gap-3">
                <button type="button" onClick={() => setStep(2)} className="btn-ghost"><ChevronLeft size={18} /></button>
                <button type="button" onClick={() => alert('保存されました！')} className="btn-candy flex-1">
                  <Check size={18} /><span>はじめる</span>
                </button>
              </div>
            </>
          )}
        </div>

        {step < 3 && (
          <button type="button" onClick={() => setStep(3)} className="mt-4 w-full text-center text-xs text-[#1c1410]/40 underline underline-offset-2">
            あとで設定する
          </button>
        )}
      </div>
    </div>
  )
}
