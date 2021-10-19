import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './index';
import { Category } from '../Model/Category.model';

export const types = [
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

const initialState: {
    data: Category[];
} = {
    data: [],
};

types.forEach((type) => {
    initialState.data = [
        ...initialState.data,
        new Category(initialState.data.length, type.name, type.color, true),
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
            state.data = [newCategory, ...state.data];
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
 * @return {string}
 */
export const getCategoryName = <T extends RootState | Category[]>(
    data: T,
    id: number
) => {
    let dataList;
    if (isState(data)) {
        dataList = data.CategoryList.data;
    } else {
        dataList = data;
    }
    const index = dataList.findIndex(({ categoryId }) => categoryId === id);
    
    return dataList[index].name;
};

// actionをexport
export const { addCategory } = categoryListSlice.actions;
// state情報をexport
export const categoryList = (state: RootState) => state.budgetList;
// reducerをexport → storeへ
export default categoryListSlice.reducer;
