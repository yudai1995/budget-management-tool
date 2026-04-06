import { DataSource } from 'typeorm'
import { User } from '../../domain/models/User'
import { errorModel } from '../../domain/models/errorModel'
import { IUserRepository } from '../../domain/repositories/IUserRepository'

const bcrypt = require('bcrypt')

if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config()
}

export class TypeORMUserRepository implements IUserRepository {
    constructor(private readonly dataSource: DataSource) {}

    async all(): Promise<User[]> {
        return this.dataSource.getRepository(User).find()
    }

    async one(userId: string): Promise<User | null> {
        return this.dataSource.getRepository(User).findOneBy({ userId })
    }

    async save(userId: string, userName: string, password: string): Promise<User> {
        const hashed = await bcrypt.hash(password, 10)
        return this.dataSource.getRepository(User).save({ userId, userName, password: hashed })
    }

    async remove(userId: string): Promise<any> {
        const repo = this.dataSource.getRepository(User)
        const userToRemove = await repo.findOneBy({ userId })
        return repo.remove(userToRemove)
    }

    async login(userId: string, password: string): Promise<true | errorModel> {
        const effectivePassword = userId === 'Guest' ? process.env.GUEST_PASSWORD : password
        const loginUser = await this.dataSource.getRepository(User).findOneBy({ userId })
        if (!loginUser) return errorModel.NOT_FOUND

        const compared = await bcrypt.compare(effectivePassword, loginUser.password)
        if (compared) return true

        return errorModel.AUTHENTICATION_FAILD
    }
}

