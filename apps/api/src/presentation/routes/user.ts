import { Hono } from 'hono';
import { createAuthMiddleware } from '../middleware/auth';
import type { TokenService } from '../../application/auth/TokenService';
import type { User } from '../../domain/models/User';
import type { AppDeps, HonoEnv } from '../../app';

/** パスワードフィールドを除去してユーザー情報を返す */
function sanitizeUser({ userId, userName }: User): Omit<User, 'password'> {
    return { userId, userName };
}

export function createUserRoutes(deps: AppDeps, tokenService: TokenService) {
    const { userRepository } = deps;
    const auth = createAuthMiddleware(tokenService);

    return new Hono<HonoEnv>()
        .get('/user', auth, async (c) => {
            const users = await userRepository.all();
            return c.json({ user: users.map(sanitizeUser) });
        })
        .get('/user/:userId', auth, async (c) => {
            const user = await userRepository.one(c.req.param('userId'));
            if (!user) {
                return c.json({ result: 'Faild', message: 'not found' }, 401);
            }
            return c.json({ user: sanitizeUser(user) });
        })
        .post('/user', auth, async (c) => {
            const body = await c.req.json<{ userId?: string; userName: string; password: string }>();
            const userId = body.userId ?? '';
            const user = await userRepository.save(userId, body.userName, body.password);
            return c.json({ user: sanitizeUser(user) });
        })
        .put('/user/:userId', auth, async (c) => {
            const body = await c.req.json<{ userName: string; password: string }>();
            const userId = c.req.param('userId');
            const user = await userRepository.save(userId, body.userName, body.password);
            return c.json({ user: sanitizeUser(user) });
        })
        .delete('/user/:userId', auth, async (c) => {
            await userRepository.remove(c.req.param('userId'));
            return c.json({ result: 'success' });
        });
}
