import { test, expect } from '@playwright/test'

/**
 * 支出登録 E2E テスト
 * auth.setup.ts で確立したログインセッションを使用する
 */
test.describe('支出の新規登録と一覧反映', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/expenses')
        // 支出一覧ページが表示されていることを確認
        await expect(page.getByRole('heading', { name: '家計管理' })).toBeVisible()
    })

    test('支出登録フォームが表示される', async ({ page }) => {
        await expect(page.getByLabel('金額')).toBeVisible()
        await expect(page.getByLabel('日付')).toBeVisible()
        await expect(page.getByLabel('種別')).toBeVisible()
        await expect(page.getByRole('button', { name: '追加する' })).toBeVisible()
    })

    test('金額を入力せずに登録するとバリデーションエラーが表示される', async ({ page }) => {
        // 金額を空にして送信
        await page.getByLabel('金額').fill('')
        await page.getByRole('button', { name: '追加する' }).click()

        // バリデーションエラーの確認（ブラウザのHTML5 required バリデーション または Server Action エラー）
        await expect(page.getByLabel('金額')).toBeFocused()
    })

    test('有効なデータで支出を登録すると成功メッセージが表示される', async ({ page }) => {
        const today = new Date().toISOString().split('T')[0]

        // フォームに入力
        await page.getByLabel('金額').fill('1500')
        await page.getByLabel('日付').fill(today)
        await page.getByLabel('種別').selectOption('0') // 支出
        await page.getByLabel('内容（任意）').fill('E2Eテスト用支出')

        // 登録ボタンをクリック
        await page.getByRole('button', { name: '追加する' }).click()

        // 成功メッセージの確認
        await expect(page.getByText('登録しました')).toBeVisible({ timeout: 10000 })
    })

    test('支出登録後に一覧に反映される', async ({ page }) => {
        const today = new Date().toISOString().split('T')[0]
        const uniqueContent = `E2E反映確認テスト-${Date.now()}`

        await page.getByLabel('金額').fill('2000')
        await page.getByLabel('日付').fill(today)
        await page.getByLabel('種別').selectOption('0')
        await page.getByLabel('内容（任意）').fill(uniqueContent)
        await page.getByRole('button', { name: '追加する' }).click()

        // 成功後にページを更新して一覧に反映されたことを確認
        await expect(page.getByText('登録しました')).toBeVisible({ timeout: 10000 })
        await page.reload()

        // 登録した内容が一覧に表示されていることを確認
        await expect(page.getByText(uniqueContent)).toBeVisible({ timeout: 10000 })
    })

    test('ログアウトボタンが表示され、クリックするとログインページに遷移する', async ({ page }) => {
        const logoutButton = page.getByRole('button', { name: 'ログアウト' })
        await expect(logoutButton).toBeVisible()

        await logoutButton.click()

        // ログアウト後にログインページへリダイレクト
        await expect(page).toHaveURL('/login', { timeout: 10000 })
    })
})
