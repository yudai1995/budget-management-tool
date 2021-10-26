import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getRecentData } from '../../store/budgetListSlice';
import { Link } from 'react-router-dom';
import { Budget } from '../../Model/budget.model';
import { hyphenToSlash } from '../../Model/Date.model';
import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';
import styles from '../../styles/RecentReport.module.scss';

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
            <dl className={styles.recentReportList}>
                {formatRecentBudgetList
                    .sort((a, b) =>
                        hyphenToSlash(a.date) < hyphenToSlash(b.date) ? 1 : -1
                    )
                    .map((data) => (
                        <div key={data.date} className={styles.reportListInner}>
                            <dt className={styles.date}>
                                <Link
                                    to={`report/${data.date}`}
                                    className={`${styles.toReportLink} iconBtn next`}
                                >
                                    {data.date.replace(/-/g, '/')}
                                </Link>
                            </dt>

                            {data.BudgetLists.map((Budgetdata) => (
                                <dd
                                    className={styles.report}
                                    key={Budgetdata.id}
                                >
                                    <ReportListLayout
                                        budgetData={Budgetdata}
                                        key={Budgetdata.id}
                                    />
                                </dd>
                            ))}
                        </div>
                    ))}
            </dl>
        </NoDateLayout>
    );
};
