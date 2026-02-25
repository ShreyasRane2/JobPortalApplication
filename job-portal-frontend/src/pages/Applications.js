import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Applications() {
  const [applications, setApplications] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [userRole, setUserRole] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [applicantProfiles, setApplicantProfiles] = useState({});
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showProfileModal, setShowProfileModal] = useState(false);

  useEffect(() => {
    fetchJobsAndApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchJobsAndApplications = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const userResponse = await axios.get('http://localhost:5454/api/users/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const userId = userResponse.data.id;
      const role = userResponse.data.role;
      const email = userResponse.data.emailId;
      
      console.log('=== APPLICATIONS DEBUG ===');
      console.log('User Email:', email);
      console.log('User Role:', role);
      
      setUserRole(role);
      setUserEmail(email);
      
      const jobsResponse = await axios.get('http://localhost:8082/api/jobs/simple');
      const jobsData = jobsResponse.data;
      setJobs(jobsData);
      
      console.log('Total Jobs:', jobsData.length);
      console.log('All Jobs:', jobsData);
      
      if (role === 'ROLE_EMPLOYER') {
        // Show email comparison for each job
        console.log('=== EMAIL COMPARISON ===');
        jobsData.forEach((job, index) => {
          console.log(`Job ${index + 1}:`, {
            jobId: job.id,
            jobTitle: job.title,
            jobEmployerEmail: job.employerEmail,
            yourEmail: email,
            match: job.employerEmail === email,
            exactMatch: job.employerEmail === email ? '✅ MATCH' : '❌ NO MATCH'
          });
        });
        
        const employerJobs = jobsData.filter(job => job.employerEmail === email);
        console.log('Employer Jobs (filtered):', employerJobs.length);
        console.log('Employer Jobs:', employerJobs);
        
        const allApplications = [];
        
        for (const job of employerJobs) {
          try {
            console.log(`Fetching applications for job ${job.id} (${job.title})...`);
            const appResponse = await axios.get(`http://localhost:8087/applications/job/${job.id}`, {
              headers: { 'Authorization': `Bearer ${token}` }
            });
            console.log(`Applications for job ${job.id}:`, appResponse.data);
            
            const jobApplications = Array.isArray(appResponse.data) ? appResponse.data : [];
            jobApplications.forEach(app => {
              allApplications.push({
                ...app,
                jobTitle: job.title,
                companyName: job.companyName,
                location: job.location,
                jobType: job.jobType
              });
            });
          } catch (err) {
            console.log(`No applications for job ${job.id}:`, err.message);
          }
        }
        
        console.log('Total Applications Found:', allApplications.length);
        console.log('All Applications:', allApplications);
        
        setApplications(allApplications);
        
        // Fetch applicant profiles
        const profiles = {};
        for (const app of allApplications) {
          if (app.applicantEmail && !profiles[app.applicantEmail]) {
            try {
              const profileResponse = await axios.get(`http://localhost:8088/profile/jobseeker/${app.applicantEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              profiles[app.applicantEmail] = profileResponse.data;
            } catch (err) {
              profiles[app.applicantEmail] = null;
            }
          }
        }
        setApplicantProfiles(profiles);
        
      } else {
        const response = await axios.get(`http://localhost:8087/applications/user/${userId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const applicationsData = Array.isArray(response.data) ? response.data : [];
        
        const applicationsWithJobDetails = applicationsData.map(app => {
          const job = jobsData.find(j => j.id === app.jobId);
          return {
            ...app,
            jobTitle: job?.title || `Job #${app.jobId}`,
            companyName: job?.companyName || 'Unknown Company',
            location: job?.location,
            jobType: job?.jobType
          };
        });
        
        setApplications(applicationsWithJobDetails);
      }
      
      setLoading(false);
    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load applications');
      setLoading(false);
    }
  };


  const handleStatusUpdate = async (applicationId, newStatus) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:8087/applications/${applicationId}/status`, 
        { status: newStatus },
        { headers: { 'Authorization': `Bearer ${token}` } }
      );
      alert(`✅ Application status updated to ${newStatus}`);
      fetchJobsAndApplications();
    } catch (error) {
      console.error('Error updating status:', error);
      alert('❌ Failed to update status');
    }
  };

  const viewApplicantProfile = (application) => {
    setSelectedApplication(application);
    setShowProfileModal(true);
  };

  const downloadResume = async (applicantEmail) => {
    try {
      const token = localStorage.getItem('token');
      const resumeResponse = await axios.get(`http://localhost:8090/resume?email=${applicantEmail}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (resumeResponse.data && resumeResponse.data.length > 0) {
        window.open(`http://localhost:8090/resume/download/${resumeResponse.data[0].id}?email=${applicantEmail}`, '_blank');
      } else {
        alert('Resume not found');
      }
    } catch (err) {
      console.error('Error downloading resume:', err);
      alert('Failed to download resume');
    }
  };

  const getStatusColor = (status) => {
    const statusUpper = (status || '').toUpperCase();
    const colors = {
      'APPLIED': '#17a2b8',
      'PENDING': '#ffc107',
      'UNDER_REVIEW': '#17a2b8',
      'UNDER REVIEW': '#17a2b8',
      'INTERVIEW_SCHEDULED': '#17a2b8',
      'INTERVIEW SCHEDULED': '#17a2b8',
      'ACCEPTED': '#28a745',
      'REJECTED': '#dc3545'
    };
    return colors[statusUpper] || '#6c757d';
  };

  const formatStatus = (status) => {
    if (!status) return 'Unknown';
    return status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading applications...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={fetchJobsAndApplications} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  // Employer View
  if (userRole === 'ROLE_EMPLOYER') {
    return (
      <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h1>📋 Applications Received</h1>
            <p style={{ color: '#666', marginTop: '10px' }}>Manage applications for your posted jobs ({applications.length} total)</p>
          </div>
          <button onClick={fetchJobsAndApplications} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            🔄 Refresh
          </button>
        </div>

        {applications.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px' }}>
            <h2>No Applications Yet</h2>
            <p style={{ color: '#666', marginBottom: '20px' }}>No one has applied to your jobs yet.</p>
            <Link to="/post-job" style={{ display: 'inline-block', padding: '10px 20px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
              Post a Job
            </Link>
          </div>
        ) : (
          <EmployerApplicationsList 
            applications={applications}
            applicantProfiles={applicantProfiles}
            handleStatusUpdate={handleStatusUpdate}
            viewApplicantProfile={viewApplicantProfile}
            downloadResume={downloadResume}
            getStatusColor={getStatusColor}
            formatStatus={formatStatus}
          />
        )}

        {showProfileModal && selectedApplication && (
          <ProfileModal 
            application={selectedApplication}
            profile={applicantProfiles[selectedApplication.applicantEmail]}
            onClose={() => setShowProfileModal(false)}
          />
        )}
      </div>
    );
  }

  // Job Seeker View
  return (
    <JobSeekerApplicationsList 
      applications={applications}
      fetchJobsAndApplications={fetchJobsAndApplications}
      getStatusColor={getStatusColor}
      formatStatus={formatStatus}
    />
  );
}

export default Applications;

// Employer Applications List Component
function EmployerApplicationsList({ applications, applicantProfiles, handleStatusUpdate, viewApplicantProfile, downloadResume, getStatusColor, formatStatus }) {
  return (
    <div style={{ display: 'grid', gap: '20px' }}>
      {applications.map(app => {
        const profile = applicantProfiles[app.applicantEmail] || {};
        return (
          <div key={app.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
            <div style={{ marginBottom: '20px' }}>
              <h2 style={{ margin: '0 0 10px 0', fontSize: '22px', color: '#333' }}>
                {app.jobTitle || 'Position Not Available'}
              </h2>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', color: '#666', fontSize: '14px' }}>
                <span>👤 {app.applicantEmail}</span>
                <span>📅 Applied: {new Date(app.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </div>
            </div>

            <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '15px' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '16px', color: '#333' }}>Applicant Profile</h3>
              {profile && Object.keys(profile).length > 0 ? (
                <>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '14px' }}>
                    <div><strong>Name:</strong> {profile.fullName || 'Not provided'}</div>
                    <div><strong>Phone:</strong> {profile.phone || 'Not provided'}</div>
                    <div><strong>Experience:</strong> {profile.experience || 'Not provided'}</div>
                    <div><strong>Location:</strong> {profile.location || 'Not provided'}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Skills:</strong> {profile.skills || 'Not provided'}</div>
                    <div style={{ gridColumn: '1 / -1' }}><strong>Education:</strong> {profile.education || 'Not provided'}</div>
                  </div>
                  <div style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
                    <button 
                      onClick={() => viewApplicantProfile(app)}
                      style={{ padding: '6px 12px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      View Full Profile
                    </button>
                    {app.resume && (
                      <button 
                        onClick={() => downloadResume(app.applicantEmail)}
                        style={{ padding: '6px 12px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                      >
                        📥 Download Resume
                      </button>
                    )}
                  </div>
                </>
              ) : (
                <div style={{ padding: '10px', background: '#fff3cd', borderRadius: '4px', border: '1px solid #ffc107' }}>
                  <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                    ⚠️ This applicant hasn't created their profile yet. Only email is available: <strong>{app.applicantEmail}</strong>
                  </p>
                  {app.resume && (
                    <button 
                      onClick={() => downloadResume(app.applicantEmail)}
                      style={{ marginTop: '10px', padding: '6px 12px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '13px' }}
                    >
                      📥 Download Resume
                    </button>
                  )}
                </div>
              )}
            </div>

            {app.coverLetter && (
              <div style={{ marginBottom: '15px', padding: '12px', background: '#fff3cd', borderRadius: '4px', borderLeft: '3px solid #ffc107' }}>
                <p style={{ margin: 0, color: '#856404', fontSize: '14px' }}>
                  <strong>Cover Letter:</strong> "{app.coverLetter}"
                </p>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                  style={{ padding: '8px 16px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  ✅ Shortlist
                </button>
                <button 
                  onClick={() => handleStatusUpdate(app.id, 'INTERVIEW_SCHEDULED')}
                  style={{ padding: '8px 16px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  📞 Schedule Interview
                </button>
                <button 
                  onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                  style={{ padding: '8px 16px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '14px' }}
                >
                  ❌ Reject
                </button>
              </div>
              <span style={{ background: getStatusColor(app.applicationStatus), color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold' }}>
                {formatStatus(app.applicationStatus)}
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Job Seeker Applications List Component
function JobSeekerApplicationsList({ applications, fetchJobsAndApplications, getStatusColor, formatStatus }) {
  return (
    <div style={{ maxWidth: '1200px', margin: '30px auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h1>My Applications</h1>
          <p style={{ color: '#666', marginTop: '10px' }}>Track the status of your job applications ({applications.length} total)</p>
        </div>
        <button onClick={fetchJobsAndApplications} style={{ padding: '8px 16px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          🔄 Refresh
        </button>
      </div>

      {applications.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '50px', background: 'white', borderRadius: '8px' }}>
          <h2>No Applications Yet</h2>
          <p style={{ color: '#666', marginBottom: '20px' }}>You haven't applied to any jobs yet.</p>
          <Link to="/jobs" style={{ display: 'inline-block', padding: '10px 20px', background: '#667eea', color: 'white', textDecoration: 'none', borderRadius: '4px' }}>
            Browse Jobs
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {applications.map(app => (
            <div key={app.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', border: '1px solid #e0e0e0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h2 style={{ margin: '0 0 15px 0', fontSize: '22px', color: '#333' }}>
                    {app.jobTitle || 'Position Not Available'}
                  </h2>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '15px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '15px' }}>
                      <span>🏢</span>
                      <span style={{ fontWeight: '500' }}>Company:</span>
                      <span>{app.companyName || 'Not specified'}</span>
                    </div>
                    
                    {app.location && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '15px' }}>
                        <span>📍</span>
                        <span style={{ fontWeight: '500' }}>Location:</span>
                        <span>{app.location}</span>
                      </div>
                    )}
                    
                    {app.jobType && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '15px' }}>
                        <span>💼</span>
                        <span style={{ fontWeight: '500' }}>Type:</span>
                        <span>{app.jobType.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#555', fontSize: '15px' }}>
                      <span>📅</span>
                      <span style={{ fontWeight: '500' }}>Applied on:</span>
                      <span>{new Date(app.appliedDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                  
                  {app.coverLetter && (
                    <div style={{ marginTop: '15px', padding: '12px', background: '#f8f9fa', borderRadius: '4px', borderLeft: '3px solid #667eea' }}>
                      <p style={{ margin: 0, color: '#666', fontSize: '14px', fontStyle: 'italic' }}>
                        <strong>Cover Letter:</strong> "{app.coverLetter}"
                      </p>
                    </div>
                  )}
                </div>
                
                <span style={{ background: getStatusColor(app.applicationStatus), color: 'white', padding: '8px 16px', borderRadius: '20px', fontSize: '14px', fontWeight: 'bold', whiteSpace: 'nowrap', marginLeft: '20px' }}>
                  {formatStatus(app.applicationStatus)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Profile Modal Component
function ProfileModal({ application, profile, onClose }) {
  const hasProfile = profile && Object.keys(profile).length > 0;
  
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={onClose}>
      <div style={{ background: 'white', padding: '30px', borderRadius: '8px', maxWidth: '600px', width: '90%', maxHeight: '80vh', overflow: 'auto' }} onClick={(e) => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2 style={{ margin: 0 }}>Applicant Profile</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: '#666' }}>×</button>
        </div>
        {!hasProfile ? (
          <div style={{ padding: '20px', background: '#fff3cd', borderRadius: '8px', border: '1px solid #ffc107', textAlign: 'center' }}>
            <p style={{ margin: 0, color: '#856404', fontSize: '16px' }}>
              ⚠️ This applicant hasn't created their profile yet.
            </p>
            <p style={{ margin: '10px 0 0 0', color: '#856404', fontSize: '14px' }}>
              Only email is available: <strong>{application.applicantEmail}</strong>
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            <div><strong>Full Name:</strong> {profile.fullName || 'Not provided'}</div>
            <div><strong>Email:</strong> {application.applicantEmail}</div>
            <div><strong>Phone:</strong> {profile.phone || 'Not provided'}</div>
            <div><strong>Location:</strong> {profile.location || 'Not provided'}</div>
            <div><strong>Experience:</strong> {profile.experience || 'Not provided'}</div>
            <div><strong>Skills:</strong> {profile.skills || 'Not provided'}</div>
            <div><strong>Education:</strong> {profile.education || 'Not provided'}</div>
            {profile.aboutMe && <div><strong>About:</strong> {profile.aboutMe}</div>}
            {profile.linkedinUrl && <div><strong>LinkedIn:</strong> <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">{profile.linkedinUrl}</a></div>}
            {profile.githubUrl && <div><strong>GitHub:</strong> <a href={profile.githubUrl} target="_blank" rel="noopener noreferrer">{profile.githubUrl}</a></div>}
          </div>
        )}
      </div>
    </div>
  );
}
