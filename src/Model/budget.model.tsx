export type BalanceType = 'income' | 'outgo';

export class Balance {
    constructor(public id: string,
        public amount: number,
        public type: BalanceType,
        public content: string
        //public Date: Date
        ) {

    };
}