import { BudgetController } from './controller/BudgetController';

export const Routes = [
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