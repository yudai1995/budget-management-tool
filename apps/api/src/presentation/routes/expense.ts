import { Hono } from 'hono';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { createExpenseSchema } from '@budget/common';
import type { CreateExpenseInput } from '@budget/common';
import { CreateExpenseUseCase } from '../../application/use-cases/CreateExpenseUseCase';
import { createAuthMiddleware } from '../middleware/auth';
import type { AppDeps, HonoEnv } from '../../app';

/** POST /api/expense のリクエストボディスキーマ */
const createExpenseBodySchema = z.object({
    newData: createExpenseSchema,
});

export function createExpenseRoutes(deps: AppDeps, sessionSecret: string) {
    const { expenseRepository, userRepository } = deps;
    const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository, userRepository);
    const auth = createAuthMiddleware(sessionSecret);

    return new Hono<HonoEnv>()
        .get('/expense', auth, async (c) => {
            const expenses = await expenseRepository.findAll();
            return c.json({ expense: expenses });
        })
        .get('/expense/:id', auth, async (c) => {
            const expense = await expenseRepository.findById(c.req.param('id'));
            if (!expense) {
                return c.json({ result: 'error', message: 'リソースが見つかりません' }, 404);
            }
            return c.json({ expense });
        })
        .post(
            '/expense',
            auth,
            zValidator('json', createExpenseBodySchema, (result, c) => {
                if (!result.success) {
                    const { error } = result as unknown as { error: { message: string } };
                    return c.json({ result: 'error', message: error.message }, 400);
                }
            }),
            async (c) => {
                const { newData } = c.req.valid('json');
                const expense = await createExpenseUseCase.execute(newData as CreateExpenseInput);
                return c.json({ expense });
            }
        )
        .put(
            '/expense/:id',
            auth,
            zValidator('json', createExpenseBodySchema, (result, c) => {
                if (!result.success) {
                    const { error } = result as unknown as { error: { message: string } };
                    return c.json({ result: 'error', message: error.message }, 400);
                }
            }),
            async (c) => {
                const { newData } = c.req.valid('json');
                const expense = await createExpenseUseCase.execute(newData as CreateExpenseInput);
                return c.json({ expense });
            }
        )
        .delete('/expense/:id', auth, async (c) => {
            await expenseRepository.remove(c.req.param('id'));
            return c.json({ result: 'success' });
        });
}
