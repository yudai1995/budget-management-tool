import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from '../styles/Header.module.scss';
import Logo from '../img/common/icon-logo.png';
import {
    getIsLoginAuth,
    getLoginUser,
    setLogout,
} from '../store/LoginStateSlice';
import { useSelector, RootState } from '../store/index';
import { useDispatch } from 'react-redux';
import {
    RequestData,
    RequestDataFailed,
    RequestDataSuccess,
} from '../store/budgetListSlice';
import axios from 'axios';

const grobalNavi = [
    {
        text: 'ホーム',
        link: '',
    },
    {
        text: 'カレンダー',
        link: 'monthly',
    },
    {
        text: 'レポート',
        link: 'report',
    },
    {
        text: '入力',
        link: 'edit',
    },
];

export const Header: React.FC = () => {
    const dispatch = useDispatch();
    const isLogin = useSelector((state: RootState) => getIsLoginAuth(state));
    const loginUser = useSelector((state: RootState) => getLoginUser(state));

    const logoutHandler = (event: React.FormEvent) => {
        event.preventDefault();
        dispatch(RequestData({}));
        axios
            .post('/api/logout')
            .then((response) => {
                dispatch(setLogout({}));
                dispatch(RequestDataSuccess({}));
            })
            .catch((err) => {
                console.log(err);
                dispatch(RequestDataFailed({}));
            });
    };
    return (
        <header className={styles.menuHeader}>
            <div className="inner">
                <div className={styles.headerWrapper}>
                    <div className={styles.headerTitleWrapper}>
                        <h1 className={styles.headerTitle}>
                            <NavLink to="/" className={styles.logo}>
                                <img
                                    src={Logo}
                                    alt="家計簿管理ツール"
                                    width="24"
                                    height="24"
                                />
                                家計簿管理ツール
                            </NavLink>
                        </h1>
                        {isLogin ? (
                            <div className={`${styles.loginWrapper} sp-only`}>
                                <p className={`${styles.loginUser}`}>
                                    {loginUser ? loginUser : '未ログイン'}
                                </p>
                                <button
                                    className={`${styles.logoutBtn}`}
                                    onClick={logoutHandler}
                                >
                                    ログアウト
                                </button>
                            </div>
                        ) : (
                            <></>
                        )}
                    </div>
                    {isLogin ? (
                        <div className={styles.headerlinksWrapper}>
                            <ul className={styles.grobalNavi}>
                                {grobalNavi.map((navi) => (
                                    <GrobalNaviList
                                        link={navi.link}
                                        key={navi.link}
                                    >
                                        {navi.text}
                                    </GrobalNaviList>
                                ))}
                            </ul>
                            <div className={`${styles.loginWrapper} pc-only`}>
                                <p className={`${styles.loginUser}`}>
                                    {loginUser ? loginUser : '未ログイン'}
                                </p>
                                <button
                                    className={`${styles.logoutBtn}`}
                                    onClick={logoutHandler}
                                >
                                    ログアウト
                                </button>
                            </div>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
            </div>
        </header>
    );
};

interface grobalNaviListProp {
    children: string;
    link: string;
}

export const GrobalNaviList: React.FC<grobalNaviListProp> = ({
    children,
    link,
}) => {
    return (
        <li className={styles.grobalNaviList} key={link}>
            {link === 'report' ? (
                <NavLink activeClassName={styles.active} to={`/${link}`}>
                    {children}
                </NavLink>
            ) : (
                <NavLink activeClassName={styles.active} to={`/${link}`} exact>
                    {children}
                </NavLink>
            )}
        </li>
    );
};
