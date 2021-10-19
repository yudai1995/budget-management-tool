import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { Header } from './Components/Header';
import { ColumnLayout } from './Components/Layout/Column/ColumnLayout';
import { SubColumn } from './Components/Layout/Column/SubColumn';
import { MainColumn } from './Components/Layout/Column/MainColumn';
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
                            <Route path="/edit">
                                <section className="content">
                                    <h2 className="headTitle">収支の入力</h2>
                                </section>
                            </Route>
                            <Route exact path={['/', '/monthly']}>
                                <ColumnLayout>
                                    <SubColumn />
                                    <MainColumn />
                                </ColumnLayout>
                            </Route>
                            <Route path="/report">
                                <ColumnLayout>
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
