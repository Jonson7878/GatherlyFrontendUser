import axios from 'axios';
import API_BASE from '../config';

const BASE_URL = `${API_BASE}/api/payment`;

const authHeaders = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const createPaymentOrder = async ({ orderId, amount, currency = 'INR', paymentMethod, prefill = {} }) => {
  const res = await axios.post(
    `${BASE_URL}/create-order`,
    { orderId, amount, currency, paymentMethod, prefill },
    { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
  );
  return res.data;
};

export const verifyPayment = async (payload) => {
  const res = await axios.post(
    `${BASE_URL}/verify`,
    payload,
    { headers: { 'Content-Type': 'application/json', ...authHeaders() } }
  );
  return res.data;
};