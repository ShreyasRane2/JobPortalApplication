import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { jobAPI, applicationAPI } from '../services/api';

const JobDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await jobAPI.getJobById(id);
      setJob(response.data);
    } catch (error) {
      console.error('Error loading job:', error);
    }
    setLoading(false);
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      await applicationAPI.applyForJob({
        jobId: id,
        userId: 1 // Replace with actual user ID
      });
      alert('Application submitted successfully!');
      navigate('/applications');
    } catch (error) {
      alert('Error applying: ' + (error.response?.data || error.message));
    }
    setApplying(false);
  };

  if (loading) return <div className="loading">Loading job details...</div>;
  if (!job) return <div className="container">Job not found</div>;

  return (
    <div className="container">
      <button onClick={() => navigate('/jobs')} className="btn">← Back to Jobs</button>
      
      <div className="card" style={{ marginTop: '20px' }}>
        <h1>{job.title}</h1>
        <p className="job-location">📍 {job.location}</p>
        <p className="job-type">{job.jobType} • {job.workMode}</p>
        {job.salary && <p className="job-salary">💰 {job.salary}</p>}
        
        <hr style={{ margin: '20px 0' }} />
        
        <h3>Job Description</h3>
        <p style={{ lineHeight: '1.8', color: '#555' }}>{job.description}</p>
        
        {/* Key Skills Section */}
        {job.keySkills && job.keySkills.length > 0 && (
          <>
            <hr style={{ margin: '20px 0' }} />
            <h3>Required Skills</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px', marginTop: '15px' }}>
              {job.keySkills.map((skill, i) => (
                <span key={i} style={{ 
                  background: '#e8f5e9', 
                  color: '#2e7d32', 
                  padding: '8px 16px', 
                  borderRadius: '20px', 
                  fontSize: '14px',
                  fontWeight: '500'
                }}>
                  {skill}
                </span>
              ))}
            </div>
          </>
        )}
        
        {/* Additional Information */}
        <hr style={{ margin: '20px 0' }} />
        <h3>Additional Information</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px', marginTop: '15px' }}>
          {job.experience !== undefined && job.experience !== null && (
            <div>
              <strong>Experience Required:</strong>
              <p style={{ margin: '5px 0', color: '#666' }}>{job.experience} years</p>
            </div>
          )}
          {job.companyName && (
            <div>
              <strong>Company:</strong>
              <p style={{ margin: '5px 0', color: '#666' }}>{job.companyName}</p>
            </div>
          )}
          {job.minSalary && job.maxSalary && (
            <div>
              <strong>Salary Range:</strong>
              <p style={{ margin: '5px 0', color: '#666' }}>₹{job.minSalary} - ₹{job.maxSalary}</p>
            </div>
          )}
          {job.status && (
            <div>
              <strong>Status:</strong>
              <p style={{ margin: '5px 0', color: job.status === 'OPEN' ? '#28a745' : '#dc3545' }}>
                {job.status}
              </p>
            </div>
          )}
        </div>
        
        <button 
          onClick={handleApply} 
          className="btn btn-success" 
          disabled={applying}
          style={{ marginTop: '20px' }}
        >
          {applying ? 'Applying...' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
};

export default JobDetails;
