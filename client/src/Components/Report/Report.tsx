import React from 'react';
// import { MonthlyReport } from './MonthlyReport';
// import { AnnualReport } from './AnnualReport';
// import { useSelector } from 'react-redux';
// import { RootState } from '../../store';
// import { typeList } from '../../Model/Date.model';
import { ReportSettings } from '../Layout/Report/ReportSettings';
import { ReportLayout } from '../Layout/Report/ReportLayout';

export const Report: React.FC = () => {
    // const reportType = useSelector(
    //     (state: RootState) => state.ReportState.reportType
    // );

    return (
        <>
            <ReportSettings />
            <ReportLayout />
        </>
    );
};
