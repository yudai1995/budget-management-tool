/**
 * PeriodSelector コンポーネントテスト
 *
 * 【検証範囲】
 * - 3つの期間ボタン（直近7日 / 今月 / 先月）が表示される
 * - URL の period パラメータに対応したボタンがアクティブスタイルになる
 * - ボタンをクリックすると router.push が呼ばれ URL パラメータが更新される
 * - デフォルト（period 未指定）は「直近7日」がアクティブになる
 */

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import * as React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { PeriodSelector } from '../../components/report/PeriodSelector';

// Next.js のルーター・クエリパラメータをモックする
const mockPush = vi.fn();
const mockSearchParams = new URLSearchParams();

vi.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));

describe('PeriodSelector', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        // 毎回 searchParams をリセット
        mockSearchParams.delete('period');
    });

    describe('初期表示', () => {
        it('3つの期間ボタンが表示される', () => {
            render(<PeriodSelector />);
            expect(screen.getByRole('button', { name: '直近7日' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '今月' })).toBeInTheDocument();
            expect(screen.getByRole('button', { name: '先月' })).toBeInTheDocument();
        });

        it('period パラメータが未指定のとき「直近7日」がアクティブスタイルになる', () => {
            render(<PeriodSelector />);
            const activeBtn = screen.getByRole('button', { name: '直近7日' });
            // アクティブスタイルのクラス（bg-[#f18840]）が適用されている
            expect(activeBtn.className).toContain('bg-[#f18840]');
        });

        it('period=current-month のとき「今月」がアクティブスタイルになる', () => {
            mockSearchParams.set('period', 'current-month');
            render(<PeriodSelector />);
            const activeBtn = screen.getByRole('button', { name: '今月' });
            expect(activeBtn.className).toContain('bg-[#f18840]');
        });

        it('period=last-month のとき「先月」がアクティブスタイルになる', () => {
            mockSearchParams.set('period', 'last-month');
            render(<PeriodSelector />);
            const activeBtn = screen.getByRole('button', { name: '先月' });
            expect(activeBtn.className).toContain('bg-[#f18840]');
        });
    });

    describe('ボタンクリック時のルーティング', () => {
        it('「今月」をクリックすると router.push が period=current-month で呼ばれる', async () => {
            render(<PeriodSelector />);
            await userEvent.click(screen.getByRole('button', { name: '今月' }));
            expect(mockPush).toHaveBeenCalledOnce();
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('period=current-month'));
        });

        it('「先月」をクリックすると router.push が period=last-month で呼ばれる', async () => {
            render(<PeriodSelector />);
            await userEvent.click(screen.getByRole('button', { name: '先月' }));
            expect(mockPush).toHaveBeenCalledOnce();
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('period=last-month'));
        });

        it('「直近7日」をクリックすると router.push が period=7days で呼ばれる', async () => {
            mockSearchParams.set('period', 'current-month');
            render(<PeriodSelector />);
            await userEvent.click(screen.getByRole('button', { name: '直近7日' }));
            expect(mockPush).toHaveBeenCalledOnce();
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('period=7days'));
        });

        it('同じ期間を再クリックしても router.push が呼ばれる（再選択可能）', async () => {
            mockSearchParams.set('period', 'current-month');
            render(<PeriodSelector />);
            await userEvent.click(screen.getByRole('button', { name: '今月' }));
            expect(mockPush).toHaveBeenCalledOnce();
        });
    });

    describe('非アクティブボタンのスタイル', () => {
        it('アクティブでないボタンは border スタイルを持つ', () => {
            render(<PeriodSelector />);
            const inactiveBtn = screen.getByRole('button', { name: '今月' });
            expect(inactiveBtn.className).toContain('border');
        });
    });
});
