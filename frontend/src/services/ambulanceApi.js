import api from './authApi';

export const ambulanceApi = {
  getAmbulances: async () => {
    const res = await api.get('/ambulance');
    return res.data;
  },
  addAmbulance: async (ambulanceData) => {
    const res = await api.post('/ambulance', ambulanceData);
    return res.data;
  },
  requestAmbulance: async (requestData) => {
    const res = await api.post('/ambulance/request', requestData);
    return res.data;
  },
  updateAmbulanceStatus: async (ambId, status) => {
    const res = await api.put(`/ambulance/${ambId}/status`, { status });
    return res.data;
  },
  updateAmbulanceLocation: async (ambId, latitude, longitude) => {
    const res = await api.put(`/ambulance/${ambId}/location`, { latitude, longitude });
    return res.data;
  }
};

export default ambulanceApi;
