import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './Pages/Signup'
import OtpVerification from './Pages/OtpVerification'
import Login from './Pages/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import OTPRoute from './routes/OTPRoute'
import Home from './Pages/Home'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminPublicRoute from './routes/AdminPublicRoute'
import AdminProtectedRoute from './routes/AdminProtectedRoute'
import UserManagement from './Pages/Admin/UserManagement'
import UserProfile from './Pages/UserProfile'
import Settings from './Pages/Settings'
import EditProfile from './Pages/EditProfile'

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

        <Route path='/admin/dashboard' element={
          <AdminProtectedRoute>
            <AdminDashboard/>
          </AdminProtectedRoute>} />

        <Route path='/admin/user-management' element={
          <AdminProtectedRoute>
            <UserManagement/>
          </AdminProtectedRoute>} />

        <Route path='/profile' element={
          <ProtectedRoute>
            <UserProfile/>
          </ProtectedRoute>} />
        
        <Route path='/settings' element={
          <ProtectedRoute>
            <Settings/>
          </ProtectedRoute>} />
        
        <Route path='/edit-profile' element={
          <ProtectedRoute>
            <EditProfile/>
          </ProtectedRoute>} />
        

      </Routes>
    </Router>
  )
}

export default App
