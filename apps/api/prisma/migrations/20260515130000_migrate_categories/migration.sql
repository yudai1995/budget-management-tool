-- カテゴリ体系の刷新に伴う既存データの移行
-- 旧 12 分類 → 新 10 分類へ変換する（冪等）
--
-- 衝突回避のため一時 ID (99) を使用してスワップを行う:
--   旧 9 (衣類)  → 新 7 (美容・衣類)
--   旧 7 (保険)  → 新 9 (医療・保険)  ← 9 を先に退避してから処理
--
-- 実行順序:
--   1. 旧 9 (衣類) を 99 に退避
--   2. 旧 6 (医療費) → 9
--   3. 旧 7 (保険)  → 9
--   4. 99 (旧衣類)  → 7
--   5. 旧 3 (光熱費) → 5  （8 を先にクリアするため 8→3 の前に実行）
--   6. 旧 8 (日用品) → 3  （旧光熱費が 5 へ移動済みなので 3 は空になった）
--   7. 旧 2 (交通費) → 8  （旧日用品が 3 へ移動済みなので 8 は空になった）
--   8. 旧 10 (趣味)  → 0
--   9. 旧 11 (その他) → 0

UPDATE `budget_list` SET `categoryId` = 99 WHERE `categoryId` = 9;
UPDATE `budget_list` SET `categoryId` = 9  WHERE `categoryId` = 6;
UPDATE `budget_list` SET `categoryId` = 9  WHERE `categoryId` = 7;
UPDATE `budget_list` SET `categoryId` = 7  WHERE `categoryId` = 99;
UPDATE `budget_list` SET `categoryId` = 5  WHERE `categoryId` = 3;
UPDATE `budget_list` SET `categoryId` = 3  WHERE `categoryId` = 8;
UPDATE `budget_list` SET `categoryId` = 8  WHERE `categoryId` = 2;
UPDATE `budget_list` SET `categoryId` = 0  WHERE `categoryId` = 10;
UPDATE `budget_list` SET `categoryId` = 0  WHERE `categoryId` = 11;
