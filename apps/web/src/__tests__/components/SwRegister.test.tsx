import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render } from '@testing-library/react'
import { SwRegister } from '../../components/SwRegister'

describe('SwRegister', () => {
    beforeEach(() => {
        vi.stubGlobal('navigator', {
            ...navigator,
            serviceWorker: {
                register: vi.fn().mockResolvedValue({}),
            },
        })
    })

    afterEach(() => {
        vi.unstubAllGlobals()
    })

    it('DOM ノードをレンダリングしない（null を返す）', () => {
        const { container } = render(<SwRegister />)
        expect(container.firstChild).toBeNull()
    })

    it('serviceWorker が使えるとき /sw.js を登録する', async () => {
        render(<SwRegister />)
        // useEffect は非同期で実行される
        await vi.waitFor(() => {
            expect(navigator.serviceWorker.register).toHaveBeenCalledWith('/sw.js')
        })
    })

    it('serviceWorker が使えないとき登録を試みない', () => {
        // serviceWorker プロパティを持たないオブジェクトに差し替える
        vi.stubGlobal('navigator', {})
        render(<SwRegister />)
        // エラーが発生せずレンダリングが完了すればOK
    })
})
