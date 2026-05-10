/**
 * DailyBudgetCard カラーパレット比較プロトタイプ
 *
 * Section 1 — 既存3パターン（オレンジ/黄系CAUTION）
 * - Pattern A: ブランドオレンジ = CAUTION セマンティクス化
 * - Pattern B: アース系エスカレーション
 * - Pattern C: ニュートラル → オレンジ → レッド
 *
 * Section 2 — CAUTION色候補（オレンジ・黄から離れた注意感）
 * - Pattern D: Rose（ローズ #f43f5e）
 * - Pattern E: Violet（バイオレット #8b5cf6）
 * - Pattern F: Cerulean（セルリアン #0284c7）
 */

import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

type PinchLevel = "safe" | "caution" | "danger";

type PinchStyle = {
  bg: string;
  border: string;
  heroColor: string;
  badgeBg: string;
  badgeText: string;
  label: string;
};

type Palette = {
  name: string;
  description: string;
  styles: Record<PinchLevel, PinchStyle>;
};

const PALETTE_A: Palette = {
  name: "Pattern A",
  description: "ブランドオレンジ = CAUTION\n収入ティールをSAFEに転用",
  styles: {
    safe: {
      bg: "#f0faf9",
      border: "#2bb5a0",
      heroColor: "#1a6b62",
      badgeBg: "#2bb5a0",
      badgeText: "#ffffff",
      label: "余裕",
    },
    caution: {
      bg: "#fff6ee",
      border: "#f18840",
      heroColor: "#c05a10",
      badgeBg: "#f18840",
      badgeText: "#ffffff",
      label: "注意",
    },
    danger: {
      bg: "#fef2f2",
      border: "#f87171",
      heroColor: "#b91c1c",
      badgeBg: "#f87171",
      badgeText: "#ffffff",
      label: "ピンチ",
    },
  },
};

const PALETTE_B: Palette = {
  name: "Pattern B",
  description: "アース系エスカレーション\n全ステートが暖色・落ち着いたトーン",
  styles: {
    safe: {
      bg: "#fafaf7",
      border: "#a3b18a",
      heroColor: "#4a7c5f",
      badgeBg: "#a3b18a",
      badgeText: "#ffffff",
      label: "余裕",
    },
    caution: {
      bg: "#fff8ed",
      border: "#d97706",
      heroColor: "#92400e",
      badgeBg: "#d97706",
      badgeText: "#ffffff",
      label: "注意",
    },
    danger: {
      bg: "#fff1ee",
      border: "#c2410c",
      heroColor: "#9a2e0c",
      badgeBg: "#c2410c",
      badgeText: "#ffffff",
      label: "ピンチ",
    },
  },
};

const PALETTE_C: Palette = {
  name: "Pattern C",
  description: "ニュートラル → オレンジ → レッド\nSAFEが静かでCAUTIONの登場に重みをもたせる",
  styles: {
    safe: {
      bg: "#f8fafc",
      border: "#64748b",
      heroColor: "#334155",
      badgeBg: "#64748b",
      badgeText: "#ffffff",
      label: "余裕",
    },
    caution: {
      bg: "#fff6ee",
      border: "#f18840",
      heroColor: "#c05a10",
      badgeBg: "#f18840",
      badgeText: "#ffffff",
      label: "注意",
    },
    danger: {
      bg: "#fef2f2",
      border: "#ef4444",
      heroColor: "#b91c1c",
      badgeBg: "#ef4444",
      badgeText: "#ffffff",
      label: "ピンチ",
    },
  },
};

// SAFE/DANGER は Pattern A と共通。CAUTION色のみ変える
const SHARED_SAFE: PinchStyle = {
  bg: "#f0faf9",
  border: "#2bb5a0",
  heroColor: "#1a6b62",
  badgeBg: "#2bb5a0",
  badgeText: "#ffffff",
  label: "余裕",
};
const SHARED_DANGER: PinchStyle = {
  bg: "#fef2f2",
  border: "#f87171",
  heroColor: "#b91c1c",
  badgeBg: "#f87171",
  badgeText: "#ffffff",
  label: "ピンチ",
};

