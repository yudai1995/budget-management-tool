import { configureStore } from '@reduxjs/toolkit';
import {
    TypedUseSelectorHook,
    useSelector as rawUseSelector,
} from 'react-redux';
import budgetListReducer from './budgetListSlice';

export const store = configureStore({
    reducer: { budgetList: budgetListReducer },
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
