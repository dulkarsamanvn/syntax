import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './Pages/Signup'
import OtpVerification from './Pages/OtpVerification'
import Login from './Pages/Login'
import ProtectedRoute from './components/ProtectedRoute'
import PublicRoute from './components/PublicRoute'
import OTPRoute from './components/OTPRoute'
import Home from './Pages/Home'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminPublicRoute from './components/AdminPublicRoute'
import AdminProtectedRoute from './components/AdminProtectedRoute'

function App() {
  return (
    <Router>
      <Routes>
        <Route path='/signup'
          element={<PublicRoute>
            <Signup />
          </PublicRoute>} />
        <Route path='/verify-otp'
          element={<OTPRoute>
            <OtpVerification />
          </OTPRoute>} />
        <Route path='/login'
          element={<PublicRoute>
            <Login />
          </PublicRoute>} />
        <Route path='/home'
          element={<ProtectedRoute>
            <Home />
          </ProtectedRoute>} />
        
        <Route path='/adminlogin' element={
          <AdminPublicRoute>
            <AdminLogin/>
          </AdminPublicRoute>} />

        <Route path='/admin-dashboard' element={
          <AdminProtectedRoute>
            <AdminDashboard/>
          </AdminProtectedRoute>} />

      </Routes>
    </Router>
  )
}

export default App
