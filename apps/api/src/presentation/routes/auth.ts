import { Hono } from 'hono';
import type { Context } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { loginSchema } from '@budget/common';
import { errorModel } from '../../domain/models/errorModel';
import type { TokenService } from '../../application/auth/TokenService';
import type { AppDeps, HonoEnv } from '../../app';

const GUEST_USER_ID = 'Guest';

/** ログイン成功時のトークンペアをレスポンスする共通処理 */
async function respondWithTokens(c: Context<HonoEnv>, userId: string, tokenService: TokenService) {
    const [accessToken, refreshToken] = await Promise.all([
        tokenService.signAccessToken(userId),
        tokenService.issueRefreshToken(userId),
    ]);
    return c.json({ result: 'success', accessToken, refreshToken, userId });
}

export function createAuthRoutes(deps: AppDeps, tokenService: TokenService) {
    const { userRepository } = deps;

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
                    if (loginResult === errorModel.NOT_FOUND || loginResult === errorModel.AUTHENTICATION_FAILD) {
                        // 詳細な失敗理由は返さない（攻撃者へのヒントを排除）
                        return c.json({ result: 'error', message: '認証に失敗しました' }, 401);
                    }
                    return respondWithTokens(c, userId, tokenService);
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
                return respondWithTokens(c, GUEST_USER_ID, tokenService);
            } catch (err) {
                console.error('[POST /guest-login]', err);
                return c.json({ result: 'error', message: 'Something broken' }, 500);
            }
        })
        .post('/refresh', async (c) => {
            try {
                const body = await c.req.json<{ refreshToken?: unknown }>();
                if (typeof body.refreshToken !== 'string') {
                    return c.json({ result: 'error', message: 'refreshToken が必要です' }, 400);
                }
                const tokens = await tokenService.rotateRefreshToken(body.refreshToken);
                return c.json({ result: 'success', ...tokens });
            } catch (err) {
                const msg = err instanceof Error ? err.message : '';
                if (msg === 'REFRESH_TOKEN_REUSE_DETECTED') {
                    // 全セッション無効化済み
                    return c.json({ result: 'error', message: '不正なトークンが検出されました' }, 401);
                }
                if (msg === 'REFRESH_TOKEN_EXPIRED' || msg === 'INVALID_REFRESH_TOKEN') {
                    return c.json({ result: 'error', message: 'トークンが無効です。再ログインしてください' }, 401);
                }
                console.error('[POST /refresh]', err);
                return c.json({ result: 'error', message: 'Something broken' }, 500);
            }
        })
        .post('/logout', async (c) => {
            try {
                const body = await c.req.json<{ refreshToken?: unknown }>();
                if (typeof body.refreshToken === 'string') {
                    await tokenService.revokeRefreshToken(body.refreshToken);
                }
                return c.json({ result: 'success', message: 'ログアウトしました' });
            } catch (err) {
                console.error('[POST /logout]', err);
                return c.json({ result: 'error', message: 'Something broken' }, 500);
            }
        });
}
