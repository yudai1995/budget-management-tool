import type { User } from '../../../domain/models/User';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/DomainException';

export class GetUserByIdUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string): Promise<User> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            throw new NotFoundError(`ユーザーが見つかりません: ${userId}`);
        }
        return user;
    }
}
