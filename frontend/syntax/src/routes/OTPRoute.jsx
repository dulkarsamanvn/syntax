import React from 'react'
import { Navigate } from 'react-router-dom'

function OTPRoute({children}) {
    const emailForOtp=localStorage.getItem('emailForOtp')
    const isAuthenticated=localStorage.getItem('isAuthenticated')
    
    if(isAuthenticated==='true'){
        return <Navigate to='/home' replace/>
    }
    if(!emailForOtp){
        return <Navigate to='/signup' replace />
    }
    return children
}

export default OTPRoute
