import type { Application, NextFunction, Request, Response } from 'express'
// biome-ignore lint/suspicious/noExplicitAny: Vitest ESM環境でのCJS互換のためrequireを使用
const express: (...args: any[]) => Application = require('express')
// biome-ignore lint/suspicious/noExplicitAny: 同上
const bodyParser: any = require('body-parser')
import { loginSchema } from '@budget/common'
import { ValidationError } from './presentation/errors'
import { errorModel } from './domain/models/errorModel'
import {
    createBudgetRoutes,
    createExpenseRoutes,
    createLoginRoute,
    createUserRoutes,
    logoutRoute,
} from './presentation/routes/routes'
import type { BudgetController } from './presentation/controllers/BudgetController'
import type { ExpenseController } from './presentation/controllers/ExpenseController'
import type { UserController } from './presentation/controllers/UserController'

const session = require('express-session')

export type AppControllers = {
    budgetController: BudgetController
    expenseController: ExpenseController
    userController: UserController
}

export type AppOptions = {
    sessionSecret?: string
    sessionMaxAge?: number
}

export function createApp(
    controllers: AppControllers,
    options: AppOptions = {},
): Application {
    const { budgetController, expenseController, userController } = controllers
    const {
        sessionSecret = process.env.SESSION_KEY ?? 'test-secret',
        sessionMaxAge = 60 * 60 * 1000,
    } = options

    const app = express()

    const sessionOption = {
        secret: sessionSecret,
        resave: false,
        saveUninitialized: false,
        cookie: { maxAge: sessionMaxAge, secure: false },
    }

    if (app.get('env') === 'production') {
        app.set('trust proxy', 1)
        sessionOption.cookie.secure = true
    }

    app.use(bodyParser.json())
    app.use(session(sessionOption))

    const budgetRoutes = createBudgetRoutes(budgetController)
    const expenseRoutes = createExpenseRoutes(expenseController)
    const userRoutes = createUserRoutes(userController)
    const loginRoute = createLoginRoute(userController)

    // ログインルート
    app.post(loginRoute.route, async (req: Request, res: Response, next: NextFunction) => {
        const validation = loginSchema.safeParse({ userId: req.body.userId, password: req.body.password })
        if (!validation.success) {
            res.status(400).json({ result: 'error', message: validation.error.message })
            return
        }
        try {
            const result = await loginRoute.handler(req, res, next)
            req.session.login = req.body.userId
            if (result === errorModel.AUTHENTICATION_FAILD) {
                res.status(401).send({ result: 'failed', message: errorModel.AUTHENTICATION_FAILD })
            } else if (result === errorModel.NOT_FOUND) {
                res.status(403).send({ result: 'failed', message: errorModel.NOT_FOUND })
            } else if (result) {
                res.send({ result: 'success', userId: req.body.userId })
            } else {
                res.status(404).send('Something broke!')
            }
        } catch (err) {
            console.log(err)
            res.status(500).send({ result: 'error', message: 'Something broken' })
        }
    })

    // ログアウトルート
    app.post(logoutRoute.route, (req: Request, res: Response) => {
        if (req.session.login === undefined) {
            res.status(403).send({ result: 'error', message: 'Auth Error' })
            return
        }
        req.session.login = undefined
        res.status(200).send({ result: 'success', message: 'logout success' })
    })

    // Expenseルート（認証必須）
    expenseRoutes.forEach((route) => {
        ;(app as unknown as Record<string, Function>)[route.method](
            route.route,
            async (req: Request, res: Response, next: NextFunction) => {
                if (req.session.login === undefined) {
                    res.status(403).send({ result: 'error', message: 'Auth Error' })
                    return
                }
                try {
                    const expense = await route.handler(req, res, next)
                    res.send({ expense })
                } catch (err) {
                    if (err instanceof ValidationError) {
                        res.status(400).json({ result: 'error', message: err.details })
                        return
                    }
                    console.log(err)
                    res.status(500).send({ result: 'error', message: 'Something broken' })
                }
            },
        )
    })

    // Budgetルート（認証必須）
    budgetRoutes.forEach((route) => {
        ;(app as unknown as Record<string, Function>)[route.method](
            route.route,
            async (req: Request, res: Response, next: NextFunction) => {
                if (req.session.login === undefined) {
                    res.status(403).send({ result: 'error', message: 'Auth Error' })
                    return
                }
                try {
                    const result = await route.handler(req, res, next)
                    if (result !== null) {
                        res.send({ budget: result })
                    } else if (result !== undefined) {
                        res.status(200).send('success')
                    } else {
                        res.status(404).send('Something broke!')
                    }
                } catch (err) {
                    console.log(err)
                    res.status(500).send({ result: 'error', message: 'Something broken' })
                }
            },
        )
    })

    // Userルート（認証必須）
    userRoutes.forEach((route) => {
        ;(app as unknown as Record<string, Function>)[route.method](
            route.route,
            async (req: Request, res: Response, next: NextFunction) => {
                if (req.session.login === undefined) {
                    res.status(403).send({ result: 'error', message: 'Auth Error' })
                    return
                }
                try {
                    const result = await route.handler(req, res, next)
                    if (result !== null) {
                        if (route.action === 'all') {
                            ;(result as unknown[]).map((user) => {
                                delete (user as Record<string, unknown>).password
                                return user
                            })
                        } else if (route.action === 'one') {
                            delete (result as Record<string, unknown>).password
                        }
                        res.send({ user: result })
                    } else if (result === null) {
                        res.status(401).send({ result: 'Faild', message: 'not found' })
                    } else {
                        res.status(404).send({ result: 'Faild', message: 'not found' })
                    }
                } catch (err) {
                    console.log(err)
                    res.status(500).send({ result: 'error', message: 'Something broken' })
                }
            },
        )
    })

    return app
}
