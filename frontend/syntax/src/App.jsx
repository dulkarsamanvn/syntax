import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
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
import ForgetPasswordOtp from './Pages/User/forgetPassword/ForgetPasswordOtp'
import ResetRoute from './routes/ResetRoute'
import ResetPassword from './Pages/User/forgetPassword/ResetPassword'
import SettingsSecurity from './Pages/User/SettingsSecurity'
import GroupManagement from './Pages/Admin/GroupManagement'
import Notifications from './Pages/User/Notifications'
import AnalyticsDashboard from './Pages/Admin/AnalyticsDashboard'
import BadgeManagement from './Pages/Admin/Badge/BadgeManagement'
import LandingPage from './Pages/User/LandingPage'
import SettingsRequests from './Pages/User/SettingsRequest'
import ChallengeRequests from './Pages/Admin/ChallengeRequests'
import ForgetPasswordEmail from './Pages/User/forgetPassword/ForgetPasswordEmail'

function App() {
  return (
    <Router>
      <Toaster
        position="top-right"
        toastOptions={{
          success: {
            style: {
              background: 'linear-gradient(to right, #2563eb, #7c3aed)', 
              color: 'white',
            },
          },
          error: {
            style: {
              background: 'linear-gradient(to right, #dc2626, #db2777)', 
              color: 'white',
            },
          },
        }}
      />
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
            <AdminLogin />
          </AdminPublicRoute>} />

        <Route path='/admin/dashboard' element={
          <AdminProtectedRoute>
            <AdminDashboard />
          </AdminProtectedRoute>} />

        <Route path='/admin/user-management' element={
          <AdminProtectedRoute>
            <UserManagement />
          </AdminProtectedRoute>} />

        <Route path='/profile' element={
          <ProtectedRoute>
            <UserProfile />
          </ProtectedRoute>} />

        <Route path='/settings' element={
          <ProtectedRoute>
            <Settings />
          </ProtectedRoute>} />

        <Route path='/edit-profile' element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>} />

        <Route path='/admin/challenge-management' element={
          <AdminProtectedRoute>
            <ChallengeList />
          </AdminProtectedRoute>} />

        <Route path='/challenge/:id' element={
          <ProtectedRoute>
            <ChallengeSolve />
          </ProtectedRoute>} />

        <Route path='/admin/level-management' element={
          <AdminProtectedRoute>
            <LevelList />
          </AdminProtectedRoute>} />

        <Route path='/leaderboard' element={
          <ProtectedRoute>
            <LeaderBoard />
          </ProtectedRoute>} />

        <Route path="/chat" element={<ProtectedRoute><ChatLayout /></ProtectedRoute>}>
          <Route index element={<ChatHome />} />
          <Route path=":userId" element={<ChatRoom />} />
          <Route path="group/:id" element={<GroupChatRoom />} />
        </Route>

        <Route path='/admin/plan-management' element={
          <AdminProtectedRoute>
            <PlanManagement />
          </AdminProtectedRoute>} />

        <Route path='/premium' element={
          <ProtectedRoute>
            <Premium />
          </ProtectedRoute>} />

        <Route path='/admin/report-management' element={
          <AdminProtectedRoute>
            <ReportManagement />
          </AdminProtectedRoute>} />

        <Route path='/admin/leaderboard' element={
          <AdminProtectedRoute>
            <LeaderboardManagement />
          </AdminProtectedRoute>} />

        <Route path='/forget-password' element={<ForgetPasswordEmail />} />

        <Route path='/verify-reset-code' element={
          <ResetRoute>
            <ForgetPasswordOtp />
          </ResetRoute>} />

        <Route path='/reset-password' element={
          <ResetRoute>
            <ResetPassword />
          </ResetRoute>} />

        <Route path='/settings/security' element={
          <ProtectedRoute>
            <SettingsSecurity />
          </ProtectedRoute>} />
        
        <Route path='/admin/group-management' element={
          <AdminProtectedRoute>
            <GroupManagement />
          </AdminProtectedRoute>} />
        
        <Route path='/notifications' element={
          <ProtectedRoute>
            <Notifications />
          </ProtectedRoute>} />
        
        <Route path='/admin/analytics' element={
          <AdminProtectedRoute>
            <AnalyticsDashboard />
          </AdminProtectedRoute>} />
        
        <Route path='/admin/badge-management' element={
          <AdminProtectedRoute>
            <BadgeManagement />
          </AdminProtectedRoute>} />
        
        <Route path='' element={<LandingPage />} />

        <Route path='/settings/requests' element={
          <ProtectedRoute>
            <SettingsRequests />
          </ProtectedRoute>} />
        
        <Route path='/admin/challenge-requests' element={
          <AdminProtectedRoute>
            <ChallengeRequests/>
          </AdminProtectedRoute>} />

      </Routes>
    </Router>
  )
}

export default App
