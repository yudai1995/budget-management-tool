import { PrismaClient } from '@prisma/client';

/**
 * PrismaClient のシングルトンインスタンス。
 * 開発環境ではホットリロード時に複数インスタンスが作成されないよう global に保持する。
 */
const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: process.env.NODE_ENV !== 'production' ? ['query'] : [],
    });

if (process.env.NODE_ENV !== 'production') {
    globalForPrisma.prisma = prisma;
}
