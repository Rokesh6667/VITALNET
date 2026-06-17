import React, { createContext, useContext, useState, useEffect } from 'react';
import api, { authApi } from '../services/authApi';
import { hospitalApi } from '../services/hospitalApi';
import { bookingApi } from '../services/bookingApi';
import { ambulanceApi } from '../services/ambulanceApi';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vn_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('vn_token') || null;
  });

  const [dbHospitals, setDbHospitals] = useState([]);
  const [dbAmbulances, setDbAmbulances] = useState([]);
  const [dbBookings, setDbBookings] = useState([]);
  const [dbPatients, setDbPatients] = useState([]);

  const fetchAllData = async () => {
    if (!localStorage.getItem('vn_token') && !token) return;

    try {
      // 1. Fetch hospitals
      let hospitalsList = [];
      if (user?.role === 'admin') {
        const res = await api.get('/admin/hospitals');
        hospitalsList = res.data;
      } else {
        hospitalsList = await hospitalApi.getHospitals();
      }
      const mappedHospitals = hospitalsList.map(h => ({
        id: h._id,
        name: h.hospitalName || h.name,
        email: h.email,
        role: 'hospital',
        phone: h.phone || h.phoneNumber,
        address: h.address,
        latitude: h.latitude,
        longitude: h.longitude,
        resources: {
          beds: h.resources?.availableBeds ?? 0,
          icuBeds: h.resources?.availableICUBeds ?? 0,
          ventilators: h.resources?.availableVentilators ?? 0
        },
        district: h.city,
        approvalStatus: h.approvalStatus
      }));
      setDbHospitals(mappedHospitals);
    } catch (err) {
      console.error('Error fetching hospitals:', err);
    }

    try {
      // 2. Fetch ambulances
      const ambulancesList = await ambulanceApi.getAmbulances();
      const mappedAmbulances = ambulancesList.map(a => ({
        id: a._id,
        vehicleNo: a.vehicleNumber || a.vehicleNo,
        driverName: a.driverName,
        phone: a.driverPhone || a.phone,
        status: a.status,
        latitude: a.currentLatitude || a.latitude,
        longitude: a.currentLongitude || a.longitude,
        hospitalId: a.hospitalId?._id || a.hospitalId
      }));
      setDbAmbulances(mappedAmbulances);
    } catch (err) {
      console.error('Error fetching ambulances:', err);
    }

    try {
      // 3. Fetch bookings
      let bookingsList = [];
      if (user?.role === 'admin') {
        const res = await api.get('/admin/bookings');
        bookingsList = res.data;
      } else {
        bookingsList = await bookingApi.getBookings();
      }
      const mappedBookings = bookingsList.map(b => ({
        id: b._id,
        patientId: b.patientId?._id || b.patientId,
        patientName: b.patientId?.name || 'Patient',
        hospitalId: b.hospitalId?._id || b.hospitalId,
        hospitalName: b.hospitalId?.hospitalName || 'Hospital',
        type: b.bookingType === 'ambulance' ? 'Ambulance' : (b.bookingType === 'bed' ? 'Bed' : (b.bookingType === 'ICU' ? 'ICU' : (b.bookingType === 'ventilator' ? 'Ventilator' : (b.bookingType || b.type)))),
        status: b.bookingStatus || b.status,
        symptoms: b.patientCondition || b.symptoms,
        createdAt: new Date(b.createdAt).toLocaleString(),
        ambulanceId: b.ambulanceId
      }));
      setDbBookings(mappedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
    }

    if (user?.role === 'admin') {
      try {
        const res = await api.get('/admin/users');
        const mappedPatients = res.data.filter(u => u.role === 'patient').map(p => ({
          id: p._id,
          name: p.name,
          email: p.email,
          role: 'patient',
          phone: p.phoneNumber || p.phone,
          address: p.address || 'N/A'
        }));
        setDbPatients(mappedPatients);
      } catch (err) {
        console.error('Error fetching patients:', err);
      }
    }
  };

  useEffect(() => {
    if (token) {
      fetchAllData();
    }
  }, [token, user?.role]);

  const login = async (email, password, role) => {
    const res = await authApi.login(email, password, role);
    const profile = {
      id: res.role === 'hospital' ? res.hospitalProfile?._id : res._id,
      userId: res._id,
      name: res.name,
      email: res.email,
      role: res.role,
      token: res.token,
      phone: res.phoneNumber || res.phone,
      address: res.role === 'hospital' ? res.hospitalProfile?.address : res.address || '',
      resources: res.hospitalProfile ? {
        beds: res.hospitalProfile.resources?.availableBeds ?? 0,
        icuBeds: res.hospitalProfile.resources?.availableICUBeds ?? 0,
        ventilators: res.hospitalProfile.resources?.availableVentilators ?? 0
      } : null
    };
    setUser(profile);
    setToken(res.token);
    localStorage.setItem('vn_user', JSON.stringify(profile));
    localStorage.setItem('vn_token', res.token);
    return profile;
  };

  const register = async (userData) => {
    const { name, email, password, role, phone, address, beds, icuBeds, ventilators, district } = userData;
    let newUser;
    if (role === 'hospital') {
      newUser = await authApi.registerHospital({
        hospitalName: name,
        email,
        password,
        phone,
        address,
        city: district || 'Chennai',
        latitude: 37.7749 + (Math.random() - 0.5) * 0.05,
        longitude: -122.4194 + (Math.random() - 0.5) * 0.05,
        emergencyAvailable: true,
        beds: parseInt(beds) || 0,
        icuBeds: parseInt(icuBeds) || 0,
        ventilators: parseInt(ventilators) || 0
      });
    } else {
      newUser = await authApi.registerPatient({
        name,
        email,
        password,
        phoneNumber: phone,
        address
      });
    }
    
    const profile = {
      id: newUser.role === 'hospital' ? newUser.hospitalProfile?._id : newUser._id,
      userId: newUser._id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      token: newUser.token,
      phone: newUser.phoneNumber || newUser.phone,
      address: newUser.address || ''
    };
    setUser(profile);
    setToken(newUser.token);
    localStorage.setItem('vn_user', JSON.stringify(profile));
    localStorage.setItem('vn_token', newUser.token);
    return profile;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vn_user');
    localStorage.removeItem('vn_token');
  };

  const updateHospitalResources = async (hospitalId, resources) => {
    const backendResources = {
      totalBeds: resources.beds,
      availableBeds: resources.beds,
      totalICUBeds: resources.icuBeds,
      availableICUBeds: resources.icuBeds,
      totalVentilators: resources.ventilators,
      availableVentilators: resources.ventilators,
    };
    await hospitalApi.updateResources(backendResources);
    
    // Sync local user resources state if they are the logged in hospital
    if (user && user.id === hospitalId) {
      const updatedUser = { ...user, resources };
      setUser(updatedUser);
      localStorage.setItem('vn_user', JSON.stringify(updatedUser));
    }
    fetchAllData();
  };

  const createBooking = async (bookingData) => {
    if (bookingData.type === 'Ambulance') {
      const response = await ambulanceApi.requestAmbulance({
        hospitalId: bookingData.hospitalId || undefined,
        latitude: 37.7749,
        longitude: -122.4194,
        patientCondition: bookingData.symptoms || 'Emergency Transport'
      });
      fetchAllData();
      return response.ambulance;
    } else {
      let bookingType = 'bed';
      if (bookingData.type === 'ICU') bookingType = 'ICU';
      if (bookingData.type === 'Ventilator') bookingType = 'ventilator';
      
      const response = await bookingApi.createBooking({
        hospitalId: bookingData.hospitalId,
        bookingType,
        patientCondition: bookingData.symptoms || 'None specified'
      });
      fetchAllData();
      return response;
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    await bookingApi.updateBookingStatus(bookingId, status);
    fetchAllData();
  };

  const addAmbulance = async (ambulanceData) => {
    const response = await ambulanceApi.addAmbulance({
      vehicleNumber: ambulanceData.vehicleNo,
      driverName: ambulanceData.driverName,
      driverPhone: ambulanceData.phone
    });
    fetchAllData();
    return response;
  };

  const updateAmbulanceStatus = async (ambId, status) => {
    await ambulanceApi.updateAmbulanceStatus(ambId, status);
    fetchAllData();
  };

  const deleteHospital = async (id) => {
    await api.delete(`/admin/hospitals/${id}`);
    fetchAllData();
  };

  const deletePatient = async (id) => {
    await api.delete(`/admin/users/${id}`);
    fetchAllData();
  };

  const deleteAmbulanceAdmin = async (id) => {
    await api.delete(`/admin/ambulances/${id}`);
    fetchAllData();
  };

  const deleteBooking = async (id) => {
    await bookingApi.deleteBooking(id);
    fetchAllData();
  };

  const approveHospital = async (id) => {
    await api.put(`/admin/approve-hospital/${id}`, { status: 'approved' });
    fetchAllData();
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      login,
      register,
      logout,
      dbHospitals,
      dbAmbulances,
      dbBookings,
      dbPatients,
      setDbBookings,
      setDbHospitals,
      setDbAmbulances,
      setDbPatients,
      updateHospitalResources,
      createBooking,
      updateBookingStatus,
      addAmbulance,
      updateAmbulanceStatus,
      deleteHospital,
      deletePatient,
      deleteAmbulanceAdmin,
      deleteBooking,
      approveHospital
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
