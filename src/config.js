const SERVER_BASE_URL = 'https://gatherly-87jr.onrender.com';

const API_BASE = process.env.NODE_ENV === 'development'
  ? 'http://localhost:4000'
  : SERVER_BASE_URL;

export default API_BASE;
