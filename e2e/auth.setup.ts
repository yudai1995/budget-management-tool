import { test as setup, expect } from '@playwright/test'
import path from 'path'

const authFile = path.join(__dirname, '.auth/user.json')

/**
 * 認証セットアップ
 * ログイン操作を1回実行し、セッション情報を .auth/user.json に保存する。
 * 以降のテストはこのストレージ状態を再利用し、毎回ログインをスキップする。
 */
setup('ユーザーログインとセッション確立', async ({ page }) => {
    await page.goto('/login')

    // ログインフォームの表示確認
    await expect(page.getByLabel('ユーザー名')).toBeVisible()
    await expect(page.getByLabel('パスワード')).toBeVisible()

    // 認証情報の入力（テスト用ゲストユーザー）
    await page.getByLabel('ユーザー名').fill(process.env.E2E_USER_ID ?? 'guest')
    await page.getByLabel('パスワード').fill(process.env.E2E_PASSWORD ?? 'guest')
    await page.getByRole('button', { name: 'ログインする' }).click()

    // ログイン後に /expenses へリダイレクトされることを確認
    await page.waitForURL('/expenses', { timeout: 10000 })
    await expect(page).toHaveURL('/expenses')

    // セッション状態をファイルに保存
    await page.context().storageState({ path: authFile })
})
