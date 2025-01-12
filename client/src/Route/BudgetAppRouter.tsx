import React from 'react'
import { Login } from '../Components/Login'
import { Switch, Route } from 'react-router-dom'
import { AuthenticationGuard } from '../Guard/AuthenticationGuard'
import { AuthenticatedRoute } from './AuthenticatedRoute'

export const BudgetAppRouter: React.FC = () => {
    return (
        <Switch>
            <Route path="/login">
                <Login />
            </Route>
            <AuthenticationGuard>
                <AuthenticatedRoute />
            </AuthenticationGuard>
        </Switch>
    )
}
