import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './index'
import { BalanceType } from '../Model/budget.model'
import { Category } from '../Model/Category.model'

export const outgoTypes = [
    { name: '未分類', color: '#333333' },
    { name: '食費', color: '#0075FF' },
    { name: '交通費', color: '#FF3E3E' },
    { name: '光熱費', color: '#D3BB08' },
    { name: '通信費', color: '#784EFF' },
    { name: '住宅費', color: '#2BBAE5' },
    { name: '医療費', color: '#17B10A' },
    { name: '保険', color: '#0139D1' },
    { name: '日用品', color: '#F250F8' },
    { name: '衣類', color: '#10D100' },
    { name: '趣味', color: '#BE8529' },
    { name: 'その他', color: '#FF9D42' },
]

const incomeTypes = [
    { name: '未分類', color: '#333333' },
    { name: '給料', color: '#10B702' },
    { name: '賞与', color: '#C93737' },
    { name: '副業', color: '#FF6505' },
    { name: '所得', color: '#04BEA1' },
    { name: '年金', color: '#865AFF' },
    { name: 'おこづかい', color: '#D9BB69' },
    { name: 'その他', color: '#FF9D42' },
]

const initialState: {
    data: Category[][]
    selectedCategory: number
} = {
    data: [[], []],
    selectedCategory: 0,
}

const outgoNumber = BalanceType['Outgo']
outgoTypes.forEach((outgoType) => {
    initialState.data[outgoNumber] = [
        ...initialState.data[outgoNumber],
        new Category(initialState.data[outgoNumber].length, outgoType.name, outgoType.color, true),
    ]
})

const incomeNumber = BalanceType['Income']
incomeTypes.forEach((outgoType) => {
    initialState.data[incomeNumber] = [
        ...initialState.data[incomeNumber],
        new Category(initialState.data[incomeNumber].length, outgoType.name, outgoType.color, true),
    ]
})

export const categoryListSlice = createSlice({
    name: 'categoryList',
    initialState,
    reducers: {
        addCategory: (state, action) => {
            const newCategory = new Category(action.payload.newCategoryId, action.payload.newName, action.payload.newColor, true)
            if (action.payload.newType === 0) {
                state.data[action.payload.newType] = [newCategory, ...state.data[action.payload.newType]]
            }
        },
        setSelectCategory: (state, action) => {
            state.selectedCategory = action.payload.selectedCategory
        },
    },
})

/**
 *  Type Guard
 * */
const isState = (data: any): data is RootState => {
    return data.CategoryList !== undefined
}

/**
 * カテゴリIDからカテゴリ名を取得する
 * @param {T extends RootState | Category[]} data
 * @param {number} id
 * @param {BalanceType} type
 * @return {string}
 */
export const getCategoryData = <T extends RootState | Category[][]>(data: T, id: number, type: BalanceType) => {
    let dataList
    if (isState(data)) {
        dataList = data.CategoryList.data
    } else {
        dataList = data
    }
    const index = dataList[type].findIndex(({ categoryId }) => categoryId === id)

    return dataList[type][index]
}

// actionをexport
export const { addCategory, setSelectCategory } = categoryListSlice.actions
// state情報をexport
export const categoryList = (state: RootState) => state.CategoryList
// reducerをexport → storeへ
export default categoryListSlice.reducer
