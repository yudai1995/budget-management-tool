/**
 * 開発環境用 Seed スクリプト
 *
 * DB マイグレーション完了後に実行し、アプリ起動に必要な初期データを投入する。
 *
 * 投入内容:
 *   - ゲストユーザー（userId: 'Guest'）: ゲストログイン機能に必須
 *
 * 冪等性: 既存レコードが存在する場合はスキップする（再実行安全）。
 *
 * 実行方法:
 *   pnpm --filter @budget/api run seed
 *
 * @see apps/api/src/presentation/routes/auth.ts - /guest-login ルート
 */

import 'reflect-metadata';
// biome-ignore lint/suspicious/noExplicitAny: bcrypt は CommonJS モジュールのため require を使用
const bcrypt = require('bcrypt') as { hash: (data: string, rounds: number) => Promise<string> };
import { AppDataSource } from '../src/infrastructure/persistence/data-source';
import { UserDataModel } from '../src/infrastructure/persistence/entity/UserDataModel';

const GUEST_USER_ID = 'Guest';
const GUEST_USER_NAME = 'ゲスト';

async function seedGuestUser(): Promise<void> {
    const repo = AppDataSource.getRepository(UserDataModel);

    const existing = await repo.findOneBy({ userId: GUEST_USER_ID });
    if (existing) {
        console.log(`  → ゲストユーザーは既に存在します（スキップ）: userId=${GUEST_USER_ID}`);
        return;
    }

    // ゲストログインはパスワード不要だが、カラムは NOT NULL のためプレースホルダーを設定する
    const placeholderHash = await bcrypt.hash(`guest-placeholder-${Date.now()}`, 10);

    await repo.save({
        userId: GUEST_USER_ID,
        userName: GUEST_USER_NAME,
        password: placeholderHash,
    });

    console.log(`  ✅ ゲストユーザーを作成しました: userId=${GUEST_USER_ID}`);
}

async function main(): Promise<void> {
    console.log('');
    console.log('🌱 Seed データを投入しています...');

    await AppDataSource.initialize();
    console.log('  → DB 接続完了');

    try {
        await seedGuestUser();

        console.log('');
        console.log('✅ Seed 完了');
    } finally {
        await AppDataSource.destroy();
    }
}

main().catch((err: unknown) => {
    console.error('❌ Seed に失敗しました:', err instanceof Error ? err.message : err);
    process.exit(1);
});
