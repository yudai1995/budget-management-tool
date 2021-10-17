import { IsNotEmpty, Min } from 'class-validator';

export enum BalanceType {
    Outgo,
    Income,
}
export type BalanceTypes = {
    type: 'outgo' | 'income';
    typenum: 0 | 1;
    typename: '支出' | '収入';
    color: string;
    borderColor: string;
};

export const balanceType: BalanceTypes[] = [
    {
        type: 'outgo',
        typenum: 0,
        typename: '支出',
        color: '#ff9676',
        borderColor: '#ff2419',
    },
    {
        type: 'income',
        typenum: 1,
        typename: '収入',
        color: '#4dbf7b',
        borderColor: '#0d9242',
    },
];

export class Budget {
    @IsNotEmpty()
    @Min(1)
    amount: number;
    categoryId: number;

    constructor(
        public id: string,
        amount: number,
        public balanceType: BalanceType,
        public content: string,
        public date: string,
        categoryId: number
    ) {
        this.amount = amount;
        this.categoryId = categoryId;
    }
}

/**
 * インスタンスの合計金額を取得
 * @param {Balance[]} moneyList
 * @param {BalanceType} type
 * @return {number} 合計値
 */
// export const sumAmount = (budgetLists: Budget[], type: BalanceType) => {
//     let counter = 0;
//     for (const data of budgetLists) {
//         if (data.balanceType === type) counter = counter + data.amount;
//     }
//     return counter;
// };

/**
 * インスタンスの支出または収入を取得
 * @param {Balance[]} moneyList
 * @param {BalanceType} type
 * @return {Budget[]}
 */
//export const filterMoneyType = (budgetLists: Budget[], type: BalanceType) => {
//     return budgetLists.filter((data) => data.balanceType === type);
// };

/**
 * ランダム値
 * @param {number} number
 * @return {string}
 */
export const getRandomID = () => {
    return Math.random().toString();
};
