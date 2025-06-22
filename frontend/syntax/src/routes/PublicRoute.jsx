import React from 'react'
import { Navigate } from 'react-router-dom'

function PublicRoute({children}) {
    const isAuthenticated=localStorage.getItem('isAuthenticated')
    return  isAuthenticated==='true' ? <Navigate to='/home' replace /> : children
}

export default PublicRoute
