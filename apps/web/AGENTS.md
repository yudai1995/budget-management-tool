<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

## UI/UX 変更前に必ず確認すること

`src/components/` または `src/app/` に新規コンポーネントや画面デザインの変更を加える場合は、
**先に `apps/sandbox/` でプロトタイプを作成し、ユーザーのレビューを得てから本番実装すること。**

ルールの詳細: [`apps/sandbox/AGENTS.md`](../sandbox/AGENTS.md)
