import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

function PostJob() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [profileLoading, setProfileLoading] = useState(true);
  const [employerProfile, setEmployerProfile] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    companyName: '',
    description: '',
    minSalary: '',
    maxSalary: '',
    location: '',
    experience: '',
    jobType: 'FULL_TIME',
    workMode: 'WORK_FROM_OFFICE',
    status: 'OPEN',
    keySkills: []
  });
  const [newSkill, setNewSkill] = useState('');

  // Redirect if not employer and fetch profile
  useEffect(() => {
    if (user && user.role !== 'ROLE_EMPLOYER') {
      alert('Only employers can post jobs');
      navigate('/jobs');
      return;
    }
    
    if (user && user.role === 'ROLE_EMPLOYER') {
      fetchEmployerProfile();
    }
  }, [user, navigate]);

  // Re-fetch profile when component becomes visible (e.g., after navigation)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!document.hidden && user?.role === 'ROLE_EMPLOYER') {
        fetchEmployerProfile();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [user]);

  const fetchEmployerProfile = async () => {
    try {
      setProfileLoading(true);
      const token = localStorage.getItem('token');
      
      // Get user email first
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userEmail = userResponse.data.emailId;
      
      // Fetch employer profile - FIXED: Using correct port 8088
      const profileResponse = await axios.get(`http://localhost:8088/profile/employer/${userEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      const profile = profileResponse.data;
      setEmployerProfile(profile);
      
      // Auto-populate form with profile data
      setFormData(prev => ({
        ...prev,
        companyName: profile.companyName || '',
        location: profile.location || ''
      }));
      
    } catch (error) {
      console.error('Error fetching employer profile:', error);
      if (error.response?.status === 404) {
        // Profile doesn't exist
        setEmployerProfile(null);
      }
    } finally {
      setProfileLoading(false);
    }
  };

  const addSkill = () => {
    if (newSkill.trim() && !formData.keySkills.includes(newSkill.trim())) {
      setFormData({ ...formData, keySkills: [...formData.keySkills, newSkill.trim()] });
      setNewSkill('');
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData({ ...formData, keySkills: formData.keySkills.filter(s => s !== skillToRemove) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.companyName || !formData.description || !formData.location) {
      alert('Please fill in all required fields');
      return;
    }

    if (!employerProfile) {
      alert('Employer profile is required to post jobs');
      return;
    }

    // Salary validation
    if (formData.minSalary && formData.maxSalary) {
      const minSal = parseFloat(formData.minSalary);
      const maxSal = parseFloat(formData.maxSalary);
      
      if (isNaN(minSal) || isNaN(maxSal)) {
        alert('❌ Please enter valid numbers for salary');
        return;
      }
      
      if (maxSal <= minSal) {
        alert('❌ Maximum salary must be greater than minimum salary');
        return;
      }
    }

    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch employer email
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const employerEmail = userResponse.data.emailId;
      
      // Use profile ID as company ID (since we have employer profile)
      const companyId = employerProfile.id;
      
      const jobData = {
        title: formData.title,
        companyName: employerProfile.companyName, // Always use profile company name
        description: formData.description,
        minSalary: formData.minSalary,
        maxSalary: formData.maxSalary,
        location: formData.location, // Can be different from company location
        experience: parseInt(formData.experience) || 0,
        jobType: formData.jobType,
        workMode: formData.workMode,
        status: formData.status,
        keySkills: formData.keySkills,
        companyId: companyId,
        employerEmail: employerEmail
      };

      await axios.post(`http://localhost:8085/api/admin/jobs?companyId=${companyId}`, jobData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      alert('✅ Job posted successfully!');
      navigate('/jobs');
    } catch (error) {
      console.error('Error posting job:', error);
      alert('❌ Failed to post job. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <h1>Add Job</h1>
      
      {profileLoading ? (
        <div style={{ background: 'white', padding: '40px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
            <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
          </div>
          <p style={{ marginTop: '15px', color: '#667eea', fontSize: '16px' }}>Loading your profile...</p>
        </div>
      ) : !employerProfile ? (
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '30px', borderRadius: '8px', marginBottom: '20px' }}>
          <h2 style={{ color: '#856404', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
            ⚠️ Profile Required
          </h2>
          <p style={{ color: '#856404', marginBottom: '20px', fontSize: '16px', lineHeight: '1.6' }}>
            You need to create your employer profile first before posting jobs. This helps avoid entering company details repeatedly and provides a better experience for job seekers.
          </p>
          <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
            <button 
              onClick={() => navigate('/profile')}
              style={{ 
                padding: '12px 24px', 
                background: '#667eea', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              Create Profile
            </button>
            <button 
              onClick={fetchEmployerProfile}
              style={{ 
                padding: '12px 24px', 
                background: '#28a745', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px',
                fontWeight: '600'
              }}
            >
              🔄 Check Again
            </button>
            <button 
              onClick={() => navigate('/jobs')}
              style={{ 
                padding: '12px 24px', 
                background: '#6c757d', 
                color: 'white', 
                border: 'none', 
                borderRadius: '6px', 
                cursor: 'pointer', 
                fontSize: '16px'
              }}
            >
              Back to Jobs
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Profile Info Display */}
          <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h3 style={{ color: '#155724', marginTop: 0, display: 'flex', alignItems: 'center', gap: '10px' }}>
              ✓ Profile Loaded
            </h3>
            <div style={{ color: '#155724', fontSize: '14px' }}>
              <p style={{ margin: '5px 0' }}><strong>Company:</strong> {employerProfile.companyName}</p>
              <p style={{ margin: '5px 0' }}><strong>Location:</strong> {employerProfile.location}</p>
              {employerProfile.industry && <p style={{ margin: '5px 0' }}><strong>Industry:</strong> {employerProfile.industry}</p>}
            </div>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginTop: '20px' }}>
            <form onSubmit={handleSubmit}>
          {/* Job Title */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Title <span style={{ color: 'red' }}>*</span>
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g., Senior Java Developer"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Company Name - Auto-populated and read-only */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Company Name <span style={{ color: 'green' }}>✓ From Profile</span>
            </label>
            <input
              type="text"
              value={formData.companyName}
              readOnly
              style={{ 
                width: '100%', 
                padding: '12px', 
                border: '1px solid #28a745', 
                borderRadius: '4px', 
                fontSize: '16px',
                backgroundColor: '#f8f9fa',
                color: '#495057'
              }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>
              This is automatically filled from your profile. To change it, update your profile.
            </small>
          </div>

          {/* Description */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Description <span style={{ color: 'red' }}>*</span>
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the job role, responsibilities, and requirements..."
              required
              rows="6"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px', fontFamily: 'inherit' }}
            />
          </div>

          {/* Location - Pre-filled from profile but editable */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Location <span style={{ color: 'red' }}>*</span>
              {employerProfile.location && <span style={{ color: 'green', fontSize: '12px' }}> (Pre-filled from profile)</span>}
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="e.g., Mumbai, India"
              required
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
            <small style={{ color: '#6c757d', fontSize: '12px' }}>
              You can modify this for specific job location if different from company location.
            </small>
          </div>

          {/* Salary Range */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Min Salary (₹)
              </label>
              <input
                type="number"
                value={formData.minSalary}
                onChange={(e) => setFormData({ ...formData, minSalary: e.target.value })}
                placeholder="e.g., 50000"
                min="0"
                style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
                Max Salary (₹)
              </label>
              <input
                type="number"
                value={formData.maxSalary}
                onChange={(e) => setFormData({ ...formData, maxSalary: e.target.value })}
                placeholder="e.g., 80000"
                min="0"
                style={{ 
                  width: '100%', 
                  padding: '12px', 
                  border: formData.minSalary && formData.maxSalary && parseFloat(formData.maxSalary) <= parseFloat(formData.minSalary) 
                    ? '2px solid #dc3545' 
                    : '1px solid #ddd', 
                  borderRadius: '4px', 
                  fontSize: '16px' 
                }}
              />
              {formData.minSalary && formData.maxSalary && parseFloat(formData.maxSalary) <= parseFloat(formData.minSalary) && (
                <small style={{ color: '#dc3545', fontSize: '12px', marginTop: '5px', display: 'block' }}>
                  ⚠️ Max salary must be greater than min salary
                </small>
              )}
            </div>
          </div>

          {/* Experience */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Experience Required (years)
            </label>
            <input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
              placeholder="e.g., 3"
              min="0"
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            />
          </div>

          {/* Job Type */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Job Type
            </label>
            <select
              value={formData.jobType}
              onChange={(e) => setFormData({ ...formData, jobType: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            >
              <option value="FULL_TIME">Full Time</option>
              <option value="PART_TIME">Part Time</option>
              <option value="INTERNSHIP">Internship</option>
            </select>
          </div>

          {/* Work Mode */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Work Mode
            </label>
            <select
              value={formData.workMode}
              onChange={(e) => setFormData({ ...formData, workMode: e.target.value })}
              style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
            >
              <option value="WORK_FROM_OFFICE">Work From Office</option>
              <option value="HYBRID">Hybrid</option>
              <option value="WORK_FROM_HOME">Work From Home</option>
            </select>
          </div>

          {/* Key Skills */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>
              Required Skills
            </label>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '10px' }}>
              <input
                type="text"
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill (e.g., Java, React)"
                style={{ flex: 1, padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
              />
              <button
                type="button"
                onClick={addSkill}
                style={{ padding: '12px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
              >
                Add
              </button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {formData.keySkills.map((skill, i) => (
                <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  {skill}
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    style={{ background: 'none', border: 'none', color: '#1976d2', cursor: 'pointer', fontSize: '18px', padding: 0 }}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit Buttons */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '30px' }}>
            <button
              type="submit"
              disabled={loading}
              style={{ padding: '12px 32px', background: loading ? '#ccc' : '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: loading ? 'not-allowed' : 'pointer', fontSize: '16px', fontWeight: 'bold' }}
            >
              {loading ? 'Adding...' : 'Add Job'}
            </button>
            <button
              type="button"
              onClick={() => navigate('/jobs')}
              style={{ padding: '12px 32px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
            >
              Cancel
            </button>
          </div>
            </form>
          </div>
        </>
      )}
    </div>
  );
}

export default PostJob;
