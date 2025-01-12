import { combineReducers } from 'redux'
import { configureStore } from '@reduxjs/toolkit'
import { TypedUseSelectorHook, useSelector as rawUseSelector } from 'react-redux'
import budgetListReducer from './budgetListSlice'
import CategoryListReducer from './CategoryListSlice'
import ReportStateReducer from './ReportStateSlice'
import LoginStateReducer from './LoginStateSlice'
import FetchingStateReducer from './FetchingStateSlice'

const reducer = combineReducers({
    budgetList: budgetListReducer,
    CategoryList: CategoryListReducer,
    ReportState: ReportStateReducer,
    LoginState: LoginStateReducer,
    FetchingState: FetchingStateReducer,
})

export const store = configureStore({
    reducer: reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: [
                    'budgetList/getBudget',
                    'budgetList/addBudget',
                    'budgetList/deleteBudget',
                    'FetchingState/RequestData',
                    'FetchingState/RequestDataSuccess',
                    'FetchingState/RequestDataFailed',
                    'ReportState/setReportType',
                    'ReportState/setTargetDate',
                    'ReportState/setTargetMonth',
                    'ReportState/setTargetYear',
                    'categoryList/setSelectCategory',
                    'ReportState/setTotalValueID',
                    'LoginState/setLogin',
                    'LoginState/setLogout',
                    'LoginState/setLoginMessage',
                ],
            },
        }),
})

// reduxを型安全に操作するための記述
export type RootState = ReturnType<typeof store.getState>
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector
export type AppDispatch = typeof store.dispatch
