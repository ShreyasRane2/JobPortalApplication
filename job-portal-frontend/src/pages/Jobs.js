import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Jobs() {
  const { user, isAuthenticated } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [userApplications, setUserApplications] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState(null);
  const [employerProfiles, setEmployerProfiles] = useState({}); // Store employer profiles by email

  useEffect(() => {
    const fetchCurrentUser = async () => {
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          const response = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setCurrentUser(response.data);
        } catch (error) {
          console.error('Failed to fetch user:', error);
        }
      }
    };
    fetchCurrentUser();
  }, [isAuthenticated]);

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await axios.get('http://localhost:8082/api/jobs/simple');
      console.log('Jobs fetched:', response.data);
      setJobs(response.data);
      
      if (isAuthenticated) {
        try {
          const token = localStorage.getItem('token');
          let userId = currentUser?.id;
          if (!userId) {
            const userResponse = await axios.get('http://localhost:5454/api/users/me', {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            userId = userResponse.data.id;
            setCurrentUser(userResponse.data);
          }
          
          const appsResponse = await axios.get(`http://localhost:8087/applications/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          setUserApplications(Array.isArray(appsResponse.data) ? appsResponse.data : []);
        } catch (err) {
          console.log('Could not fetch applications:', err);
          setUserApplications([]);
        }
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      setError('Failed to load jobs. Make sure Job Service is running on port 8082.');
      setLoading(false);
    }
  };

  const fetchEmployerProfile = async (employerEmail) => {
    if (!employerEmail || employerProfiles[employerEmail]) {
      return employerProfiles[employerEmail] || null;
    }

    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:8088/profile/employer/${employerEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setEmployerProfiles(prev => ({
        ...prev,
        [employerEmail]: response.data
      }));
      
      return response.data;
    } catch (error) {
      return null;
    }
  };

  // Fetch employer profiles for all jobs
  useEffect(() => {
    const loadEmployerProfiles = async () => {
      for (const job of jobs) {
        if (job.employerEmail) {
          await fetchEmployerProfile(job.employerEmail);
        }
      }
    };
    
    if (jobs.length > 0) {
      loadEmployerProfiles();
    }
  }, [jobs, fetchEmployerProfile]);


  const hasApplied = (jobId) => {
    return userApplications.some(app => app.jobId === jobId);
  };

  const handleApply = async (jobId) => {
    if (!currentUser && !isAuthenticated) {
      alert('Please login to apply for jobs');
      return;
    }

    if (currentUser?.role === 'ROLE_EMPLOYER') {
      alert('Employers cannot apply for jobs');
      return;
    }

    if (hasApplied(jobId)) {
      alert('You have already applied for this job');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      let userId = currentUser?.id;
      
      if (!userId) {
        const userResponse = await axios.get('http://localhost:5454/api/users/me', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        userId = userResponse.data.id;
      }
      
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userEmail = userResponse.data.emailId;
      
      // Validation: Check if profile exists
      let hasProfile = false;
      try {
        const profileResponse = await axios.get(`http://localhost:8088/profile/jobseeker/${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        hasProfile = profileResponse.data && Object.keys(profileResponse.data).length > 0;
      } catch (err) {
        console.log('No profile found for user');
      }
      
      if (!hasProfile) {
        if (window.confirm('⚠️ You need to create your profile before applying.\n\nProfile helps employers know about your skills and experience.\n\nGo to Profile page now?')) {
          window.location.href = '/profile';
        }
        return;
      }
      
      // Validation: Check if resume exists
      let resumePath = null;
      let hasResume = false;
      try {
        const resumeResponse = await axios.get(`http://localhost:8090/resume?email=${userEmail}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (resumeResponse.data && resumeResponse.data.length > 0) {
          resumePath = resumeResponse.data[0].filePath;
          hasResume = true;
        }
      } catch (err) {
        console.log('No resume found for user');
      }
      
      if (!hasResume) {
        if (window.confirm('⚠️ You need to upload your resume before applying.\n\nResume helps employers evaluate your qualifications.\n\nGo to Profile page to upload resume?')) {
          window.location.href = '/profile';
        }
        return;
      }
      
      // All validations passed - proceed with application
      await axios.post('http://localhost:8087/applications', {
        applicantId: userId,
        applicantEmail: userEmail,
        jobId: jobId,
        resume: resumePath,
        applicationStatus: 'Applied'
      }, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      // Get job details for notification
      const job = jobs.find(j => j.id === jobId);
      
      // Create notification
      try {
        await axios.post('http://localhost:8086/api/notifications/send', {
          recipientId: userId,
          recipientEmail: userEmail,
          notificationType: 'JOB_APPLICATION',
          subject: `Application Submitted: ${job?.title || 'Job'}`,
          message: `You have successfully applied for ${job?.title || 'the job'} at ${job?.companyName || 'the company'}. Your application is under review.`
        });
      } catch (notifError) {
        console.error('Failed to create notification:', notifError);
      }
      
      alert('✅ Application submitted successfully!');
      fetchJobs();
    } catch (error) {
      console.error('Error applying for job:', error);
      alert('Failed to submit application. You may have already applied for this job.');
    }
  };

  const filteredJobs = jobs.filter(job => 
    (job.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    job.location?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading jobs...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchJobs} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>Browse Jobs ({jobs.length} available)</h1>
        <button onClick={fetchJobs} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>
      
      <div style={{ marginBottom: '30px' }}>
        <input
          type="text"
          placeholder="Search jobs by title, company, or location..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px', border: '1px solid #ddd', borderRadius: '4px', fontSize: '16px' }}
        />
      </div>

      {jobs.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px' }}>
          <h2>No Jobs Available</h2>
          <p style={{ color: '#666' }}>There are currently no job postings. Check back later!</p>
          {user?.role === 'ROLE_EMPLOYER' && (
            <Link to="/post-job" style={{ display: 'inline-block', marginTop: '20px', padding: '10px 20px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              Post a Job
            </Link>
          )}
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {filteredJobs.map(job => {
            const employerProfile = employerProfiles[job.employerEmail];
            
            return (
            <div key={job.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '15px' }}>
                <div>
                  <h2 style={{ margin: '0 0 10px 0', fontSize: '24px' }}>{job.title}</h2>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '16px' }}>🏢 {job.companyName || 'Company'}</p>
                  <p style={{ margin: '5px 0', color: '#666', fontSize: '16px' }}>📍 {job.location || 'Location not specified'}</p>
                  {employerProfile?.industry && (
                    <p style={{ margin: '5px 0', color: '#667eea', fontSize: '14px', fontWeight: '500' }}>
                      🏭 {employerProfile.industry}
                    </p>
                  )}
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ background: '#e3f2fd', color: '#1976d2', padding: '5px 12px', borderRadius: '20px', fontSize: '14px' }}>
                    {job.jobType || 'Full-time'}
                  </span>
                  {job.salaryRange && (
                    <p style={{ margin: '10px 0 0 0', fontWeight: 'bold', color: '#28a745', fontSize: '18px' }}>{job.salaryRange}</p>
                  )}
                </div>
              </div>
              <p style={{ color: '#666', lineHeight: '1.6', marginBottom: '15px' }}>
                {job.description || 'No description available'}
              </p>
              
              {/* Key Skills */}
              {job.keySkills && job.keySkills.length > 0 && (
                <div style={{ marginBottom: '15px' }}>
                  <strong style={{ color: '#333', fontSize: '14px', display: 'block', marginBottom: '8px' }}>🎯 Required Skills:</strong>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {job.keySkills.map((skill, i) => (
                      <span key={i} style={{ background: '#e8f5e9', color: '#2e7d32', padding: '6px 12px', borderRadius: '15px', fontSize: '13px', fontWeight: '500' }}>
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Additional Job Info */}
              <div style={{ display: 'flex', gap: '20px', marginBottom: '15px', flexWrap: 'wrap' }}>
                {job.experience !== undefined && job.experience !== null && (
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    💼 <strong>{job.experience}</strong> years exp
                  </span>
                )}
                {job.workMode && (
                  <span style={{ color: '#666', fontSize: '14px' }}>
                    🏠 <strong>{job.workMode.replace(/_/g, ' ')}</strong>
                  </span>
                )}
              </div>
              
              {user?.role !== 'ROLE_EMPLOYER' && (
                hasApplied(job.id) ? (
                  <button 
                    disabled
                    style={{ padding: '10px 24px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'not-allowed', fontSize: '16px' }}
                  >
                    Already Applied
                  </button>
                ) : (
                  <button 
                    onClick={() => handleApply(job.id)}
                    style={{ padding: '10px 24px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}
                  >
                    Apply Now
                  </button>
                )
              )}
            </div>
            );
          })}
        </div>
      )}

      {filteredJobs.length === 0 && jobs.length > 0 && (
        <div style={{ textAlign: 'center', padding: '50px', color: '#666' }}>
          <p style={{ fontSize: '18px' }}>No jobs found matching "{searchTerm}"</p>
        </div>
      )}
    </div>
  );
}

export default Jobs;
