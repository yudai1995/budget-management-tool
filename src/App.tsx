import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './Components/Header';
import { ColumnLayout } from './Components/Layout/Column/ColumnLayout';
import { SubColumn } from './Components/Layout/Column/SubColumn';
import { MainColumn } from './Components/Layout/Column/MainColumn';
import { Edit } from './Components/Edit';
import { NotFound } from './Components/NotFound';
import { Footer } from './Components/Footer';

const App: React.FC = () => {
    return (
        <div className="App">
            <BrowserRouter>
                <Header />
                <main>
                    <div className="inner">
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
                    </div>
                </main>
                <Footer />
            </BrowserRouter>
        </div>
    );
};

export default App;
