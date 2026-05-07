/** 支出ゼロ日連続のマイルストーン定義 */
export const ZERO_STREAK_MILESTONES = [3, 7, 30, 100] as const;
export type ZeroStreakMilestone = (typeof ZERO_STREAK_MILESTONES)[number];

export type ZeroStreakMilestoneResult = {
    /** 達成済みの最大マイルストーン（未達成なら null） */
    achieved: ZeroStreakMilestone | null;
    /** 次のマイルストーン（すべて達成済みなら null） */
    next: ZeroStreakMilestone | null;
    /** 次のマイルストーンまでの残り日数 */
    daysToNext: number | null;
};

/**
 * 支出ゼロ連続日数からマイルストーン情報を算出する。
 * 達成済みマイルストーンのバッジ表示や次目標の表示に使用する。
 *
 * @param zeroStreakDays - 現在の支出ゼロ連続日数
 */
export function getZeroStreakMilestone(zeroStreakDays: number): ZeroStreakMilestoneResult {
    const sorted = [...ZERO_STREAK_MILESTONES].sort((a, b) => a - b);

    let achieved: ZeroStreakMilestone | null = null;
    let next: ZeroStreakMilestone | null = null;

    for (const milestone of sorted) {
        if (zeroStreakDays >= milestone) {
            achieved = milestone;
        } else if (next === null) {
            next = milestone;
        }
    }

    return {
        achieved,
        next,
        daysToNext: next !== null ? next - zeroStreakDays : null,
    };
}
