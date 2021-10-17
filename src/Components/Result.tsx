import React from 'react';
import { Budget } from '../Model/budget.model';
import { useSelector } from 'react-redux';
import { RootState } from '../store/index';
import { sumAmount, getRecentData } from '../store/budgetListSlice';
import { getTargetDateList } from '../store/budgetListSlice';
import '../styles/Result.scss';
import { NoDateLayout } from './Layout';

export const TodayResult: React.FC = () => {
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

export const RecentResult: React.FC = () => {
    const recentBudgetList = useSelector((state) =>
        getRecentData(state as RootState)
    );

    let formatRecentBudgetList: {
        date: string;
        BudgetLists: Budget[];
    }[] = [];

    recentBudgetList.forEach((data) => {
        const targetDate = data.date;

        const index = formatRecentBudgetList.findIndex(
            ({ date }) => date === targetDate
        );

        if (index === -1) {
            formatRecentBudgetList = [
                ...formatRecentBudgetList,
                {
                    date: targetDate,
                    BudgetLists: [data],
                },
            ];
        } else {
            formatRecentBudgetList[index].BudgetLists = [
                ...formatRecentBudgetList[index].BudgetLists,
                data,
            ];
        }
    });

    return (
        <NoDateLayout data={recentBudgetList}>
            <dl>
                {formatRecentBudgetList.map((data) => (
                    <>
                        <dt key={data.date}>{data.date}</dt>
                        {data.BudgetLists.map((Budgetdata) => (
                            <dd key={Budgetdata.id}>¥{Budgetdata.amount}</dd>
                        ))}
                    </>
                ))}
            </dl>
        </NoDateLayout>
    );
};
