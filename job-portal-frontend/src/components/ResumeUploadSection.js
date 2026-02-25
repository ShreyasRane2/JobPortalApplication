import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ResumeUploadSection({ userEmail }) {
  const [resume, setResume] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchResume();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userEmail]);

  const fetchResume = async () => {
    if (!userEmail) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8090/resume?email=${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (response.data && response.data.length > 0) {
        setResume(response.data[0]);
      }
    } catch (error) {
      console.log('No resume found or error fetching:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setResumeFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!resumeFile) {
      alert('Please select a file');
      return;
    }

    try {
      setUploading(true);
      const token = localStorage.getItem('token');
      const formData = new FormData();
      formData.append('file', resumeFile);
      formData.append('email', userEmail);
      formData.append('skills', 'N/A');
      formData.append('experience', '0');

      await axios.post('http://localhost:8090/resume/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      alert('✅ Resume uploaded successfully!');
      setResumeFile(null);
      fetchResume();
    } catch (error) {
      console.error('Error uploading resume:', error);
      alert('❌ Failed to upload resume. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async () => {
    if (!resume || !window.confirm('Are you sure you want to delete your resume?')) return;

    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8090/resume/${resume.id}?email=${userEmail}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('✅ Resume deleted successfully!');
      setResume(null);
    } catch (error) {
      console.error('Error deleting resume:', error);
      alert('❌ Failed to delete resume.');
    }
  };

  const handleDownload = () => {
    if (!resume || !resume.id) {
      alert('❌ No resume available to download');
      return;
    }

    try {
      const downloadUrl = `http://localhost:8090/resume/download/${resume.id}?email=${encodeURIComponent(userEmail)}`;
      window.open(downloadUrl, '_blank');
    } catch (error) {
      console.error('Error downloading resume:', error);
      alert('❌ Failed to download resume. Please try again.');
    }
  };

  if (loading) {
    return (
      <div style={{ 
        background: 'white', 
        padding: '40px', 
        borderRadius: '16px', 
        boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
        marginTop: '30px',
        border: '1px solid #f0f0f0',
        textAlign: 'center'
      }}>
        <div style={{ display: 'inline-block', width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTop: '4px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
        <p style={{ marginTop: '15px', color: '#667eea', fontSize: '16px' }}>Loading resume...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      background: 'white', 
      padding: '40px', 
      borderRadius: '16px', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)', 
      marginTop: '30px',
      border: '1px solid #f0f0f0',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.transform = 'translateY(-5px)';
      e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.12)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
    }}>
      <div style={{ marginBottom: '30px', paddingBottom: '20px', borderBottom: '2px solid #f0f0f0' }}>
        <h2 style={{ margin: 0, fontSize: '24px', color: '#333' }}>📄 Resume</h2>
        <p style={{ margin: '10px 0 0 0', color: '#666', fontSize: '14px' }}>
          {resume ? 'Your uploaded resume' : 'Upload your resume to apply for jobs'}
        </p>
      </div>
      
      {resume ? (
        <div>
          <div style={{ 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)', 
            padding: '25px', 
            borderRadius: '12px', 
            marginBottom: '20px',
            border: '1px solid rgba(255,255,255,0.8)',
            transition: 'all 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(1.02)';
            e.currentTarget.style.boxShadow = '0 8px 20px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
            e.currentTarget.style.boxShadow = 'none';
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
              <div>
                <h3 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '18px', fontWeight: '600' }}>
                  📎 {resume.fileName || 'Resume.pdf'}
                </h3>
                <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
                  📅 Uploaded: {new Date(resume.uploadDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                </p>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={handleDownload}
                  style={{ 
                    padding: '10px 20px', 
                    background: 'linear-gradient(135deg, #17a2b8 0%, #138496 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(23, 162, 184, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(23, 162, 184, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(23, 162, 184, 0.3)';
                  }}
                >
                  📥 Download
                </button>
                <button 
                  onClick={handleDelete}
                  style={{ 
                    padding: '10px 20px', 
                    background: 'linear-gradient(135deg, #dc3545 0%, #c82333 100%)', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '8px', 
                    cursor: 'pointer', 
                    fontSize: '14px',
                    fontWeight: '600',
                    transition: 'all 0.3s ease',
                    boxShadow: '0 4px 15px rgba(220, 53, 69, 0.3)'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = 'translateY(-2px)';
                    e.target.style.boxShadow = '0 6px 20px rgba(220, 53, 69, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = 'translateY(0)';
                    e.target.style.boxShadow = '0 4px 15px rgba(220, 53, 69, 0.3)';
                  }}
                >
                  🗑️ Delete
                </button>
              </div>
            </div>
          </div>
          <div style={{ 
            background: 'linear-gradient(135deg, #fff3cd 0%, #ffe69c 100%)', 
            border: '2px solid #ffc107', 
            padding: '20px', 
            borderRadius: '12px',
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ fontSize: '32px' }}>ℹ️</div>
            <p style={{ margin: 0, color: '#856404', fontSize: '15px', lineHeight: '1.5' }}>
              You can only have one resume. Delete the current resume to upload a new one.
            </p>
          </div>
        </div>
      ) : (
        <div>
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontWeight: '600', color: '#333', fontSize: '15px' }}>
              📤 Upload Your Resume
            </label>
            <input 
              type="file" 
              accept=".pdf,.doc,.docx"
              onChange={handleFileChange}
              style={{ 
                display: 'block', 
                marginBottom: '12px',
                padding: '12px',
                border: '2px dashed #667eea',
                borderRadius: '8px',
                width: '100%',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                background: '#f8f9ff'
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#764ba2';
                e.target.style.background = '#f0f2ff';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#667eea';
                e.target.style.background = '#f8f9ff';
              }}
            />
            <p style={{ color: '#666', fontSize: '14px', margin: '5px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>📋</span> Accepted formats: PDF, DOC, DOCX (Max 5MB)
            </p>
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading || !resumeFile}
            style={{ 
              padding: '14px 32px', 
              background: uploading || !resumeFile ? '#ccc' : 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
              color: 'white', 
              border: 'none', 
              borderRadius: '8px', 
              cursor: uploading || !resumeFile ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              fontWeight: '600',
              transition: 'all 0.3s ease',
              boxShadow: uploading || !resumeFile ? 'none' : '0 4px 15px rgba(40, 167, 69, 0.3)',
              opacity: uploading || !resumeFile ? 0.6 : 1
            }}
            onMouseEnter={(e) => {
              if (!uploading && resumeFile) {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 6px 20px rgba(40, 167, 69, 0.4)';
              }
            }}
            onMouseLeave={(e) => {
              if (!uploading && resumeFile) {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = '0 4px 15px rgba(40, 167, 69, 0.3)';
              }
            }}
          >
            {uploading ? '⏳ Uploading...' : '📤 Upload Resume'}
          </button>
        </div>
      )}
    </div>
  );
}

export default ResumeUploadSection;
