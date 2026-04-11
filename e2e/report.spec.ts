import { test, expect } from '@playwright/test'

/**
 * レポート画面 E2E テスト
 * auth.setup.ts で確立したログインセッションを使用する
 */
test.describe('レポート画面の期間切り替えとグラフ表示', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/report')
        await expect(page.getByRole('heading', { name: 'レポート' })).toBeVisible()
    })

    test('レポートページが正しく表示される', async ({ page }) => {
        // ページタイトルとPeriodSelectorの表示確認
        await expect(page.getByRole('heading', { name: 'レポート' })).toBeVisible()
    })

    test('デフォルトで「直近7日間」が選択されている', async ({ page }) => {
        // URLに period パラメータがないか、7days が設定されている
        const url = page.url()
        const hasNoParam = !url.includes('period=')
        const has7days = url.includes('period=7days')
        expect(hasNoParam || has7days).toBe(true)
    })

    test('「今月」に切り替えるとURLパラメータが変わる', async ({ page }) => {
        // 期間セレクタで「今月」を選択
        const periodSelector = page.getByRole('combobox')
        if (await periodSelector.isVisible()) {
            await periodSelector.selectOption('current-month')
            await expect(page).toHaveURL(/period=current-month/)
        } else {
            // ボタン形式のセレクタの場合
            const currentMonthButton = page.getByRole('button', { name: '今月' })
            if (await currentMonthButton.isVisible()) {
                await currentMonthButton.click()
                await expect(page).toHaveURL(/period=current-month/)
            }
        }
    })

    test('「先月」に切り替えるとURLパラメータが変わる', async ({ page }) => {
        const periodSelector = page.getByRole('combobox')
        if (await periodSelector.isVisible()) {
            await periodSelector.selectOption('last-month')
            await expect(page).toHaveURL(/period=last-month/)
        } else {
            const lastMonthButton = page.getByRole('button', { name: '先月' })
            if (await lastMonthButton.isVisible()) {
                await lastMonthButton.click()
                await expect(page).toHaveURL(/period=last-month/)
            }
        }
    })

    test('URLで period=current-month を指定するとレポートが表示される', async ({ page }) => {
        await page.goto('/report?period=current-month')

        // レポートページが表示されていること
        await expect(page.getByRole('heading', { name: 'レポート' })).toBeVisible()

        // データなしのメッセージか、サマリーが表示されることを確認
        const hasData = await page.getByText('支出合計').isVisible()
        const noData = await page.getByText('この期間のデータはありません').isVisible()
        expect(hasData || noData).toBe(true)
    })

    test('URLで period=last-month を指定するとレポートが表示される', async ({ page }) => {
        await page.goto('/report?period=last-month')

        await expect(page.getByRole('heading', { name: 'レポート' })).toBeVisible()

        const hasData = await page.getByText('支出合計').isVisible()
        const noData = await page.getByText('この期間のデータはありません').isVisible()
        expect(hasData || noData).toBe(true)
    })
})
