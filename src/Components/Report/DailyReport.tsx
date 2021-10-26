import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getTargetDateList } from '../../store/budgetListSlice';
import { ContentLayout } from '../Layout/ContentLayout';
import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';
import styles from '../../styles/DailyReport.module.scss';

export const DailyReport: React.FC = () => {
    const path = useLocation().pathname;
    const Date = path.split('/')[2];

    const targetBudgetList = useSelector((state: RootState) =>
        getTargetDateList(state, [0, 0, 0], Date)
    );

    return (
        <ContentLayout title={`${Date.replace(/-/g, '/')}のレポート`}>
            <NoDateLayout data={targetBudgetList}>
                <ul className={styles.dairyReportList}>
                    {targetBudgetList.map((data) => (
                        <li key={data.id} className={styles.dairyReport}>
                            <ReportListLayout budgetData={data} />
                        </li>
                    ))}
                </ul>
            </NoDateLayout>
        </ContentLayout>
    );
};
