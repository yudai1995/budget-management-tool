/**
 * 統合テスト用 DB ヘルパー
 *
 * 【冪等性の原則】
 * - resetDatabase(): 全テーブルを TRUNCATE し、テストケース間の状態汚染を防ぐ
 * - seedTestData(): 実ユースケースに基づく動的 ID でデータを投入する
 *   固定 ID のハードコードは禁止。ulid() で毎回一意の ID を生成すること。
 */

import 'reflect-metadata';
import bcrypt from 'bcrypt';
import { DataSource } from 'typeorm';
import { ulid } from 'ulid';
import { BudgetDataModel } from '../../infrastructure/persistence/entity/BudgetDataModel';
import { UserDataModel } from '../../infrastructure/persistence/entity/UserDataModel';

// ------------------------------------------------------------------
// テスト専用 DataSource
// 環境変数は vitest.integration.config.ts で .env.test から注入済み
// synchronize: true でスキーマを自動同期（マイグレーション実行不要）
// ------------------------------------------------------------------
export const TestDataSource = new DataSource({
    type: 'mysql',
    host: process.env.DB_HOSTNAME || '127.0.0.1',
    port: Number(process.env.DB_PORT || 3307),
    username: process.env.DB_USER || 'Admin',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_NAME || 'budgetdb_test',
    synchronize: true,
    logging: false,
    entities: [BudgetDataModel, UserDataModel],
});

// ------------------------------------------------------------------
// resetDatabase: 全テーブルを TRUNCATE し真っさらな状態に戻す
// beforeEach で呼び出すことで各テストの独立性を保証する
// ------------------------------------------------------------------
export async function resetDatabase(): Promise<void> {
    const queryRunner = TestDataSource.createQueryRunner();
    try {
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 0');
        await queryRunner.query('TRUNCATE TABLE budget_list');
        await queryRunner.query('TRUNCATE TABLE user_list');
        await queryRunner.query('SET FOREIGN_KEY_CHECKS = 1');
    } finally {
        await queryRunner.release();
    }
}

// ------------------------------------------------------------------
// シードパターン定義
// ------------------------------------------------------------------
export type SeedPattern =
    | 'minimal' // ログイン確認用の最小セット
    | 'lastMonthHeavyUser' // 前月に大量経費を申請したユーザー
    | 'managerUser' // 複数カテゴリを管理する管理職ユーザー
    | 'edgeCases'; // 実運用で起こり得るイレギュラーデータ

export type SeedResult = {
    users: UserDataModel[];
    budgets: BudgetDataModel[];
};

