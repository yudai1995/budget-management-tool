export type BalanceType = 'income' | 'outgo';

export class Balance {
    constructor(public id: string,
        public amount: number,
        public balanceType: BalanceType,
        public content: string
        //public Date: Date
        ) {

    };
}

/**
 * インスタンスの合計金額を取得
 * @param {Balance[]} moneyList 
 * @param {BalanceType} type
 * @return {number} 合計値
 */
export const sumAmount = (moneyList:Balance[], type: BalanceType) => {
    let counter = 0;
    for (const item of moneyList) {
        if (item.balanceType === type) counter = counter + item.amount;
    }
    return counter;
}