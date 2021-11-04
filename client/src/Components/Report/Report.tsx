import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

import {
    getTargetDateList,
    getTargetAnnulaList,
    sumAmount,
} from '../../store/budgetListSlice';
import classNames from 'classnames/bind';
import { ReportGraph } from '../Graph/ReportGraph';
import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';
import { Budget, balanceType } from '../../Model/budget.model';
import styles from '../../styles/Report.module.scss';

type ReportType = '月間' | '年間';
const typeList: ReportType[] = ['月間', '年間'];

export const Report: React.FC = () => {
    const [reportType, setReportType] = useState(typeList[0]);
    const [targetDate, setTargetDate] = useState(new Date());
    const budgetList = useSelector((state: RootState) => state.budgetList.data);

    let targetBudgetList: Budget[] = [];
    if (reportType === typeList[0]) {
        targetBudgetList = getTargetDateList(budgetList, [
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
        ]);
    } else {
        targetBudgetList = getTargetAnnulaList(budgetList, targetDate);
    }

    const sumOutcome = sumAmount(targetBudgetList, 0);
    const sumIncome = sumAmount(targetBudgetList, 1);
    const sumAll = sumAmount(targetBudgetList);

    const onClickPrevBtn = () => {
        reportType === typeList[0]
            ? setTargetDate(
                  new Date(targetDate.setMonth(targetDate.getMonth() - 1))
              )
            : setTargetDate(
                  new Date(targetDate.setFullYear(targetDate.getFullYear() - 1))
              );
    };

    const onClickNextBtn = () => {
        reportType === typeList[0]
            ? setTargetDate(
                  new Date(targetDate.setMonth(targetDate.getMonth() + 1))
              )
            : setTargetDate(
                  new Date(targetDate.setFullYear(targetDate.getFullYear() + 1))
              );
    };

    // タブのclass
    const cx = classNames.bind(styles);
    const tabclass = (showReport: ReportType) => {
        return cx({
            reportTypeTab: true,
            isActive: showReport === typeList[0],
        });
    };

    return (
        <>
            <div className={styles.settings}>
                <div
                    className={tabclass(reportType)}
                    onClick={() =>
                        setReportType((prevState) =>
                            prevState === typeList[0]
                                ? typeList[1]
                                : typeList[0]
                        )
                    }
                >
                    <p className={styles.tabCircle}>{reportType}レポート</p>
                    <ul className={styles.tabList}>
                        {typeList.map((type, index) => (
                            <li key={index} className={styles.tabListItem}>
                                {type}レポート
                            </li>
                        ))}
                    </ul>
                </div>
                <div className={styles.contorolArea}>
                    <button
                        onClick={onClickPrevBtn}
                        className={`${styles.changeDateBtn} iconBtn prev`}
                    >
                        ＜
                    </button>
                    <p className={styles.date}>
                        {reportType === typeList[0]
                            ? `${targetDate.getFullYear()}年${
                                  targetDate.getMonth() + 1
                              }月`
                            : `${targetDate.getFullYear()}年`}
                    </p>

                    <button
                        onClick={onClickNextBtn}
                        className={`${styles.changeDateBtn} iconBtn next`}
                    >
                        ＞
                    </button>
                </div>
                <section className={`${styles.sumReport} ${styles.All}`}>
                    <h3
                        className={styles.reportTitle}
                        style={{ color: '#FF9D42' }}
                    >
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
            </div>
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
