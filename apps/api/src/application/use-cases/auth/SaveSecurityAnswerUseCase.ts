import type { ISecurityAnswerRepository } from '../../../domain/repositories/ISecurityAnswerRepository';

export class SaveSecurityAnswerUseCase {
    constructor(private readonly securityAnswerRepository: ISecurityAnswerRepository) {}

    async execute(userId: string, questionId: number, answer: string): Promise<void> {
        await this.securityAnswerRepository.save(userId, questionId, answer);
    }
}
