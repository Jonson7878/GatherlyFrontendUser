import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signupUser, createCompany } from '../api/userApi';
import CommonSidebar from '../components/CommonSidebar';
import BasicTabs from '../components/BasicTabs/BasicTabs';

const Signup = () => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: '',
    companyName: '',
    companyType: '',
    companyDescription: '',
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const navigate = useNavigate();

  const validate = () => {
    const newErrors = {};

    if (!formData.username.trim()) newErrors.username = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) newErrors.email = 'Invalid email format';
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%^])[A-Za-z\d@#!%^]{8,16}$/;
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(formData.password)) {
      newErrors.password =
        'Password must be 8-16 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, !, %, ^).';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirm Password is required';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    if (!formData.companyName.trim()) newErrors.companyName = 'Company Name is required';
    if (!formData.companyType.trim()) newErrors.companyType = 'Company Type is required';
    if (!formData.companyDescription.trim()) newErrors.companyDescription = 'Company Description is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const signupData = {
        username: formData.username,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      };
      await signupUser(signupData);
      alert('Signup successful!');
      navigate('/login');
    } catch (error) {
      setApiError('An error occurred during signup. Please try again.');
    }
  };

  const handleCompanySignup = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const companyData = {
        companyName: formData.companyName,
        companyType: formData.companyType,
        companyDescription: formData.companyDescription,
      };
      await createCompany(companyData);
      alert('Company created successfully!');
      navigate('/login');
    } catch (error) {
      setApiError('An error occurred while creating the company. Please try again.');
    }
  };

  return (
    <div className="container">
      <CommonSidebar title="Hi, Welcome to our platform" subtitle="Create your account to get started." />
      <div className="form-container">
        <h2>Create an account</h2>

        {apiError && <div className="error-text">{apiError}</div>}

        <BasicTabs
          formData={formData}
          setFormData={setFormData}
          handleSignupSubmit={handleSignupSubmit}
          handleCompanySignup={handleCompanySignup}
          errors={errors}
        />
      </div>
    </div>
  );
};

export default Signup;