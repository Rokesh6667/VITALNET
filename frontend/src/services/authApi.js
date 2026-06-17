import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5005/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vn_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authApi = {
  login: async (email, password, role) => {
    const res = await api.post('/auth/login', { email, password, role });
    return res.data;
  },
  registerPatient: async (userData) => {
    const res = await api.post('/auth/register-patient', userData);
    return res.data;
  },
  registerHospital: async (userData) => {
    const res = await api.post('/auth/register-hospital', userData);
    return res.data;
  },
  getProfile: async () => {
    const res = await api.get('/auth/profile');
    return res.data;
  },
};

export default api;
