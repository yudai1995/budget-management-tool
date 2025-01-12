import { Route, Switch } from 'react-router-dom'
import { ColumnLayout } from '../Components/Layout/Column/ColumnLayout'
import { SubColumn } from '../Components/Layout/Column/SubColumn'
import { MainColumn } from '../Components/Layout/Column/MainColumn'
import { Edit } from '../Components/Edit'
import { NotFound } from '../Components/NotFound'

export const AuthenticatedRoute: React.FC = () => {
    return (
        <Switch>
            <Route exact path="/edit">
                <Edit />
            </Route>
            <Route exact path={['/', '/monthly']}>
                <ColumnLayout width={[40, 60]}>
                    <SubColumn />
                    <MainColumn />
                </ColumnLayout>
            </Route>
            <Route path="/report">
                <ColumnLayout width={[40, 60]}>
                    <SubColumn />
                    <MainColumn />
                </ColumnLayout>
            </Route>
            <Route>
                <NotFound />
            </Route>
        </Switch>
    )
}
