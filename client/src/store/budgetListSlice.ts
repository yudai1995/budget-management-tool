import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Budget, BalanceType } from '../Model/budget.model';
import { getYear, getMonth, hyphenToSlash, getDate } from '../Model/Date.model';

const initialState: {
    data: Budget[];
} = {
    data: [],
};

export const budgetListSlice = createSlice({
    name: 'budgetList',
    initialState,
    reducers: {
        getBudget: (state, action) => {
            let newData: any = [];
            action.payload.budgetData.forEach((data: Budget) => {
                const newItem = new Budget(
                    data.id,
                    data.amount,
                    data.balanceType,
                    data.content,
                    data.date,
                    data.categoryId
                );
                newData = [...newData, newItem];
            });
            state.data = newData;
        },
        addBudget: (state, action) => {
            const newItem = new Budget(
                action.payload.newID,
                action.payload.newAmount,
                action.payload.newType,
                action.payload.newContent,
                action.payload.newDate,
                action.payload.newCategory
            );
            state.data = [...state.data, newItem];
        },
        deleteBudget: (state, action) => {
            state.data = state.data.filter(
                (data) => data.id !== action.payload.id
            );
        },
    },
});

/**
 *  Type Guard
 * */
const isState = (data: any): data is RootState => {
    return data.budgetList !== undefined;
};

/**
 * stateのbudgetListを返す
 * @param {RootState} state
 * @return {Budget[]}
 */
export const stateBadgetLists = (state: RootState) => {
    return state.budgetList.data;
};

/**
 * 合計金額を取得
 * @param {state} date
 * @param {BalanceType?} type
 * @return {number} 合計値
 */
export const sumAmount = <T extends RootState | Budget[]>(
    data: T,
    type?: BalanceType
) => {
    let dataList: Budget[];
    if (isState(data)) {
        dataList = data.budgetList.data;
    } else {
        dataList = data;
    }

    if (type === 0 || type === 1) {
        let counter = 0;
        for (const item of dataList) {
            if (item.balanceType === type) counter = counter + item.amount;
        }
        return counter;
    } else {
        let counter = 0;

        dataList.forEach((item) => {
            if (item.balanceType === 0) {
                counter = counter - item.amount;
            } else if (item.balanceType === 1) {
                counter = counter + item.amount;
            }
        });
        return counter;
    }
};

/**
 * 費用の支出か収入を取得
 * @param {BalanceType} type
 * @param {state} RootState
 * @return {Budget[]}
 */
export const filterMoneyType = (type: BalanceType, state: RootState) => {
    return state.budgetList.data.filter((item) => item.balanceType === type);
};

/**
 * 指定の期間のデータを取得する
 * @param {T extends RootState | Budget[]} data
 * @param {Date} targetDate
 * @param {string?} targetDay
 * @return {number} 合計値
 */
export const getTargetDateList = <T extends RootState | Budget[]>(
    data: T,
    targetDate: [number, number, number?],
    targetDay?: string
) => {
    let dataList: Budget[];
    if (isState(data)) {
        dataList = data.budgetList.data;
    } else {
        dataList = data;
    }

    if (targetDay) {
        return dataList.filter((data) => data.date === targetDay);
    } else if (targetDate.length === 3) {
        return dataList.filter(
            (data) =>
                getYear(data.date) === targetDate[0].toString() &&
                getMonth(data.date) === targetDate[1].toString() &&
                getDate(data.date) === targetDate[2]?.toString()
        );
    } else {
        return dataList.filter(
            (data) =>
                getYear(data.date) === targetDate[0].toString() &&
                getMonth(data.date) === targetDate[1].toString()
        );
    }
};

/**
 * 指定の年の通年データを取得する
 * @param {T extends RootState | Budget[]} data
 * @param {Date} targetYear
 * @return {number} 合計値
 */
export const getTargetAnnulaList = <T extends RootState | Budget[]>(
    data: T,
    target: Date
) => {
    let dataList: Budget[];
    if (isState(data)) {
        dataList = data.budgetList.data;
    } else {
        dataList = data;
    }

    const isYearDate = (data: Budget) => {
        const targetYear = data.date.split('-')[0];
        return targetYear === target.getFullYear().toString();
    };

    return dataList.filter(isYearDate);
};

/**
 * 直近一週間のデータを取得する
 * @param {currentDate} Date
 * @param {state} RootState
 * @return {number} 合計値
 */
export const getRecentData = (state: RootState) => {
    const today = new Date();
    const lastDay = new Date(new Date().setDate(new Date().getDate() - 7));

    const isRecentData = (data: Budget) => {
        const date = hyphenToSlash(data.date);
        return date <= today && date > lastDay;
    };

    return state.budgetList.data.filter(isRecentData);
};

/**
 * 日付ごとにまとめたデータを返す
 * @param {T extends RootState | Budget[]} budgetList
 * @return {{date: string; BudgetLists: Budget[];}} formatRecentBudgetList
 */
export const getFormatRecentBudgetList = <T extends RootState | Budget[]>(
    budgetList: T
) => {
    let recentBudgetList;
    if (isState(budgetList)) {
        recentBudgetList = budgetList.budgetList.data;
    } else {
        recentBudgetList = budgetList;
    }

    let formatRecentBudgetList: {
        date: string;
        BudgetLists: Budget[];
    }[] = [];
    recentBudgetList.forEach((data) => {
        const targetDate = data.date;

        const index = formatRecentBudgetList.findIndex(
            ({ date }) => date === targetDate
        );

        if (index === -1) {
            formatRecentBudgetList = [
                ...formatRecentBudgetList,
                {
                    date: targetDate,
                    BudgetLists: [data],
                },
            ];
        } else {
            formatRecentBudgetList[index].BudgetLists = [
                ...formatRecentBudgetList[index].BudgetLists,
                data,
            ];
        }
    });
    return formatRecentBudgetList;
};

// actionをexport
export const {
    getBudget,
    addBudget,
    deleteBudget,
} = budgetListSlice.actions;
// state情報をexport
export const budgetList = (state: RootState) => state.budgetList;
// reducerをexport → storeへ
export default budgetListSlice.reducer;
