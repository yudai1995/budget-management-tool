import { Switch, Route } from 'react-router-dom';
import { ContentLayout } from '../ContentLayout';
import { RecentReport } from '../../Report/RecentReport';
import { Monthly } from '../../Monthly';
import { DailyReport } from '../../Report/DailyReport';
import { RecentGraph } from '../../Graph/RecentGraph';
import { Report } from '../../Report/Report';

export const MainColumn: React.FC = () => {
    return (
        <>
            <Switch>
                <Route exact path="/">
                    <ContentLayout title="直近のレポート">
                        <RecentGraph />
                    </ContentLayout>
                    <ContentLayout>
                        <RecentReport />
                    </ContentLayout>
                </Route>
                <Route exact path="/monthly">
                    <ContentLayout title="カレンダー">
                        <Monthly />
                    </ContentLayout>
                </Route>
                <Route exact path="/report">
                    <ContentLayout title="月間レポート">
                        <Report target="Monthly" />
                    </ContentLayout>

                    <ContentLayout title="年間レポート">
                        <Report target="Annual" />
                    </ContentLayout>
                </Route>
                <Route path="/report/:date" component={DailyReport} />
            </Switch>
        </>
    );
};
