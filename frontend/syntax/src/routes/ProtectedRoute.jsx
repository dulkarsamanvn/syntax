import React from "react";
import { Navigate } from "react-router-dom";
import Login from "../Pages/User/Login";

function ProtectedRoute({children}){
    const isAuthenticated=localStorage.getItem('isAuthenticated');
    return isAuthenticated==='true' ? children : <Navigate to='/login' replace/>
}
export default ProtectedRoute