const PALETTE_D: Palette = {
  name: "Pattern D — Rose",
  description: "SAFE: ウォームグレー（目立たない通常色）\nCAUTION: コーラル #f87171 / DANGER: ローズ #f43f5e（濃くエスカレート）",
  styles: {
    safe: {
      bg: "#fafaf8",
      border: "#c4b5a5",
      heroColor: "#6b5b52",
      badgeBg: "#c4b5a5",
      badgeText: "#ffffff",
      label: "余裕",
    },
    caution: {
      bg: "#fef2f2",
      border: "#f87171",
      heroColor: "#b91c1c",
      badgeBg: "#f87171",
      badgeText: "#ffffff",
      label: "注意",
    },
    danger: {
      bg: "#fff1f2",
      border: "#f43f5e",
      heroColor: "#9f1239",
      badgeBg: "#f43f5e",
      badgeText: "#ffffff",
      label: "ピンチ",
    },
  },
};

const PALETTE_E: Palette = {
  name: "Pattern E — Violet",
  description: "CAUTION: バイオレット #8b5cf6\n完全に別ヒュー。金融アプリでの「通知・注意」色として実績あり",
  styles: {
    safe: SHARED_SAFE,
    caution: {
      bg: "#f5f3ff",
      border: "#8b5cf6",
      heroColor: "#5b21b6",
      badgeBg: "#8b5cf6",
      badgeText: "#ffffff",
      label: "注意",
    },
    danger: SHARED_DANGER,
  },
};

const PALETTE_F: Palette = {
  name: "Pattern F — Cerulean",
  description: "CAUTION: セルリアン #0284c7\nクール系で注意より「情報提示」寄り。収入ティールとは別トーン",
  styles: {
    safe: SHARED_SAFE,
    caution: {
      bg: "#eff8ff",
      border: "#0284c7",
      heroColor: "#075985",
      badgeBg: "#0284c7",
      badgeText: "#ffffff",
      label: "注意",
    },
    danger: SHARED_DANGER,
  },
};

const PALETTES = [PALETTE_A, PALETTE_B, PALETTE_C];
const PALETTE_CANDIDATES = [PALETTE_D, PALETTE_E, PALETTE_F];

type CardProps = {
  pinchLevel: PinchLevel;
  style: PinchStyle;
  dailyBudget: number;
  todayExpense: number;
  daysUntilPayday: number;
};

