import React, { useState } from 'react';
import { companyAPI } from '../services/api';

const CompanyProfile = () => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    location: '',
    website: '',
    size: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await companyAPI.createCompany(formData);
      setMessage('Company profile created successfully!');
      setFormData({
        name: '',
        description: '',
        industry: '',
        location: '',
        website: '',
        size: ''
      });
    } catch (error) {
      setMessage('Error creating company: ' + (error.response?.data || error.message));
    }
    setLoading(false);
  };

  return (
    <div className="container">
      <h1 className="page-title">Company Profile</h1>

      <div className="card">
        <h3>Create Company Profile</h3>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </div>

          <div className="form-group">
            <label>Company Size</label>
            <select name="size" value={formData.size} onChange={handleChange}>
              <option value="">Select size</option>
              <option value="1-10">1-10 employees</option>
              <option value="11-50">11-50 employees</option>
              <option value="51-200">51-200 employees</option>
              <option value="201-500">201-500 employees</option>
              <option value="500+">500+ employees</option>
            </select>
          </div>

          {message && (
            <div className={message.includes('Error') ? 'error-message' : 'success-message'}>
              {message}
            </div>
          )}

          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Creating...' : 'Create Company Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CompanyProfile;
