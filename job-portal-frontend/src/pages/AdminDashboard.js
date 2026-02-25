import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AdminDashboard() {
  const [stats, setStats] = useState({ totalUsers: 0, totalJobs: 0, activeJobs: 0 });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const headers = { 'Authorization': `Bearer ${token}` };

      // Load stats
      const statsRes = await axios.get('http://localhost:8085/api/admin/dashboard/stats', { headers });
      setStats(statsRes.data);

      // Load users
      const usersRes = await axios.get('http://localhost:8085/api/admin/users', { headers });
      setUsers(usersRes.data);

      // Load jobs
      const jobsRes = await axios.get('http://localhost:8085/api/admin/jobs', { headers });
      setJobs(jobsRes.data);

      setLoading(false);
    } catch (error) {
      console.error('Error loading admin data:', error);
      setError('Failed to load admin data. Make sure Admin Service is running on port 8085.');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8085/api/admin/users/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('User deleted successfully');
      loadDashboardData();
    } catch (error) {
      alert('Failed to delete user: ' + (error.response?.data || error.message));
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (!window.confirm('Are you sure you want to delete this job?')) return;
    
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:8085/api/admin/jobs/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      alert('Job deleted successfully');
      loadDashboardData();
    } catch (error) {
      alert('Failed to delete job: ' + (error.response?.data || error.message));
    }
  };

  const loadApplicationsForUser = async (userId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:8085/api/admin/applications/user/${userId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setApplications(res.data);
      setActiveTab('applications');
    } catch (error) {
      alert('Failed to load applications: ' + (error.response?.data || error.message));
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <h2>Loading Admin Dashboard...</h2>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', color: 'red' }}>
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={loadDashboardData} style={{ padding: '10px 20px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginTop: '20px' }}>
          Retry
        </button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '1400px', margin: '30px auto', padding: '20px' }}>
      <h1 style={{ marginBottom: '30px' }}>Admin Dashboard</h1>

      {/* Tab Navigation */}
      <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '2px solid #ddd' }}>
        <button 
          onClick={() => setActiveTab('dashboard')}
          style={{ 
            padding: '10px 20px', 
            background: activeTab === 'dashboard' ? '#667eea' : 'transparent', 
            color: activeTab === 'dashboard' ? 'white' : '#333',
            border: 'none', 
            borderBottom: activeTab === 'dashboard' ? '3px solid #667eea' : 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          📊 Dashboard
        </button>
        <button 
          onClick={() => setActiveTab('users')}
          style={{ 
            padding: '10px 20px', 
            background: activeTab === 'users' ? '#667eea' : 'transparent', 
            color: activeTab === 'users' ? 'white' : '#333',
            border: 'none', 
            borderBottom: activeTab === 'users' ? '3px solid #667eea' : 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          👥 Users ({users.length})
        </button>
        <button 
          onClick={() => setActiveTab('jobs')}
          style={{ 
            padding: '10px 20px', 
            background: activeTab === 'jobs' ? '#667eea' : 'transparent', 
            color: activeTab === 'jobs' ? 'white' : '#333',
            border: 'none', 
            borderBottom: activeTab === 'jobs' ? '3px solid #667eea' : 'none',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          💼 Jobs ({jobs.length})
        </button>
        <button 
          onClick={loadDashboardData}
          style={{ 
            padding: '10px 20px', 
            background: '#28a745', 
            color: 'white',
            border: 'none', 
            borderRadius: '4px',
            cursor: 'pointer',
            marginLeft: 'auto'
          }}
        >
          🔄 Refresh
        </button>
      </div>

      {/* Dashboard Tab */}
      {activeTab === 'dashboard' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Platform Statistics</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginBottom: '30px' }}>
            <div style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', padding: '30px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.totalUsers}</div>
              <div style={{ fontSize: '18px', marginTop: '10px' }}>Total Users</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', padding: '30px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.totalJobs}</div>
              <div style={{ fontSize: '18px', marginTop: '10px' }}>Total Jobs</div>
            </div>
            <div style={{ background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', padding: '30px', borderRadius: '8px', color: 'white', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
              <div style={{ fontSize: '48px', fontWeight: 'bold' }}>{stats.activeJobs}</div>
              <div style={{ fontSize: '18px', marginTop: '10px' }}>Active Jobs</div>
            </div>
          </div>

          <div style={{ background: 'white', padding: '30px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
            <h3 style={{ marginBottom: '20px' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '15px' }}>
              <button onClick={() => setActiveTab('users')} style={{ padding: '15px', background: '#667eea', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                Manage Users
              </button>
              <button onClick={() => setActiveTab('jobs')} style={{ padding: '15px', background: '#f5576c', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                Manage Jobs
              </button>
              <button onClick={loadDashboardData} style={{ padding: '15px', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '16px' }}>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab === 'users' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>User Management</h2>
          <div style={{ background: 'white', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)', overflow: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8f9fa', borderBottom: '2px solid #dee2e6' }}>
                  <th style={{ padding: '15px', textAlign: 'left' }}>ID</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Name</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Email</th>
                  <th style={{ padding: '15px', textAlign: 'left' }}>Role</th>
                  <th style={{ padding: '15px', textAlign: 'center' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} style={{ borderBottom: '1px solid #dee2e6' }}>
                    <td style={{ padding: '15px' }}>{user.id}</td>
                    <td style={{ padding: '15px' }}>{user.fullName}</td>
                    <td style={{ padding: '15px' }}>{user.emailId}</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ 
                        background: user.role === 'ROLE_EMPLOYER' ? '#ffc107' : user.role === 'ROLE_ADMIN' ? '#dc3545' : '#17a2b8', 
                        color: 'white', 
                        padding: '5px 10px', 
                        borderRadius: '15px', 
                        fontSize: '12px' 
                      }}>
                        {user.role?.replace('ROLE_', '')}
                      </span>
                    </td>
                    <td style={{ padding: '15px', textAlign: 'center' }}>
                      <button 
                        onClick={() => loadApplicationsForUser(user.id)}
                        style={{ padding: '5px 10px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginRight: '5px' }}
                      >
                        View Apps
                      </button>
                      <button 
                        onClick={() => handleDeleteUser(user.id)}
                        style={{ padding: '5px 10px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Jobs Tab */}
      {activeTab === 'jobs' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>Job Management</h2>
          <div style={{ display: 'grid', gap: '20px' }}>
            {jobs.map((job) => (
              <div key={job.id} style={{ background: 'white', padding: '25px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: '0 0 10px 0' }}>{job.title}</h3>
                    <p style={{ color: '#666', margin: '5px 0' }}>🏢 {job.companyName || 'Company'}</p>
                    <p style={{ color: '#666', margin: '5px 0' }}>📍 {job.location || 'Location not specified'}</p>
                    <p style={{ color: '#666', margin: '5px 0' }}>💼 {job.jobType || 'Full-time'}</p>
                    <p style={{ color: '#666', margin: '10px 0' }}>{job.description?.substring(0, 150)}...</p>
                    <div style={{ marginTop: '10px' }}>
                      <span style={{ 
                        background: job.status === 'OPEN' ? '#28a745' : '#6c757d', 
                        color: 'white', 
                        padding: '5px 12px', 
                        borderRadius: '15px', 
                        fontSize: '12px' 
                      }}>
                        {job.status || 'OPEN'}
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <button 
                      onClick={() => handleDeleteJob(job.id)}
                      style={{ padding: '10px 20px', background: '#dc3545', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                    >
                      Delete Job
                    </button>
                  </div>
                </div>
              </div>
            ))} 
          </div>
        </div>
      )}

      {/* Applications Tab */}
      {activeTab === 'applications' && (
        <div>
          <h2 style={{ marginBottom: '20px' }}>User Applications</h2>
          <button 
            onClick={() => setActiveTab('users')}
            style={{ padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', marginBottom: '20px' }}
          >
            ← Back to Users
          </button>
          {applications.length === 0 ? (
            <div style={{ background: 'white', padding: '30px', borderRadius: '8px', textAlign: 'center' }}>
              <p>No applications found for this user.</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {applications.map((app) => (
                <div key={app.id} style={{ background: 'white', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <p><strong>Job ID:</strong> {app.jobId}</p>
                  <p><strong>Status:</strong> <span style={{ color: '#28a745' }}>{app.applicationStatus}</span></p>
                  <p><strong>Applied:</strong> {new Date(app.appliedDate).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AdminDashboard;
