import React from 'react'
import { Navigate } from 'react-router-dom'

function AdminPublicRoute({children}) {
  const isAdmin=localStorage.getItem('isAdmin')
  return isAdmin==='true' ? <Navigate to='/admin-dashboard' replace /> : children
}

export default AdminPublicRoute
