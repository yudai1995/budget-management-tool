import React from 'react';
import { useSelector, RootState } from './store/index';
import { getFetchingState } from './store/FetchingStateSlice';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Components/Header';
import { BudgetAppRouter } from './Route/BudgetAppRouter';
import { Footer } from './Components/Footer';

const App: React.FC = () => {
    const isFetching = useSelector((state: RootState) =>
        getFetchingState(state)
    );
    return (
        <div className={isFetching ? `fetching App` : `App`}>
            <BrowserRouter>
                <Header />
                <main>
                    {isFetching ? (
                        <div className="fetchingWrapper">
                            <h2 className="title">処理中です...</h2>
                        </div>
                    ) : (
                        <></>
                    )}
                    <div className="inner">
                        <BudgetAppRouter />
                    </div>
                </main>

                <Footer />
            </BrowserRouter>
        </div>
    );
};

export default App;
