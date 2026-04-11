import { Hono } from 'hono';
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { deleteCookie, getSignedCookie, setSignedCookie } from 'hono/cookie';
import { loginSchema } from '@budget/common';
import { errorModel } from '../../domain/models/errorModel';
import { SESSION_COOKIE_NAME } from '../middleware/auth';
import type { AppDeps, HonoEnv } from '../../app';

const SESSION_MAX_AGE_SECONDS = 60 * 60; // 1時間
const GUEST_USER_ID = 'Guest';

export function createAuthRoutes(deps: AppDeps, sessionSecret: string) {
    const { userRepository } = deps;

    /** セッション Cookie を発行する共通処理 */
    const issueSession = async (c: Context<HonoEnv>, userId: string) => {
        await setSignedCookie(c, SESSION_COOKIE_NAME, userId, sessionSecret, {
            httpOnly: true,
            maxAge: SESSION_MAX_AGE_SECONDS,
            path: '/',
            secure: false,
        });
    };

    return new Hono<HonoEnv>()
        .post(
            '/login',
            zValidator('json', loginSchema, (result, c) => {
                if (!result.success) {
                    const { error } = result as unknown as { error: { message: string } };
                    return c.json({ result: 'error', message: error.message }, 400);
                }
            }),
            async (c) => {
                const { userId, password } = c.req.valid('json');
                try {
                    const loginResult = await userRepository.login(userId, password);

                    if (loginResult === errorModel.NOT_FOUND) {
                        return c.json({ result: 'failed', message: errorModel.NOT_FOUND }, 403);
                    }
                    if (loginResult === errorModel.AUTHENTICATION_FAILD) {
                        return c.json({ result: 'failed', message: errorModel.AUTHENTICATION_FAILD }, 401);
                    }

                    await issueSession(c, userId);
                    return c.json({ result: 'success', userId });
                } catch (err) {
                    console.error('[POST /login]', err);
                    return c.json({ result: 'error', message: 'Something broken' }, 500);
                }
            }
        )
        .post('/guest-login', async (c) => {
            // ゲストログインはパスワード不要。ゲストユーザーの存在確認のみ行う。
            try {
                const guest = await userRepository.one(GUEST_USER_ID);
                if (!guest) {
                    return c.json({ result: 'error', message: 'ゲストユーザーが存在しません' }, 404);
                }
                await issueSession(c, GUEST_USER_ID);
                return c.json({ result: 'success', userId: GUEST_USER_ID });
            } catch (err) {
                console.error('[POST /guest-login]', err);
                return c.json({ result: 'error', message: 'Something broken' }, 500);
            }
        })
        .post('/logout', async (c) => {
            const userId = await getSignedCookie(c, sessionSecret, SESSION_COOKIE_NAME);
            if (!userId) {
                return c.json({ result: 'error', message: 'Auth Error' }, 403);
            }
            deleteCookie(c, SESSION_COOKIE_NAME, { path: '/' });
            return c.json({ result: 'success', message: 'logout success' });
        });
}
