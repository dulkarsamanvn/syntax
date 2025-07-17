import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Signup from './Pages/User/Signup'
import OtpVerification from './Pages/User/OtpVerification'
import Login from './Pages/User/Login'
import ProtectedRoute from './routes/ProtectedRoute'
import PublicRoute from './routes/PublicRoute'
import OTPRoute from './routes/OTPRoute'
import Home from './Pages/User/Home'
import AdminLogin from './Pages/Admin/AdminLogin'
import AdminDashboard from './Pages/Admin/AdminDashboard'
import AdminPublicRoute from './routes/AdminPublicRoute'
import AdminProtectedRoute from './routes/AdminProtectedRoute'
import UserManagement from './Pages/Admin/UserManagement'
import UserProfile from './Pages/User/UserProfile'
import Settings from './Pages/User/Settings'
import EditProfile from './Pages/User/EditProfile'
import ChallengeList from './Pages/Admin/Challenges/ChallengeList'
import ChallengeSolve from './Pages/User/ChallengeSolve'
import LevelList from './Pages/Admin/Levels/LevelList'
import LeaderBoard from './Pages/User/LeaderBoard'
import ChatRoom from './Pages/User/ChatRoom'
import ChatLayout from './Pages/User/ChatLayout'
import ChatHome from './Pages/User/ChatHome'
import GroupChatRoom from './Pages/User/GroupChatRoom'
import PlanManagement from './Pages/Admin/PlanManagement'
import Premium from './Pages/User/Premium'
import ReportManagement from './Pages/Admin/ReportManagement'
import LeaderboardManagement from './Pages/Admin/LeaderboardManagement'

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

        <Route path='/admin/challenge-management' element={
          <AdminProtectedRoute>
            <ChallengeList/>
          </AdminProtectedRoute>} />

        <Route path='/challenge/:id' element={
          <ProtectedRoute>
            <ChallengeSolve/>
          </ProtectedRoute>} />
        
        <Route path='/admin/level-management' element={
          <AdminProtectedRoute>
            <LevelList/>
          </AdminProtectedRoute>} />
        
        <Route path='/leaderboard' element={
          <ProtectedRoute>
            <LeaderBoard/>
          </ProtectedRoute>} />
        
        <Route path="/chat" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
          <Route index element={<ChatHome/>} />
          <Route path=":userId" element={<ChatRoom />} />
          <Route path="group/:id" element={<GroupChatRoom />} />
        </Route>

        <Route path='/admin/plan-management' element={
          <AdminProtectedRoute>
            <PlanManagement/>
          </AdminProtectedRoute>} />
          
        <Route path='/premium' element={
          <ProtectedRoute>
            <Premium/>
          </ProtectedRoute>} />
        
        <Route path='/admin/report-management' element={
          <AdminProtectedRoute>
            <ReportManagement/>
          </AdminProtectedRoute>} />
        
        <Route path='/admin/leaderboard' element={
          <AdminProtectedRoute>
            <LeaderboardManagement/>
          </AdminProtectedRoute>} />

      </Routes>
    </Router>
  )
}

export default App
