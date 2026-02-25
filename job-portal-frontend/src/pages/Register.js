import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Register() {
  const [formData, setFormData] = useState({ emailId: '', password: '', fullName: '', role: 'ROLE_EMPLOYEE' });
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [touched, setTouched] = useState({});
  const { register } = useAuth();
  const navigate = useNavigate();

  // Validation functions
  const validateFullName = (name) => {
    if (!name.trim()) {
      return 'Full name is required';
    }
    if (name.trim().length < 2) {
      return 'Full name must be at least 2 characters';
    }
    if (name.trim().length > 50) {
      return 'Full name must not exceed 50 characters';
    }
    // Check if name contains only letters, spaces, hyphens, and apostrophes
    if (!/^[a-zA-Z\s'-]+$/.test(name)) {
      return 'Full name can only contain letters, spaces, hyphens, and apostrophes';
    }
    // Check if name contains numbers
    if (/\d/.test(name)) {
      return 'Full name cannot contain numbers';
    }
    return '';
  };

  const validateEmail = (email) => {
    if (!email.trim()) {
      return 'Email is required';
    }
    // Standard email regex
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }
    return '';
  };

  const validatePassword = (password) => {
    if (!password) {
      return 'Password is required';
    }
    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }
    if (password.length > 20) {
      return 'Password must not exceed 20 characters';
    }
    // Check for at least one letter and one number
    if (!/(?=.*[a-zA-Z])(?=.*\d)/.test(password)) {
      return 'Password must contain at least one letter and one number';
    }
    return '';
  };

  // Handle field blur (when user leaves the field)
  const handleBlur = (field) => {
    setTouched({ ...touched, [field]: true });
    validateField(field, formData[field]);
  };

  // Validate individual field
  const validateField = (field, value) => {
    let error = '';
    switch (field) {
      case 'fullName':
        error = validateFullName(value);
        break;
      case 'emailId':
        error = validateEmail(value);
        break;
      case 'password':
        error = validatePassword(value);
        break;
      default:
        break;
    }
    setValidationErrors({ ...validationErrors, [field]: error });
    return error;
  };

  // Handle input change with validation
  const handleChange = (field, value) => {
    setFormData({ ...formData, [field]: value });
    if (touched[field]) {
      validateField(field, value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Mark all fields as touched
    setTouched({ fullName: true, emailId: true, password: true });
    
    // Validate all fields
    const nameError = validateFullName(formData.fullName);
    const emailError = validateEmail(formData.emailId);
    const passwordError = validatePassword(formData.password);
    
    setValidationErrors({
      fullName: nameError,
      emailId: emailError,
      password: passwordError
    });
    
    // If any validation errors, don't submit
    if (nameError || emailError || passwordError) {
      setError('Please fix the validation errors before submitting');
      return;
    }
    
    setError('');
    const result = await register(formData);
    if (result.success) {
      alert('✅ Registration successful! Please login.');
      navigate('/login');
    } else {
      // Handle error - could be string or object
      const errorMessage = typeof result.error === 'string' 
        ? result.error 
        : result.error?.message || result.error?.error || 'Registration failed. Please try again.';
      setError(errorMessage);
    }
  };

  const getInputStyle = (field) => ({
    width: '100%',
    padding: '10px',
    border: touched[field] && validationErrors[field] ? '2px solid #dc3545' : '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '14px'
  });

  return (
    <div style={{ maxWidth: '450px', margin: '50px auto', padding: '35px', background: 'white', borderRadius: '12px', boxShadow: '0 4px 15px rgba(0,0,0,0.1)' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#333', fontSize: '28px' }}>Create Account</h2>
      <p style={{ textAlign: 'center', marginBottom: '30px', color: '#666', fontSize: '14px' }}>Join us to find your dream job</p>
      
      <form onSubmit={handleSubmit}>
        {/* Full Name */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
            Full Name <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="text"
            value={formData.fullName}
            onChange={(e) => handleChange('fullName', e.target.value)}
            onBlur={() => handleBlur('fullName')}
            style={getInputStyle('fullName')}
            placeholder="Enter your full name"
          />
          {touched.fullName && validationErrors.fullName && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⚠️</span> {validationErrors.fullName}
            </div>
          )}
          {touched.fullName && !validationErrors.fullName && formData.fullName && (
            <div style={{ color: '#28a745', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>✓</span> Looks good!
            </div>
          )}
        </div>

        {/* Email */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
            Email Address <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="email"
            value={formData.emailId}
            onChange={(e) => handleChange('emailId', e.target.value)}
            onBlur={() => handleBlur('emailId')}
            style={getInputStyle('emailId')}
            placeholder="your.email@example.com"
          />
          {touched.emailId && validationErrors.emailId && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⚠️</span> {validationErrors.emailId}
            </div>
          )}
          {touched.emailId && !validationErrors.emailId && formData.emailId && (
            <div style={{ color: '#28a745', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>✓</span> Valid email
            </div>
          )}
        </div>

        {/* Password */}
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
            Password <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <input
            type="password"
            value={formData.password}
            onChange={(e) => handleChange('password', e.target.value)}
            onBlur={() => handleBlur('password')}
            style={getInputStyle('password')}
            placeholder="Create a strong password"
          />
          {touched.password && validationErrors.password && (
            <div style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>⚠️</span> {validationErrors.password}
            </div>
          )}
          {touched.password && !validationErrors.password && formData.password && (
            <div style={{ color: '#28a745', fontSize: '12px', marginTop: '5px', display: 'flex', alignItems: 'center', gap: '5px' }}>
              <span>✓</span> Strong password
            </div>
          )}
          <div style={{ fontSize: '11px', color: '#999', marginTop: '5px' }}>
            Must be 6-20 characters with at least one letter and one number
          </div>
        </div>

        {/* Role */}
        <div style={{ marginBottom: '25px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333', fontSize: '14px' }}>
            I am a <span style={{ color: '#dc3545' }}>*</span>
          </label>
          <select
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '14px', cursor: 'pointer' }}
          >
            <option value="ROLE_EMPLOYEE">Job Seeker</option>
            <option value="ROLE_EMPLOYER">Employer</option>
            <option value="ROLE_ADMINISTRATOR">Administrator</option>
          </select>
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
          style={{ 
            width: '100%', 
            padding: '12px', 
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
            color: 'white', 
            border: 'none', 
            borderRadius: '6px', 
            cursor: 'pointer',
            fontSize: '16px',
            fontWeight: '600',
            transition: 'transform 0.2s, box-shadow 0.2s',
            boxShadow: '0 4px 10px rgba(102, 126, 234, 0.3)'
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateY(-2px)';
            e.target.style.boxShadow = '0 6px 15px rgba(102, 126, 234, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateY(0)';
            e.target.style.boxShadow = '0 4px 10px rgba(102, 126, 234, 0.3)';
          }}
        >
          Create Account
        </button>
      </form>

      {/* Login Link */}
      <p style={{ textAlign: 'center', marginTop: '20px', color: '#666', fontSize: '14px' }}>
        Already have an account? <Link to="/login" style={{ color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>Login here</Link>
      </p>
    </div>
  );
}

export default Register;
