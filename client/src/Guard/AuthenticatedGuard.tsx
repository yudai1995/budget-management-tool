import React from 'react'
import { Redirect } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { getIsLoginAuth } from '../store/LoginStateSlice'
import { RootState } from '../store/index'
import { useLocation } from 'react-router'

export const AuthenticatedGuard: React.FC = ({ children }) => {
    const isLoginAuth = useSelector((state: RootState) => getIsLoginAuth(state))
    const location = useLocation()

    return (
        <>
            {isLoginAuth ? (
                <Redirect
                    to={{
                        pathname: '/about',
                        state: { from: location },
                    }}
                />
            ) : (
                <>{children}</>
            )}
        </>
    )
}
