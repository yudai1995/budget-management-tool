import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
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
import { Footer } from './Components/Footer';
import { Budget } from './Model/budget.model';
import { BudgetAppRouter } from './Route/BudgetAppRouter';

const App: React.FC = () => {
    const isFetching = useSelector(
        (state: RootState) => state.budgetList.isFetching
    );
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(RequestData({}));
        axios
            .get('/api/budget')
            .then((response) => {
                const budgetData = response.data.budget;

                (budgetData as Budget[]).forEach((data: Budget) => {
                    const newID = data.id,
                        newAmount = data.amount,
                        newType = data.balanceType,
                        newContent = data.content,
                        newDate = data.date,
                        newCategory = data.categoryId;

                    dispatch(
                        addBudget({
                            newID,
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
                            <h2 className="title">処理中です...</h2>
                        </div>
                    ) : (
                        <div className="inner">
                            <BudgetAppRouter />
                        </div>
                    )}
                </main>

                <Footer />
            </BrowserRouter>
        </div>
    );
};

export default App;
