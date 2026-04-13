import type { UpdateUserInput } from '@budget/common';
import type { User } from '../../../domain/models/User';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { NotFoundError, ValidationError } from '../../../shared/errors/DomainException';

export class UpdateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(userId: string, input: UpdateUserInput): Promise<User> {
        // 対象ユーザーの存在確認
        const existing = await this.userRepository.findById(userId);
        if (!existing) {
            throw new NotFoundError(`ユーザーが見つかりません: ${userId}`);
        }

        // email 更新時の重複チェック（自分自身との重複は許容）
        if (input.email && input.email !== existing.email) {
            const emailOwner = await this.userRepository.findByEmail(input.email);
            if (emailOwner) {
                throw new ValidationError(`このメールアドレスは既に使用されています: ${input.email}`);
            }
        }

        return this.userRepository.update(userId, input);
    }
}
