import type { ISecurityAnswerRepository } from '../../../domain/repositories/ISecurityAnswerRepository';
import type { SecurityQuestionPreset } from '@budget/common';

export class GetSecurityQuestionsUseCase {
    constructor(private readonly securityAnswerRepository: ISecurityAnswerRepository) {}

    async execute(): Promise<SecurityQuestionPreset[]> {
        return this.securityAnswerRepository.listQuestions();
    }
}
