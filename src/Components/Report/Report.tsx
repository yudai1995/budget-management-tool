import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import {
    getTargetDateList,
    getTargetAnnulaList,
} from '../../store/budgetListSlice';
import { ReportGraph } from '../Graph/ReportGraph';
// import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';
import { Budget } from '../../Model/budget.model';
import styles from '../../styles/Report.module.scss';

interface ReportProp {
    target: 'Monthly' | 'Annual';
}

export const Report: React.FC<ReportProp> = ({ target }) => {
    const [targetDate, setTargetDate] = useState(new Date());
    const budgetList = useSelector((state: RootState) => state.budgetList.data);

    let targetBudgetList: Budget[];
    if (target === 'Monthly') {
        targetBudgetList = getTargetDateList(budgetList, [
            targetDate.getFullYear(),
            targetDate.getMonth() + 1,
        ]);
    } else {
        targetBudgetList = getTargetAnnulaList(budgetList, targetDate);
    }

    const onClickPrevBtn = () => {
        target === 'Monthly'
            ? setTargetDate(
                  new Date(targetDate.setMonth(targetDate.getMonth() - 1))
              )
            : setTargetDate(
                  new Date(targetDate.setFullYear(targetDate.getFullYear() - 1))
              );
    };

    const onClickNextBtn = () => {
        target === 'Monthly'
            ? setTargetDate(
                  new Date(targetDate.setMonth(targetDate.getMonth() + 1))
              )
            : setTargetDate(
                  new Date(targetDate.setFullYear(targetDate.getFullYear() + 1))
              );
    };

    return (
        <>
            <div className={styles.contorolArea}>
                <button
                    onClick={onClickPrevBtn}
                    className={`${styles.changeDateBtn} iconBtn prev`}
                >
                    ＜
                </button>
                <p className={styles.date}>
                    {target === 'Monthly'
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
            <NoDateLayout data={targetBudgetList}>
                <>
                    {/* <ul>
                        {targetBudgetList.map((data) => (
                            <li key={data.id}>
                                <ReportListLayout budgetData={data} />
                            </li>
                        ))}
                    </ul> */}
                    <div className={styles.graphWrapper}>
                        <ReportGraph targetBudgetList={targetBudgetList} />
                    </div>
                </>
            </NoDateLayout>
        </>
    );
};
