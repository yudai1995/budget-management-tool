import type { NextFunction, Request, Response } from 'express'
import type { BudgetController } from '../controllers/BudgetController'
import type { ExpenseController } from '../controllers/ExpenseController'
import type { UserController } from '../controllers/UserController'

export type AppRouteMethod = 'get' | 'post' | 'put' | 'delete'

export type AppRoute = {
    method: AppRouteMethod
    route: string
    action: string
    // biome-ignore lint/suspicious/noExplicitAny: Expressハンドラの戻り値はPromise/void/任意の値を取るため意図的にany
    handler: (req: Request, res: Response, next: NextFunction) => any
}

export const createBudgetRoutes = (controller: BudgetController): AppRoute[] => [
    {
        method: 'get',
        route: '/api/budget',
        action: 'all',
        handler: (_req, _res, _next) => controller.all(),
    },
    {
        method: 'get',
        route: '/api/budget/:id',
        action: 'one',
        handler: (req, _res, _next) => controller.one(String(req.params.id)),
    },
    {
        method: 'post',
        route: '/api/budget',
        action: 'save',
        handler: (req, _res, _next) => controller.save(req.body.newData),
    },
    // TODO: add PUT ACTION
    {
        method: 'put',
        route: '/api/budget/:id',
        action: 'save',
        handler: (req, _res, _next) => controller.save(req.body.newData),
    },
    {
        method: 'delete',
        route: '/api/budget/:id',
        action: 'remove',
        handler: (req, _res, _next) => controller.remove(String(req.params.id)),
    },
]

export const createUserRoutes = (controller: UserController): AppRoute[] => [
    {
        method: 'get',
        route: '/api/user',
        action: 'all',
        handler: (_req, _res, _next) => controller.all(),
    },
    {
        method: 'get',
        route: '/api/user/:userId',
        action: 'one',
        handler: (req, _res, _next) => controller.one(String(req.params.userId)),
    },
    {
        method: 'post',
        route: '/api/user',
        action: 'save',
        handler: (req, _res, _next) => {
            const userId = String(req.params.userId ?? req.body.userId ?? '')
            return controller.save(userId, req.body.userName, req.body.password)
        },
    },
    // TODO: add PUT ACTION
    {
        method: 'put',
        route: '/api/user/:userId',
        action: 'save',
        handler: (req, _res, _next) => {
            const userId = String(req.params.userId ?? req.body.userId ?? '')
            return controller.save(userId, req.body.userName, req.body.password)
        },
    },
    {
        method: 'delete',
        route: '/api/user/:userId',
        action: 'remove',
        handler: (req, _res, _next) => controller.remove(String(req.params.userId)),
    },
]

export const createExpenseRoutes = (controller: ExpenseController): AppRoute[] => [
    {
        method: 'get',
        route: '/api/expense',
        action: 'all',
        handler: (_req, _res, _next) => controller.all(),
    },
    {
        method: 'get',
        route: '/api/expense/:id',
        action: 'one',
        handler: (req, _res, _next) => controller.one(String(req.params.id)),
    },
    {
        method: 'post',
        route: '/api/expense',
        action: 'save',
        handler: (req, _res, _next) => controller.save(req.body.newData),
    },
    {
        method: 'put',
        route: '/api/expense/:id',
        action: 'save',
        handler: (req, _res, _next) => controller.save(req.body.newData),
    },
    {
        method: 'delete',
        route: '/api/expense/:id',
        action: 'remove',
        handler: (req, _res, _next) => controller.remove(String(req.params.id)),
    },
]

export const createLoginRoute = (controller: UserController): AppRoute => ({
    method: 'post',
    route: '/api/login',
    action: 'login',
    handler: (req, _res, _next) => controller.login(String(req.body.userId), req.body.password),
})

export const logoutRoute = {
    method: 'post' as const,
    route: '/api/logout',
}
