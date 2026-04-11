/**
 * OpenAPIHono インスタンスのファクトリ。
 *
 * 全ルートはこのファクトリで生成したインスタンスを使用する。
 * defaultHook により、Zod バリデーション失敗時のレスポンス形式が統一され、
 * ルートごとに個別のエラーハンドラを書く必要がなくなる。
 */
import { OpenAPIHono } from '@hono/zod-openapi';
import type { HonoEnv } from '../app';

export function createOpenAPIApp() {
    return new OpenAPIHono<HonoEnv>({
        defaultHook: (result, c) => {
            if (!result.success) {
                const message = result.error.issues[0]?.message ?? 'バリデーションエラー';
                return c.json({ result: 'error' as const, message }, 400);
            }
        },
    });
}
