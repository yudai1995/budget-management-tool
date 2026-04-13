import type { ISecurityAnswerRepository } from '../../../domain/repositories/ISecurityAnswerRepository';
import type { IPasswordResetTokenRepository } from '../../../domain/repositories/IPasswordResetTokenRepository';
import { AuthenticationError } from '../../../shared/errors/DomainException';

export class VerifyRecoveryAnswerUseCase {
    constructor(
        private readonly securityAnswerRepository: ISecurityAnswerRepository,
        private readonly passwordResetTokenRepository: IPasswordResetTokenRepository
    ) {}

    async execute(userId: string, answer: string): Promise<{ resetToken: string; expiresAt: string }> {
        const ok = await this.securityAnswerRepository.verifyAnswer(userId, answer);
        if (!ok) {
            throw new AuthenticationError('回答が正しくありません');
        }

        const { token, expiresAt } = await this.passwordResetTokenRepository.issue(userId);
        return { resetToken: token, expiresAt: expiresAt.toISOString() };
    }
}
