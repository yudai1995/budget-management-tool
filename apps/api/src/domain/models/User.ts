import type { UserProps } from '@budget/common';

export type { UserProps };

/** ユーザーのドメインエンティティ（インフラ依存なし） */
export class User {
    readonly userId: string;
    readonly userName: string;
    readonly password: string;

    private constructor(props: UserProps) {
        this.userId = props.userId;
        this.userName = props.userName;
        this.password = props.password;
    }

    static reconstruct(props: UserProps): User {
        return new User(props);
    }
}
