import { calculateXDay, type XDayInputs, type XDayResult } from '@budget/common';

/**
 * Xデー（資産枯渇日）算出ドメインサービス。
 * 純粋な計算を @budget/common に委譲し、ドメイン層のエントリポイントとして機能する。
 */
export class XDayCalculator {
    calculate(inputs: XDayInputs, now: Date = new Date()): XDayResult {
        return calculateXDay(inputs, now);
    }
}
