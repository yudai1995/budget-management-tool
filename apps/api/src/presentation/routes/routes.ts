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
        handler: (req, res, next) => controller.all(req, res, next),
    },
    {
        method: 'get',
        route: '/api/budget/:id',
        action: 'one',
        handler: (req, res, next) => controller.one(req, res, next),
    },
    {
        method: 'post',
        route: '/api/budget',
        action: 'save',
        handler: (req, res, next) => controller.save(req, res, next),
    },
    // TODO: add PUT ACTION
    {
        method: 'put',
        route: '/api/budget/:id',
        action: 'save',
        handler: (req, res, next) => controller.save(req, res, next),
    },
    {
        method: 'delete',
        route: '/api/budget/:id',
        action: 'remove',
        handler: (req, res, next) => controller.remove(req, res, next),
    },
]

export const createUserRoutes = (controller: UserController): AppRoute[] => [
    {
        method: 'get',
        route: '/api/user',
        action: 'all',
        handler: (req, res, next) => controller.all(req, res, next),
    },
    {
        method: 'get',
        route: '/api/user/:userId',
        action: 'one',
        handler: (req, res, next) => controller.one(req, res, next),
    },
    {
        method: 'post',
        route: '/api/user',
        action: 'save',
        handler: (req, res, next) => controller.save(req, res, next),
    },
    // TODO: add PUT ACTION
    {
        method: 'put',
        route: '/api/user/:userId',
        action: 'save',
        handler: (req, res, next) => controller.save(req, res, next),
    },
    {
        method: 'delete',
        route: '/api/user/:userId',
        action: 'remove',
        handler: (req, res, next) => controller.remove(req, res, next),
    },
]

export const createExpenseRoutes = (controller: ExpenseController): AppRoute[] => [
    {
        method: 'get',
        route: '/api/expense',
        action: 'all',
        handler: (req, res, next) => controller.all(req, res, next),
    },
    {
        method: 'get',
        route: '/api/expense/:id',
        action: 'one',
        handler: (req, res, next) => controller.one(req, res, next),
    },
    {
        method: 'post',
        route: '/api/expense',
        action: 'save',
        handler: (req, res, next) => controller.save(req, res, next),
    },
    {
        method: 'put',
        route: '/api/expense/:id',
        action: 'save',
        handler: (req, res, next) => controller.save(req, res, next),
    },
    {
        method: 'delete',
        route: '/api/expense/:id',
        action: 'remove',
        handler: (req, res, next) => controller.remove(req, res, next),
    },
]

export const createLoginRoute = (controller: UserController): AppRoute => ({
    method: 'post',
    route: '/api/login',
    action: 'login',
    handler: (req, res, next) => controller.login(req, res, next),
})

export const logoutRoute = {
    method: 'post' as const,
    route: '/api/logout',
}
