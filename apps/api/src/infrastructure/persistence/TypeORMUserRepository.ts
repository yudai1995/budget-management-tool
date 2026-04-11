import type { DataSource } from 'typeorm';
import type { User } from '../../domain/models/User';
import { errorModel } from '../../domain/models/errorModel';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';
import { UserDataModel } from './entity/UserDataModel';
import { UserMapper } from './mappers/UserMapper';

const bcrypt = require('bcrypt');

if (process.env.NODE_ENV !== 'production') {
    // CWD は turbo 実行時に apps/api/ になるため、リポジトリルートの .env を明示的に指定する
    require('dotenv').config({ path: require('node:path').resolve(__dirname, '../../../.env') });
}

export class TypeORMUserRepository implements IUserRepository {
    constructor(private readonly dataSource: DataSource) {}

    async all(): Promise<User[]> {
        const dataModels = await this.dataSource.getRepository(UserDataModel).find();
        return dataModels.map(UserMapper.toDomain);
    }

    async one(userId: string): Promise<User | null> {
        const dataModel = await this.dataSource.getRepository(UserDataModel).findOneBy({ userId });
        if (!dataModel) return null;
        return UserMapper.toDomain(dataModel);
    }

    async save(userId: string, userName: string, password: string): Promise<User> {
        const hashed = await bcrypt.hash(password, 10);
        const dataModel = await this.dataSource
            .getRepository(UserDataModel)
            .save({ userId, userName, password: hashed });
        return UserMapper.toDomain(dataModel);
    }

    async remove(userId: string): Promise<void> {
        const repo = this.dataSource.getRepository(UserDataModel);
        const userToRemove = await repo.findOneBy({ userId });
        if (userToRemove) {
            await repo.remove(userToRemove);
        }
    }

    async login(userId: string, password: string): Promise<true | errorModel> {
        const dataModel = await this.dataSource.getRepository(UserDataModel).findOneBy({ userId });
        if (!dataModel) return errorModel.NOT_FOUND;

        // ハッシュが未設定の場合は認証失敗（ゲストユーザー等、パスワードなしのアカウント）
        if (!dataModel.password) return errorModel.AUTHENTICATION_FAILD;

        const compared = await bcrypt.compare(password, dataModel.password);
        if (compared) return true;

        return errorModel.AUTHENTICATION_FAILD;
    }
}
