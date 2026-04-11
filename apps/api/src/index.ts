import * as express from 'express';
import * as bodyParser from 'body-parser';
import type { NextFunction, Request, Response } from 'express';
import { AppDataSource } from './infrastructure/persistence/data-source';
import {
    createBudgetRoutes,
    createExpenseRoutes,
    createLoginRoute,
    createUserRoutes,
    logoutRoute,
} from './presentation/routes/routes';
import { loginSchema } from '@budget/common';
import { ValidationError } from './presentation/errors';
const path = require('path');
import { errorModel } from './domain/models/errorModel';
const Router = require('express');
const router = Router();
const session = require('express-session');
import { TypeORMBudgetRepository } from './infrastructure/persistence/TypeORMBudgetRepository';
import { TypeORMExpenseRepository } from './infrastructure/persistence/TypeORMExpenseRepository';
import { TypeORMUserRepository } from './infrastructure/persistence/TypeORMUserRepository';
import { CreateExpenseUseCase } from './application/use-cases/CreateExpenseUseCase';
import { BudgetController } from './presentation/controllers/BudgetController';
import { ExpenseController } from './presentation/controllers/ExpenseController';
import { UserController } from './presentation/controllers/UserController';

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}

const port = process.env.PORT || 5000;

//初期設定　sessionの設定
const sessionOption = {
    secret: process.env.SESSION_KEY, //本番環境ではわかりにくいキーを設定すること
    resave: false, //trueにするとsessionに変更がなくても強制的に保存　通常false
    saveUninitialized: false, //trueにすると初期はされていなくても保存 通常false
    cookie: { maxAge: 60 * 60 * 1000, secure: false }, //cookieの寿命　単位はミリ秒
};

AppDataSource.initialize()
    .then(async () => {
        // create express app
        const app = express();
        if (app.get('env') === 'production') {
            app.set('trust proxy', 1);
            sessionOption.cookie.secure = true;
        }

        app.use(bodyParser.json());
        app.use(session(sessionOption));

        // --- DDD wiring（composition root）---
        const budgetRepository = new TypeORMBudgetRepository(AppDataSource);
        const userRepository = new TypeORMUserRepository(AppDataSource);
        const expenseRepository = new TypeORMExpenseRepository(AppDataSource);
        const createExpenseUseCase = new CreateExpenseUseCase(expenseRepository, userRepository);
        const budgetController = new BudgetController(budgetRepository);
        const expenseController = new ExpenseController(expenseRepository, createExpenseUseCase);
        const userController = new UserController(userRepository);

        const budgetRoutes = createBudgetRoutes(budgetController);
        const expenseRoutes = createExpenseRoutes(expenseController);
        const userRoutes = createUserRoutes(userController);
        const loginRoute = createLoginRoute(userController);

        app.post(loginRoute.route, (req: Request, res: Response, next: NextFunction) => {
            const validation = loginSchema.safeParse({ userId: req.body.userId, password: req.body.password });
            if (!validation.success) {
                res.status(400).json({ result: 'error', message: validation.error.message });
                return;
            }
            const result = loginRoute.handler(req, res, next);
            if (result) {
                req.session.login = req.body.userId;
                result
                    .then((result) => {
                        if (result === errorModel.AUTHENTICATION_FAILD) {
                            res.status(401).send({
                                result: 'failed',
                                message: errorModel.AUTHENTICATION_FAILD,
                            });
                        } else if (result === errorModel.NOT_FOUND) {
                            res.status(403).send({ result: 'failed', message: errorModel.NOT_FOUND });
                        } else if (result) {
                            res.send({ result: 'success', userId: req.body.userId });
                        } else {
                            res.status(404).send('Something broke!');
                        }
                    })
                    .catch((err) => {
                        console.log(err);
                        res.status(500).send({ result: 'error', message: 'Something broken' });
                    });
            } else if (result !== null && result !== undefined) {
                res.json(result);
            }
        });

        app.post(logoutRoute.route, (req, res) => {
            if (req.session.login === undefined) {
                res.status(403).send({ result: 'error', message: 'Auth Error' });
            }
            req.session.login = undefined;
            res.status(200).send({ result: 'success', message: 'logout success' });
        });

        // register express routes from defined application routes
        expenseRoutes.forEach((route) => {
            (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
                if (req.session.login === undefined) {
                    res.status(403).send({ result: 'error', message: 'Auth Error' });
                    return;
                }
                const result = route.handler(req, res, next);
                if (result instanceof Promise) {
                    result
                        .then((expense) => {
                            res.send({ expense });
                        })
                        .catch((err) => {
                            if (err instanceof ValidationError) {
                                res.status(400).json({ result: 'error', message: err.details });
                                return;
                            }
                            console.log(err);
                            res.status(500).send({ result: 'error', message: 'Something broken' });
                        });
                } else if (result !== null && result !== undefined) {
                    res.json(result);
                }
            });
        });

        budgetRoutes.forEach((route) => {
            (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
                const result = route.handler(req, res, next);
                if (req.session.login === undefined) {
                    res.status(403).send({ result: 'error', message: 'Auth Error' });
                }
                if (result instanceof Promise) {
                    result
                        .then((result) => {
                            if (result !== null) {
                                res.send({ budget: result });
                            } else if (result !== undefined) {
                                // TODO: error handling
                                res.status(200).send('success');
                            } else {
                                console.log('error');
                                res.status(404).send('Something broke!');
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(500).send({ result: 'error', message: 'Something broken' });
                        });
                } else if (result !== null && result !== undefined) {
                    res.json(result);
                }
            });
        });

        userRoutes.forEach((route) => {
            (app as any)[route.method](route.route, (req: Request, res: Response, next: NextFunction) => {
                const result = route.handler(req, res, next);
                if (req.session.login === undefined) {
                    res.status(403).send({ result: 'error', message: 'Auth Error' });
                }
                if (result instanceof Promise) {
                    result
                        .then((result) => {
                            if (result !== null) {
                                if (route.action === 'all') {
                                    result.map((user) => {
                                        delete user.password;
                                        return user;
                                    });
                                } else if (route.action === 'one') {
                                    delete result.password;
                                }
                                res.send({ user: result });
                            } else if (result === null) {
                                res.status(401).send({ result: 'Faild', message: 'not found' });
                            } else {
                                console.log('error');
                                res.status(404).send({ result: 'Faild', message: 'not found' });
                            }
                        })
                        .catch((err) => {
                            console.log(err);
                            res.status(500).send({ result: 'error', message: 'Something broken' });
                        });
                } else if (result !== null && result !== undefined) {
                    res.json(result);
                }
            });
        });

        router.get('/api', (req, res) => {
            res.status(404).sendFile(path.join(__dirname, '../../client/build/index.html'));
        });

        router.get('/api/*', (req, res) => {
            res.status(404).sendFile(path.join(__dirname, '../../client/build/index.html'));
        });

        router.get('*', (req, res) => {
            res.sendFile(path.join(__dirname, '../../client/build/index.html'));
        });

        app.use(express.static(path.join(__dirname, '../../client/build')), router);

        // start express server
        const server = app.listen(port);
        server.timeout = 1000 * 60 * 0.05;

        console.log(`Express server has started on port ${port}. Open http://localhost:${port}/api to see results`);
    })
    .catch((error) => {
        console.log('Error:');
        console.log(error);
    });
