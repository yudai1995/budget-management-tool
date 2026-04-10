import { z } from 'zod'

export const loginSchema = z.object({
  userId: z.string().min(1, 'ユーザーIDを入力してください'),
  password: z.string().min(1, 'パスワードを入力してください'),
})

export type LoginSchema = z.infer<typeof loginSchema>
