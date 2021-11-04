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
                        <>
                            <RecentGraph />
                            <RecentReport />
                        </>
                    </ContentLayout>
                </Route>
                <Route exact path="/monthly">
                    <ContentLayout title={false} option="monthly">
                        <Monthly />
                    </ContentLayout>
                </Route>
                <Route exact path="/report">
                    <ContentLayout title={false}>
                        <Report />
                    </ContentLayout>
                </Route>
                <Route path="/report/:date" component={DailyReport} />
            </Switch>
        </>
    );
};
