import React from 'react';
import { useSelector } from 'react-redux';
import { balanceType } from '../../../Model/budget.model';
import { RootState } from '../../../store';
import { sumAmount } from '../../../store/budgetListSlice';
import {
    getTargetDateList,
    getTargetAnnulaList,
} from '../../../store/budgetListSlice';
import { Budget } from '../../../Model/budget.model';
import { typeList } from '../../../Model/Date.model';
import styles from '../../../styles/Report/SumReport.module.scss';

export const SumReport: React.FC = () => {
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
    } else {
        targetBudgetList = getTargetAnnulaList(budgetList, targetYear);
    }

    const sumOutcome = sumAmount(targetBudgetList, 0),
        sumIncome = sumAmount(targetBudgetList, 1),
        sumAll = sumAmount(targetBudgetList);

    return (
        <>
            <section className={`${styles.sumReport} ${styles.All}`}>
                <h3 className={styles.reportTitle} style={{ color: '#FF9D42' }}>
                    収支
                </h3>
                <p className={styles.reportContent}>
                    <span className={styles.yen}>¥</span>
                    {sumAll.toLocaleString()}
                </p>
            </section>

            <div className={styles.sumReportWrapper}>
                {balanceType.map((type) => (
                    <section
                        className={`${styles.sumReport} ${type.type}`}
                        key={type.type}
                    >
                        <h3
                            className={styles.reportTitle}
                            style={{ color: type.color }}
                        >
                            {type.typename}
                        </h3>
                        <p className={styles.reportContent}>
                            <span className={styles.yen}>¥</span>
                            {type.typenum === 0
                                ? sumOutcome.toLocaleString()
                                : sumIncome.toLocaleString()}
                        </p>
                    </section>
                ))}
            </div>
        </>
    );
};
