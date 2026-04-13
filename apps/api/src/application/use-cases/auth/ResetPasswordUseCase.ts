import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { IPasswordResetTokenRepository } from '../../../domain/repositories/IPasswordResetTokenRepository';
import { AuthenticationError } from '../../../shared/errors/DomainException';

export class ResetPasswordUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly passwordResetTokenRepository: IPasswordResetTokenRepository
    ) {}

    async execute(resetToken: string, newPassword: string): Promise<void> {
        const userId = await this.passwordResetTokenRepository.verify(resetToken);
        if (!userId) {
            throw new AuthenticationError('リセットトークンが無効または期限切れです');
        }

        await this.userRepository.update(userId, { password: newPassword });
        await this.passwordResetTokenRepository.consume(resetToken);
    }
}
