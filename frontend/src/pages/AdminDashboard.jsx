import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { ShieldCheck, Heart, User, Activity, Trash, Plus, MapPin, Navigation, Truck, Users } from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const {
    dbHospitals,
    dbAmbulances,
    dbBookings,
    dbPatients,
    setDbHospitals,
    setDbPatients,
    setDbAmbulances,
    setDbBookings
  } = useAuth();

  const [activeTab, setActiveTab] = useState('analytics'); // analytics, hospitals, patients, ambulances

  // Hospital inputs
  const [hospName, setHospName] = useState('');
  const [hospEmail, setHospEmail] = useState('');
  const [hospPhone, setHospPhone] = useState('');
  const [hospAddress, setHospAddress] = useState('');

  // Analytics mock data
  const chartData = [
    { name: 'Mon', bookings: 4 },
    { name: 'Tue', bookings: 7 },
    { name: 'Wed', bookings: 5 },
    { name: 'Thu', bookings: 12 },
    { name: 'Fri', bookings: 9 },
    { name: 'Sat', bookings: 15 },
    { name: 'Sun', bookings: 18 }
  ];

  const resourceData = dbHospitals.map(h => ({
    name: h.name.split(' ')[0],
    beds: h.resources.beds,
    icu: h.resources.icuBeds
  }));

  const handleDeleteHospital = (id) => {
    setDbHospitals(prev => prev.filter(h => h.id !== id));
  };

  const handleDeletePatient = (id) => {
    setDbPatients(prev => prev.filter(p => p.id !== id));
  };

  const handleDeleteAmbulance = (id) => {
    setDbAmbulances(prev => prev.filter(a => a.id !== id));
  };

  const handleDeleteBooking = (id) => {
    setDbBookings(prev => prev.filter(b => b.id !== id));
  };

  const handleAddHospital = (e) => {
    e.preventDefault();
    if (!hospName || !hospEmail || !hospPhone || !hospAddress) return;

    const newHosp = {
      id: 'h_' + Math.random().toString(36).substr(2, 9),
      name: hospName,
      email: hospEmail,
      phone: hospPhone,
      address: hospAddress,
      role: 'hospital',
      resources: { beds: 10, icuBeds: 2, ventilators: 1 },
      latitude: 37.7749,
      longitude: -122.4194
    };

    setDbHospitals(prev => [...prev, newHosp]);
    setHospName('');
    setHospEmail('');
    setHospPhone('');
    setHospAddress('');
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="text-left">
            <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">Control Center</h1>
            <p className="text-slate-400 text-sm font-semibold">VitalNet Global Platform Administration</p>
          </div>

          <div className="flex gap-1.5 bg-slate-100 p-1 rounded-2xl">
            {['analytics', 'hospitals', 'patients', 'ambulances', 'bookings'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-xs font-bold rounded-xl capitalize transition-all ${
                  activeTab === tab ? 'bg-white text-medblue-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Global Stats Counters */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="bg-medblue-50 text-medblue-600 p-3 rounded-xl">
              <Activity className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Bookings</span>
              <span className="text-xl font-extrabold text-slate-800">{dbBookings.length}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="bg-brand-50 text-brand-600 p-3 rounded-xl">
              <Users className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Providers</span>
              <span className="text-xl font-extrabold text-slate-800">{dbHospitals.length}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
              <Truck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Ambulances</span>
              <span className="text-xl font-extrabold text-slate-800">{dbAmbulances.length}</span>
            </div>
          </div>
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-sm flex items-center gap-4">
            <div className="bg-red-50 text-emergency-600 p-3 rounded-xl">
              <Heart className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">Patients</span>
              <span className="text-xl font-extrabold text-slate-800">{dbPatients.length}</span>
            </div>
          </div>
        </div>

        {/* Tab content panel */}
        {activeTab === 'analytics' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Weekly bookings chart */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6">Weekly Request Volumes</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData}>
                    <defs>
                      <linearGradient id="colorBookings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#0284c7" stopOpacity={0.4}/>
                        <stop offset="95%" stopColor="#0284c7" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="bookings" stroke="#0284c7" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBookings)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Resources per Clinic */}
            <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase tracking-wider mb-6">Capacity Distribution</h3>
              <div className="h-80 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={resourceData}>
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="beds" fill="#10b981" radius={[4, 4, 0, 0]} name="General Beds" />
                    <Bar dataKey="icu" fill="#0284c7" radius={[4, 4, 0, 0]} name="ICU Beds" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'hospitals' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Add Hospital Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-1 h-fit">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase mb-4 tracking-wider">Register Provider</h3>
              <form onSubmit={handleAddHospital} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Name</label>
                  <input
                    type="text"
                    required
                    value={hospName}
                    onChange={(e) => setHospName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-medblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Email</label>
                  <input
                    type="email"
                    required
                    value={hospEmail}
                    onChange={(e) => setHospEmail(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-medblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Phone</label>
                  <input
                    type="tel"
                    required
                    value={hospPhone}
                    onChange={(e) => setHospPhone(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-medblue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Address</label>
                  <input
                    type="text"
                    required
                    value={hospAddress}
                    onChange={(e) => setHospAddress(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold outline-none focus:bg-white focus:border-medblue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="w-full bg-medblue-600 hover:bg-medblue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all"
                >
                  Create Facility
                </button>
              </form>
            </div>

            {/* Hospital List */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm lg:col-span-2">
              <h3 className="font-extrabold text-slate-800 text-sm uppercase mb-4 tracking-wider">Registered Facilities</h3>
              <div className="divide-y divide-slate-100">
                {dbHospitals.map(h => (
                  <div key={h.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                    <div>
                      <h4 className="font-extrabold text-slate-800 text-sm">{h.name}</h4>
                      <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{h.address}</span>
                      <span className="text-[10px] text-slate-500 font-bold block mt-1">
                        Beds: {h.resources.beds} | ICU: {h.resources.icuBeds} | Vent: {h.resources.ventilators}
                      </span>
                    </div>
                    <button
                      onClick={() => handleDeleteHospital(h.id)}
                      className="bg-red-50 hover:bg-red-100 text-emergency-600 border border-red-200 p-2 rounded-xl transition-all"
                    >
                      <Trash className="h-4.5 w-4.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {activeTab === 'patients' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase mb-4 tracking-wider">Platform Patients</h3>
            <div className="divide-y divide-slate-100">
              {dbPatients.map(p => (
                <div key={p.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{p.name}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{p.email} | {p.phone}</span>
                    <span className="text-[10px] text-slate-500 font-bold block mt-1">{p.address}</span>
                  </div>
                  <button
                    onClick={() => handleDeletePatient(p.id)}
                    className="bg-red-50 hover:bg-red-100 text-emergency-600 border border-red-200 p-2 rounded-xl transition-all"
                  >
                    <Trash className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'ambulances' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase mb-4 tracking-wider">Emergency Dispatch Ambulances</h3>
            <div className="divide-y divide-slate-100">
              {dbAmbulances.map(a => (
                <div key={a.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div>
                    <h4 className="font-extrabold text-slate-800 text-sm">{a.vehicleNo}</h4>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">Driver: {a.driverName} | {a.phone}</span>
                    <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border mt-1.5 inline-block ${
                      a.status === 'available' ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                    }`}>
                      {a.status}
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteAmbulance(a.id)}
                    className="bg-red-50 hover:bg-red-100 text-emergency-600 border border-red-200 p-2 rounded-xl transition-all"
                  >
                    <Trash className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
        {activeTab === 'bookings' && (
          <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
            <h3 className="font-extrabold text-slate-800 text-sm uppercase mb-4 tracking-wider">Active Bookings & History</h3>
            <div className="divide-y divide-slate-100">
              {dbBookings.map(b => (
                <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex justify-between items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-slate-800 text-sm">{b.patientName}</h4>
                      <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase">
                        {b.type}
                      </span>
                      <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded border ${
                        b.status === 'approved' ? 'bg-brand-50 text-brand-700 border-brand-100' : 'bg-amber-50 text-amber-700 border-amber-100'
                      }`}>
                        {b.status}
                      </span>
                    </div>
                    <span className="text-[10px] text-slate-400 font-semibold block mt-1">Facility: {b.hospitalName} | Date: {b.createdAt}</span>
                    {b.symptoms && (
                      <p className="text-[11px] text-slate-500 mt-1 italic">"{b.symptoms}"</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteBooking(b.id)}
                    className="bg-red-50 hover:bg-red-100 text-emergency-600 border border-red-200 p-2 rounded-xl transition-all"
                  >
                    <Trash className="h-4.5 w-4.5" />
                  </button>
                </div>
              ))}
              {dbBookings.length === 0 && (
                <div className="text-center py-6 text-slate-400 text-xs font-semibold">
                  No bookings logged.
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
