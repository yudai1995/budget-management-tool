import { useSelector } from 'react-redux';
import { RootState } from '../../store/index';
import { sumAmount } from '../../store/budgetListSlice';
import { getTargetDateList } from '../../store/budgetListSlice';

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
            <section>
                <h3>収支</h3>
                <dd>{todayAllSum}</dd>
            </section>

            <section>
                <h3>支出</h3>
                <dd>{todayOutcome}</dd>
            </section>

            <section>
                <h3>収入</h3>
                <dd>{todayIncome}</dd>
            </section>
        </>
    );
};
