import React from 'react';
import { useSelector, RootState } from './store/index';
import { getFetchingState } from './store/FetchingStateSlice';
import { BrowserRouter } from 'react-router-dom';
import { Header } from './Components/Header';
import { BudgetAppRouter } from './Route/BudgetAppRouter';
import { Footer } from './Components/Footer';
import { Helmet } from 'react-helmet';
import { getLoginUser } from './store/LoginStateSlice';
import { pageTitle } from './Model/navigation.model';
import { guest } from './Model/User.model';

const App: React.FC = () => {
    const isFetching = useSelector((state: RootState) =>
        getFetchingState(state)
    );
    const loginUser = useSelector((state: RootState) => getLoginUser(state));
    const title = pageTitle.Home;

    return (
        <div className={isFetching ? `fetching App` : `App`}>
            <Helmet>
                <meta
                    name="description"
                    content={`家計簿管理の${title}画面です`}
                />
                <meta name="keywords" content={`家計簿, 支出管理, ${title}`} />
                <meta property="og:title" content={`${title} | 家計簿管理`} />
                <meta
                    property="og:description"
                    content={`家計簿管理の${title}画面です`}
                />
                <title>{`${
                    guest['guest-en'] === loginUser
                        ? guest['guest-ja']
                        : loginUser
                }さん | 家計簿管理`}</title>
            </Helmet>
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
