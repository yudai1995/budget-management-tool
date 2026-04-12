/** @type {import('tailwindcss').Config} */
/**
 * モノリポ共通 Tailwind CSS 設計トークン定義。
 *
 * 【重要】apps/web は Tailwind v4 を採用しており、このファイルは直接読み込まれない。
 * v4 では CSS ベースの設定（globals.css の @theme ブロック）が優先される。
 * このファイルはデザイントークンの「定義一覧」として参照用に維持する。
 * packages/ui 等の v3 互換ライブラリを追加した場合に有効となる。
 *
 * CSS 変数の実体は apps/web/src/app/globals.css の :root ブロックで定義。
 * scripts/sync-tokens.ts により Figma Variables から自動生成・更新される。
 */
module.exports = {
  content: [
    "./apps/**/*.{js,ts,jsx,tsx}",
    "./packages/ui/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Figma Variables から変換された CSS 変数を参照
        brand: {
          primary: 'var(--color-brand-primary)',
          secondary: 'var(--color-brand-secondary)',
        },
        surface: {
          default: 'var(--color-surface-default)',
          subtle: 'var(--color-surface-subtle)',
        },
        // 支出・収入の意味的カラー
        expense: {
          DEFAULT: 'var(--color-expense)',
          light: 'var(--color-expense-light)',
        },
        income: {
          DEFAULT: 'var(--color-income)',
          light: 'var(--color-income-light)',
        },
      },
      spacing: {
        // レイアウトの一貫性を保つためのトークン
        'ds-padding': 'var(--spacing-md)',
        'ds-gap': 'var(--spacing-sm)',
      },
      borderRadius: {
        'ds-button': 'var(--radius-full)',
        'ds-card': 'var(--radius-card)',
      },
      fontFamily: {
        sans: ['var(--font-sans)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
