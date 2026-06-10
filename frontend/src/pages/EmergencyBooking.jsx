import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Activity, ShieldAlert, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react';
import './EmergencyBooking.css';

export default function EmergencyBooking() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { dbHospitals, createBooking } = useAuth();

  const [hospitalId, setHospitalId] = useState(state?.hospitalId || dbHospitals[0]?.id || '');
  const [bookingType, setBookingType] = useState('Bed'); // Bed, ICU, Ventilator
  const [symptoms, setSymptoms] = useState('');
  const [severity, setSeverity] = useState('High'); // Low, Medium, High, Critical
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const selectedHospital = dbHospitals.find(h => h.id === hospitalId);

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);
    
    setTimeout(() => {
      const hosp = dbHospitals.find(h => h.id === hospitalId);
      createBooking({
        hospitalId,
        hospitalName: hosp?.name || 'City Hospital',
        type: bookingType,
        severity,
        symptoms
      });
      setLoading(false);
      setSuccess(true);
    }, 1200);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl text-center space-y-6">
          <div className="bg-brand-50 border border-brand-100 text-brand-600 p-4 rounded-full w-16 h-16 flex items-center justify-center mx-auto shadow-md">
            <CheckCircle2 className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Booking Requested</h2>
          <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
            Your {bookingType} booking request at <span className="text-slate-700 font-bold">{selectedHospital?.name}</span> has been submitted. The hospital will review and update the status shortly.
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-medblue-600 hover:bg-medblue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-medblue-100 hover:shadow-xl transition-all"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 flex items-center justify-center">
      <div className="max-w-xl w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-fade-in card-interactive">
        
        {/* Back navigation */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider hover-scale"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>

        <div className="text-left space-y-1">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight font-sans">Book Critical Resource</h1>
          <p className="text-slate-400 text-xs font-semibold">
            Instantly reserve general beds, emergency ICU slots, or ventilators.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Hospital Select */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Select Facility</label>
            <select
              value={hospitalId}
              onChange={(e) => setHospitalId(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            >
              {dbHospitals.map(h => (
                <option key={h.id} value={h.id}>
                  {h.name} (Beds: {h.resources.beds} | ICU: {h.resources.icuBeds} | Vent: {h.resources.ventilators})
                </option>
              ))}
            </select>
          </div>

          {/* Booking Type Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Resource Type</label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { type: 'Bed', label: 'General Bed' },
                { type: 'ICU', label: 'ICU Bed' },
                { type: 'Ventilator', label: 'Ventilator' }
              ].map((item) => (
                <button
                  key={item.type}
                  type="button"
                  onClick={() => setBookingType(item.type)}
                  className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all text-center flex flex-col items-center justify-center gap-1.5 hover-scale ${
                    bookingType === item.type
                      ? 'border-medblue-500 bg-medblue-50/50 text-medblue-700 shadow-sm shadow-medblue-50'
                      : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Activity className="h-4.5 w-4.5 shrink-0" />
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* Severity Indicator */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Urgency/Severity</label>
            <div className="grid grid-cols-4 gap-2">
              {['Low', 'Medium', 'High', 'Critical'].map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setSeverity(level)}
                  className={`py-2 rounded-xl text-[10px] font-bold border transition-all uppercase tracking-wider hover-scale ${
                    severity === level
                      ? level === 'Critical'
                        ? 'border-red-500 bg-red-50 text-red-700 font-extrabold animate-pulse'
                        : 'border-amber-500 bg-amber-50 text-amber-700 font-extrabold'
                      : 'border-slate-200 bg-white text-slate-500 hover:bg-slate-50'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Symptoms description */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Symptoms & Details</label>
            <textarea
              required
              rows="3"
              value={symptoms}
              onChange={(e) => setSymptoms(e.target.value)}
              placeholder="Please describe symptoms (e.g. respiratory distress, chest pains, high fever)..."
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none resize-none input-interactive"
            />
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
                <Heart className="h-5 w-5" />
                Reserve Space
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
