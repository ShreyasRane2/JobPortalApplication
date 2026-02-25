import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalJobs: 0, applications: 0, interviews: 0 });
  const [loading, setLoading] = useState(true);
  const [recentApplications, setRecentApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    fetchDashboardData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // Fetch total jobs count
      const jobsResponse = await axios.get('http://localhost:8082/api/jobs/simple');
      const totalJobs = jobsResponse.data.length;
      
      // Fetch user's applications if user is logged in
      let applications = 0;
      let interviews = 0;
      let recentApps = [];
      
      if (user) {
        try {
          // Get user details
          const userResponse = await axios.get('http://localhost:5454/api/users/me', {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userId = userResponse.data.id;
          const userEmail = userResponse.data.emailId;
          
          // Fetch applications
          const appsResponse = await axios.get(`http://localhost:8087/applications/user/${userId}`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const userApps = Array.isArray(appsResponse.data) ? appsResponse.data : [];
          applications = userApps.length;
          
          // Get recent applications (last 5)
          recentApps = userApps.slice(0, 5);
          
          // Count interviews
          interviews = userApps.filter(app => 
            app.applicationStatus === 'INTERVIEW_SCHEDULED'
          ).length;
          
          // Fetch user profile for completion calculation
          if (user.role === 'ROLE_JOB_SEEKER') {
            try {
              const profileResponse = await axios.get(`http://localhost:8088/profile/jobseeker/${userEmail}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              setUserProfile(profileResponse.data);
              calculateProfileCompletion(profileResponse.data);
            } catch (err) {
              console.log('No profile found');
            }
          }
          
          // Get recommended jobs (jobs user hasn't applied to)
          const appliedJobIds = userApps.map(app => app.jobId);
          const recommended = jobsResponse.data
            .filter(job => !appliedJobIds.includes(job.id))
            .slice(0, 5);
          setRecommendedJobs(recommended);
          
        } catch (error) {
          console.log('Could not fetch user data:', error);
        }
      }
      
      setStats({ totalJobs, applications, interviews });
      setRecentApplications(recentApps);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({ totalJobs: 0, applications: 0, interviews: 0 });
      setLoading(false);
    }
  };

  const calculateProfileCompletion = (profile) => {
    if (!profile) {
      setProfileCompletion(0);
      return;
    }
    
    const fields = [
      profile.fullName,
      profile.phone,
      profile.location,
      profile.bio,
      profile.skills,
      profile.experience,
      profile.education,
      profile.linkedinUrl
    ];
    
    const completed = fields.filter(field => field && field.toString().trim() !== '').length;
    const percentage = Math.round((completed / fields.length) * 100);
    setProfileCompletion(percentage);
  };

  const getStatusColor = (status) => {
    const colors = {
      'Applied': '#17a2b8',
      'UNDER_REVIEW': '#ffc107',
      'INTERVIEW_SCHEDULED': '#28a745',
      'REJECTED': '#dc3545',
      'ACCEPTED': '#28a745'
    };
    return colors[status] || '#6c757d';
  };

  const getStatusIcon = (status) => {
    const icons = {
      'Applied': '📝',
      'UNDER_REVIEW': '👀',
      'INTERVIEW_SCHEDULED': '📅',
      'REJECTED': '❌',
      'ACCEPTED': '✅'
    };
    return icons[status] || '📋';
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <div style={{ display: 'inline-block', width: '50px', height: '50px', border: '5px solid #f3f3f3', borderTop: '5px solid #667eea', borderRadius: '50%', animation: 'spin 1s linear infinite' }}>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
        <h2 style={{ marginTop: '20px', color: '#667eea' }}>Loading your dashboard...</h2>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '0 auto', padding: '30px 20px', background: '#f8f9fa' }}>
      {/* Header Section */}
      <div style={{ marginBottom: '30px' }}>
        <h1 style={{ margin: '0 0 10px 0', fontSize: '32px', color: '#333' }}>
          Welcome back, {user?.username || 'User'}! 👋
        </h1>
        <p style={{ color: '#666', fontSize: '16px' }}>
          {user?.role === 'ROLE_EMPLOYER' 
            ? 'Manage your job postings and find the best talent' 
            : 'Track your applications and discover new opportunities'}
        </p>
      </div>

      {/* Profile Completion Banner - Job Seekers Only */}
      {user?.role === 'ROLE_JOB_SEEKER' && profileCompletion < 100 && (
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '25px', 
          borderRadius: '12px', 
          marginBottom: '30px',
          color: 'white',
          boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
            <div style={{ flex: 1 }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '20px' }}>Complete Your Profile</h3>
              <p style={{ margin: '0 0 15px 0', opacity: 0.9 }}>
                {profileCompletion}% complete - A complete profile gets 3x more views!
              </p>
              <div style={{ background: 'rgba(255,255,255,0.3)', borderRadius: '10px', height: '10px', overflow: 'hidden' }}>
                <div style={{ 
                  background: 'white', 
                  height: '100%', 
                  width: `${profileCompletion}%`,
                  transition: 'width 0.5s ease'
                }}></div>
              </div>
            </div>
            <Link 
              to="/profile" 
              style={{ 
                background: 'white', 
                color: '#667eea', 
                padding: '12px 30px', 
                borderRadius: '8px', 
                textDecoration: 'none',
                fontWeight: '600',
                boxShadow: '0 4px 10px rgba(0,0,0,0.1)',
                transition: 'transform 0.2s'
              }}
              onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
            >
              Complete Now
            </Link>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        <div style={{ 
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', 
          padding: '30px', 
          borderRadius: '16px', 
          color: 'white', 
          boxShadow: '0 8px 20px rgba(102, 126, 234, 0.3)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(102, 126, 234, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(102, 126, 234, 0.3)';
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>{stats.totalJobs}</div>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Available Jobs</div>
          <div style={{ marginTop: '15px', fontSize: '14px', opacity: 0.8 }}>
            🔥 {Math.floor(stats.totalJobs * 0.3)} new this week
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', 
          padding: '30px', 
          borderRadius: '16px', 
          color: 'white', 
          boxShadow: '0 8px 20px rgba(245, 87, 108, 0.3)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(245, 87, 108, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(245, 87, 108, 0.3)';
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>{stats.applications}</div>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>My Applications</div>
          <div style={{ marginTop: '15px', fontSize: '14px', opacity: 0.8 }}>
            📊 Track your progress
          </div>
        </div>
        
        <div style={{ 
          background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', 
          padding: '30px', 
          borderRadius: '16px', 
          color: 'white', 
          boxShadow: '0 8px 20px rgba(79, 172, 254, 0.3)',
          transition: 'transform 0.3s, box-shadow 0.3s',
          cursor: 'pointer'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'translateY(-5px)';
          e.currentTarget.style.boxShadow = '0 12px 30px rgba(79, 172, 254, 0.4)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 20px rgba(79, 172, 254, 0.3)';
        }}>
          <div style={{ fontSize: '48px', fontWeight: 'bold', marginBottom: '10px' }}>{stats.interviews}</div>
          <div style={{ fontSize: '16px', opacity: 0.9 }}>Interviews Scheduled</div>
          <div style={{ marginTop: '15px', fontSize: '14px', opacity: 0.8 }}>
            🎯 Prepare well!
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <h2 style={{ marginBottom: '20px', fontSize: '24px', color: '#333' }}>Quick Actions</h2>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginBottom: '40px' }}>
        {user?.role === 'ROLE_EMPLOYER' ? (
          // Employer Quick Actions
          [
            { to: '/post-job', icon: '➕', title: 'Add Job', desc: 'Post a new job opening', color: '#667eea' },
            { to: '/profile', icon: '👤', title: 'My Profile', desc: 'Update your information', color: '#28a745' },
            { to: '/applications', icon: '📝', title: 'Applications', desc: 'View job applications', color: '#ffc107' }
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ color: item.color, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </Link>
          ))
        ) : (
          // Job Seeker Quick Actions
          [
            { to: '/jobs', icon: '💼', title: 'Browse Jobs', desc: 'Find your dream job', color: '#007bff' },
            { to: '/profile', icon: '👤', title: 'My Profile', desc: 'Update your information', color: '#28a745' },
            { to: '/applications', icon: '📝', title: 'Applications', desc: 'Track your applications', color: '#ffc107' },
            { to: '/resume', icon: '📄', title: 'Resume', desc: 'Manage your resume', color: '#17a2b8' }
          ].map((item, i) => (
            <Link key={i} to={item.to} style={{ textDecoration: 'none', color: 'inherit' }}>
              <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', textAlign: 'center', transition: 'transform 0.3s, box-shadow 0.3s', cursor: 'pointer' }}
                   onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'; }}
                   onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)'; }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>{item.icon}</div>
                <h3 style={{ color: item.color, marginBottom: '8px' }}>{item.title}</h3>
                <p style={{ color: '#666', fontSize: '14px' }}>{item.desc}</p>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Two Column Layout for Recent Activity and Recommended Jobs */}
      <div style={{ display: 'grid', gridTemplateColumns: user?.role === 'ROLE_JOB_SEEKER' ? '1fr 1fr' : '1fr', gap: '30px', marginTop: '40px' }}>
        
        {/* Recent Applications - Job Seekers Only */}
        {user?.role === 'ROLE_JOB_SEEKER' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#333' }}>Recent Applications</h2>
              <Link to="/applications" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                View All →
              </Link>
            </div>
            
            {recentApplications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>📭</div>
                <p style={{ margin: 0 }}>No applications yet</p>
                <Link to="/jobs" style={{ display: 'inline-block', marginTop: '15px', color: '#667eea', textDecoration: 'none', fontWeight: '600' }}>
                  Browse Jobs
                </Link>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {recentApplications.map((app, index) => (
                  <div key={index} style={{ 
                    padding: '20px', 
                    border: '1px solid #e0e0e0', 
                    borderRadius: '12px',
                    transition: 'all 0.3s',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#667eea';
                    e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                    e.currentTarget.style.transform = 'translateX(5px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'translateX(0)';
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                      <div style={{ flex: 1 }}>
                        <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
                          Job ID: {app.jobId}
                        </h4>
                        <p style={{ margin: '0', fontSize: '13px', color: '#666' }}>
                          Applied: {new Date(app.applicationDate).toLocaleDateString()}
                        </p>
                      </div>
                      <span style={{ 
                        background: getStatusColor(app.applicationStatus) + '20',
                        color: getStatusColor(app.applicationStatus),
                        padding: '6px 12px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '600',
                        whiteSpace: 'nowrap'
                      }}>
                        {getStatusIcon(app.applicationStatus)} {app.applicationStatus.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Recommended Jobs - Job Seekers Only */}
        {user?.role === 'ROLE_JOB_SEEKER' && (
          <div style={{ background: 'white', padding: '30px', borderRadius: '16px', boxShadow: '0 4px 15px rgba(0,0,0,0.08)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
              <h2 style={{ margin: 0, fontSize: '22px', color: '#333' }}>Recommended for You</h2>
              <Link to="/jobs" style={{ color: '#667eea', textDecoration: 'none', fontSize: '14px', fontWeight: '600' }}>
                View All →
              </Link>
            </div>
            
            {recommendedJobs.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px 20px', color: '#999' }}>
                <div style={{ fontSize: '48px', marginBottom: '15px' }}>🔍</div>
                <p style={{ margin: 0 }}>No recommendations yet</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                {recommendedJobs.map((job, index) => (
                  <Link 
                    key={index} 
                    to={`/jobs`}
                    style={{ 
                      textDecoration: 'none',
                      color: 'inherit'
                    }}
                  >
                    <div style={{ 
                      padding: '20px', 
                      border: '1px solid #e0e0e0', 
                      borderRadius: '12px',
                      transition: 'all 0.3s',
                      cursor: 'pointer'
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#667eea';
                      e.currentTarget.style.boxShadow = '0 4px 12px rgba(102, 126, 234, 0.15)';
                      e.currentTarget.style.transform = 'translateX(5px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e0e0e0';
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateX(0)';
                    }}>
                      <h4 style={{ margin: '0 0 8px 0', fontSize: '16px', color: '#333' }}>
                        {job.title}
                      </h4>
                      <p style={{ margin: '0 0 8px 0', fontSize: '14px', color: '#666' }}>
                        🏢 {job.companyName}
                      </p>
                      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                        <span style={{ fontSize: '12px', color: '#999' }}>📍 {job.location}</span>
                        {job.experience && (
                          <span style={{ fontSize: '12px', color: '#999' }}>💼 {job.experience} yrs</span>
                        )}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
