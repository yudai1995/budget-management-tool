import type { User } from '../models/User'
import type { errorModel } from '../models/errorModel'

export interface IUserRepository {
    all(): Promise<User[]>
    one(userId: string): Promise<User | null>
    save(userId: string, userName: string, password: string): Promise<User>
    remove(userId: string): Promise<void>
    login(userId: string, password: string): Promise<true | errorModel>
}

