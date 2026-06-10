import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

// Mock initial data if localStorage is empty
const defaultPatients = [
  { id: 'u1', name: 'John Doe', email: 'patient@vitalnet.com', role: 'patient', phone: '+1 555-0199', address: '742 Evergreen Terrace', password: 'password123' }
];

const defaultHospitals = [
  {
    id: 'h1',
    name: 'City General Hospital',
    email: 'hospital@vitalnet.com',
    role: 'hospital',
    phone: '+1 555-0120',
    address: '120 Medical Center Parkway',
    latitude: 37.7749,
    longitude: -122.4194,
    resources: { beds: 15, icuBeds: 5, ventilators: 3 },
    district: 'Chennai',
    password: 'password123'
  },
  {
    id: 'h2',
    name: 'St. Jude Emergency Center',
    email: 'stjude@vitalnet.com',
    role: 'hospital',
    phone: '+1 555-0144',
    address: '455 Care Lane',
    latitude: 37.7833,
    longitude: -122.4167,
    resources: { beds: 4, icuBeds: 1, ventilators: 0 },
    district: 'Coimbatore',
    password: 'password123'
  },
  {
    id: 'h3',
    name: 'Mercy Hope Clinic',
    email: 'mercy@vitalnet.com',
    role: 'hospital',
    phone: '+1 555-0188',
    address: '88 Grace Ave',
    latitude: 37.7699,
    longitude: -122.4468,
    resources: { beds: 35, icuBeds: 12, ventilators: 8 },
    district: 'Madurai',
    password: 'password123'
  }
];

const defaultAmbulances = [
  { id: 'a1', vehicleNo: 'AMB-2026-A', driverName: 'Robert Vance', phone: '+1 555-0301', status: 'available', latitude: 37.7749, longitude: -122.4194, hospitalId: 'h1' },
  { id: 'a2', vehicleNo: 'AMB-2026-B', driverName: 'Sarah Jenkins', phone: '+1 555-0302', status: 'in-transit', latitude: 37.7794, longitude: -122.4225, hospitalId: 'h1' },
  { id: 'a3', vehicleNo: 'AMB-2026-C', driverName: 'David Miller', phone: '+1 555-0303', status: 'available', latitude: 37.7833, longitude: -122.4167, hospitalId: 'h2' }
];

