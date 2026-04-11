import { OpenApiGeneratorV3 } from '@asteasolutions/zod-to-openapi';
import { registry } from './registry';

/**
 * OpenAPI 3.0 ドキュメントを生成して返す。
 * generate-openapi.ts スクリプトおよび Swagger UI ルートから呼び出す。
 */
// biome-ignore lint/suspicious/noExplicitAny: OpenAPIObject 型は Record<string, unknown> に変換できないため
export function generateOpenAPIDocument(): any {
    const generator = new OpenApiGeneratorV3(registry.definitions);

    return generator.generateDocument({
        openapi: '3.0.0',
        info: {
            version: '1.0.0',
            title: '家計簿管理ツール API',
            description: '支出（Expense）の登録・管理を行う REST API。セッション Cookie による認証が必要。',
        },
        servers: [{ url: 'http://localhost:3001', description: 'ローカル開発' }],
    });
}
