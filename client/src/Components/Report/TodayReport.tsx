import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { sumAmount } from '../../store/budgetListSlice';
import { getTargetDateList } from '../../store/budgetListSlice';
import { balanceType } from '../../Model/budget.model';
import styles from '../../styles/TodayReport.module.scss';

export const TodayReport: React.FC = () => {
    const today = new Date();

    const todayBudgetList = useSelector((state) =>
        getTargetDateList(state as RootState, [
            today.getFullYear(),
            today.getMonth() + 1,
            today.getDate(),
        ])
    );

    const todayOutcome = sumAmount(todayBudgetList, 0);
    const todayIncome = sumAmount(todayBudgetList, 1);
    const todayAllSum = sumAmount(todayBudgetList);

    return (
        <>
            <section className={`${styles.todayReport} ${styles.All}`}>
                <h3 className={styles.reportTitle} style={{ color: '#FF9D42' }}>
                    収支
                </h3>
                <p className={styles.reportContent}>
                    <span className={styles.yen}>¥</span>
                    {todayAllSum.toLocaleString()}
                </p>
            </section>

            <div className={styles.reportWrapper}>
                {balanceType.map((type) => (
                    <section className={`${styles.todayReport} ${type.type}`} key={type.type}>
                        <h3
                            className={styles.reportTitle}
                            style={{ color: type.color }}
                        >
                            {type.typename}
                        </h3>
                        <p className={styles.reportContent}>
                            <span className={styles.yen}>¥</span>
                            {type.typenum === 0 ? todayOutcome.toLocaleString() : todayIncome.toLocaleString()}
                        </p>
                    </section>
                ))}
            </div>
        </>
    );
};
