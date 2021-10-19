import { ContentLayout } from '../ContentLayout';
import { TodayReport } from '../../Report/TodayReport';
import { SimpleInputForm } from '../../SimpleInputForm';

export const SubColumn: React.FC = () => {
    return (
        <>
            <ContentLayout title="本日のレポート">
                <TodayReport />
            </ContentLayout>

            <ContentLayout title="収支の入力">
                <SimpleInputForm />
            </ContentLayout>
        </>
    );
};
