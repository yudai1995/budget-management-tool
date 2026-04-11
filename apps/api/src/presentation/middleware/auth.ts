import { createMiddleware } from 'hono/factory';
import type { HonoEnv } from '../../app';
import type { TokenService } from '../../application/auth/TokenService';

/**
 * Bearer トークン（RS256 JWT）を検証するミドルウェア。
 * 検証成功時は context 変数 `userId` にログイン中のユーザーIDを設定する。
 */
export const createAuthMiddleware = (tokenService: TokenService) =>
    createMiddleware<HonoEnv>(async (c, next) => {
        const authorization = c.req.header('Authorization');
        if (!authorization?.startsWith('Bearer ')) {
            return c.json({ result: 'error', message: '認証が必要です' }, 401);
        }

        const token = authorization.slice(7);
        try {
            const payload = await tokenService.verifyAccessToken(token);
            c.set('userId', payload.sub);
            await next();
        } catch {
            return c.json({ result: 'error', message: '認証トークンが無効です' }, 401);
        }
    });
