import { prisma } from './infrastructure/persistence/prisma-client';
import { PrismaBudgetRepository } from './infrastructure/persistence/PrismaBudgetRepository';
import { PrismaExpenseRepository } from './infrastructure/persistence/PrismaExpenseRepository';
import { PrismaRefreshTokenRepository } from './infrastructure/persistence/PrismaRefreshTokenRepository';
import { PrismaUserRepository } from './infrastructure/persistence/PrismaUserRepository';
import { PrismaSecurityAnswerRepository } from './infrastructure/persistence/PrismaSecurityAnswerRepository';
import { PrismaPasswordResetTokenRepository } from './infrastructure/persistence/PrismaPasswordResetTokenRepository';
import type { AppDeps } from './app';

/**
 * 本番用依存関係コンテナ。
 * PrismaClient は prisma-client.ts のシングルトンを使用する。
 */
export function buildDeps(): AppDeps {
    return {
        userRepository: new PrismaUserRepository(prisma),
        expenseRepository: new PrismaExpenseRepository(prisma),
        budgetRepository: new PrismaBudgetRepository(prisma),
        refreshTokenRepository: new PrismaRefreshTokenRepository(prisma),
        securityAnswerRepository: new PrismaSecurityAnswerRepository(prisma),
        passwordResetTokenRepository: new PrismaPasswordResetTokenRepository(prisma),
    };
}
