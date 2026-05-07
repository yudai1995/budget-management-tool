import type { PrismaClient } from '@prisma/client';
import { ulid } from 'ulid';
import type { UserSettings } from '../../domain/models/UserSettings';
import type { IUserSettingsRepository } from '../../domain/repositories/IUserSettingsRepository';

export class PrismaUserSettingsRepository implements IUserSettingsRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async findByUserId(userId: string): Promise<UserSettings | null> {
        const record = await this.prisma.userSettings.findUnique({ where: { userId } });
        if (!record) return null;
        return {
            id: record.id,
            userId: record.userId,
            totalAssets: record.totalAssets,
            monthlyIncome: record.monthlyIncome,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }

    async upsert(settings: Omit<UserSettings, 'id' | 'createdAt' | 'updatedAt'>): Promise<UserSettings> {
        const record = await this.prisma.userSettings.upsert({
            where: { userId: settings.userId },
            create: {
                id: ulid(),
                userId: settings.userId,
                totalAssets: settings.totalAssets,
                monthlyIncome: settings.monthlyIncome,
            },
            update: {
                totalAssets: settings.totalAssets,
                monthlyIncome: settings.monthlyIncome,
            },
        });
        return {
            id: record.id,
            userId: record.userId,
            totalAssets: record.totalAssets,
            monthlyIncome: record.monthlyIncome,
            createdAt: record.createdAt,
            updatedAt: record.updatedAt,
        };
    }
}
