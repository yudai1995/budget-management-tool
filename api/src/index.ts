import * as express from 'express';
import * as bodyParser from 'body-parser';
import { Request, Response } from 'express';
import { AppDataSource } from './data-source';
import { Routes } from './routes';
const path = require('path');
import { Budget } from './entity/Budget';
const Router = require('express');
const router = Router();

if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const port = process.env.PORT || 5000;

AppDataSource.initialize()
  .then(async () => {
    // create express app
    const app = express();
    app.use(bodyParser.json());

    // register express routes from defined application routes
    Routes.forEach((route) => {
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
                throw err;
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
