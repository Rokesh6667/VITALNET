import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Heart, Activity, Compass, Users, Truck, Sparkles, ArrowRight } from 'lucide-react';
import './Home.css';

export default function Home() {
  const { user, dbHospitals, dbAmbulances, createBooking, updateBookingStatus, login } = useAuth();
  const navigate = useNavigate();

  const [showSosModal, setShowSosModal] = useState(false);
  const [dispatchedHospital, setDispatchedHospital] = useState(null);

  const handleInstantEmergency = async () => {
    const userLat = 37.7749;
    const userLng = -122.4194;

    let nearestHospital = null;
    let minDistance = Infinity;

    dbHospitals.forEach(h => {
      const dist = Math.sqrt(Math.pow(h.latitude - userLat, 2) + Math.pow(h.longitude - userLng, 2));
      const hasAmbulance = dbAmbulances.some(a => a.hospitalId === h.id && a.status === 'available');
      if (hasAmbulance && dist < minDistance) {
        minDistance = dist;
        nearestHospital = h;
      }
    });

    if (!nearestHospital) {
      dbHospitals.forEach(h => {
        const dist = Math.sqrt(Math.pow(h.latitude - userLat, 2) + Math.pow(h.longitude - userLng, 2));
        if (dist < minDistance) {
          minDistance = dist;
          nearestHospital = h;
        }
      });
    }

    if (!nearestHospital) {
      alert("No clinics or hospitals available.");
      return;
    }

    let activeUser = user;
    if (!activeUser) {
      try {
        activeUser = await login('patient@vitalnet.com', 'password123', 'patient');
      } catch (err) {
        console.error(err);
      }
    }

    const booking = await createBooking({
      patientId: activeUser?.id || 'u1',
      patientName: activeUser?.name || 'Patient',
      hospitalId: nearestHospital.id,
      hospitalName: nearestHospital.name,
      type: 'Ambulance',
      symptoms: 'INSTANT EMERGENCY BOOKING - AUTO ROUTED',
      severity: 'Critical'
    });

    setDispatchedHospital(nearestHospital);
    setShowSosModal(true);
  };

  const totalBeds = dbHospitals.reduce((acc, h) => acc + (h.resources?.beds || 0), 0);
  const totalVentilators = dbHospitals.reduce((acc, h) => acc + (h.resources?.ventilators || 0), 0);
  const activeDispatches = dbAmbulances.filter(a => a.status === 'in-transit' || a.status === 'busy').length;

  const features = [
    {
      icon: Compass,
      title: 'Real-time Search',
      desc: 'Find nearby hospitals with live counters for available general beds, ICU beds, and ventilators.'
    },
    {
      icon: Heart,
      title: 'Emergency Booking',
      desc: 'Secure critical care spaces (beds, ICU, ventilators) instantly with zero dispatch delays.'
    },
    {
      icon: Truck,
      title: 'Ambulance Tracking',
      desc: 'Dispatch fleet units with real-time coordinate updates and map route tracking.'
    },
    {
      icon: ShieldAlert,
      title: 'SOS Emergency Signal',
      desc: 'A single-click button to broadcast your coordinate details to dispatch nearest units.'
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen flex flex-col">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-medblue-50/50 via-white to-slate-50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Hero Content */}
          <div className="space-y-6 text-left">
            
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-none font-sans">
              Critical Care Booking <br />
              <span className="bg-gradient-to-r from-medblue-600 to-brand-500 bg-clip-text text-transparent">
                When Seconds Count
              </span>
            </h1>

            <p className="text-slate-500 text-base sm:text-lg max-w-lg leading-relaxed">
              VitalNet coordinates hospital beds, ICU ventilators, and ambulance dispatches in real-time, connecting patients to emergency response facilities instantly.
            </p>

            <div className="flex flex-wrap gap-4 pt-2">
              <button
                onClick={handleInstantEmergency}
                className="bg-gradient-to-tr from-red-700 to-red-500 hover:from-red-800 hover:to-red-600 text-white font-black px-6 py-3.5 rounded-2xl shadow-lg shadow-red-100 hover:shadow-xl hover-scale transition-all duration-300 flex items-center gap-2 animate-sos"
              >
                <ShieldAlert className="h-5 w-5 animate-pulse" />
                INSTANT SOS BOOKING
              </button>
              {user ? (
                <Link
                  to={user.role === 'patient' ? '/search' : user.role === 'hospital' ? '/hospital' : '/admin'}
                  className="bg-medblue-600 hover:bg-medblue-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-medblue-100 hover:shadow-xl hover-scale transition-all duration-300 flex items-center gap-2"
                >
                  Go to Dashboard <ArrowRight className="h-5 w-5" />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="bg-medblue-600 hover:bg-medblue-700 text-white font-bold px-6 py-3.5 rounded-2xl shadow-lg shadow-medblue-100 hover:shadow-xl hover-scale transition-all duration-300 flex items-center gap-2"
                  >
                    Register <ArrowRight className="h-5 w-5" />
                  </Link>
                  <Link
                    to="/login"
                    className="bg-white hover:bg-slate-50 text-slate-700 font-semibold px-6 py-3.5 rounded-2xl border border-slate-200 shadow-sm hover-scale transition-all"
                  >
                    Partner Login
                  </Link>
                </>
              )}
            </div>

            {/* Quick Stat Bar */}
            <div className="pt-6 border-t border-slate-100 grid grid-cols-3 gap-6">
              <div>
                <span className="block text-2xl font-black text-slate-800 font-sans">100%</span>
                <span className="text-xs text-slate-400 font-bold uppercase">Real-Time</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-800 font-sans">5s</span>
                <span className="text-xs text-slate-400 font-bold uppercase">SOS Trigger</span>
              </div>
              <div>
                <span className="block text-2xl font-black text-slate-800 font-sans">99.9%</span>
                <span className="text-xs text-slate-400 font-bold uppercase">Uptime Link</span>
              </div>
            </div>
          </div>

          {/* Hero Graphic / Interactive Visual */}
          <div className="relative flex justify-center items-center">
            {/* Ambient Background Glows */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-medblue-200/40 rounded-full blur-3xl filter -z-10"></div>
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-brand-200/30 rounded-full blur-3xl filter -z-10"></div>
            
            {/* Interactive Panel Mockup */}
            <div className="w-full max-w-md bg-white border border-slate-100 rounded-3xl p-6 shadow-xl relative animate-fade-in card-interactive">
              <div className="flex justify-between items-center pb-4 border-b border-slate-50 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-brand-500 animate-ping"></div>
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Live System Feed</span>
                </div>
              </div>

              {/* Live Beds Panel */}
              <div className="space-y-4">
                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover-scale transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-medblue-500 text-white p-2 rounded-xl">
                      <Activity className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">General Ward Beds</span>
                      <span className="text-[10px] text-slate-400 font-semibold">{dbHospitals.length} Clinics Online</span>
                    </div>
                  </div>
                  <span className="bg-brand-50 text-brand-700 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-brand-100">{totalBeds} Avail</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover-scale transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-amber-500 text-white p-2 rounded-xl">
                      <Heart className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">ICU Ventilator Units</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Ready for Dispatch</span>
                    </div>
                  </div>
                  <span className="bg-amber-50 text-amber-700 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-amber-100">{totalVentilators} Avail</span>
                </div>

                <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 hover-scale transition-all">
                  <div className="flex items-center gap-3">
                    <div className="bg-emergency-600 text-white p-2 rounded-xl">
                      <Truck className="h-4.5 w-4.5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-700 block">Active Dispatches</span>
                      <span className="text-[10px] text-slate-400 font-semibold">Fleet Responders</span>
                    </div>
                  </div>
                  <span className="bg-red-50 text-emergency-600 text-xs font-extrabold px-2.5 py-1 rounded-lg border border-red-100">{activeDispatches} Active</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-black text-slate-900 tracking-tight font-sans">Everything Needed to Coordinate Emergency Care</h2>
            <p className="text-slate-400 text-sm font-medium">Robust sync protocols built to coordinate dispatch systems and resource trackers instantly.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div key={idx} className="bg-slate-50 rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                  <div className="bg-medblue-500 text-white p-3 rounded-xl inline-block mb-4 shadow-md shadow-medblue-100">
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-slate-800 mb-2 tracking-tight">{feat.title}</h3>
                  <p className="text-slate-500 text-xs leading-relaxed font-medium">{feat.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {showSosModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-gradient-to-br from-red-700 to-red-500 text-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center space-y-6 relative border border-red-400/20 animate-scale-in">
            <div className="bg-white/10 border border-white/20 text-white p-4 rounded-full w-20 h-20 flex items-center justify-center mx-auto shadow-lg animate-pulse">
              <ShieldAlert className="h-10 w-10 text-white" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black tracking-tight uppercase">SOS ACTIVE</h2>
              <p className="text-red-100 text-sm font-semibold max-w-sm mx-auto leading-relaxed">
                Emergency dispatch initiated! An ambulance has been routed to your GPS location immediately.
              </p>
            </div>
            
            <div className="bg-white/10 border border-white/10 rounded-2xl p-4 text-left space-y-2">
              <div className="flex justify-between items-center text-xs font-bold text-red-100">
                <span>RESPONDER HOSPITAL:</span>
                <span className="text-white font-extrabold uppercase">{dispatchedHospital?.name}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-bold text-red-100">
                <span>DISPATCH STATUS:</span>
                <span className="bg-white/20 text-white px-2 py-0.5 rounded text-[10px] uppercase tracking-wider font-extrabold">IN TRANSIT</span>
              </div>
            </div>

            <button
              onClick={() => {
                setShowSosModal(false);
                navigate('/dashboard');
              }}
              className="w-full bg-white hover:bg-red-50 text-red-600 font-black py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
            >
              TRACK RESPONDER LIVE
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
