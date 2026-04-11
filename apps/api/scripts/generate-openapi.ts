/**
 * OpenAPI スペックを packages/api-spec/openapi.yaml に書き出すスクリプト。
 *
 * 実行方法:
 *   pnpm --filter @budget/api run generate:openapi
 */
import * as fs from 'node:fs';
import * as path from 'node:path';
import { stringify } from 'yaml';
import { generateOpenAPIDocument } from '../src/openapi/spec';

const doc = generateOpenAPIDocument();
const outputPath = path.resolve(__dirname, '../../../packages/api-spec/openapi.yaml');

// 出力先ディレクトリを作成（存在しない場合）
fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, stringify(doc), 'utf-8');

console.log(`✅ OpenAPI spec generated: ${outputPath}`);
