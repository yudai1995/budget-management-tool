# /branch

1. `git rev-parse --abbrev-ref HEAD` で現在のブランチを確認。
2. main/masterブランチの場合、ユーザーの指示から短い英語のslug（例: feat-create-expense）を生成。
3. `git checkout -b {slug}` を実行して作業ブランチに切り替える。
