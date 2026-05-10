#!/usr/bin/env bash
# .github/hooks/ の実態スクリプトを実行する薄いラッパー
exec "$(git rev-parse --show-toplevel)/.github/hooks/enforce-flow.sh" "$@"
