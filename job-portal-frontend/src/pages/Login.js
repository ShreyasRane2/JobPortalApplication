import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    const result = await login(formData.email, formData.password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      // Handle error - could be string or object
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : result.error?.message || result.error?.error || 'Login failed. Please try again.';
      setError(errorMessage);
    }
    setLoading(false);
  };

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '35px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '28px' }}>Welcome Back</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '14px' }}>Login to continue your job search</p>
      
      <form onSubmit={handleSubmit}>
        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
            Email Address <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="your.email@example.com"
            required
          />
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
            Password <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            style={{ 
              width: '100%', 
              padding: '10px', 
              border: '1px solid #ddd', 
              borderRadius: '4px',
              fontSize: '14px'
            }}
            placeholder="Enter your password"
            required
          />
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ 
            background: '#fff3cd', 
            border: '1px solid #ffc107', 
            color: '#856404', 
            padding: '12px', 
            borderRadius: '6px', 
            marginBottom: '15px',
            fontSize: '14px'
          }}>
            ⚠️ {error}
          </div>
        )}

        {/* Submit Button */}
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: loading ? '#ccc' : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: loading ? 'none' : '0 4px 10px rgba(102, 126, 234, 0.3)',
            opacity: loading ? 0.7 : 1
          }}
          onMouseEnter={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(-2px)';
              e.target.style.boxShadow = '0 6px 15px rgba(102, 126, 234, 0.4)';
            }
          }}
          onMouseLeave={(e) => {
            if (!loading) {
              e.target.style.transform = 'translateY(0)';
              e.target.style.boxShadow = '0 4px 10px rgba(102, 126, 234, 0.3)';
            }
          }}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>

      {/* Register Link */}
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Don't have an account? <Link to="/register" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Register here</Link>
      </p>
    </div>
  );
}

export default Login;
