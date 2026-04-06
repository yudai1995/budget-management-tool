import { User } from '../models/User'
import { errorModel } from '../models/errorModel'

export interface IUserRepository {
    all(): Promise<User[]>
    one(userId: string): Promise<User | null>
    save(userId: string, userName: string, password: string): Promise<User>
    remove(userId: string): Promise<any>
    login(userId: string, password: string): Promise<true | errorModel>
}

