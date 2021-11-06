import React from 'react';
import { ReportTypeTab } from './ReportTypeTab';
import { DateContorol } from './DateContorol';
import { SumReport } from './SumReport';
import styles from '../../../styles/Report/ReportSettings.module.scss';

export const ReportSettings: React.FC = () => {
    return (
        <div className={styles.settings}>
            <ReportTypeTab />
            <DateContorol />
            <SumReport />
        </div>
    );
};
