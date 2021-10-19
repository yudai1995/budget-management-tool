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

    @Min(1)
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
 * ランダム値
 * @param {number} number
 * @return {string}
 */
export const getRandomID = () => {
    return Math.random().toString();
};
