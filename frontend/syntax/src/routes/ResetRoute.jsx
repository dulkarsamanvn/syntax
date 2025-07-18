import React from 'react'
import { Navigate } from 'react-router-dom'

function ResetRoute({children}) {
    const resetEmail = localStorage.getItem('resetEmail')
    const isAuthenticated = localStorage.getItem('isAuthenticated')

    if(isAuthenticated===true){
        return <Navigate to='/home' replace />
    }
    if(!resetEmail){
        return <Navigate to='/forget-password' replace />
    }
    return children
}

export default ResetRoute
