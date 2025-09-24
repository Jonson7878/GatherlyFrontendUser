import React, { useState } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../../App.css'

function CustomTabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs({ formData, setFormData, errors }) {
  const [value, setValue] = useState(0);
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const navigate = useNavigate();

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleCompanyFormSubmit = async (e) => {
    e.preventDefault();

    const companyData = {
      name: formData.companyName,
      type: formData.companyType,
      description: formData.companyDescription,
    };

    try {
      const response = await axios.post('http://localhost:4000/api/company/', companyData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setAlert({ message: 'Company created successfully!', severity: 'success' });

      const companyId = response.data.company._id;

      setFormData({
        ...formData,
        companyId: companyId,
      });

      setValue(1);
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Error creating company', severity: 'error' });
      console.error('Error creating company:', error.response ? error.response.data : error);
    }
  };

  const handleUserFormSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      username: formData.username,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      companyId: formData.companyId,
      role: "admin",
    };

    try {
      const response = await axios.post('http://localhost:4000/api/company/register', userData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setAlert({ message: 'User registered successfully!', severity: 'success' });
      console.log('User created successfully:', response.data);
      navigate('/login');
    } catch (error) {
      setAlert({ message: error.response?.data?.message || 'Error registering user', severity: 'error' });
      console.error('Error creating user:', error.response ? error.response.data : error);
    }
  };

  return (
    <Box sx={{ width: '100%' }}>
      {/* Alert Message */}
      {alert.message && (
        <Stack sx={{ width: '100%', mb: 2 }}>
          <Alert severity={alert.severity} sx={{ fontWeight: 'bold' }}>
            {alert.message}
          </Alert>
        </Stack>
      )}

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
          <Tab label="Company Information" {...a11yProps(0)} />
          <Tab label="User Information" {...a11yProps(1)} />
        </Tabs>
      </Box>

      {/* First Tab: Company Info */}
      <CustomTabPanel value={value} index={0}>
        <form onSubmit={handleCompanyFormSubmit}>
          <label>Company Name</label>
          <input
            type="text"
            name="companyName"
            value={formData.companyName}
            onChange={handleFormChange}
            className={errors.companyName ? 'error-input' : ''}
          />
          {errors.companyName && <span className="error-text">{errors.companyName}</span>}

          <label>Company Type</label>
          <input
            type="text"
            name="companyType"
            value={formData.companyType}
            onChange={handleFormChange}
            className={errors.companyType ? 'error-input' : ''}
          />
          {errors.companyType && <span className="error-text">{errors.companyType}</span>}

          <label>Company Description</label>
          <textarea
            name="companyDescription"
            value={formData.companyDescription}
            onChange={handleFormChange}
            className={errors.companyDescription ? 'error-input' : ''}
          />
          {errors.companyDescription && <span className="error-text">{errors.companyDescription}</span>}

          <button type="submit">Create Company</button>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </form>
      </CustomTabPanel>

      {/* Second Tab: User Info */}
      <CustomTabPanel value={value} index={1}>
        <form onSubmit={handleUserFormSubmit}>
          <label>Full Name</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleFormChange}
            className={errors.username ? 'error-input' : ''}
          />
          {errors.username && <span className="error-text">{errors.username}</span>}

          <label>Email address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleFormChange}
            className={errors.email ? 'error-input' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleFormChange}
            className={errors.password ? 'error-input' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleFormChange}
            className={errors.confirmPassword ? 'error-input' : ''}
          />
          {errors.confirmPassword && <span className="error-text">{errors.confirmPassword}</span>}

          <button type="submit">Sign Up</button>
          <p>Already have an account? <Link to="/login">Login</Link></p>
        </form>
      </CustomTabPanel>
    </Box>
  );
}
