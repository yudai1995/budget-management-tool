import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { budgetRoutes, userRoutes, loginRouter, logoutRouter } from './routes';
const path = require('path');
import { Budget } from './entity/Budget';
import { errorModel } from './model/errorModel';
const Router = require('express');
const router = Router();
const session = require('express-session');

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

    app.post(
      loginRouter.route,
      (req: Request, res: Response, next: Function) => {
        const result = new (loginRouter.controller as any)()[
          loginRouter.action
        ](req, res, next);
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
                res
                  .status(403)
                  .send({ result: 'failed', message: errorModel.NOT_FOUND });
              } else if (result) {
                res.send({ result: 'success', userId: req.body.userId });
              } else {
                res.status(404).send('Something broke!');
              }
            })
            .catch((err) => {
              console.log(err);
              res
                .status(500)
                .send({ result: 'error', message: 'Something broken' });
            });
        } else if (result !== null && result !== undefined) {
          res.json(result);
        }
      }
    );

    app.post(logoutRouter.route, (req, res) => {
      req.session.login = undefined;
      res.redirect('/login');
    });

    // register express routes from defined application routes
    budgetRoutes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
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
                res
                  .status(500)
                  .send({ result: 'error', message: 'Something broken' });
              });
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    userRoutes.forEach((route) => {
      (app as any)[route.method](
        route.route,
        (req: Request, res: Response, next: Function) => {
          const result = new (route.controller as any)()[route.action](
            req,
            res,
            next
          );
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
                  res
                    .status(401)
                    .send({ result: 'Faild', message: 'not found' });
                } else {
                  console.log('error');
                  res
                    .status(404)
                    .send({ result: 'Faild', message: 'not found' });
                }
              })
              .catch((err) => {
                console.log(err);
                res
                  .status(500)
                  .send({ result: 'error', message: 'Something broken' });
              });
          } else if (result !== null && result !== undefined) {
            res.json(result);
          }
        }
      );
    });

    router.get('/api', (req, res) => {
      res
        .status(404)
        .sendFile(path.join(__dirname, '../../client/build/index.html'));
    });

    router.get('/api/*', (req, res) => {
      res
        .status(404)
        .sendFile(path.join(__dirname, '../../client/build/index.html'));
    });

    router.get('*', (req, res) => {
      res.sendFile(path.join(__dirname, '../../client/build/index.html'));
    });

    app.use(express.static(path.join(__dirname, '../../client/build')), router);

    // start express server
    app.listen(port);
    app.timeout = 1000 * 60 * 0.05;

    console.log(
      `Express server has started on port ${port}. Open http://localhost:${port}/api to see results`
    );
  })
  .catch((error) => {
    console.log('Error:');
    console.log(error);
  });
