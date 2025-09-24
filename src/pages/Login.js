import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useUser } from '../components/UserContext';
import CommonSidebar from '../components/CommonSidebar';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import '../App.css';

const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [isLoginHover, setIsLoginHover] = useState(false);
  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState('');
  const [alert, setAlert] = useState({ message: '', severity: '' });
  const navigate = useNavigate();
  const { setUser } = useUser();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
    setBackendError('');
    setAlert({ message: '', severity: '' });
  };

  const validate = () => {
    const newErrors = {};
    if (!form.email) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Invalid email format';
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#!%^])[A-Za-z\d@#!%^]{8,16}$/;
    if (!form.password.trim()) {
      newErrors.password = 'Password is required';
    } else if (!passwordRegex.test(form.password)) {
      newErrors.password =
        'Password must be 8-16 characters, include at least one uppercase letter, one lowercase letter, one number, and one special character (@, #, !, %, ^).';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    try {
      const response = await axios.post('http://localhost:4000/api/user/login', form);

      if (response?.data?.status === 'awaiting_2fa') {
        setAlert({ message: 'Enter your authentication code', severity: 'info' });
        navigate('/authenticator', { state: { mode: 'validate', userId: response.data.userId } });
        return;
      }

      const { token, user } = response.data;

      localStorage.setItem('token', token);
      setUser(user);

      if (!user?.twoFactorEnabled) {
        setAlert({ message: 'Set up two-factor authentication', severity: 'info' });
        navigate('/authenticator', { state: { mode: 'setup' } });
        return;
      }

      setAlert({ message: 'Enter your authentication code', severity: 'info' });
      navigate('/authenticator', { state: { mode: 'validate', userId: user?._id || user?.id } });
      return;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please try again.';
      setBackendError(errorMessage);
      setAlert({ message: errorMessage, severity: 'error' });
    }
  };

  return (
    <div className="container">
      <CommonSidebar title="Hi, Welcome back" subtitle="More effectively with optimized workflows." />

      <div className="form-container">
        <h2>Login to your account</h2>

        {alert.message && (
          <Stack sx={{ width: '100%', mb: 2, fontWeight: 'bold' }}>
            <Alert
              severity={alert.severity}
              sx={{
                fontWeight: 'bold',
                color: (theme) => {
                  switch (alert.severity) {
                    case 'error':
                      return theme.palette.error.main;
                    case 'success':
                      return theme.palette.success.main;
                    case 'warning':
                      return theme.palette.warning.main;
                    case 'info':
                      return theme.palette.info.main;
                    default:
                      return theme.palette.text.primary;
                  }
                },
              }}
            >
              {alert.message}
            </Alert>
          </Stack>
        )}

        <form onSubmit={handleSubmit}>
          {backendError && !alert.message && <div className="backend-error">{backendError}</div>}

          <label>Email address</label>
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            className={errors.email ? 'error-input' : ''}
          />
          {errors.email && <span className="error-text">{errors.email}</span>}

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={form.password}
            onChange={handleChange}
            className={errors.password ? 'error-input' : ''}
          />
          {errors.password && <span className="error-text">{errors.password}</span>}

          <p>
            Reset and get back in instantly. <Link to="/resetlink">Forget Password.</Link>
          </p>
          <button
            type="submit"
            style={{
              backgroundColor: isLoginHover ? '#5e35b1' : 'transparent',
              border: '2px solid #5e35b1',
              color: isLoginHover ? '#ffffff' : '#5e35b1',
              marginTop: 10,
              padding: '8px 20px',
              borderRadius: 8,
              fontSize: 16,
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s, transform 0.2s',
              // transform: isLoginHover ? 'scale(1.05)' : 'none'
            }}
            onMouseEnter={() => setIsLoginHover(true)}
            onMouseLeave={() => setIsLoginHover(false)}
          >
            Log in
          </button>
        </form>
        <p>
          Don't have an account? <Link to="/signup">Get started</Link>
        </p>
      </div>
    </div>
  );
};

export default Login;