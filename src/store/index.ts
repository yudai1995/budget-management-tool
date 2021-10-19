import { combineReducers } from 'redux';
import { configureStore } from '@reduxjs/toolkit';
import {
    TypedUseSelectorHook,
    useSelector as rawUseSelector,
} from 'react-redux';
import budgetListReducer from './budgetListSlice';
import CategoryListReducer from './CategoryListSlice';

const reducer = combineReducers({
    budgetList: budgetListReducer,
    CategoryList: CategoryListReducer,
});

export const store = configureStore({
    reducer: reducer,
    middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({
            serializableCheck: {
                ignoredActions: ['budgetList/addBudget'],
            },
        }),
});

// reduxを型安全に操作するための記述
export type RootState = ReturnType<typeof store.getState>;
export const useSelector: TypedUseSelectorHook<RootState> = rawUseSelector;
export type AppDispatch = typeof store.dispatch;
