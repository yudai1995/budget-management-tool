import React from 'react';
import { NavLink } from 'react-router-dom';
import { useScrollPosition } from '@n8tb1t/use-scroll-position';
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
    RequestDataSuccess,
    RequestDataFailed,
} from '../store/FetchingStateSlice';
import axios from 'axios';
import { guest } from '../Model/User.model';
import { useState } from 'react';
import { GrobalNaviList } from './Layout/GrobalNaviList';

export const Header: React.FC = () => {
    const dispatch = useDispatch();
    const isLogin = useSelector((state: RootState) => getIsLoginAuth(state));
    const loginUser = useSelector((state: RootState) => getLoginUser(state));
    const [headerStyle, setHeaderStyle] = useState({});

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

    useScrollPosition(
        ({ prevPos, currPos }) => {
            const isVisible = currPos.y > prevPos.y;
            const shouldBeStyle = {
                transition: `all ${isVisible ? '20ms' : '20ms'} ${
                    isVisible ? 'ease-in' : 'ease-out'
                }`,
            };

            if (JSON.stringify(shouldBeStyle) === JSON.stringify(headerStyle))
                return;
            setHeaderStyle(shouldBeStyle);
        },
        [headerStyle]
    );
    return (
        <header className={`${styles.menuHeader}`} style={{ ...headerStyle }}>
            <div className="inner">
                <div className={styles.headerWrapper}>
                    <div className={styles.headerTitleWrapper}>
                        <h1 className={styles.headerTitle}>
                            <NavLink to="/" className={styles.logo}>
                                <img
                                    src={Logo}
                                    alt="家計簿管理"
                                    width="24"
                                    height="24"
                                />
                                家計簿管理
                            </NavLink>
                        </h1>
                        {isLogin ? (
                            <div className={`${styles.loginWrapper} sp-only`}>
                                <p className={`${styles.loginUser}`}>
                                    {loginUser
                                        ? `${
                                              guest['guest-en'] === loginUser
                                                  ? guest['guest-ja']
                                                  : loginUser
                                          }さん`
                                        : '未ログイン'}
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
                            <GrobalNaviList></GrobalNaviList>
                            <div className={`${styles.loginWrapper} pc-only`}>
                                <p className={`${styles.loginUser}`}>
                                    {loginUser
                                        ? `${
                                              guest['guest-en'] === loginUser
                                                  ? guest['guest-ja']
                                                  : loginUser
                                          }さん`
                                        : '未ログイン'}
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

