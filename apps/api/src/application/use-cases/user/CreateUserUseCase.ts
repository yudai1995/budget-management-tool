import type { CreateUserInput } from '@budget/common';
import { User } from '../../../domain/models/User';
import type { IUserRepository } from '../../../domain/repositories/IUserRepository';
import { ValidationError } from '../../../shared/errors/DomainException';

export class CreateUserUseCase {
    constructor(private readonly userRepository: IUserRepository) {}

    async execute(input: CreateUserInput): Promise<User> {
        // email 重複チェック
        if (input.email) {
            const existing = await this.userRepository.findByEmail(input.email);
            if (existing) {
                throw new ValidationError(`このメールアドレスは既に使用されています: ${input.email}`);
            }
        }

        // ドメインファクトリでユーザーを生成（不変条件の検証もここで実施）
        const user = User.create({
            userName: input.userName,
            email: input.email,
            role: input.role,
        });

        return this.userRepository.create(user, input.password);
    }
}
