import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getRecentData } from '../../store/budgetListSlice';
import { Link } from 'react-router-dom';
import { Budget } from '../../Model/budget.model';
import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';

export const RecentReport: React.FC = () => {
    const recentBudgetList = useSelector((state: RootState) =>
        getRecentData(state)
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
            <dl key={`recentReport"${recentBudgetList.length}`}>
                {formatRecentBudgetList.map((data) => (
                    <>
                        <dt key={data.date}>
                            <Link to={`report/${data.date}`}>{data.date}</Link>
                        </dt>

                        {data.BudgetLists.map((Budgetdata) => (
                            <dd key={Budgetdata.id}>
                                <ReportListLayout budgetData={Budgetdata} />
                            </dd>
                        ))}
                    </>
                ))}
            </dl>
        </NoDateLayout>
    );
};
