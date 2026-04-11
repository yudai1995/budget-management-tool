import { Hono } from 'hono';
import { createAuthMiddleware } from '../middleware/auth';
import type { AppDeps, HonoEnv } from '../../app';

export function createBudgetRoutes(deps: AppDeps, sessionSecret: string) {
    const { budgetRepository } = deps;
    const auth = createAuthMiddleware(sessionSecret);

    return new Hono<HonoEnv>()
        .get('/budget', auth, async (c) => {
            const budgets = await budgetRepository.all();
            return c.json({ budget: budgets });
        })
        .get('/budget/:id', auth, async (c) => {
            const budget = await budgetRepository.one(c.req.param('id'));
            if (!budget) {
                return c.json({ result: 'error', message: 'リソースが見つかりません' }, 404);
            }
            return c.json({ budget });
        })
        .post('/budget', auth, async (c) => {
            const body = await c.req.json<{ newData: unknown }>();
            const budget = await budgetRepository.save(body.newData);
            return c.json({ budget });
        })
        .put('/budget/:id', auth, async (c) => {
            const body = await c.req.json<{ newData: unknown }>();
            const budget = await budgetRepository.save(body.newData);
            return c.json({ budget });
        })
        .delete('/budget/:id', auth, async (c) => {
            await budgetRepository.remove(c.req.param('id'));
            return c.json({ result: 'success' });
        });
}
