import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { Budget } from '../../Model/budget.model';
import {
    getTargetDateList,
    getTargetAnnulaList,
} from '../../store/budgetListSlice';
import { typeList } from '../../Model/Date.model';
import { ReportSettings } from '../Layout/Report/ReportSettings';
import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';
import { ReportGraph } from '../Graph/ReportGraph';
import styles from '../../styles/Report.module.scss';

export const Report: React.FC = () => {
    const budgetList = useSelector((state: RootState) => state.budgetList.data);
    const reportType = useSelector(
        (state: RootState) => state.ReportState.reportType
    );
    const targetMonth = useSelector(
        (state: RootState) => state.ReportState.targetMonth
    );
    const targetYear = useSelector(
        (state: RootState) => state.ReportState.targetYear
    );

    let targetBudgetList: Budget[] = [];
    if (reportType === typeList[0]) {
        targetBudgetList = getTargetDateList(budgetList, [
            targetMonth.getFullYear(),
            targetMonth.getMonth() + 1,
        ]);
    } else if (reportType === typeList[1]) {
        targetBudgetList = getTargetAnnulaList(budgetList, targetYear);
    }

    return (
        <>
            <ReportSettings />
            <NoDateLayout data={targetBudgetList}>
                <>
                    <div className={styles.graphWrapper}>
                        <ReportGraph targetBudgetList={targetBudgetList} />
                    </div>
                    <ul>
                        {targetBudgetList.map((data) => (
                            <li key={data.id} className={styles.report}>
                                <ReportListLayout budgetData={data} />
                            </li>
                        ))}
                    </ul>
                </>
            </NoDateLayout>
        </>
    );
};
