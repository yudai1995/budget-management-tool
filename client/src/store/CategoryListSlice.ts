import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './index';
import { BalanceType } from '../Model/budget.model';
import { Category } from '../Model/Category.model';

export const outgoTypes = [
    { name: '未分類', color: '#' },
    { name: '食費', color: '#' },
    { name: '交通費', color: '#' },
    { name: '光熱費', color: '#' },
    { name: '通信費', color: '#' },
    { name: '住宅費', color: '#' },
    { name: '医療費', color: '#' },
    { name: '保険', color: '#' },
    { name: '住宅費', color: '#' },
    { name: '日用品', color: '#' },
    { name: '衣類', color: '#' },
    { name: '趣味', color: '#' },
    { name: 'その他', color: '#' },
];

const incomeTypes = [
    { name: '未分類', color: '#' },
    { name: '給料', color: '#' },
    { name: '賞与', color: '#' },
    { name: '副業', color: '#' },
    { name: '所得', color: '#' },
    { name: '年金', color: '#' },
    { name: 'おこづかい', color: '#' },
    { name: 'その他', color: '#' },
];

const initialState: {
    data: Category[][];
} = {
    data: [[], []],
};

const outgoNumber = BalanceType['Outgo'];
outgoTypes.forEach((outgoType) => {
    initialState.data[outgoNumber] = [
        ...initialState.data[outgoNumber],
        new Category(
            initialState.data[outgoNumber].length,
            outgoType.name,
            outgoType.color,
            true
        ),
    ];
});

const incomeNumber = BalanceType['Income'];
incomeTypes.forEach((outgoType) => {
    initialState.data[incomeNumber] = [
        ...initialState.data[incomeNumber],
        new Category(
            initialState.data[incomeNumber].length,
            outgoType.name,
            outgoType.color,
            true
        ),
    ];
});

export const categoryListSlice = createSlice({
    name: 'categoryList',
    initialState,
    reducers: {
        addCategory: (state, action) => {
            const newCategory = new Category(
                action.payload.newCategoryId,
                action.payload.newName,
                action.payload.newColor,
                true
            );
            if (action.payload.newType === 0) {
                state.data[action.payload.newType] = [
                    newCategory,
                    ...state.data[action.payload.newType],
                ];
            }
        },
    },
});

/**
 *  Type Guard
 * */
const isState = (data: any): data is RootState => {
    return data.CategoryList !== undefined;
};

/**
 * カテゴリIDからカテゴリ名を取得する
 * @param {T extends RootState | Category[]} data
 * @param {number} id
 * @param {BalanceType} type
 * @return {string}
 */
export const getCategoryName = <T extends RootState | Category[][]>(
    data: T,
    id: number,
    type: BalanceType
) => {
    let dataList;
    if (isState(data)) {
        dataList = data.CategoryList.data;
    } else {
        dataList = data;
    }
    const index = dataList[type].findIndex(
        ({ categoryId }) => categoryId === id
    );

    return dataList[type][index].name;
};

// actionをexport
export const { addCategory } = categoryListSlice.actions;
// state情報をexport
export const categoryList = (state: RootState) => state.budgetList;
// reducerをexport → storeへ
export default categoryListSlice.reducer;
