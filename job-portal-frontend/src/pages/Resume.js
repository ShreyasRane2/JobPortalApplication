import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Resume() {
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showUploadForm, setShowUploadForm] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    file: null,
    skills: '',
    experience: 0
  });

  useEffect(() => {
    fetchUserAndResumes();
  }, []);

  const fetchUserAndResumes = async () => {
    setError(null);
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login.');
        setLoading(false);
        return;
      }

      console.log('Fetching user data...');
      // Fetch user email
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('User response:', userResponse.data);
      
      if (!userResponse.data || !userResponse.data.emailId) {
        setError('User email not found in response. Please try logging in again.');
        setLoading(false);
        return;
      }

      const email = userResponse.data.emailId;
      setUserEmail(email);
      console.log('User email:', email);
      
      // Fetch resumes
      console.log('Fetching resumes for:', email);
      const response = await axios.get(`http://localhost:8090/resume?email=${email}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      console.log('Resumes response:', response.data);
      setResumes(response.data);
    } catch (error) {
      console.error('Error in fetchUserAndResumes:', error);
      if (error.response) {
        setError(`Server error: ${error.response.status} - ${error.response.data?.message || 'Unknown error'}`);
      } else if (error.request) {
        setError('No response from server. Please check if services are running.');
      } else {
        setError(`Error: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setFormData({ ...formData, file: e.target.files[0] });
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!formData.file) {
      alert('Please select a file');
      return;
    }

    if (!userEmail) {
      alert('User email not loaded. Please refresh the page.');
      return;
    }

    setUploading(true);
    try {
      const token = localStorage.getItem('token');
      const uploadData = new FormData();
      uploadData.append('file', formData.file);
      uploadData.append('email', userEmail);
      uploadData.append('skills', formData.skills);
      uploadData.append('experience', formData.experience);

      await axios.post('http://localhost:8090/resume/upload', uploadData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('Resume uploaded successfully!');
      setShowUploadForm(false);
      setFormData({ file: null, skills: '', experience: 0 });
      fetchUserAndResumes();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('Failed to upload resume: ' + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (resumeId) => {
    if (!window.confirm('Are you sure you want to delete this resume?')) return;

    if (!userEmail) {
      alert('User email not loaded. Please refresh the page.');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8090/resume/${resumeId}?email=${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      alert('Resume deleted successfully!');
      fetchUserAndResumes();
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('Failed to delete resume: ' + (error.response?.data?.message || error.message));
    }
  };

  if (loading) return <div style={{ textAlign: 'center', padding: '50px' }}>Loading...</div>;

  if (error) {
    return (
      <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
        <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '20px', borderRadius: '8px' }}>
          <h2 style={{ color: '#856404', marginTop: 0 }}>⚠️ Error Loading Resume Page</h2>
          <p style={{ color: '#856404', marginBottom: '15px' }}>{error}</p>
          <button 
            onClick={fetchUserAndResumes}
            style={{ padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            Retry
          </button>
        </div>
        <div style={{ marginTop: '20px', background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
          <h3>Troubleshooting:</h3>
          <ul style={{ lineHeight: '1.8' }}>
            <li>Make sure you're logged in</li>
            <li>Check if User Service is running on port 5454</li>
            <li>Check if Resume Service is running on port 8090</li>
            <li>Open browser console (F12) for detailed error messages</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '900px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Resume</h1>
        {resumes.length === 0 && (
          <button 
            onClick={() => setShowUploadForm(!showUploadForm)}
            style={{ padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
          >
            {showUploadForm ? 'Cancel' : 'Upload Resume'}
          </button>
        )}
      </div>

      {userEmail && (
        <div style={{ background: '#d4edda', border: '1px solid #c3e6cb', padding: '10px 15px', borderRadius: '4px', marginBottom: '20px', color: '#155724' }}>
          ✓ Logged in as: {userEmail}
        </div>
      )}

      {showUploadForm && resumes.length === 0 && (
        <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
          <h2 style={{ marginTop: 0 }}>Upload Resume</h2>
          <form onSubmit={handleUpload}>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Resume File (PDF/DOC)</label>
              <input 
                type="file" 
                accept=".pdf,.doc,.docx"
                onChange={handleFileChange}
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Skills (comma separated)</label>
              <input 
                type="text"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                placeholder="e.g., Java, React, Spring Boot, MySQL"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold' }}>Years of Experience</label>
              <input 
                type="number"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                min="0"
                style={{ width: '100%', padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
                required
              />
            </div>
            <button 
              type="submit"
              disabled={uploading}
              style={{ padding: '10px 24px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: uploading ? 'not-allowed' : 'pointer', fontSize: '16px' }}
            >
              {uploading ? 'Uploading...' : 'Upload Resume'}
            </button>
          </form>
        </div>
      )}

      {resumes.length === 0 && !showUploadForm ? (
        <div style={{ background: 'white', padding: '50px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center' }}>
          <p style={{ fontSize: '18px', color: '#666' }}>No resume uploaded yet.</p>
          <p style={{ color: '#999' }}>Click "Upload Resume" to add your resume.</p>
        </div>
      ) : resumes.length > 0 ? (
        <div>
          {resumes.map((resume) => (
            <div key={resume.id} style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 15px 0', color: '#667eea' }}>{resume.fileName}</h3>
                  
                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#333' }}>Experience:</strong>
                    <span style={{ marginLeft: '10px', color: '#666' }}>{resume.experience} years</span>
                  </div>

                  <div style={{ marginBottom: '15px' }}>
                    <strong style={{ color: '#333', display: 'block', marginBottom: '8px' }}>Skills:</strong>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {resume.skills.split(',').map((skill, i) => (
                        <span key={i} style={{ background: '#e3f2fd', color: '#1976d2', padding: '6px 12px', borderRadius: '15px', fontSize: '14px' }}>
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginLeft: '20px' }}>
                  <button 
                    onClick={() => handleDelete(resume.id)}
                    style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
          <div style={{ background: '#fff3cd', border: '1px solid #ffc107', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
            <p style={{ margin: 0, color: '#856404' }}>
              ℹ️ You can only have one resume. Delete the current resume to upload a new one.
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export default Resume;