const defaultBookings = [
  { id: 'b1', patientName: 'John Doe', patientId: 'u1', hospitalName: 'City General Hospital', hospitalId: 'h1', type: 'ICU', status: 'pending', createdAt: new Date(Date.now() - 3600000 * 2).toLocaleString() },
  { id: 'b2', patientName: 'John Doe', patientId: 'u1', hospitalName: 'St. Jude Emergency Center', hospitalId: 'h2', type: 'Ambulance', status: 'pending', createdAt: new Date().toLocaleString(), ambulanceId: 'a2' }
];

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('vn_user');
    return saved ? JSON.parse(saved) : null;
  });
  
  const [token, setToken] = useState(() => {
    return localStorage.getItem('vn_token') || null;
  });

  // State-based mock database synced with localStorage for a robust demonstration
  const [dbHospitals, setDbHospitals] = useState(() => {
    const saved = localStorage.getItem('vn_db_hospitals_v3');
    return saved ? JSON.parse(saved) : defaultHospitals;
  });

  const [dbAmbulances, setDbAmbulances] = useState(() => {
    const saved = localStorage.getItem('vn_db_ambulances');
    return saved ? JSON.parse(saved) : defaultAmbulances;
  });

  const [dbBookings, setDbBookings] = useState(() => {
    const saved = localStorage.getItem('vn_db_bookings_v3');
    return saved ? JSON.parse(saved) : defaultBookings;
  });

  const [dbPatients, setDbPatients] = useState(() => {
    const saved = localStorage.getItem('vn_db_patients');
    return saved ? JSON.parse(saved) : defaultPatients;
  });

  useEffect(() => {
    localStorage.setItem('vn_db_hospitals_v3', JSON.stringify(dbHospitals));
  }, [dbHospitals]);

  useEffect(() => {
    localStorage.setItem('vn_db_ambulances', JSON.stringify(dbAmbulances));
  }, [dbAmbulances]);

  useEffect(() => {
    localStorage.setItem('vn_db_bookings_v3', JSON.stringify(dbBookings));
  }, [dbBookings]);

  useEffect(() => {
    localStorage.setItem('vn_db_patients', JSON.stringify(dbPatients));
  }, [dbPatients]);

  const login = async (email, password, role) => {
    // Basic validation / Simulation
    let matchedUser = null;
    
    if (role === 'admin' && email === 'rokesh@vitalnet.com') {
      if (password !== '2006') {
        throw new Error('Kindly enter the valid email ID and password.');
      }
      matchedUser = { id: 'admin', name: 'System Administrator', email: 'rokesh@vitalnet.com', role: 'admin', password: '2006' };
    } else if (role === 'hospital') {
      matchedUser = dbHospitals.find(h => h.email === email);
    } else if (role === 'patient') {
      matchedUser = dbPatients.find(p => p.email === email);
    }

    if (!matchedUser) {
      throw new Error('Kindly enter the valid email ID and password.');
    }

    const correctPassword = matchedUser.password || 'apollo';
    if (correctPassword !== password) {
      throw new Error('Kindly enter the valid email ID and password.');
    }

    setUser(matchedUser);
    const fakeToken = 'mock_jwt_token_' + matchedUser.id;
    setToken(fakeToken);
    localStorage.setItem('vn_user', JSON.stringify(matchedUser));
    localStorage.setItem('vn_token', fakeToken);
    return matchedUser;
  };

  const register = async (userData) => {
    const { name, email, password, role, phone, address, beds, icuBeds, ventilators, district } = userData;
    
    // Check if exists
    const exists = (role === 'hospital' ? dbHospitals : dbPatients).some(u => u.email === email);
    if (exists) {
      throw new Error('User/Hospital with this email already exists');
    }

    const newUser = {
      id: role + '_' + Math.random().toString(36).substr(2, 9),
      name,
      email,
      password,
      role,
      phone,
      address,
      district: role === 'hospital' ? district : undefined
    };

    if (role === 'hospital') {
      newUser.resources = {
        beds: parseInt(beds) || 0,
        icuBeds: parseInt(icuBeds) || 0,
        ventilators: parseInt(ventilators) || 0
      };
      newUser.latitude = 37.7749 + (Math.random() - 0.5) * 0.05;
      newUser.longitude = -122.4194 + (Math.random() - 0.5) * 0.05;
      setDbHospitals(prev => [...prev, newUser]);
    } else {
      setDbPatients(prev => [...prev, newUser]);
    }

    // Auto-login
    setUser(newUser);
    const fakeToken = 'mock_jwt_token_' + newUser.id;
    setToken(fakeToken);
    localStorage.setItem('vn_user', JSON.stringify(newUser));
    localStorage.setItem('vn_token', fakeToken);
    return newUser;
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('vn_user');
    localStorage.removeItem('vn_token');
  };

  // Helper functions to simulate DB operations in memory
  const updateHospitalResources = (hospitalId, resources) => {
    setDbHospitals(prev => prev.map(h => {
      if (h.id === hospitalId) {
        const updated = { ...h, resources: { ...h.resources, ...resources } };
        // Sync logged in user if they are the hospital
        if (user && user.id === hospitalId) {
          setUser(updated);
          localStorage.setItem('vn_user', JSON.stringify(updated));
        }
        return updated;
      }
      return h;
    }));
  };

  const createBooking = (bookingData) => {
    const newBooking = {
      id: 'b_' + Math.random().toString(36).substr(2, 9),
      patientId: user?.id || 'u1',
      patientName: user?.name || 'John Doe',
      createdAt: new Date().toLocaleString(),
      status: 'pending',
      ...bookingData
    };
    
    // Decrement hospital resources if approved or instantly block them
    setDbBookings(prev => [newBooking, ...prev]);
    return newBooking;
  };

  const updateBookingStatus = (bookingId, status) => {
    setDbBookings(prev => prev.map(b => {
      if (b.id === bookingId) {
        const updatedBooking = { ...b, status };
        
        // Handle resource decrement if approved
        if (status === 'approved') {
          const hosp = dbHospitals.find(h => h.id === b.hospitalId);
          if (hosp) {
            let update = {};
            if (b.type === 'Bed' && hosp.resources.beds > 0) update.beds = hosp.resources.beds - 1;
            if (b.type === 'ICU' && hosp.resources.icuBeds > 0) update.icuBeds = hosp.resources.icuBeds - 1;
            if (b.type === 'Ventilator' && hosp.resources.ventilators > 0) update.ventilators = hosp.resources.ventilators - 1;
            
            if (Object.keys(update).length > 0) {
              updateHospitalResources(b.hospitalId, update);
            }
          }
          
          // Dispatch ambulance if booking type is Ambulance
          if (b.type === 'Ambulance') {
            const availAmb = dbAmbulances.find(a => a.hospitalId === b.hospitalId && a.status === 'available');
            if (availAmb) {
              setDbAmbulances(prevAmbs => prevAmbs.map(a => 
                a.id === availAmb.id ? { ...a, status: 'in-transit' } : a
              ));
              updatedBooking.ambulanceId = availAmb.id;
            }
          }
        }
        return updatedBooking;
      }
      return b;
    }));
  };

  const addAmbulance = (ambulanceData) => {
    const newAmb = {
      id: 'a_' + Math.random().toString(36).substr(2, 9),
      status: 'available',
      latitude: user?.latitude || 37.7749,
      longitude: user?.longitude || -122.4194,
      hospitalId: user?.id,
      ...ambulanceData
    };
    setDbAmbulances(prev => [...prev, newAmb]);
    return newAmb;
  };

  const updateAmbulanceStatus = (ambId, status) => {
    setDbAmbulances(prev => prev.map(a => 
      a.id === ambId ? { ...a, status } : a
    ));
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
      updateAmbulanceStatus
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
