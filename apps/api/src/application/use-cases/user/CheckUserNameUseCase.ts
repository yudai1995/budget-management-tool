import type { IUserRepository } from '../../../domain/repositories/IUserRepository';

export class CheckUserNameUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string): Promise<{ available: boolean }> {
        const existing = await this.userRepository.findById(userId);
        return { available: existing === null };
    }
}
