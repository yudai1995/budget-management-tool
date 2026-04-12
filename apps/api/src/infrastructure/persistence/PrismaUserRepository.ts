import type { PrismaClient } from '@prisma/client';
import { errorModel } from '../../domain/models/errorModel';
import { User } from '../../domain/models/User';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';

// biome-ignore lint/suspicious/noExplicitAny: bcrypt は CommonJS モジュールのため require を使用
const bcrypt = require('bcrypt') as {
    hash: (data: string, rounds: number) => Promise<string>;
    compare: (data: string, encrypted: string) => Promise<boolean>;
};

export class PrismaUserRepository implements IUserRepository {
    constructor(private readonly prisma: PrismaClient) {}

    async all(): Promise<User[]> {
        const records = await this.prisma.userList.findMany();
        return records.map((r) => User.reconstruct({ userId: r.userId, userName: r.userName, password: r.password }));
    }

    async one(userId: string): Promise<User | null> {
        const record = await this.prisma.userList.findUnique({ where: { userId } });
        if (!record) return null;
        return User.reconstruct({ userId: record.userId, userName: record.userName, password: record.password });
    }

    async save(userId: string, userName: string, password: string): Promise<User> {
        const hashed = await bcrypt.hash(password, 10);
        const record = await this.prisma.userList.create({ data: { userId, userName, password: hashed } });
        return User.reconstruct({ userId: record.userId, userName: record.userName, password: record.password });
    }

    async remove(userId: string): Promise<void> {
        await this.prisma.userList.delete({ where: { userId } });
    }

    async login(userId: string, password: string): Promise<true | errorModel> {
        const record = await this.prisma.userList.findUnique({ where: { userId } });
        if (!record) return errorModel.NOT_FOUND;
        if (!record.password) return errorModel.AUTHENTICATION_FAILD;
        const matched = await bcrypt.compare(password, record.password);
        return matched ? true : errorModel.AUTHENTICATION_FAILD;
    }
}
