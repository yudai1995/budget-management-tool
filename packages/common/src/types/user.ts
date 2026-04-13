/** ユーザーの権限ロール */
export type UserRole = 'ADMIN' | 'USER' | 'GUEST'

/** ユーザーのアカウントステータス */
export type UserStatus = 'ACTIVE' | 'INACTIVE'

/** ユーザーエンティティのプロパティ（password は常にハッシュ済み） */
export interface UserProps {
    userId: string
    userName: string
    /** bcrypt ハッシュ済みパスワード。クライアントへの送信禁止 */
    password: string
    email: string | null
    role: UserRole
    status: UserStatus
    createdAt: Date
    updatedAt: Date
}

/** ユーザー作成時の入力（password は平文 — ハッシュ化はインフラ層が担う） */
export interface CreateUserInput {
    userName: string
    /** 平文パスワード */
    password: string
    email?: string | null
    role?: UserRole
}

/** ユーザー更新時の入力（各フィールドはオプション） */
export interface UpdateUserInput {
    userName?: string
    /** 平文パスワード（省略時は変更なし） */
    password?: string
    email?: string | null
    role?: UserRole
    status?: UserStatus
}
