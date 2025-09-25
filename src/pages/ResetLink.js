import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_BASE from '../config';
import ForgotPasswordSidebar from '../components/ForgotPasswordSidebar';
import '../App.css';
import { Alert, Stack } from '@mui/material';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [alert,setAlert] = useState({message:'', severity:''})
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (!email) {
      setError('Email is required');
      setAlert({message:"Email is required", severity:"error"})
      return;
    }

    if (!validateEmail(email)) {
      setError('Invalid email format');
      setAlert({message:"Invaild email format", severity:"error"})
      return;
    }

    setLoading(true);
    try {
  const response = await axios.post(`${API_BASE}/api/user/resetlink`, { email });
      setAlert({message:response.data.message || 'Reset link sent successfully', severity:"success"})
      setTimeout(()=>
        setAlert({message:'',severity:''}),4000)
      // setMessage(response.data.message || 'Reset link sent successfully!');
      setEmail('');
    } catch (err) {
      const msg = err.response?.data?.message || 'Something went wrong. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
        <ForgotPasswordSidebar />

      <div className="form-container">
        <h2>Reset Your Password</h2>
        <p>Enter your email to receive a reset link.</p>

        {alert.message &&(
          <Stack sx={{width:'100%', mb: 2}}>
            <Alert severity={alert.severity} sx={{fontWeight:'bold'}}>
              {alert.message}
            </Alert>
          </Stack>
        )}
        <form onSubmit={handleSubmit}>
          {error && <div className="backend-error">{error}</div>}
          {message && <div className="success-message">{message}</div>}

          <label>Email address</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={error ? 'error-input' : ''}
            placeholder="Enter your email"
          />

          <button type="submit" disabled={loading}>
            {loading ? 'Sending...' : 'Send Reset Link'}
          </button>
        </form>

        <p className="auth-footer">
          Remember your password now? <Link to="/login">Back to Login</Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
