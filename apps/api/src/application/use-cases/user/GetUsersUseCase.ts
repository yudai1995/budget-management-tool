import type { User } from '../../../domain/models/User';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class GetUsersUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(): Promise<User[]> {
        return this.userRepository.findAll();
    }
}
