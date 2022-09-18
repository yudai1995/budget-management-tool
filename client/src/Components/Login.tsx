import React from 'react';
import styles from '../styles/Login.module.scss';
import { useRef } from 'react';
import { useDispatch } from 'react-redux';
import {
    RequestData,
    RequestDataFailed,
    RequestDataSuccess,
} from '../store/budgetListSlice';
import axios from 'axios';
import {
    setLogin,
    getLoginMessage,
    setLoginMessage,
} from '../store/LoginStateSlice';
import { useHistory } from 'react-router-dom';
import { errorMessage } from '../Model/error.model';
import { useSelector, RootState } from '../store/index';

export const Login: React.FC = () => {
    const history = useHistory();
    const inputUserIdRef = useRef<HTMLInputElement>(null);
    const inputPasswordRef = useRef<HTMLInputElement>(null);
    const dispatch = useDispatch();
    const loginMessage = useSelector((state: RootState) =>
        getLoginMessage(state)
    );

    const onSubmitLoginHandler = (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();
        clearTimeout();
        const userId = inputUserIdRef.current!.value;
        const password = inputPasswordRef.current!.value;

        if (userId && password) {
            dispatch(RequestData({}));
            axios
                .post('/api/login', {
                    userId,
                    password,
                })
                .then((response) => {
                    dispatch(setLogin({ userId: response.data.userId }));
                    dispatch(RequestDataSuccess({}));

                    history.push({ pathname: '/' });
                })
                .catch((err) => {
                    loginErrorHandler(err);
                    dispatch(RequestDataFailed({}));
                });

            inputUserIdRef.current!.value = '';
            inputPasswordRef.current!.value = '';
        }
    };

    const onSubmitGuestHandler = (event: React.FormEvent) => {
        event.preventDefault();
        event.stopPropagation();

        dispatch(RequestData({}));
        axios
            .post('/api/login', {
                userId: 'Guest',
            })
            .then((response) => {
                dispatch(setLogin({ userId: response.data.userId }));
                dispatch(RequestDataSuccess({}));

                history.push({ pathname: '/' });
            })
            .catch((err) => {
                console.log(err);
                loginErrorHandler(err);
                dispatch(RequestDataFailed({}));
            });

        inputUserIdRef.current!.value = '';
        inputPasswordRef.current!.value = '';
    };

    const loginErrorHandler = (error: any) => {
        const errorData = error.response.data;
        dispatch(
            setLoginMessage({
                message: errorMessage[errorData.message],
            })
        );
    };



    return (
        <>
            <div className={styles.login}>
                <section className={styles.loginSection}>
                    <h2 className={styles.title}>ログイン</h2>
                    <form className={styles.loginForm}>
                        <div className={styles.inputWrapper}>
                            <input
                                id="userId"
                                className={`${styles.input} ${styles.inputUserId}`}
                                ref={inputUserIdRef}
                                type="text"
                                placeholder="ユーザー名を入力してください"
                                autoComplete="off"
                            />
                            <label htmlFor="userId" className={styles.label}>
                                ユーザー名
                            </label>
                        </div>
                        <div className={styles.inputWrapper}>
                            <input
                                id="password"
                                className={`${styles.input} ${styles.inputPassword}`}
                                ref={inputPasswordRef}
                                type="password"
                                placeholder="パスワードを入力してください"
                                autoComplete="off"
                            />
                            <label htmlFor="password" className={styles.label}>
                                パスワード
                            </label>
                        </div>
                        <button
                            onClick={onSubmitLoginHandler}
                            className={`${styles.submitBtn} iconBtn next`}
                        >
                            ログインする
                        </button>
                    </form>
                    <button
                        onClick={onSubmitGuestHandler}
                        className={`${styles.submitBtn} ${styles.submitGusetBtn} iconBtn next`}
                    >
                        ゲストユーザーはこちら
                    </button>
                </section>
            </div>
            {loginMessage ? (
                <div className={styles.toast}>
                    <p>{loginMessage}</p>
                </div>
            ) : (
                <></>
            )}
        </>
    );
};
