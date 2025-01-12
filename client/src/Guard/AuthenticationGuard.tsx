import React from 'react'
import { Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getIsLoginAuth } from '../store/LoginStateSlice'
import { RootState } from '../store/index'
import { useLocation } from 'react-router'

export const AuthenticationGuard: React.FC = ({ children }) => {
    const isLoginAuth = useSelector((state: RootState) => getIsLoginAuth(state))
    const location = useLocation()

    return (
        <>
            {isLoginAuth ? (
                <>{children}</>
            ) : (
                <Redirect
                    to={{
                        pathname: '/login',
                        state: { from: location },
                    }}
                />
            )}
        </>
    )
}
