import api from './authApi';

export const ambulanceApi = {
  getAmbulances: async () => {
    const res = await api.get('/ambulances');
    return res.data;
  },
  addAmbulance: async (ambulanceData) => {
    const res = await api.post('/ambulances', ambulanceData);
    return res.data;
  },
  updateAmbulanceStatus: async (ambId, status) => {
    const res = await api.put(`/ambulances/${ambId}/status`, { status });
    return res.data;
  },
  updateAmbulanceLocation: async (ambId, latitude, longitude) => {
    const res = await api.put(`/ambulances/${ambId}/location`, { latitude, longitude });
    return res.data;
  }
};

export default ambulanceApi;
