import React from 'react';
import { Truck, Phone, CheckCircle, Clock, Navigation } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function AmbulanceCard({ ambulance, onStatusUpdate, showTrackButton = false }) {
  const navigate = useNavigate();

  const getStatusStyle = (status) => {
    switch (status) {
      case 'available':
        return 'bg-brand-50 text-brand-700 border-brand-100';
      case 'in-transit':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'busy':
        return 'bg-red-50 text-red-700 border-red-100';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <div className="bg-red-50 p-2.5 rounded-xl border border-red-100 text-red-600">
            <Truck className="h-5 w-5" />
          </div>
          <div>
            <h4 className="font-bold text-slate-800 text-sm tracking-tight">{ambulance.vehicleNo}</h4>
            <span className="text-[11px] text-slate-400 block font-medium">Driver: {ambulance.driverName}</span>
          </div>
        </div>
        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full border ${getStatusStyle(ambulance.status)}`}>
          {ambulance.status}
        </span>
      </div>

      <div className="space-y-2 mb-4">
        <p className="text-slate-500 text-xs flex items-center gap-2">
          <Phone className="h-3.5 w-3.5 text-slate-400" />
          <span>{ambulance.phone}</span>
        </p>
      </div>

      <div className="flex flex-col gap-2 mt-2">
        {onStatusUpdate && (
          <div className="flex gap-1.5 w-full">
            <button
              onClick={() => onStatusUpdate(ambulance.id, 'available')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                ambulance.status === 'available' ? 'bg-brand-500 text-white border-transparent' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Set Available
            </button>
            <button
              onClick={() => onStatusUpdate(ambulance.id, 'in-transit')}
              className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border ${
                ambulance.status === 'in-transit' ? 'bg-amber-500 text-white border-transparent' : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
              }`}
            >
              Set Transit
            </button>
          </div>
        )}

        {showTrackButton && ambulance.status === 'in-transit' && (
          <button
            onClick={() => navigate('/tracking', { state: { ambulance } })}
            className="w-full bg-medblue-600 hover:bg-medblue-700 text-white font-semibold text-xs py-2 rounded-xl flex items-center justify-center gap-1 shadow-sm transition-all"
          >
            <Navigation className="h-3 w-3" />
            Track Ambulance
          </button>
        )}
      </div>
    </div>
  );
}
