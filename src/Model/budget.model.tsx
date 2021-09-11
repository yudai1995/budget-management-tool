import { IsNotEmpty, Min, IsDate } from 'class-validator';
export enum BalanceType {
    Income,
    Outgo,
}
export type BalanceTypes = {
    type: 'income' | 'outgo';
    typenum: 0 | 1;
    typename: '収入' | '支出';
    color: string;
    borderColor: string;
};

export const balanceType: BalanceTypes[] = [
    {
        type: 'income',
        typenum: 0,
        typename: '収入',
        color: '#4dbf7b',
        borderColor: '#0d9242',
    },
    {
        type: 'outgo',
        typenum: 1,
        typename: '支出',
        color: '#ff9676',
        borderColor: '#ff2419',
    },
];

export class Balance {
    @IsNotEmpty()
    @Min(1)
    amount: number;

    @IsDate()
    date: Date

    constructor(
        public id: string,
        amount: number,
        public balanceType: BalanceType,
        public content: string,
        date: Date
    ) {
        this.amount = amount;
        this.date = date;
    }
}

/**
 * インスタンスの合計金額を取得
 * @param {Balance[]} moneyList
 * @param {BalanceType} type
 * @return {number} 合計値
 */
export const sumAmount = (moneyList: Balance[], type: BalanceType) => {
    let counter = 0;
    for (const item of moneyList) {
        if (item.balanceType === type) counter = counter + item.amount;
    }
    return counter;
};

/**
 * インスタンスの費用のタイプを取得
 * @param {Balance[]} moneyList
 * @param {BalanceType} type
 * @return {number} 合計値
 */
export const filterMoneyType = (moneyList: Balance[], type: BalanceType) => {
    return moneyList.filter((item) => item.balanceType === type);
};
