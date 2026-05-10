/**
 * DailyBudgetCard プロトタイプ
 *
 * 「今日使えるお金」カードのピンチ度別 3 ステートを確認できる。
 * Issue #133 の信号機カラー設計を検証するためのページ。
 */

type PinchLevel = "safe" | "caution" | "danger";

type PinchStyle = {
  bg: string;
  border: string;
  heroColor: string;
  badgeBg: string;
  badgeText: string;
  label: string;
};

const PINCH_STYLES: Record<PinchLevel, PinchStyle> = {
  safe: {
    bg: "var(--color-safe-light, #eff6ff)",
    border: "var(--color-safe, #3b82f6)",
    heroColor: "var(--color-safe, #3b82f6)",
    badgeBg: "var(--color-safe, #3b82f6)",
    badgeText: "#ffffff",
    label: "余裕",
  },
  caution: {
    bg: "var(--color-caution-light, #fffbeb)",
    border: "var(--color-caution, #f59e0b)",
    heroColor: "var(--color-caution, #f59e0b)",
    badgeBg: "var(--color-caution, #f59e0b)",
    badgeText: "#1c1410",
    label: "注意",
  },
  danger: {
    bg: "var(--color-danger-light, #fef2f2)",
    border: "var(--color-danger, #ef4444)",
    heroColor: "var(--color-danger, #ef4444)",
    badgeBg: "var(--color-danger, #ef4444)",
    badgeText: "#ffffff",
    label: "ピンチ",
  },
};

function formatYen(amount: number): string {
  return `¥${Math.abs(amount).toLocaleString("ja-JP")}`;
}

type CardProps = {
  pinchLevel: PinchLevel;
  dailyBudget: number;
  todayExpense: number;
  daysUntilPayday: number;
};

function DailyBudgetCardDemo({ pinchLevel, dailyBudget, todayExpense, daysUntilPayday }: CardProps) {
  const style = PINCH_STYLES[pinchLevel];
  const remaining = dailyBudget - todayExpense;
  const isOverBudget = remaining < 0;

  return (
    <div
      className="rounded-2xl border-2 p-5"
      style={{
        background: style.bg,
        borderColor: style.border,
        boxShadow: "0 1px 4px 0 rgba(28, 20, 16, 0.07)",
      }}
    >
      {/* ヘッダー行 */}
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold text-[#1c1410]/60 uppercase tracking-wide">
          今日使えるお金
        </span>
        <span
          className="rounded-full px-2 py-0.5 text-xs font-bold"
          style={{ background: style.badgeBg, color: style.badgeText }}
        >
          {style.label}
        </span>
      </div>

      {/* ヒーローナンバー */}
      <div className="mb-4">
        <p
          className="text-4xl font-extrabold leading-none"
          style={{ color: isOverBudget ? "var(--color-danger, #ef4444)" : style.heroColor }}
        >
          {isOverBudget ? `-${formatYen(Math.abs(remaining))}` : formatYen(remaining)}
        </p>
        {isOverBudget && (
          <p className="mt-1 text-xs font-medium text-[#1c1410]/60">
            予算を{formatYen(Math.abs(remaining))}超過
          </p>
        )}
      </div>

      {/* 内訳行 */}
      <div className="flex items-center gap-3 text-xs text-[#1c1410]/60">
        <span>
          1日予算{" "}
          <span className="font-bold text-[#1c1410]/80">{formatYen(dailyBudget)}</span>
        </span>
        <span className="text-[#1c1410]/30">|</span>
        <span>
          本日支出{" "}
          <span className="font-bold text-[#1c1410]/80">{formatYen(todayExpense)}</span>
        </span>
      </div>

      {/* 給料日カウントダウン */}
      <div
        className="mt-3 pt-3 border-t flex items-center gap-1.5"
        style={{ borderColor: `${style.border}40` }}
      >
        <span
          className="inline-block h-1.5 w-1.5 rounded-full"
          style={{ background: style.heroColor }}
        />
        <span className="text-xs text-[#1c1410]/60">
          給料日まで{" "}
          <span className="font-bold text-[#1c1410]/80">あと{daysUntilPayday}日</span>
        </span>
      </div>
    </div>
  );
}

function FallbackCard() {
  return (
    <div
      className="rounded-2xl border-2 border-dashed p-5"
      style={{ borderColor: "#e8c8b0", background: "#fffdf5" }}
    >
      <p className="text-sm font-medium text-[#1c1410]/50 text-center">
        設定を完了すると「今日使えるお金」が表示されます
      </p>
    </div>
  );
}

export function DailyBudgetCardPrototype() {
  return (
    <div className="min-h-screen p-6" style={{ background: "var(--color-surface-subtle, #fffdf5)" }}>
      {/* ヘッダー */}
      <div className="mb-6 max-w-sm">
        <h1 className="text-xl font-extrabold text-[#1c1410]">DailyBudgetCard プロトタイプ</h1>
        <p className="mt-1 text-xs text-[#1c1410]/50">Issue #133 — 信号機カラーによるピンチ度表現</p>
      </div>

      <div className="flex flex-col gap-8 max-w-sm">
        {/* 余裕ステート */}
        <section>
          <p className="mb-2 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide">
            Safe（余裕）— 残予算 ≥ 80%
          </p>
          <DailyBudgetCardDemo
            pinchLevel="safe"
            dailyBudget={3200}
            todayExpense={300}
            daysUntilPayday={12}
          />
        </section>

        {/* 注意ステート */}
        <section>
          <p className="mb-2 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide">
            Caution（注意）— 残予算 20〜80%
          </p>
          <DailyBudgetCardDemo
            pinchLevel="caution"
            dailyBudget={3200}
            todayExpense={1800}
            daysUntilPayday={12}
          />
        </section>

        {/* ピンチステート */}
        <section>
          <p className="mb-2 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide">
            Danger（ピンチ）— 残予算 &lt; 20%
          </p>
          <DailyBudgetCardDemo
            pinchLevel="danger"
            dailyBudget={3200}
            todayExpense={3100}
            daysUntilPayday={12}
          />
        </section>

        {/* 予算超過ステート */}
        <section>
          <p className="mb-2 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide">
            Danger（予算超過）— 支出 &gt; 1日予算
          </p>
          <DailyBudgetCardDemo
            pinchLevel="danger"
            dailyBudget={3200}
            todayExpense={4500}
            daysUntilPayday={12}
          />
        </section>

        {/* 設定未完了フォールバック */}
        <section>
          <p className="mb-2 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide">
            未設定フォールバック
          </p>
          <FallbackCard />
        </section>

        {/* 給料日当日ステート */}
        <section>
          <p className="mb-2 text-xs font-bold text-[#1c1410]/50 uppercase tracking-wide">
            給料日当日（daysUntilPayday=1）
          </p>
          <DailyBudgetCardDemo
            pinchLevel="safe"
            dailyBudget={5000}
            todayExpense={200}
            daysUntilPayday={1}
          />
        </section>
      </div>
    </div>
  );
}
