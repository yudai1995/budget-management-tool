import axios from 'axios'
import React, { useRef, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useDispatch } from 'react-redux'
import { useHistory } from 'react-router-dom'
import { errorMessage } from '../Model/error.model'
import { pageTitle } from '../Model/navigation.model'
import { RequestData, RequestDataFailed, RequestDataSuccess } from '../store/FetchingStateSlice'
import { RootState, useSelector } from '../store/index'
import { getLoginMessage, setLogin, setLoginMessage } from '../store/LoginStateSlice'
import styles from '../styles/Login.module.scss'

export const Login: React.FC = () => {
    const history = useHistory()
    const inputUserIdRef = useRef<HTMLInputElement>(null)
    const inputPasswordRef = useRef<HTMLInputElement>(null)
    const [disabled, setDisabled] = useState<boolean>(true)
    const dispatch = useDispatch()
    const loginMessage = useSelector((state: RootState) => getLoginMessage(state))

    const onChangeInputHandler = () => {
        const userId = inputUserIdRef.current!.value
        const password = inputPasswordRef.current!.value
        setDisabled(userId && password ? false : true)
    }

    const onSubmitLoginHandler = (event: React.FormEvent) => {
        event.preventDefault()
        event.stopPropagation()
        const userId = inputUserIdRef.current!.value
        const password = inputPasswordRef.current!.value

        if (userId && password) {
            dispatch(RequestData({}))
            axios
                .post('/api/login', {
                    userId,
                    password,
                })
                .then((response) => {
                    dispatch(setLogin({ userId: response.data.userId }))
                    dispatch(RequestDataSuccess({}))

                    history.push({ pathname: '/' })
                })
                .catch((err) => {
                    console.log(err)
                    loginErrorHandler(err)
                    dispatch(RequestDataFailed({}))
                })

            inputUserIdRef.current!.value = ''
            inputPasswordRef.current!.value = ''
        }
    }

    const onSubmitGuestHandler = (event: React.FormEvent) => {
        event.preventDefault()
        event.stopPropagation()

        dispatch(RequestData({}))
        axios
            .post('/api/login', {
                userId: 'Guest',
            })
            .then((response) => {
                dispatch(setLogin({ userId: response.data.userId }))
                dispatch(RequestDataSuccess({}))

                history.push({ pathname: '/' })
            })
            .catch((err) => {
                console.log(err)
                loginErrorHandler(err)
                dispatch(RequestDataFailed({}))
            })

        inputUserIdRef.current!.value = ''
        inputPasswordRef.current!.value = ''
    }

    const loginErrorHandler = (error: any) => {
        const errorData = error.response.data
        const message = errorData.message ? errorMessage[errorData.message] : 'サーバーが応答しておりません'
        dispatch(
            setLoginMessage({
                message,
            })
        )
    }
    const title = pageTitle.Login

    return (
        <>
            <Helmet>
                <meta name="description" content={`家計簿管理の${title}画面です`} />
                <meta name="keywords" content={`家計簿, 支出管理, ${title}`} />
                <meta property="og:title" content={`${title} | 家計簿管理`} />
                <meta property="og:description" content={`家計簿管理の${title}画面です`} />
                <title>{`${title} | 家計簿管理`}</title>
            </Helmet>
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
                                onChange={onChangeInputHandler}
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
                                onChange={onChangeInputHandler}
                            />
                            <label htmlFor="password" className={styles.label}>
                                パスワード
                            </label>
                        </div>
                        <button onClick={onSubmitLoginHandler} className={`${styles.submitBtn} iconBtn next`} disabled={disabled}>
                            ログインする
                        </button>
                    </form>
                    <button onClick={onSubmitGuestHandler} className={`${styles.submitBtn} ${styles.submitGusetBtn} iconBtn next`}>
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
    )
}
