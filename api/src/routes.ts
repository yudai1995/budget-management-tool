import { BudgetController } from './controller/BudgetController';
import { UserController } from './controller/UserController';

export const budgetRoutes = [
  {
    method: 'get',
    route: '/api/budget',
    controller: BudgetController,
    action: 'all',
  },
  {
    method: 'get',
    route: '/api/budget/:id',
    controller: BudgetController,
    action: 'one',
  },
  {
    method: 'post',
    route: '/api/budget',
    controller: BudgetController,
    action: 'save',
  },
  // TODO: add PUT ACTION
  {
    method: 'put',
    route: '/api/budget/:id',
    controller: BudgetController,
    action: 'save',
  },
  {
    method: 'delete',
    route: '/api/budget/:id',
    controller: BudgetController,
    action: 'remove',
  },
];

export const userRoutes = [
  {
    method: 'get',
    route: '/api/user',
    controller: UserController,
    action: 'all',
  },
  {
    method: 'get',
    route: '/api/user/:userId',
    controller: UserController,
    action: 'one',
  },
  {
    method: 'post',
    route: '/api/user',
    controller: UserController,
    action: 'save',
  },
  // TODO: add PUT ACTION
  {
    method: 'put',
    route: '/api/user/:userId',
    controller: UserController,
    action: 'save',
  },
  {
    method: 'delete',
    route: '/api/user/:userId',
    controller: UserController,
    action: 'remove',
  },
];

export const loginRouter = {
  method: 'post',
  route: '/api/login',
  controller: UserController,
  action: 'login',
};

export const logoutRouter = {
  method: 'post',
  route: '/api/logout',
};