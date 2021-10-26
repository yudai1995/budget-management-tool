import { IsNotEmpty, Min, NotEquals } from 'class-validator';

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
    id: string;

    @IsNotEmpty()
    @Min(1)
    amount: number;

    @Min(1)
    categoryId: number;

    @NotEquals('')
    date: string;

    constructor(
        id: string,
        amount: number,
        public balanceType: BalanceType,
        public content: string,
        date: string,
        categoryId: number
    ) {
        this.id = id;
        this.amount = amount;
        this.date = date;
        this.categoryId = categoryId;
    }
}

/**
 * ランダム値
 * @param {number?} myStrong
 * @return {string}
 */
export const getRandomID = (myStrong?: number) => {
    let strong: number;
    myStrong ? (strong = myStrong) : (strong = 1000);
    return (
        new Date().getTime().toString(16) +
        Math.floor(strong * Math.random()).toString(16)
    );
};

/**
 * 日本円単位を付与する
 * @param {number} number
 * @return {string}
 */
export const unitFormat = (num: number) => {
    const stringNum = num.toString();
    const len = stringNum.length;
    const units = ['', '万', '億', '兆', '京', '垓'];
    let result = '';
    let results = [];

    for (let i = 0; i < Math.ceil(len / 4); i++) {
        results[i] = Number(
            stringNum.substring(len - i * 4, len - (i + 1) * 4)
        );

        if (results[i] !== 0) {
            result =
                results[i].toString().replace(/(\d)(?=(\d\d\d)+$)/g, '$1,') +
                units[i] +
                result;
        }
    }
    if (result === '') return '0';
    return result;
};