function MiniCard({ style, dailyBudget, todayExpense, daysUntilPayday }: Omit<CardProps, "pinchLevel">) {
  const remaining = dailyBudget - todayExpense;
  const isOverBudget = remaining < 0;

  return (
    <div
      className="rounded-xl border-2 p-4"
      style={{
        background: style.bg,
        borderColor: style.border,
        boxShadow: "0 1px 4px 0 rgba(28,20,16,0.07)",
      }}
    >
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-[10px] font-bold text-[#1c1410]/50 uppercase tracking-wide">
          今日使えるお金
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-[10px] font-bold"
          style={{ background: style.badgeBg, color: style.badgeText }}
        >
          {style.label}
        </span>
      </div>

      {/* ヒーローナンバー */}
      <p
        className="text-2xl font-extrabold leading-none mb-3"
        style={{
          color: isOverBudget ? "#b91c1c" : style.heroColor,
        }}
      >
        {isOverBudget
          ? `-¥${Math.abs(remaining).toLocaleString("ja-JP")}`
          : `¥${remaining.toLocaleString("ja-JP")}`}
      </p>

      {/* 内訳 */}
      <div className="flex items-center gap-2 text-[10px] text-[#1c1410]/50">
        <span>1日予算 <span className="font-bold text-[#1c1410]/70">¥{dailyBudget.toLocaleString()}</span></span>
        <span className="text-[#1c1410]/20">|</span>
        <span>支出 <span className="font-bold text-[#1c1410]/70">¥{todayExpense.toLocaleString()}</span></span>
      </div>

      {/* 給料日カウント */}
      <div
        className="mt-2 pt-2 border-t flex items-center gap-1"
        style={{ borderColor: `${style.border}40` }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
          style={{ background: style.heroColor }}
        />
        <span className="text-[10px] text-[#1c1410]/50">
          給料日まで <span className="font-bold text-[#1c1410]/70">あと{daysUntilPayday}日</span>
        </span>
      </div>
    </div>
  );
}

const CARD_CASES: { pinchLevel: PinchLevel; dailyBudget: number; todayExpense: number; daysUntilPayday: number; label: string }[] = [
  { pinchLevel: "safe",    dailyBudget: 3200, todayExpense: 300,  daysUntilPayday: 12, label: "SAFE（余裕 ≥ 80%）" },
  { pinchLevel: "caution", dailyBudget: 3200, todayExpense: 1800, daysUntilPayday: 12, label: "CAUTION（20〜80%）" },
  { pinchLevel: "danger",  dailyBudget: 3200, todayExpense: 3100, daysUntilPayday: 12, label: "DANGER（< 20%）" },
];

export function DailyBudgetCardPalettePrototype() {
  return (
    <div
      className="min-h-screen p-6"
      style={{ background: "var(--color-surface-subtle, #fffdf5)" }}
    >
      {/* ナビ */}
      <Link
        to="/"
        className="inline-flex items-center gap-1 text-xs text-[#1c1410]/50 hover:text-[#f18840] mb-6 transition-colors"
      >
        <ArrowLeft size={13} />
        ギャラリーに戻る
      </Link>

      {/* ヘッダー */}
      <div className="mb-8">
        <h1 className="text-xl font-extrabold text-[#1c1410]">カラーパレット比較</h1>
        <p className="mt-1 text-xs text-[#1c1410]/50">
          DailyBudgetCard — SAFE / CAUTION / DANGER のパレット比較
        </p>
      </div>

      {/* Section 1: 既存パターン */}
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xs font-extrabold text-[#1c1410]/30 uppercase tracking-widest">
          Section 1 — 既存パターン（オレンジ/黄系 CAUTION）
        </span>
        <span className="flex-1 h-px bg-[#1c1410]/10" />
      </div>

      {/* パレット比較テーブル */}
      <div className="flex flex-col gap-12">
        {PALETTES.map((palette) => (
          <section key={palette.name}>
            {/* パレットヘッダー */}
            <div className="mb-4 pb-3 border-b border-[#1c1410]/10">
              <h2 className="text-base font-extrabold text-[#1c1410]">{palette.name}</h2>
              <p className="mt-0.5 text-xs text-[#1c1410]/50 whitespace-pre-line">
                {palette.description}
              </p>

              {/* カラーチップ */}
              <div className="mt-2 flex gap-2">
                {(["safe", "caution", "danger"] as PinchLevel[]).map((level) => (
                  <div key={level} className="flex items-center gap-1">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-[#1c1410]/10"
                      style={{ background: palette.styles[level].border }}
                    />
                    <span className="text-[10px] text-[#1c1410]/50">{palette.styles[level].border}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* カード3枚横並び */}
            <div className="grid grid-cols-3 gap-3">
              {CARD_CASES.map((c) => (
                <div key={c.pinchLevel}>
                  <p className="mb-1.5 text-[10px] font-bold text-[#1c1410]/40 uppercase tracking-wide">
                    {c.label}
                  </p>
                  <MiniCard
                    pinchLevel={c.pinchLevel}
                    style={palette.styles[c.pinchLevel]}
                    dailyBudget={c.dailyBudget}
                    todayExpense={c.todayExpense}
                    daysUntilPayday={c.daysUntilPayday}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Section 2: CAUTION色候補 */}
      <div className="mt-14 mb-3 flex items-center gap-3">
        <span className="text-xs font-extrabold text-[#f18840] uppercase tracking-widest">
          Section 2 — CAUTION色候補（オレンジ・黄から離れた注意感）
        </span>
        <span className="flex-1 h-px bg-[#f18840]/20" />
      </div>
      <p className="mb-8 text-xs text-[#1c1410]/40">
        SAFE / DANGER は Section 1 の Pattern A と共通。CAUTION 色のみを差し替えて比較。
      </p>

      <div className="flex flex-col gap-12">
        {PALETTE_CANDIDATES.map((palette) => (
          <section key={palette.name}>
            <div className="mb-4 pb-3 border-b border-[#1c1410]/10">
              <h2 className="text-base font-extrabold text-[#1c1410]">{palette.name}</h2>
              <p className="mt-0.5 text-xs text-[#1c1410]/50 whitespace-pre-line">
                {palette.description}
              </p>
              <div className="mt-2 flex gap-2">
                {(["safe", "caution", "danger"] as PinchLevel[]).map((level) => (
                  <div key={level} className="flex items-center gap-1">
                    <span
                      className="inline-block h-4 w-4 rounded-full border border-[#1c1410]/10"
                      style={{ background: palette.styles[level].border }}
                    />
                    <span className="text-[10px] text-[#1c1410]/50">{palette.styles[level].border}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {CARD_CASES.map((c) => (
                <div key={c.pinchLevel}>
                  <p className="mb-1.5 text-[10px] font-bold text-[#1c1410]/40 uppercase tracking-wide">
                    {c.label}
                  </p>
                  <MiniCard
                    pinchLevel={c.pinchLevel}
                    style={palette.styles[c.pinchLevel]}
                    dailyBudget={c.dailyBudget}
                    todayExpense={c.todayExpense}
                    daysUntilPayday={c.daysUntilPayday}
                  />
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* 現行との比較 */}
      <section className="mt-12">
        <div className="mb-4 pb-3 border-b border-[#1c1410]/10">
          <h2 className="text-base font-extrabold text-[#1c1410]">現行（Before）</h2>
          <p className="mt-0.5 text-xs text-[#1c1410]/50">
            青 / 黄amber / 赤 — CAUTION がブランドオレンジと競合している状態
          </p>
          <div className="mt-2 flex gap-2">
            {[["#3b82f6", "safe"], ["#f59e0b", "caution"], ["#ef4444", "danger"]].map(([color, label]) => (
              <div key={label} className="flex items-center gap-1">
                <span className="inline-block h-4 w-4 rounded-full border border-[#1c1410]/10" style={{ background: color }} />
                <span className="text-[10px] text-[#1c1410]/50">{color}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {[
            { pinchLevel: "safe" as PinchLevel, style: { bg: "#eff6ff", border: "#3b82f6", heroColor: "#3b82f6", badgeBg: "#3b82f6", badgeText: "#fff", label: "余裕" }, todayExpense: 300 },
            { pinchLevel: "caution" as PinchLevel, style: { bg: "#fffbeb", border: "#f59e0b", heroColor: "#f59e0b", badgeBg: "#f59e0b", badgeText: "#1c1410", label: "注意" }, todayExpense: 1800 },
            { pinchLevel: "danger" as PinchLevel, style: { bg: "#fef2f2", border: "#ef4444", heroColor: "#ef4444", badgeBg: "#ef4444", badgeText: "#fff", label: "ピンチ" }, todayExpense: 3100 },
          ].map((c) => (
            <div key={c.pinchLevel}>
              <p className="mb-1.5 text-[10px] font-bold text-[#1c1410]/40 uppercase tracking-wide">
                {CARD_CASES.find(x => x.pinchLevel === c.pinchLevel)?.label}
              </p>
              <MiniCard
                pinchLevel={c.pinchLevel}
                style={c.style}
                dailyBudget={3200}
                todayExpense={c.todayExpense}
                daysUntilPayday={12}
              />
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
