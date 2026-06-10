import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import MapComponent from '../components/MapComponent';
import { 
  Phone, 
  ArrowLeft, 
  ShieldAlert, 
  Truck, 
  User, 
  Gauge, 
  Compass, 
  Clock, 
  Battery, 
  Activity,
  Heart,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import './Tracking.css';

export default function Tracking() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const ambulance = state?.ambulance || {
    vehicleNo: 'AMB-2026-B',
    driverName: 'Sarah Jenkins',
    phone: '+1 555-0302',
    status: 'in-transit',
    latitude: 37.7794,
    longitude: -122.4225
  };

  // Telemetry status state updated dynamically by MapComponent
  const [telemetry, setTelemetry] = useState({
    progress: 0,
    speed: 0,
    distance: '5.2',
    eta: 5,
    currentStreet: 'Oak Avenue (Residences)',
    traffic: 'medium',
    isPlaying: true
  });

  const [sirensActive, setSirensActive] = useState(true);
  const [logs, setLogs] = useState([]);

  // Generate logs based on progress thresholds
  useEffect(() => {
    const p = telemetry.progress;
    const newLogs = [];

    newLogs.push({ time: '11:22 AM', text: 'Emergency booking approved. Dispatch Hub notified.', done: true });
    
    if (p >= 0) {
      newLogs.push({ time: '11:23 AM', text: `Ambulance unit ${ambulance.vehicleNo} departing City Station.`, done: true });
    }
    if (p > 15) {
      newLogs.push({ time: '11:24 AM', text: 'Driver Sarah Jenkins initiated siren response pathway.', done: true });
    }
    if (p > 35) {
      newLogs.push({ time: '11:25 AM', text: `Vehicle cruising Parkway Express at ${telemetry.speed || 45} mph.`, done: true });
    }
    if (p > 65) {
      newLogs.push({ 
        time: '11:26 AM', 
        text: telemetry.traffic === 'heavy' 
          ? 'Encountered heavy traffic. GPS routing adjusted.' 
          : 'Traffic clear. Approaching Patient Grid zone.',
        done: true 
      });
    }
    if (p >= 100) {
      newLogs.push({ time: '11:28 AM', text: 'Ambulance has arrived at patient residence location.', done: true, highlight: true });
    }

    setLogs(newLogs.reverse()); // Show newest logs first
  }, [telemetry.progress, telemetry.traffic, ambulance.vehicleNo]);

  const handleTelemetryChange = (data) => {
    setTelemetry(data);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6 animate-fade-in">
        
        {/* Header */}
        <div className="flex justify-between items-center">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1.5 text-xs font-bold text-slate-400 hover:text-slate-600 transition-colors uppercase tracking-wider"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </button>
          
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${sirensActive ? 'bg-red-500' : 'bg-slate-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${sirensActive ? 'bg-red-500' : 'bg-slate-400'}`}></span>
            </span>
            <span className="bg-red-50 text-emergency-600 text-[10px] font-extrabold px-3 py-1 rounded-full border border-red-100 uppercase tracking-wider">
              {telemetry.progress >= 100 ? 'Arrived' : 'Live Tracking'}
            </span>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Column 1: Map (lg:col-span-8) */}
          <div className="lg:col-span-8 space-y-4">
            <MapComponent 
              vehicleNo={ambulance.vehicleNo} 
              onTelemetryChange={handleTelemetryChange}
              sirensActive={sirensActive}
              setSirensActive={setSirensActive}
            />

            {/* Stepper Status Bar */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
              <div className="grid grid-cols-4 gap-2 text-center relative">
                {[
                  { label: 'Dispatched', active: telemetry.progress >= 0 },
                  { label: 'En Route', active: telemetry.progress > 20 },
                  { label: 'Nearby', active: telemetry.progress > 70 },
                  { label: 'Arrived', active: telemetry.progress >= 100 }
                ].map((step, idx) => (
                  <div key={idx} className="relative z-10 flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border-2 transition-all ${
                      step.active 
                        ? 'bg-brand-500 border-brand-500 text-white shadow-md shadow-brand-100' 
                        : 'bg-white border-slate-200 text-slate-400'
                    }`}>
                      {idx + 1}
                    </div>
                    <span className={`text-[10px] font-extrabold uppercase mt-2 tracking-wide ${
                      step.active ? 'text-slate-800' : 'text-slate-400'
                    }`}>
                      {step.label}
                    </span>
                  </div>
                ))}
                
                {/* Connecting bar */}
                <div className="absolute top-4 left-0 right-0 h-0.5 bg-slate-100 -z-1" />
                <div 
                  className="absolute top-4 left-0 h-0.5 bg-brand-500 transition-all duration-300 -z-1"
                  style={{ width: `${Math.min(90, telemetry.progress)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Column 2: Telemetry & Logs (lg:col-span-4) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Live Telemetry Gauges */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase border-b border-slate-50 pb-3">
                Telemetry Dashboard
              </h3>

              <div className="grid grid-cols-2 gap-4">
                {/* Speed Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <Gauge className="h-5 w-5" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Speed</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800">{telemetry.speed}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">MPH</span>
                  </div>
                </div>

                {/* Distance Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <Compass className="h-5 w-5" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Distance</span>
                  </div>
                  <div>
                    <span className="text-2xl font-black text-slate-800">{telemetry.distance}</span>
                    <span className="text-[10px] text-slate-400 font-bold ml-1">MILES</span>
                  </div>
                </div>

                {/* ETA Card */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50 flex flex-col justify-between col-span-2">
                  <div className="flex items-center justify-between text-slate-400 mb-2">
                    <Clock className="h-5 w-5" />
                    <span className="text-[9px] uppercase font-bold tracking-wider">Estimated Arrival</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-3xl font-black text-slate-800">
                        {telemetry.progress >= 100 ? '0' : telemetry.eta}
                      </span>
                      <span className="text-xs text-slate-400 font-bold ml-1">MINUTES</span>
                    </div>
                    <span className="text-[10px] bg-red-50 text-emergency-600 font-extrabold px-2 py-0.5 rounded">
                      SIRENS ACTIVE
                    </span>
                  </div>
                </div>
              </div>

              {/* Current Location Road */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100/50">
                <span className="text-[9px] uppercase text-slate-400 font-bold tracking-wider block mb-1">Current Sector</span>
                <span className="text-xs text-slate-700 font-extrabold flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5 text-emergency-500 animate-bounce" />
                  {telemetry.currentStreet}
                </span>
              </div>
            </div>

            {/* Dispatcher Timeline Logs */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm flex flex-col h-[340px]">
              <h3 className="font-extrabold text-slate-800 text-xs tracking-wider uppercase border-b border-slate-50 pb-3 mb-4">
                Dispatch Event Log
              </h3>
              
              <div className="flex-1 overflow-y-auto space-y-4 pr-1">
                {logs.map((log, idx) => (
                  <div key={idx} className={`flex gap-3 text-xs ${log.highlight ? 'bg-brand-50 border border-brand-100 p-2.5 rounded-xl text-brand-800 font-bold' : 'text-slate-600'}`}>
                    <span className="text-[10px] text-slate-400 font-bold shrink-0">{log.time}</span>
                    <p className="leading-tight">{log.text}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Crew and Specs Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-slate-100 p-2.5 rounded-2xl text-slate-600">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block">Assigned Crew</span>
                    <h4 className="font-extrabold text-slate-800 text-sm">{ambulance.driverName}</h4>
                    <span className="text-[10px] text-slate-400 font-bold">Driver • Paramedic crew</span>
                  </div>
                </div>

                <a
                  href={`tel:${ambulance.phone}`}
                  className="bg-brand-500 hover:bg-brand-600 text-white p-3 rounded-2xl shadow-md transition-all hover-scale"
                  title="Call Driver"
                >
                  <Phone className="h-4 w-4" />
                </a>
              </div>

              {/* Ambulance Diagnostics */}
              <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-50">
                <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                  <Battery className="h-4 w-4 text-emerald-500 mx-auto mb-1" />
                  <span className="text-[8px] text-slate-400 font-bold block">FUEL</span>
                  <span className="text-xs font-black text-slate-700">92%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                  <Activity className="h-4 w-4 text-red-500 mx-auto mb-1 animate-pulse" />
                  <span className="text-[8px] text-slate-400 font-bold block">OXYGEN</span>
                  <span className="text-xs font-black text-slate-700">100%</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-xl text-center">
                  <Heart className="h-4 w-4 text-sky-500 mx-auto mb-1" />
                  <span className="text-[8px] text-slate-400 font-bold block">EQUIP</span>
                  <span className="text-[9px] font-black text-slate-700 uppercase">LOADED</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}

