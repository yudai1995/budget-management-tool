import { createSlice } from '@reduxjs/toolkit';
import { ReportType, typeList } from '../Model/Date.model';
import { RootState } from './index';

const initialState: {
    targetMonth: Date;
    targetYear: Date;
    reportType: ReportType;
} = {
    targetMonth: new Date(),
    targetYear: new Date(),
    reportType: typeList[0],
};

export const ReportStateSlice = createSlice({
    name: 'ReportState',
    initialState,
    reducers: {
        setTargetMonth: (state, action) => {
            state.targetMonth = action.payload.targetMonth;
        },
        setTargetYear: (state, action) => {
            state.targetYear = action.payload.targetYear;
        },
        setReportType: (state, action) => {
            state.reportType = action.payload.reportType;
        },
    },
});

// actionをexport
export const { setTargetMonth, setTargetYear, setReportType } =
    ReportStateSlice.actions;
// state情報をexport
export const ReportState = (state: RootState) => state.ReportState;
// reducerをexport → storeへ
export default ReportStateSlice.reducer;
