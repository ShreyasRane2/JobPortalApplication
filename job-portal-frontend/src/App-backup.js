import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Jobs from './pages/Jobs';
import JobDetails from './pages/JobDetails';
import Applications from './pages/Applications';
import Resume from './pages/Resume';
import Notifications from './pages/Notifications';
import AdminDashboard from './pages/AdminDashboard';
import CompanyProfile from './pages/CompanyProfile';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <div className="main-content">
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              <Route path="/dashboard" element={
                <PrivateRoute>
                  <Dashboard />
                </PrivateRoute>
              } />
              
              <Route path="/profile" element={
                <PrivateRoute>
                  <Profile />
                </PrivateRoute>
              } />
              
              <Route path="/jobs" element={
                <PrivateRoute>
                  <Jobs />
                </PrivateRoute>
              } />
              
              <Route path="/jobs/:id" element={
                <PrivateRoute>
                  <JobDetails />
                </PrivateRoute>
              } />
              
              <Route path="/applications" element={
                <PrivateRoute>
                  <Applications />
                </PrivateRoute>
              } />
              
              <Route path="/resume" element={
                <PrivateRoute>
                  <Resume />
                </PrivateRoute>
              } />
              
              <Route path="/notifications" element={
                <PrivateRoute>
                  <Notifications />
                </PrivateRoute>
              } />
              
              <Route path="/admin" element={
                <PrivateRoute>
                  <AdminDashboard />
                </PrivateRoute>
              } />
              
              <Route path="/company" element={
                <PrivateRoute>
                  <CompanyProfile />
                </PrivateRoute>
              } />
              
              <Route path="/" element={<Navigate to="/dashboard" />} />
            </Routes>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
