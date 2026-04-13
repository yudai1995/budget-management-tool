import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError } from '../../../shared/errors/DomainException';

export class DeleteUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string): Promise<void> {
        const existing = await this.userRepository.findById(userId);
        if (!existing) {
            throw new NotFoundError(`ユーザーが見つかりません: ${userId}`);
        }
        await this.userRepository.remove(userId);
    }
}
