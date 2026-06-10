import api from './authApi';

export const hospitalApi = {
  getHospitals: async (lat, lng, query = '') => {
    const res = await api.get('/hospitals', { params: { lat, lng, query } });
    return res.data;
  },
  getHospitalById: async (id) => {
    const res = await api.get(`/hospitals/${id}`);
    return res.data;
  },
  updateResources: async (resources) => {
    const res = await api.put('/hospitals/resources', resources);
    return res.data;
  },
};

export default hospitalApi;
