import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import SearchHospitals from './pages/SearchHospitals';
import EmergencyBooking from './pages/EmergencyBooking';
import AmbulanceBooking from './pages/AmbulanceBooking';
import Tracking from './pages/Tracking';
import UserDashboard from './pages/UserDashboard';
import HospitalDashboard from './pages/HospitalDashboard';
import AdminDashboard from './pages/AdminDashboard';

// Protected Route wrapper based on Roles
const ProtectedRoute = ({ children, allowedRoles }) => {
  const { user } = useAuth();
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Redirect to respective home dashboard if they mismatch
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'hospital') return <Navigate to="/hospital" replace />;
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function AppContent() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <Navbar />
      <main className="flex-grow">
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Patient Routes */}
          <Route path="/search" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <SearchHospitals />
            </ProtectedRoute>
          } />
          <Route path="/emergency-booking" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <EmergencyBooking />
            </ProtectedRoute>
          } />
          <Route path="/ambulance-booking" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <AmbulanceBooking />
            </ProtectedRoute>
          } />
          <Route path="/tracking" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <Tracking />
            </ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute allowedRoles={['patient']}>
              <UserDashboard />
            </ProtectedRoute>
          } />

          {/* Hospital Routes */}
          <Route path="/hospital" element={
            <ProtectedRoute allowedRoles={['hospital']}>
              <HospitalDashboard />
            </ProtectedRoute>
          } />

          {/* Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboard />
            </ProtectedRoute>
          } />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}
