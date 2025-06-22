import React from 'react'
import { Navigate } from 'react-router-dom'

function AdminProtectedRoute({children}) {
  const isAdmin=localStorage.getItem('isAdmin')
  return isAdmin==='true' ? children : <Navigate to='/adminlogin' replace />

}

export default AdminProtectedRoute
