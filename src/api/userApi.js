import axios from 'axios';
import API_BASE from '../config';

const API_URL = `${API_BASE}/api/company`;

export const signupUser = async (userData) => {
  try {
    console.log("Sending user data:", userData);
    
    const response = await axios.post(`${API_URL}/register`, userData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error("Error during user signup:", error.response?.data || error.message);
    throw error;
  }
};

export const createCompany = async (companyData) => {
  try {
    console.log("Sending company data:", companyData);
    
    const response = await axios.post(`${API_URL}/`, companyData, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    console.log("Company creation response:", response.data);
    return response.data;
  } catch (error) {
    console.error("Error creating company:", error.response?.data || error.message);
    throw error;
  }
};

const USER_API = `${API_BASE}/api/user`;

export const loginApi = async (payload) => {
  const res = await axios.post(`${USER_API}/login`, payload);
  return res.data;
};

export const setupTwoFactorApi = async () => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${USER_API}/2fa/setup`, {}, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const verifyTwoFactorApi = async (tokenCode) => {
  const token = localStorage.getItem('token');
  const res = await axios.post(`${USER_API}/2fa/verify`, { token: tokenCode }, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.data;
};

export const validateTwoFactorApi = async ({ userId, token }) => {
  const res = await axios.post(`${USER_API}/2fa/validate`, { userId, token });
  return res.data;
};