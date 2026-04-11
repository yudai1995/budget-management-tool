import { AppDataSource } from './infrastructure/persistence/data-source';
import { TypeORMBudgetRepository } from './infrastructure/persistence/TypeORMBudgetRepository';
import { TypeORMExpenseRepository } from './infrastructure/persistence/TypeORMExpenseRepository';
import { TypeORMRefreshTokenRepository } from './infrastructure/persistence/TypeORMRefreshTokenRepository';
import { TypeORMUserRepository } from './infrastructure/persistence/TypeORMUserRepository';
import type { AppDeps } from './app';

/**
 * 本番用依存関係コンテナ。
 * AppDataSource の初期化後に呼び出すこと。
 */
export function buildDeps(): AppDeps {
    return {
        userRepository: new TypeORMUserRepository(AppDataSource),
        expenseRepository: new TypeORMExpenseRepository(AppDataSource),
        budgetRepository: new TypeORMBudgetRepository(AppDataSource),
        refreshTokenRepository: new TypeORMRefreshTokenRepository(AppDataSource),
    };
}
