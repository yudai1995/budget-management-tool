import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import type { ISecurityAnswerRepository } from '../../../domain/repositories/ISecurityAnswerRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/DomainException';

export class GetRecoveryQuestionUseCase {
    constructor(
        private readonly userRepository: IUserRepository,
        private readonly securityAnswerRepository: ISecurityAnswerRepository
    ) {}

    async execute(userId: string): Promise<{ questionId: number; questionText: string }> {
        const user = await this.userRepository.findById(userId);
        if (!user) {
            // セキュリティ上ユーザー存在有無は明かさない
            throw new NotFoundError('秘密の質問が設定されていないか、ユーザーが存在しません');
        }

        const question = await this.securityAnswerRepository.findQuestionByUserId(userId);
        if (!question) {
            throw new ValidationError('このアカウントには秘密の質問が設定されていません');
        }

        return question;
    }
}
