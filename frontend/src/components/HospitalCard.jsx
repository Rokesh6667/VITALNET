import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Phone, CheckCircle, AlertTriangle } from 'lucide-react';

export default function HospitalCard({ hospital, distance }) {
  const navigate = useNavigate();
  const { resources = { beds: 0, icuBeds: 0, ventilators: 0 } } = hospital;

  const totalAvailable = resources.beds + resources.icuBeds + resources.ventilators;

  return (
    <div className={`bg-white rounded-2xl border p-6 flex flex-col justify-between card-interactive ${
      totalAvailable <= 5 ? 'card-interactive-emergency' : ''
    } animate-fade-in`}>
      <div>
        <div className="flex justify-between items-start mb-3">
          <div>
            <h3 className="font-bold text-lg text-slate-800 tracking-tight">{hospital.name}</h3>
            {hospital.district && (
              <span className="bg-slate-100 text-slate-600 text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider block w-fit mt-1">
                {hospital.district}
              </span>
            )}
          </div>
          {distance !== undefined && (
            <span className="bg-medblue-50 text-medblue-600 text-xs font-semibold px-2.5 py-1 rounded-full flex items-center gap-1 border border-medblue-100">
              <MapPin className="h-3 w-3" />
              {distance.toFixed(1)} km away
            </span>
          )}
        </div>

        <div className="space-y-2 mb-4">
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <MapPin className="h-4 w-4 text-slate-400 shrink-0" />
            <span className="truncate">{hospital.address}</span>
          </p>
          <p className="text-slate-500 text-sm flex items-center gap-2">
            <Phone className="h-4 w-4 text-slate-400 shrink-0" />
            <span>{hospital.phone}</span>
          </p>
        </div>

        {/* Resources Grid */}
        <div className="grid grid-cols-3 gap-2.5 mb-6">
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Gen. Beds</span>
            <span className={`text-base font-extrabold ${resources.beds > 5 ? 'text-brand-600' : resources.beds > 0 ? 'text-warning-600' : 'text-emergency-600'}`}>
              {resources.beds}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">ICU Beds</span>
            <span className={`text-base font-extrabold ${resources.icuBeds > 2 ? 'text-brand-600' : resources.icuBeds > 0 ? 'text-warning-600' : 'text-emergency-600'}`}>
              {resources.icuBeds}
            </span>
          </div>
          <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 text-center">
            <span className="block text-[10px] uppercase font-bold text-slate-400">Ventilators</span>
            <span className={`text-base font-extrabold ${resources.ventilators > 1 ? 'text-brand-600' : resources.ventilators > 0 ? 'text-warning-600' : 'text-emergency-600'}`}>
              {resources.ventilators}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => navigate('/emergency-booking', { state: { hospitalId: hospital.id, hospitalName: hospital.name } })}
          disabled={totalAvailable === 0}
          className={`w-full py-2.5 rounded-xl font-semibold text-sm transition-all flex items-center justify-center gap-1.5 ${
            totalAvailable > 0
              ? 'bg-medblue-600 hover:bg-medblue-700 text-white shadow-sm shadow-medblue-100'
              : 'bg-slate-150 text-slate-400 cursor-not-allowed border border-slate-200'
          }`}
        >
          Book Resource
        </button>
        <button
          onClick={() => navigate('/ambulance-booking', { state: { hospitalId: hospital.id, hospitalName: hospital.name } })}
          className="bg-brand-50 hover:bg-brand-100 text-brand-700 border border-brand-200 font-semibold text-sm px-4 py-2.5 rounded-xl transition-all"
        >
          Call Amb
        </button>
      </div>
    </div>
  );
}
