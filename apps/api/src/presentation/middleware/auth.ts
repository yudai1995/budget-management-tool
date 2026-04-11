import { createMiddleware } from 'hono/factory';
import { getSignedCookie } from 'hono/cookie';
import type { HonoEnv } from '../../app';

export const SESSION_COOKIE_NAME = 'session';

/**
 * セッションCookieを検証し、未認証リクエストを 403 で拒否するミドルウェア。
 * 認証済みの場合は context 変数 `userId` にログイン中のユーザーIDを設定する。
 */
export const createAuthMiddleware = (sessionSecret: string) =>
    createMiddleware<HonoEnv>(async (c, next) => {
        const userId = await getSignedCookie(c, sessionSecret, SESSION_COOKIE_NAME);
        if (!userId) {
            return c.json({ result: 'error', message: 'Auth Error' }, 403);
        }
        c.set('userId', userId);
        await next();
    });
