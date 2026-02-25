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
import Applications from './pages/Applications';
import PostJob from './pages/PostJob';
import Resume from './pages/Resume';
import AdminDashboard from './pages/AdminDashboard';
import './App.css';
import './styles/responsive.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App" style={{ minHeight: '100vh', background: '#f5f7fa' }}>
          <Navbar />
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
            <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
            <Route path="/jobs" element={<PrivateRoute><Jobs /></PrivateRoute>} />
            <Route path="/applications" element={<PrivateRoute><Applications /></PrivateRoute>} />
            <Route path="/post-job" element={<PrivateRoute><PostJob /></PrivateRoute>} />
            <Route path="/resume" element={<PrivateRoute><Resume /></PrivateRoute>} />
            <Route path="/admin" element={<PrivateRoute><AdminDashboard /></PrivateRoute>} />
            <Route path="/" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
