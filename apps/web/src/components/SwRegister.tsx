'use client';

import { useEffect } from 'react';

/**
 * Service Worker を登録するクライアントコンポーネント。
 * ルートレイアウトに配置し、ブラウザがサポートしている場合のみ登録する。
 */
export function SwRegister() {
    useEffect(() => {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker
                .register('/sw.js')
                .catch(() => {
                    // SW 登録失敗はアプリの動作に影響しないため握りつぶす
                });
        }
    }, []);

    return null;
}
