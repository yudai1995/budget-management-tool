import { useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import { getTargetDateList } from '../../store/budgetListSlice';
import { ContentLayout } from '../Layout/ContentLayout';
import { ReportListLayout } from '../Layout/ReportListLayout';
import { NoDateLayout } from '../Layout/NoDateLayout';
import styles from '../../styles/DailyReport.module.scss';
import { Helmet } from 'react-helmet';
import { pageTitle } from '../../Model/navigation.model';

export const DailyReport: React.FC = () => {
    const path = useLocation().pathname;
    const Date = path.split('/')[2];

    const targetBudgetList = useSelector((state: RootState) =>
        getTargetDateList(state, [0, 0, 0], Date)
    );
    const title = pageTitle.Report;
    const date = Date.replace(/-/g, '/');

    return (
        <>
            <Helmet>
                <meta
                    name="description"
                    content={`家計簿管理の${date}の${title}画面です`}
                />
                <meta name="keywords" content={`家計簿, 支出管理, ${title}`} />
                <meta
                    property="og:title"
                    content={`${date}の${title} | 家計簿管理`}
                />
                <meta
                    property="og:description"
                    content={`家計簿管理の${date}の${title}画面です`}
                />
                <title>{`${date}の${title} | 家計簿管理`}</title>
            </Helmet>
            <ContentLayout title={`${date}の${title}`}>
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
        </>
    );
};
