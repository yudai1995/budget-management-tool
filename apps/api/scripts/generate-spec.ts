/**
 * OpenAPI スペック生成 CLI
 *
 * Hono App（createApp）のルート定義から openapi.yaml を自動出力する。
 * ハンドラは実行されないため、スタブ依存関係を使用する。
 *
 * 出力先: packages/api-spec/openapi.yaml
 *
 * 使い方:
 *   pnpm --filter @budget/api run generate:spec
 *
 * CI/pre-commit での使い方:
 *   pnpm --filter @budget/api run generate:spec && git diff --exit-code packages/api-spec/openapi.yaml
 *   （差分がある場合は非ゼロ終了 → コミット拒否）
 *
 * @see apps/api/src/openapi/spec.ts - generateOpenAPIDocument の実装
 * @see lefthook.yml - openapi-sync フックの定義
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { stringify } from 'yaml';
import { generateOpenAPIDocument } from '../src/openapi/spec';

const OUTPUT_PATH = path.resolve(__dirname, '../../../packages/api-spec/openapi.yaml');

function main(): void {
    console.log('🔄 OpenAPI スペックを生成中...');

    const doc = generateOpenAPIDocument();
    const yaml = stringify(doc);

    // 出力先ディレクトリを作成（存在しない場合）
    fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
    fs.writeFileSync(OUTPUT_PATH, yaml, 'utf-8');

    const lineCount = yaml.split('\n').length;
    console.log(`✅ OpenAPI スペックを出力しました`);
    console.log(`   出力先: ${OUTPUT_PATH}`);
    console.log(`   行数: ${lineCount} 行`);
    console.log('');
    console.log('次のステップ:');
    console.log('  フロントエンドの型を更新する場合は以下を実行:');
    console.log('  pnpm codegen');
}

main();
