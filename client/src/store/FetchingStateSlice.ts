import { createSlice } from '@reduxjs/toolkit';
import { RootState } from './index';

const initialState: {
    isFetching: boolean;
} = {
    isFetching: false,
};

export const FetchingStateSlice = createSlice({
    name: 'FetchingState',
    initialState,
    reducers: {
        RequestData: (state, action) => {
            state.isFetching = true;
        },
        RequestDataSuccess: (state, action) => {
            state.isFetching = false;
        },
        RequestDataFailed: (state, action) => {
            state.isFetching = false;
        },
    },
});

export const getFetchingState = (state: RootState) => {
    return state.FetchingState.isFetching;
};

// actionをexport
export const { RequestData, RequestDataSuccess, RequestDataFailed } =
    FetchingStateSlice.actions;
// state情報をexport
export const fetchingState = (state: RootState) => state.FetchingState;
// reducerをexport → storeへ
export default FetchingStateSlice.reducer;
