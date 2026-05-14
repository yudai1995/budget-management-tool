import type { PrismaClient } from '@prisma/client';
import type { ILlmUsageRepository } from '../../domain/repositories/ILlmUsageRepository';

export class PrismaLlmUsageRepository implements ILlmUsageRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async countTodayByUserAndFeature(userId: string, feature: string): Promise<number> {
        const startOfDay = new Date();
        startOfDay.setHours(0, 0, 0, 0);

        return this.prisma.llmUsage.count({
            where: { userId, feature, createdAt: { gte: startOfDay } },
        });
    }

    async sumMonthlyTokensByUser(userId: string): Promise<number> {
        const startOfMonth = new Date();
        startOfMonth.setDate(1);
        startOfMonth.setHours(0, 0, 0, 0);

        const result = await this.prisma.llmUsage.aggregate({
            where: { userId, createdAt: { gte: startOfMonth } },
            _sum: { inputTokens: true, outputTokens: true },
        });

        return (result._sum.inputTokens ?? 0) + (result._sum.outputTokens ?? 0);
    }

    async record(params: {
        id: string;
        userId: string;
        feature: string;
        inputTokens: number;
        outputTokens: number;
    }): Promise<void> {
        await this.prisma.llmUsage.create({ data: params });
    }
}
