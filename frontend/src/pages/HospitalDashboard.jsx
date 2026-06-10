import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import ResourceCard from '../components/ResourceCard';
import AmbulanceCard from '../components/AmbulanceCard';
import { Activity, ShieldCheck, Heart, User, Check, X, ShieldAlert, Plus } from 'lucide-react';
import './HospitalDashboard.css';

export default function HospitalDashboard() {
  const {
    user,
    dbBookings,
    dbAmbulances,
    updateHospitalResources,
    updateBookingStatus,
    addAmbulance,
    updateAmbulanceStatus
  } = useAuth();

  const [bedsInput, setBedsInput] = useState(user?.resources?.beds || 15);
  const [icuInput, setIcuInput] = useState(user?.resources?.icuBeds || 5);
  const [ventInput, setVentInput] = useState(user?.resources?.ventilators || 3);

  // New ambulance inputs
  const [showAddAmb, setShowAddAmb] = useState(false);
  const [vehicleNo, setVehicleNo] = useState('');
  const [driverName, setDriverName] = useState('');
  const [phone, setPhone] = useState('');

  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, approved, rejected

  // Bookings requested to this hospital
  const baseHospitalBookings = dbBookings.filter(b => b.hospitalId === user?.id);
  const hospitalBookings = baseHospitalBookings.filter(b => statusFilter === 'all' || b.status === statusFilter);
  // Ambulances belonging to this hospital
  const hospitalAmbulances = dbAmbulances.filter(a => a.hospitalId === user?.id);

  const handleUpdateResources = (e) => {
    e.preventDefault();
    if (!user?.id) return;
    updateHospitalResources(user.id, {
      beds: parseInt(bedsInput) || 0,
      icuBeds: parseInt(icuInput) || 0,
      ventilators: parseInt(ventInput) || 0
    });
    alert('Resource counters updated successfully!');
  };

  const handleAddAmbulance = (e) => {
    e.preventDefault();
    if (!vehicleNo || !driverName || !phone) return;
    
    addAmbulance({
      vehicleNo,
      driverName,
      phone
    });
    setVehicleNo('');
    setDriverName('');
    setPhone('');
    setShowAddAmb(false);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-left">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">
            {user?.name || 'City General Hospital'}
          </h1>
          <p className="text-slate-400 text-sm font-semibold">
            Emergency Care Provider Dashboard
          </p>
        </div>

        {/* Resources Cards Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <ResourceCard title="General Ward Beds" count={user?.resources?.beds || 0} icon={Activity} color="blue" />
          <ResourceCard title="ICU Ventilators" count={user?.resources?.ventilators || 0} icon={Heart} color="red" />
          <ResourceCard title="ICU Beds" count={user?.resources?.icuBeds || 0} icon={ShieldCheck} color="green" />
        </div>

        {/* Action Panel Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left Column: Update Counters & Add Ambulance */}
          <div className="space-y-6 lg:col-span-1">
            
            {/* Resource Updates Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-md mb-4 uppercase tracking-wider">Update Capacities</h3>
              
              <form onSubmit={handleUpdateResources} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">General Beds</label>
                  <input
                    type="number"
                    value={bedsInput}
                    onChange={(e) => setBedsInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:bg-white focus:border-medblue-500 input-interactive"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">ICU Beds</label>
                  <input
                    type="number"
                    value={icuInput}
                    onChange={(e) => setIcuInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:bg-white focus:border-medblue-500 input-interactive"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase mb-1">Ventilators</label>
                  <input
                    type="number"
                    value={ventInput}
                    onChange={(e) => setVentInput(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold outline-none focus:bg-white focus:border-medblue-500 input-interactive"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-medblue-600 hover:bg-medblue-700 text-white font-bold py-2.5 rounded-xl text-xs uppercase tracking-wider transition-all hover-scale"
                >
                  Save Resources
                </button>
              </form>
            </div>

            {/* Ambulance Dispatch Fleet Form */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-extrabold text-slate-800 text-md uppercase tracking-wider">Fleet Registry</h3>
                <button
                  onClick={() => setShowAddAmb(!showAddAmb)}
                  className="text-xs text-medblue-600 font-bold hover:underline flex items-center gap-1"
                >
                  <Plus className="h-3.5 w-3.5" />
                  {showAddAmb ? 'Close' : 'Add Vehicle'}
                </button>
              </div>

              {showAddAmb && (
                <form onSubmit={handleAddAmbulance} className="space-y-3 mb-4 p-3 bg-slate-50 border border-slate-100 rounded-2xl">
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Vehicle No (e.g. AMB-91)"
                      value={vehicleNo}
                      onChange={(e) => setVehicleNo(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      required
                      placeholder="Driver Name"
                      value={driverName}
                      onChange={(e) => setDriverName(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 outline-none"
                    />
                  </div>
                  <div>
                    <input
                      type="tel"
                      required
                      placeholder="Driver Phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-slate-200 outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full bg-brand-500 text-white font-bold py-2 rounded-lg text-xs"
                  >
                    Register Vehicle
                  </button>
                </form>
              )}

              <div className="space-y-3">
                {hospitalAmbulances.map(amb => (
                  <AmbulanceCard key={amb.id} ambulance={amb} onStatusUpdate={updateAmbulanceStatus} showTrackButton={true} />
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Manage pending bookings */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-extrabold text-slate-800 text-md mb-4 uppercase tracking-wider">Incoming Reservations</h3>

               {/* Status Filters */}
              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-50 pb-4">
                {[
                  { id: 'all', label: 'All', count: baseHospitalBookings.length },
                  { id: 'pending', label: 'Pending', count: baseHospitalBookings.filter(b => b.status === 'pending').length },
                  { id: 'payment-pending', label: 'Awaiting Payment', count: baseHospitalBookings.filter(b => b.status === 'payment-pending').length },
                  { id: 'approved', label: 'Approved', count: baseHospitalBookings.filter(b => b.status === 'approved').length },
                  { id: 'rejected', label: 'Rejected', count: baseHospitalBookings.filter(b => b.status === 'rejected').length }
                ].map(filter => (
                  <button
                    key={filter.id}
                    onClick={() => setStatusFilter(filter.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                      statusFilter === filter.id
                        ? filter.id === 'pending'
                          ? 'bg-amber-500 text-white shadow-sm'
                          : filter.id === 'payment-pending'
                            ? 'bg-purple-500 text-white shadow-sm'
                            : filter.id === 'approved'
                              ? 'bg-brand-500 text-white shadow-sm'
                              : filter.id === 'rejected'
                                ? 'bg-red-500 text-white shadow-sm'
                                : 'bg-medblue-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {filter.label}
                    <span className={`text-[10px] font-black px-1.5 py-0.2 rounded-full ${
                      statusFilter === filter.id ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}>
                      {filter.count}
                    </span>
                  </button>
                ))}
              </div>

              {hospitalBookings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {hospitalBookings.map((b) => (
                    <div key={b.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2.5">
                          <span className="font-extrabold text-slate-800">{b.patientName}</span>
                          <span className="bg-medblue-50 text-medblue-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                            {b.type}
                          </span>
                          {b.severity === 'Critical' && (
                            <span className="bg-red-50 text-emergency-600 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded border border-red-100">
                              SOS Alert
                            </span>
                          )}
                        </div>
                        <p className="text-slate-400 text-xs mt-1.5 font-medium italic">"{b.symptoms}"</p>
                        <span className="text-[10px] text-slate-400 font-semibold block mt-1.5">{b.createdAt}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {b.status === 'pending' ? (
                          <>
                            <button
                              onClick={() => updateBookingStatus(b.id, 'payment-pending')}
                              className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 p-2 rounded-xl"
                              title="Accept Reservation & Request Payment"
                            >
                              <Check className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => updateBookingStatus(b.id, 'rejected')}
                              className="bg-red-50 hover:bg-red-100 text-emergency-600 border border-red-200 p-2 rounded-xl"
                              title="Reject"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </>
                        ) : (
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            b.status === 'approved'
                              ? 'bg-brand-50 text-brand-700 border-brand-100'
                              : b.status === 'payment-pending'
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : 'bg-red-50 text-emergency-600 border-red-150'
                          }`}>
                            {b.status === 'payment-pending' ? 'Awaiting Payment' : b.status}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-slate-400 text-xs font-semibold">No booking requests received.</p>
                </div>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
