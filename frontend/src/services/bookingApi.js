import api from './authApi';

export const bookingApi = {
  createBooking: async (bookingData) => {
    const res = await api.post('/bookings', bookingData);
    return res.data;
  },
  getBookings: async () => {
    const res = await api.get('/bookings');
    return res.data;
  },
  updateBookingStatus: async (bookingId, status) => {
    const res = await api.put(`/bookings/${bookingId}/status`, { status });
    return res.data;
  },
  deleteBooking: async (bookingId) => {
    const res = await api.delete(`/bookings/${bookingId}`);
    return res.data;
  },
  triggerSOS: async (location) => {
    const res = await api.post('/bookings/sos', { location });
    return res.data;
  }
};

export default bookingApi;
