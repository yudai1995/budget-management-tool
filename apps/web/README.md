# Web（Next.js）

[`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app) で作成した [Next.js](https://nextjs.org) アプリです。

## 開発サーバーの起動

モノレポのルートで `pnpm dev` を実行すると、他アプリとまとめて起動します。  
このパッケージ単体で動かす場合は次のとおりです。

```bash
pnpm dev
```

ブラウザで [http://localhost:3000](http://localhost:3000) を開いて確認できます。

## ページの編集

`app/page.tsx` を編集すると、保存に合わせて画面が更新されます。

フォントは [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) で [Geist](https://vercel.com/font) を読み込んでいます。

## 参考リンク

- [Next.js ドキュメント](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)（チュートリアル）
- [Next.js の GitHub](https://github.com/vercel/next.js)

## デプロイ

Vercel へのデプロイは [Vercel の案内](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) を参照してください。  
詳細は [Next.js のデプロイ手順](https://nextjs.org/docs/app/building-your-application/deploying) も参照できます。
