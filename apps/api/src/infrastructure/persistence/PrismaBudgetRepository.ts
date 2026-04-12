import type { BudgetList } from '@prisma/client';
import type { PrismaClient } from '@prisma/client';
import { Budget } from '../../domain/models/Budget';
import type { IBudgetRepository } from '../../domain/repositories/IBudgetRepository';

/** Prisma の BudgetList レコードをドメインモデルに変換する */
function toDomain(record: BudgetList): Budget {
    return Budget.reconstruct({
        id: record.id,
        amount: record.amount,
        balanceType: record.balanceType as 0 | 1,
        userId: record.userId,
        categoryId: record.categoryId,
        content: record.content,
        date: record.date,
        createdDate: record.createdDate,
        updatedDate: record.updatedDate,
        deletedDate: record.deletedDate,
    });
}

export class PrismaBudgetRepository implements IBudgetRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async all(): Promise<Budget[]> {
        const records = await this.prisma.budgetList.findMany();
        return records.map(toDomain);
    }

    async one(id: string): Promise<Budget | null> {
        const record = await this.prisma.budgetList.findUnique({ where: { id } });
        return record ? toDomain(record) : null;
    }

    async save(budget: unknown): Promise<Budget> {
        const b = budget as Budget;
        const record = await this.prisma.budgetList.upsert({
            where: { id: b.id },
            create: {
                id: b.id,
                amount: b.amount,
                balanceType: b.balanceType,
                userId: b.userId,
                categoryId: b.categoryId,
                content: b.content,
                date: b.date,
            },
            update: {
                amount: b.amount,
                balanceType: b.balanceType,
                categoryId: b.categoryId,
                content: b.content,
                date: b.date,
            },
        });
        return toDomain(record);
    }

    async remove(id: string): Promise<void> {
        await this.prisma.budgetList.delete({ where: { id } });
    }
}
