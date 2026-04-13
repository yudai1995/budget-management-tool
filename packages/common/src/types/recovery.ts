/** 秘密の質問プリセット */
export interface SecurityQuestionPreset {
    id: number
    text: string
}

/** ユーザーのリカバリ情報 */
export interface RecoveryQuestion {
    questionId: number
    questionText: string
}

/** パスワードリセットトークンのペイロード */
export interface PasswordResetResult {
    resetToken: string
    /** ISO 8601 形式の有効期限 */
    expiresAt: string
}
