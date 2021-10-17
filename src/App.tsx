import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/index';
import { getTargetDateList } from './store/budgetListSlice';
import { Header } from './Components/Header';
import { ColumnLayout, SubColumn, MainColumn } from './Components/Layout';
import { NotFound } from './Components/NotFound';
import { Graph } from './Components/Graph';
import { ItemList } from './Components/ItemList';
import { Footer } from './Components/Footer';

const App: React.FC = () => {
    const today = new Date();
    const budgetLists = useSelector((state) =>
        getTargetDateList(state as RootState, [
            today.getFullYear(),
            today.getMonth() + 1,
        ])
    );

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
                            {/* <Route path={['monthly', 'report']}> */}
                            <Route exact path={['/', '/report']}>
                                <ColumnLayout>
                                    <SubColumn />
                                    <MainColumn />
                                </ColumnLayout>
                            </Route>
                            <Route path="/monthly">
                                <ColumnLayout>
                                    <SubColumn />
                                    <MainColumn />
                                </ColumnLayout>
                            </Route>
                            <Route>
                                <NotFound />
                            </Route>
                        </Switch>

                        <div className="topWrapper">
                            <Graph />
                        </div>

                        <ItemList BudgetLists={budgetLists}></ItemList>
                    </div>
                </main>
                <Footer />
            </BrowserRouter>
        </div>
    );
};

export default App;
