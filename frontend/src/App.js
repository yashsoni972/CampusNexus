import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import ProtectedRoute from './components/common/ProtectedRoute';
import Layout from './components/layout/Layout';

// Auth pages
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import VerifyEmail from './pages/auth/VerifyEmail';
import VerifyOTP from './pages/auth/VerifyOTP';

// Dashboard pages
import Dashboard from './pages/dashboard/Dashboard';

// Announcement pages
import Announcements from './pages/announcements/Announcements';
import AnnouncementDetail from './pages/announcements/AnnouncementDetail';
import CreateAnnouncement from './pages/announcements/CreateAnnouncement';

// Complaint pages
import Complaints from './pages/complaints/Complaints';
import ComplaintDetail from './pages/complaints/ComplaintDetail';
import CreateComplaint from './pages/complaints/CreateComplaint';

// Event pages
import Events from './pages/events/Events';
import EventDetail from './pages/events/EventDetail';
import CreateEvent from './pages/events/CreateEvent';

// Profile pages
import Profile from './pages/profile/Profile';
import EditProfile from './pages/profile/EditProfile';
import AchievementPassport from './pages/profile/AchievementPassport';

// Admin pages
import AdminUsers from './pages/admin/AdminUsers';

// Club pages
import Clubs from './pages/clubs/Clubs';
import ClubChat from './pages/clubs/ClubChat';

// Mail
import Mail from './pages/mail/Mail';

function App() {
  return (
    <AuthProvider>
      <Router>
        <SocketProvider>
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
              borderRadius: '10px',
              padding: '12px 16px'
            },
            success: { style: { background: '#f0fdf4', color: '#166534', border: '1px solid #bbf7d0' } },
            error: { style: { background: '#fef2f2', color: '#991b1b', border: '1px solid #fecaca' } }
          }}
        />
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Navigate to="/dashboard" replace />} />
              <Route path="/dashboard" element={<Dashboard />} />

              {/* Announcements */}
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/announcements/:id" element={<AnnouncementDetail />} />
              <Route path="/announcements/create" element={
                <ProtectedRoute roles={['admin', 'faculty']} />
              }>
                <Route index element={<CreateAnnouncement />} />
              </Route>

              {/* Complaints */}
              <Route path="/complaints" element={<Complaints />} />
              <Route path="/complaints/create" element={<CreateComplaint />} />
              <Route path="/complaints/:id" element={<ComplaintDetail />} />

              {/* Events */}
              <Route path="/events" element={<Events />} />
              <Route path="/events/:id" element={<EventDetail />} />
              <Route path="/events/create" element={
                <ProtectedRoute roles={['admin', 'faculty']} />
              }>
                <Route index element={<CreateEvent />} />
              </Route>

              {/* Profile */}
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/edit" element={<EditProfile />} />
              <Route path="/profile/passport" element={<AchievementPassport />} />
              <Route path="/profile/:id" element={<Profile />} />

              {/* Admin / Faculty - Manage Users */}
              <Route path="/admin/users" element={
                <ProtectedRoute roles={['admin', 'faculty']} />
              }>
                <Route index element={<AdminUsers />} />
              </Route>

              {/* Clubs */}
              <Route path="/clubs" element={<Clubs />} />
              <Route path="/clubs/:id" element={<ClubChat />} />

              {/* Mail */}
              <Route path="/mail" element={<Mail />} />
            </Route>
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </SocketProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;
