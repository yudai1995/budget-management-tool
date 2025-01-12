import { createSlice } from '@reduxjs/toolkit'
import { RootState } from './index'

const initialState: {
    isLogin: boolean
    userId?: string
    message?: string
} = {
    isLogin: false,
}

export const LoginStateSlice = createSlice({
    name: 'LoginState',
    initialState,
    reducers: {
        setLogin: (state, action) => {
            state.isLogin = true
            state.userId = action.payload.userId
            state.message = undefined
        },
        setLogout: (state, action) => {
            state.isLogin = false
            state.userId = undefined
        },
        setLoginMessage: (state, action) => {
            state.message = action.payload.message
        },
    },
})

export const getIsLoginAuth = (state: RootState) => {
    return state.LoginState.isLogin
}

export const getLoginUser = (state: RootState) => {
    return state.LoginState.userId
}

export const getLoginMessage = (state: RootState) => {
    return state.LoginState.message
}

// actionをexport
export const { setLogin, setLogout, setLoginMessage } = LoginStateSlice.actions
// state情報をexport
export const loginState = (state: RootState) => state.LoginState
// reducerをexport → storeへ
export default LoginStateSlice.reducer
