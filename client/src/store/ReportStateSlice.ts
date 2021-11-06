import { createSlice } from '@reduxjs/toolkit';
import { ReportType, typeList } from '../Model/Date.model';
import { RootState } from './index';

const initialState: {
    targetDate: Date;
    targetMonth: Date;
    targetYear: Date;
    reportType: ReportType;
} = {
    targetDate: new Date(),
    targetMonth: new Date(),
    targetYear: new Date(),
    reportType: typeList[0],
};

export const ReportStateSlice = createSlice({
    name: 'ReportState',
    initialState,
    reducers: {
        setTargetDate: (state, action) => {
            state.targetDate = action.payload.targetDate;
        },
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
export const { setTargetDate, setTargetMonth, setTargetYear, setReportType } =
    ReportStateSlice.actions;
// state情報をexport
export const ReportState = (state: RootState) => state.ReportState;
// reducerをexport → storeへ
export default ReportStateSlice.reducer;
