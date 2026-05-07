/**
 * AppShell レイアウト構造テスト
 *
 * 【目的】
 * - モバイルでコンテンツが正しく縦積みになることを保証する
 * - flex-col（モバイル縦積み）が欠落するリグレッションを防ぐ
 *
 * 【背景】
 * PR #157（Issue #141）で AppShell の外側ラッパーから flex-col が削除され、
 * モバイルビューでヘッダーとコンテンツが横並びになる不具合が発生した。
 */
import { describe, it, expect, vi } from 'vitest'
import { render } from '@testing-library/react'
import { AppShell } from '../../components/layout/AppShell'

vi.mock('../../components/layout/Header', () => ({
    Header: () => <div data-testid="mock-header" />,
}))

vi.mock('../../components/layout/BottomNav', () => ({
    BottomNav: () => <div data-testid="mock-bottom-nav" />,
}))

describe('AppShell', () => {
    it('外側ラッパーに flex-col クラスが含まれる（モバイル縦積みのリグレッション防止）', () => {
        const { container } = render(
            <AppShell>
                <div data-testid="content">コンテンツ</div>
            </AppShell>
        )

        // 最外側の div が flex-col を持つことを確認する
        // これが欠落するとモバイルでヘッダーとコンテンツが横並びになる
        const outerDiv = container.firstChild as HTMLElement
        expect(outerDiv.className).toContain('flex-col')
    })

    it('children が描画される', () => {
        const { getByTestId } = render(
            <AppShell>
                <div data-testid="content">コンテンツ</div>
            </AppShell>
        )

        expect(getByTestId('content')).toBeInTheDocument()
    })

    it('PC 向けに md:flex-row クラスが含まれる', () => {
        const { container } = render(
            <AppShell>
                <div>コンテンツ</div>
            </AppShell>
        )

        const outerDiv = container.firstChild as HTMLElement
        expect(outerDiv.className).toContain('md:flex-row')
    })
})
