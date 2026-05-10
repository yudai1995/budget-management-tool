# Web（Next.js）

[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) で作成した [Next.js](https://nextjs.org) アプリです。

## 開発サーバーの起動

モノレポのルートで `pnpm dev` を実行すると、他アプリとまとめて起動します。
このパッケージ単体で動かす場合は次のとおりです。

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## Storybook（デザインカタログ）

`components/common/` に定義した共通 UI コンポーネントをブラウザで確認できます。

### PC ブラウザで開く

```bash
pnpm storybook
```

→ [http://localhost:6006](http://localhost:6006)

### スマートフォン・タブレットから確認する

`--host 0.0.0.0` オプションでローカルネットワーク全体に公開します。

```bash
pnpm storybook:network
```

起動後、**同一 Wi-Fi ネットワーク上のスマホ**から `http://<PCのローカルIP>:6006/` でアクセスできます。
PC のローカル IP は `ipconfig getifaddr en0`（Mac）で確認できます。

### 静的ビルド（CI・GitHub Pages）

```bash
pnpm build-storybook
# → storybook-static/ に出力される
```

`main` ブランチへのマージ時に GitHub Actions が自動的に GitHub Pages へデプロイします（`.github/workflows/storybook-deploy.yml`）。

### カタログの構成

| タイトル | コンポーネント | 概要 |
|---|---|---|
| Common/Button | `Button.tsx` | primary / secondary / ghost / destructive × sm/md/lg |
| Common/Badge | `Badge.tsx` | safe / caution / danger / income / expense バリアント |
| Common/Tooltip | `Tooltip.tsx` | ホバーツールチップ |
| Common/SecurityBadges | `SecurityBadges.tsx` | 暗号化通信・匿名利用バッジ |
| Common/Skeleton | `Skeleton.tsx` | ローディングスケルトン |
| Dashboard/DailyBudgetCard | `DailyBudgetCard.tsx` | 現行の「今日使えるお金」カード |
| Catalog/DailyBudgetCardV2 | `DailyBudgetCardV2.tsx` | Pattern D パレット候補版（#247 実装前の確認用） |

### 新しいストーリーを追加するには

`src/components/**/*.stories.tsx` として配置するだけで自動検出されます。

```
src/components/
  common/
    Button.tsx
    Button.stories.tsx   ← ここに置く
```

## ページの編集

`app/page.tsx` を編集すると、保存に合わせて画面が更新されます。

フォントは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) で [Geist](https://vercel.com/font) を読み込んでいます。

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Storybook ドキュメント](https://storybook.js.org/docs)
