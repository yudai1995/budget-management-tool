import { z } from 'zod'

export const loginSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export type LoginSchema = z.infer<typeof loginSchema>

/** 自己登録スキーマ（管理者によるユーザー作成とは別） */
export const registerSchema = z.object({
  /** ログインIDを兼ねるユーザー名（英数字・アンダースコア・ハイフン、3〜30文字） */
  userId: z
    .string()
    .min(3, 'ユーザー名は3文字以上で入力してください')
    .max(30, 'ユーザー名は30文字以内で入力してください')
    .regex(/^[a-zA-Z0-9_-]+$/, '半角英数字・アンダースコア・ハイフンのみ使用できます'),
  /** 表示名（省略時はuserIdと同値） */
  displayName: z
    .string()
    .min(1, '表示名を入力してください')
    .max(50, '表示名は50文字以内で入力してください')
    .optional(),
  password: z
    .string()
    .min(8, 'パスワードは8文字以上で入力してください')
    .max(128, 'パスワードは128文字以内で入力してください'),
  /** 秘密の質問ID */
  securityQuestionId: z.number().int().positive('質問を選択してください'),
  /** 秘密の質問の回答 */
  securityAnswer: z.string().min(1, '回答を入力してください').max(100, '回答は100文字以内で入力してください'),
})

export type RegisterSchema = z.infer<typeof registerSchema>

/** パスワードリセット: 回答照合スキーマ */
export const verifyRecoverySchema = z.object({
  userId: z.string().min(1, 'ユーザー名を入力してください'),
  answer: z.string().min(1, '回答を入力してください'),
})

export type VerifyRecoverySchema = z.infer<typeof verifyRecoverySchema>

/** パスワードリセット: 新パスワード設定スキーマ */
export const resetPasswordSchema = z.object({
  resetToken: z.string().min(1, 'リセットトークンが必要です'),
  newPassword: z.string().min(8, 'パスワードは8文字以上で入力してください').max(128),
})

export type ResetPasswordSchema = z.infer<typeof resetPasswordSchema>
