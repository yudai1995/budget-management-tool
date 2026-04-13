import type { UserProps, UserRole, UserStatus } from '@budget/common';
import { ulid } from 'ulid';
import { ValidationError } from '../../shared/errors/DomainException';

export type { UserProps, UserRole, UserStatus };

/** メールアドレス形式の簡易チェック（RFC 5321 準拠の簡易版） */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** ユーザーのドメインエンティティ（インフラ依存なし） */
export class User {
    readonly userId: string;
    readonly userName: string;
    /** bcrypt ハッシュ済みパスワード。ドメイン層で生パスワードは保持しない */
    readonly password: string;
    readonly email: string | null;
    readonly role: UserRole;
    readonly status: UserStatus;
    readonly createdAt: Date;
    readonly updatedAt: Date;

    private constructor(props: UserProps) {
        this.userId = props.userId;
        this.userName = props.userName;
        this.password = props.password;
        this.email = props.email;
        this.role = props.role;
        this.status = props.status;
        this.createdAt = props.createdAt;
        this.updatedAt = props.updatedAt;
    }

    /**
     * 新規ユーザーのファクトリメソッド。
     * ビジネスルール（不変条件）を検証してから生成する。
     * password フィールドは空文字で初期化 — 実際のハッシュはインフラ層で設定される。
     */
    static create(input: { userName: string; email?: string | null; role?: UserRole }): User {
        User.validateUserName(input.userName);
        if (input.email) {
            User.validateEmail(input.email);
        }

        return new User({
            userId: ulid(),
            userName: input.userName.trim(),
            password: '', // インフラ層がハッシュ化後に上書きする
            email: input.email ?? null,
            role: input.role ?? 'USER',
            status: 'ACTIVE',
            createdAt: new Date(),
            updatedAt: new Date(),
        });
    }

    /**
     * DB から復元するファクトリメソッド（バリデーション省略）。
     * インフラ層（PrismaUserRepository）からのみ呼び出す。
     */
    static reconstruct(props: UserProps): User {
        return new User(props);
    }

    // ─── バリデーション（ドメイン不変条件） ─────────────────────
    private static validateUserName(userName: string): void {
        const trimmed = userName.trim();
        if (trimmed.length === 0) {
            throw new ValidationError('ユーザー名を入力してください');
        }
        if (trimmed.length > 50) {
            throw new ValidationError('ユーザー名は50文字以内で入力してください');
        }
    }

    private static validateEmail(email: string): void {
        if (!EMAIL_REGEX.test(email)) {
            throw new ValidationError(`メールアドレスの形式が不正です: ${email}`);
        }
    }
}
