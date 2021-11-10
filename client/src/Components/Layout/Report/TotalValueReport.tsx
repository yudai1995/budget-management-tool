import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BalanceType, balanceType } from '../../../Model/budget.model';
import { RootState } from '../../../store';
import { sumAmount } from '../../../store/budgetListSlice';
import { setTotalValueID } from '../../../store/ReportStateSlice';
import {
    getTargetDateList,
    getTargetAnnulaList,
} from '../../../store/budgetListSlice';
import { Budget } from '../../../Model/budget.model';
import { typeList } from '../../../Model/Date.model';
import styles from '../../../styles/Report/TotalValueReport.module.scss';
import classNames from 'classnames/bind';

export const TotalValueReport: React.FC = () => {
    const dispatch = useDispatch();
    const budgetList = useSelector((state: RootState) => state.budgetList.data);
    const reportType = useSelector(
        (state: RootState) => state.ReportState.reportType
    );

    const targetDate = useSelector(
        (state: RootState) => state.ReportState.targetDate
    );
    let targetBudgetList: Budget[] = [];
    if (reportType === typeList[0]) {
        targetBudgetList = getTargetDateList(budgetList, [
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
        ]);
    } else {
        targetBudgetList = getTargetAnnulaList(budgetList, targetDate);
    }

    const sumOutcome = sumAmount(targetBudgetList, 0),
        sumIncome = sumAmount(targetBudgetList, 1),
        sumAll = sumAmount(targetBudgetList);
    const totalValueType = useSelector(
        (state: RootState) => state.ReportState.totalValueID
    );

    // タブのclass
    const cx = classNames.bind(styles);
    const tabclass = (type: BalanceType | 2) => {
        return cx({
            totalValueReport: true,
            isActive: type === totalValueType,
            all: type === 2,
            outgo: type === balanceType[0].typenum,
            income: type === balanceType[1].typenum,
        });
    };

    return (
        <>
            <section
                className={classNames(tabclass(2))}
                onClick={() => dispatch(setTotalValueID({ totalValueID: 2 }))}
            >
                <h3 className={styles.reportTitle} style={{ color: '#FF9D42' }}>
                    収支
                </h3>
                <p className={styles.reportContent}>
                    <span className={styles.yen}>¥</span>
                    {sumAll.toLocaleString()}
                </p>
            </section>

            <div className={styles.totalValueReportWrapper}>
                {balanceType.map((type) => (
                    <section
                        className={classNames(tabclass(type.typenum))}
                        key={type.type}
                        onClick={() =>
                            dispatch(
                                setTotalValueID({
                                    totalValueID: type.typenum,
                                })
                            )
                        }
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
