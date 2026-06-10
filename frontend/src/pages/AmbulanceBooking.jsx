import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Truck, Navigation, ShieldAlert, ArrowLeft, Loader2 } from 'lucide-react';
import './AmbulanceBooking.css';

export default function AmbulanceBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { dbHospitals, dbAmbulances, createBooking } = useAuth();

  const [hospitalId, setHospitalId] = useState(state?.hospitalId || dbHospitals[0]?.id || '');
  const [pickupAddress, setPickupAddress] = useState('');
  const [patientCondition, setPatientCondition] = useState('Critical Injury');
  const [loading, setLoading] = useState(false);

  const availableAmbulance = dbAmbulances.find(
    a => a.hospitalId === hospitalId && a.status === 'available'
  );

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    setTimeout(() => {
      const hosp = dbHospitals.find(h => h.id === hospitalId);
      const booking = createBooking({
        hospitalId,
        hospitalName: hosp?.name || 'City Hospital',
        type: 'Ambulance',
        symptoms: `${patientCondition} - Pickup: ${pickupAddress}`
      });
      setLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-fade-in card-interactive-emergency">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider hover-scale"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-left space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Dispatch Emergency Ambulance</h1>
          <p className="text-slate-400 text-xs font-semibold">
            Input patient locations to book the nearest responder dispatch vehicle.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Hospital Selection */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Dispatch Hub (Hospital)</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            >
              {dbHospitals.map(h => {
                const count = dbAmbulances.filter(a => a.hospitalId === h.id && a.status === 'available').length;
                return (
                  <option key={h.id} value={h.id}>
                    {h.name} ({count} Ambulances Available)
                  </option>
                );
              })}
            </select>
          </div>

          {/* Condition Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Patient Condition</label>
            <select
              value={patientCondition}
              onChange={(e) => setPatientCondition(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            >
              <option value="Critical Injury">Critical Injury / Trauma</option>
              <option value="Cardiac Arrest">Cardiac Arrest Symptoms</option>
              <option value="Respiratory Distress">Respiratory Distress</option>
              <option value="Unconsciousness">Loss of Consciousness</option>
              <option value="Minor Injury">Stable / Minor Injury</option>
            </select>
          </div>

          {/* Pickup Coordinate / Text Input */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Pickup Address / Location</label>
            <input
              type="text"
              required
              value={pickupAddress}
              onChange={(e) => setPickupAddress(e.target.value)}
              placeholder="e.g. 56 Care Court, Apt 4B"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            />
          </div>

          {/* Warning notice */}
          <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 text-xs font-semibold text-amber-800 flex gap-2">
            <ShieldAlert className="h-5 w-5 shrink-0 text-amber-600 animate-pulse" />
            <p>
              By proceeding, dispatch teams will prepare immediate siren responder paths. Falsifying emergency requests carries liability warnings.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-emergency-600 hover:bg-emergency-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-red-100 hover:shadow-xl hover-scale transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <Truck className="h-5 w-5" />
                Dispatch Ambulance
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
