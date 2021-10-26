import React, { useEffect } from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from './store';
import {
    addBudget,
    RequestData,
    RequestDataSuccess,
    RequestDataFailed,
} from './store/budgetListSlice';
import axios from 'axios';
import { Header } from './Components/Header';
import { ColumnLayout } from './Components/Layout/Column/ColumnLayout';
import { SubColumn } from './Components/Layout/Column/SubColumn';
import { MainColumn } from './Components/Layout/Column/MainColumn';
import { Edit } from './Components/Edit';
import { NotFound } from './Components/NotFound';
import { Footer } from './Components/Footer';
import { Budget } from './Model/budget.model';

const App: React.FC = () => {
    const isFetching = useSelector(
        (state: RootState) => state.budgetList.isFetching
    );
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(RequestData({}));
        axios
            .get('/api')
            .then((response) => {
                const budgetData = response.data.budget;

                (budgetData as Budget[]).forEach((data: Budget) => {
                    const newAmount = data.amount,
                        newType = data.balanceType,
                        newContent = data.content,
                        newDate = data.date,
                        newCategory = data.categoryId;

                    dispatch(
                        addBudget({
                            newAmount,
                            newType,
                            newContent,
                            newDate,
                            newCategory,
                        })
                    );
                });

                dispatch(RequestDataSuccess({}));
            })
            .catch((err) => {
                console.error(new Error(err));
                dispatch(RequestDataFailed({}));
            });
    }, [dispatch]);

    return (
        <div className="App">
            <BrowserRouter>
                <Header />

                <main>
                    {isFetching ? (
                        <div className="fetching">
                            <h2 className="title">取得中です...</h2>
                        </div>
                    ) : (
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
                    )}
                </main>

                <Footer />
            </BrowserRouter>
        </div>
    );
};

export default App;