// ------------------------------------------------------------------
// seedTestData: シナリオに応じたテストデータを動的に投入する
// ID は必ず ulid() で生成し、固定値のハードコードを禁止する
// ------------------------------------------------------------------
export async function seedTestData({ pattern }: { pattern: SeedPattern }): Promise<SeedResult> {
    const userRepo = TestDataSource.getRepository(UserDataModel);
    const budgetRepo = TestDataSource.getRepository(BudgetDataModel);
    const hashedPassword = await bcrypt.hash('password123', 10);
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    switch (pattern) {
        // ----------------------------------------------------------
        // minimal: ログイン・セッション確認のための最小セット
        // ----------------------------------------------------------
        case 'minimal': {
            const user = await userRepo.save(
                userRepo.create({
                    userId: `test-${ulid()}`,
                    userName: 'テストユーザー',
                    password: hashedPassword,
                })
            );
            return { users: [user], budgets: [] };
        }

        // ----------------------------------------------------------
        // lastMonthHeavyUser: 前月に大量の経費を申請したユーザーが
        // 今月初めてログインした場合のシナリオ
        // ----------------------------------------------------------
        case 'lastMonthHeavyUser': {
            const user = await userRepo.save(
                userRepo.create({
                    userId: `heavy-${ulid()}`,
                    userName: '前月大量申請ユーザー',
                    password: hashedPassword,
                })
            );

            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthPrefix = lastMonth.toISOString().slice(0, 7);

            // 前月の支出 15 件（食費・交通費・通信費をローテーション）
            const expenseEntries = Array.from({ length: 15 }, (_, i) => {
                const day = String(i + 1).padStart(2, '0');
                return budgetRepo.create({
                    id: ulid(),
                    amount: 1000 + (i + 1) * 200,
                    balanceType: 0,
                    userId: user.userId,
                    categoryId: (i % 3) + 1,
                    content: `前月経費 ${i + 1} 件目`,
                    date: `${lastMonthPrefix}-${day}`,
                });
            });

            // 前月の給与（収入）
            expenseEntries.push(
                budgetRepo.create({
                    id: ulid(),
                    amount: 300000,
                    balanceType: 1,
                    userId: user.userId,
                    categoryId: 1,
                    content: '前月給与',
                    date: `${lastMonthPrefix}-25`,
                })
            );

            const budgets = await budgetRepo.save(expenseEntries);
            return { users: [user], budgets };
        }

        // ----------------------------------------------------------
        // managerUser: 複数プロジェクトを跨いで経費を管理している
        // 管理職ユーザーのシナリオ（複数カテゴリ、今月と先月）
        // ----------------------------------------------------------
        case 'managerUser': {
            const manager = await userRepo.save(
                userRepo.create({
                    userId: `manager-${ulid()}`,
                    userName: '管理職ユーザー',
                    password: hashedPassword,
                })
            );

            const thisMonthPrefix = today.toISOString().slice(0, 7);
            const lastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
            const lastMonthPrefix = lastMonth.toISOString().slice(0, 7);

            const entries = [
                // 今月の各プロジェクト経費（カテゴリ 1〜5）
                ...([1, 2, 3, 4, 5] as const).map((cat) =>
                    budgetRepo.create({
                        id: ulid(),
                        amount: 5000 * cat,
                        balanceType: 0,
                        userId: manager.userId,
                        categoryId: cat,
                        content: `プロジェクト ${cat} 経費`,
                        date: `${thisMonthPrefix}-0${cat}`,
                    })
                ),
                // 今月の給与
                budgetRepo.create({
                    id: ulid(),
                    amount: 500000,
                    balanceType: 1,
                    userId: manager.userId,
                    categoryId: 1,
                    content: '管理職給与（今月）',
                    date: `${thisMonthPrefix}-25`,
                }),
                // 先月の交通費
                budgetRepo.create({
                    id: ulid(),
                    amount: 8000,
                    balanceType: 0,
                    userId: manager.userId,
                    categoryId: 2,
                    content: '先月出張交通費',
                    date: `${lastMonthPrefix}-20`,
                }),
            ];

            const budgets = await budgetRepo.save(entries);
            return { users: [manager], budgets };
        }

        // ----------------------------------------------------------
        // edgeCases: 実運用で起こり得るイレギュラーなデータ
        // - 最小金額（1円）
        // - 未来日の経費申請
        // - 極端に長い備考欄（250文字）
        // - content が null（任意項目が未入力）
        // ----------------------------------------------------------
        case 'edgeCases': {
            const user = await userRepo.save(
                userRepo.create({
                    userId: `edge-${ulid()}`,
                    userName: 'エッジケースユーザー',
                    password: hashedPassword,
                })
            );

            const futureDate = new Date(today);
            futureDate.setMonth(today.getMonth() + 1);
            const futureDateStr = futureDate.toISOString().slice(0, 10);

            const budgets = await budgetRepo.save([
                // 最小金額（1円）
                budgetRepo.create({
                    id: ulid(),
                    amount: 1,
                    balanceType: 0,
                    userId: user.userId,
                    categoryId: 1,
                    content: '最小金額テスト',
                    date: todayStr,
                }),
                // 未来日の経費申請
                budgetRepo.create({
                    id: ulid(),
                    amount: 10000,
                    balanceType: 0,
                    userId: user.userId,
                    categoryId: 2,
                    content: '未来日付テスト',
                    date: futureDateStr,
                }),
                // 極端に長い備考欄（250文字）
                budgetRepo.create({
                    id: ulid(),
                    amount: 5000,
                    balanceType: 0,
                    userId: user.userId,
                    categoryId: 3,
                    content: 'あ'.repeat(250),
                    date: todayStr,
                }),
                // content が null（任意項目未入力）
                budgetRepo.create({
                    id: ulid(),
                    amount: 2000,
                    balanceType: 0,
                    userId: user.userId,
                    categoryId: 1,
                    content: null,
                    date: todayStr,
                }),
            ]);
            return { users: [user], budgets };
        }
    }
}
