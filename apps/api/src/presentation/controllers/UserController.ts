import type { User } from '../../domain/models/User';
import type { errorModel } from '../../domain/models/errorModel';
import type { IUserRepository } from '../../domain/repositories/IUserRepository';

export class UserController {
    constructor(private readonly userRepository: IUserRepository) {}

    async all(): Promise<User[]> {
        return this.userRepository.all();
    }

    async one(userId: string): Promise<User | null> {
        return this.userRepository.one(userId);
    }

    async save(userId: string, userName: string, preHashPassword: string): Promise<User> {
        return this.userRepository.save(userId, userName, preHashPassword);
    }

    async remove(userId: string): Promise<void> {
        return this.userRepository.remove(userId);
    }

    async login(userId: string, password: string): Promise<true | errorModel> {
        return this.userRepository.login(userId, password);
    }
}
