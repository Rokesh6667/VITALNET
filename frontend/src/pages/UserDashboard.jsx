import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ShieldAlert, Heart, Calendar, MapPin, Truck, Phone, Navigation, Loader2, CheckCircle2, CreditCard, X } from 'lucide-react';
import AmbulanceCard from '../components/AmbulanceCard';
import './UserDashboard.css';

export default function UserDashboard() {
  const { user, dbBookings, dbAmbulances, createBooking, updateBookingStatus } = useAuth();
  const navigate = useNavigate();
  const [sosLoading, setSosLoading] = useState(false);
  const [sosTriggered, setSosTriggered] = useState(false);

  // Payment states
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [cardNumber, setCardNumber] = useState('4111 2222 3333 4444');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvv, setCardCvv] = useState('123');
  const [paymentLoading, setPaymentLoading] = useState(false);

  // Filter bookings for this patient
  const patientBookings = dbBookings.filter(b => b.patientId === user?.id || b.patientId === 'u1');

  const handleSOSTrigger = () => {
    setSosLoading(true);
    setTimeout(() => {
      // Create a critical SOS Booking
      createBooking({
        hospitalId: 'h1',
        hospitalName: 'City General Hospital',
        type: 'Ambulance',
        symptoms: 'CRITICAL EMERGENCY - SOS TRIGGERED',
        status: 'approved',
        severity: 'Critical',
        ambulanceId: 'a2' // Sarah Jenkins unit
      });
      setSosLoading(false);
      setSosTriggered(true);
      setTimeout(() => setSosTriggered(false), 5000); // clear banner after 5s
    }, 2000);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Banner Alert for SOS */}
        {sosTriggered && (
          <div className="bg-emergency-600 text-white rounded-2xl p-4 shadow-xl flex items-center justify-between animate-bounce-slow">
            <div className="flex items-center gap-3">
              <ShieldAlert className="h-6 w-6 shrink-0 text-white" />
              <div>
                <span className="font-extrabold text-sm uppercase block tracking-wider">SOS Signal Dispatched</span>
                <span className="text-xs text-red-100 font-medium">Nearest ambulance (AMB-2026-B) has been routed to your GPS location!</span>
              </div>
            </div>
            <button
              onClick={() => navigate('/tracking')}
              className="bg-white text-emergency-600 font-bold px-4 py-2 rounded-xl text-xs shadow-md"
            >
              Track Live
            </button>
          </div>
        )}

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Left Column: Profile details & SOS Button */}
          <div className="space-y-6 lg:col-span-1">
            {/* Profile Card */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-medblue-500 text-white p-3 rounded-2xl">
                  <Heart className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-800 leading-tight text-lg">{user?.name || 'John Doe'}</h3>
                  <span className="text-[10px] bg-slate-100 text-slate-500 font-bold uppercase tracking-wider px-2 py-0.5 rounded-full mt-1 inline-block">
                    {user?.role || 'Patient'}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5 pt-4 border-t border-slate-50 text-xs font-semibold text-slate-500">
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Contact</span>
                  <span className="text-slate-700">{user?.phone || '+1 555-0199'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Email</span>
                  <span className="text-slate-700">{user?.email || 'patient@vitalnet.com'}</span>
                </div>
                <div>
                  <span className="block text-[10px] uppercase text-slate-400 font-bold mb-0.5">Home GPS Registry</span>
                  <span className="text-slate-700">{user?.address || '742 Evergreen Terrace'}</span>
                </div>
              </div>
            </div>

            {/* Premium SOS Trigger Card */}
            <div className="bg-gradient-to-tr from-red-700 to-red-500 rounded-3xl p-6 shadow-xl text-center text-white space-y-4">
              <ShieldAlert className="h-10 w-10 text-white mx-auto animate-pulse" />
              <div>
                <h3 className="font-extrabold text-lg leading-tight">EMERGENCY SOS</h3>
                <p className="text-red-100 text-xs mt-1">
                  Broadcasting your location dispatching nearest response vehicle.
                </p>
              </div>

              <button
                onClick={handleSOSTrigger}
                disabled={sosLoading}
                className="w-full bg-white text-emergency-600 font-black py-4 rounded-2xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 animate-sos flex items-center justify-center gap-2"
              >
                {sosLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  'TRIGGER SOS NOW'
                )}
              </button>
            </div>
          </div>

          {/* Right Columns: Bookings Logs & Actions */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Quick action cards */}
            <div className="grid grid-cols-2 gap-4">
              <Link
                to="/search"
                className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Find Hospital Ward</h4>
                  <p className="text-slate-400 text-xs mt-1">Check bed and ventilator availability logs.</p>
                </div>
                <span className="text-medblue-600 font-bold text-xs mt-4 hover:underline flex items-center gap-1">
                  Search Clinics &rarr;
                </span>
              </Link>

              <Link
                to="/ambulance-booking"
                className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <h4 className="font-bold text-slate-800 text-sm">Request Transport</h4>
                  <p className="text-slate-400 text-xs mt-1">Book an emergency ambulance to your house.</p>
                </div>
                <span className="text-medblue-600 font-bold text-xs mt-4 hover:underline flex items-center gap-1">
                  Dispatch Unit &rarr;
                </span>
              </Link>
            </div>

            {/* Booking History Logs */}
            <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-black text-slate-800 text-lg mb-6 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-medblue-600" />
                Active Bookings & History
              </h3>

              {patientBookings.length > 0 ? (
                <div className="divide-y divide-slate-100">
                  {patientBookings.map((booking) => {
                    // Find corresponding ambulance if any
                    const ambulance = dbAmbulances.find(a => a.id === booking.ambulanceId);

                    return (
                      <div key={booking.id} className="py-4 first:pt-0 last:pb-0 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <div className="flex items-center gap-2.5">
                            <span className="font-bold text-sm text-slate-800">{booking.hospitalName}</span>
                            <span className="bg-slate-100 text-slate-600 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                              {booking.type}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-semibold block mt-1">Booked: {booking.createdAt}</span>
                          
                          {booking.type === 'Ambulance' && ambulance && (
                            <div className="mt-2 flex items-center gap-2 bg-slate-50 border border-slate-100 px-3 py-1.5 rounded-xl">
                              <Truck className="h-3.5 w-3.5 text-emergency-500" />
                              <span className="text-[11px] text-slate-600 font-semibold">
                                Dispatch: {ambulance.vehicleNo} ({ambulance.status})
                              </span>
                              {ambulance.status === 'in-transit' && (
                                <button
                                  onClick={() => navigate('/tracking', { state: { ambulance } })}
                                  className="text-[10px] text-medblue-600 font-extrabold hover:underline ml-2"
                                >
                                  Track Live Map
                                </button>
                              )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {booking.status === 'payment-pending' && (
                            <button
                              onClick={() => {
                                setSelectedBooking(booking);
                                setShowPaymentModal(true);
                              }}
                              className="bg-purple-600 hover:bg-purple-700 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-xl shadow-md transition-all hover-scale"
                            >
                              Proceed to Payment
                            </button>
                          )}
                          <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border ${
                            booking.status === 'approved'
                              ? 'bg-brand-50 text-brand-700 border-brand-100'
                              : booking.status === 'payment-pending'
                                ? 'bg-purple-50 text-purple-700 border-purple-100'
                                : 'bg-amber-50 text-amber-700 border-amber-100'
                          }`}>
                            {booking.status === 'approved'
                              ? 'Approved'
                              : booking.status === 'payment-pending'
                                ? 'Awaiting Payment'
                                : 'Status Pending'}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-slate-400 text-xs font-semibold">No bookings registered yet.</p>
                </div>
              )}
            </div>

          </div>

        </div>

      </div>

      {showPaymentModal && selectedBooking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-6 relative border border-slate-100 animate-scale-in card-interactive font-sans">
            
            {/* Close Button */}
            <button
              onClick={() => setShowPaymentModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="text-center space-y-2">
              <div className="bg-purple-50 border border-purple-100 text-purple-600 p-3 rounded-full w-14 h-14 flex items-center justify-center mx-auto shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Complete Booking Payment</h3>
              <p className="text-slate-400 text-xs font-semibold max-w-xs mx-auto">
                Secure your emergency ward slot or ambulance unit reservation.
              </p>
            </div>

            {/* Billing Summary */}
            <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 space-y-2.5 text-slate-700">
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">FACILITY:</span>
                <span className="text-slate-800 font-bold">{selectedBooking.hospitalName}</span>
              </div>
              <div className="flex justify-between items-center text-xs font-semibold">
                <span className="text-slate-400">RESOURCE TYPE:</span>
                <span className="bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[9px] font-bold uppercase">{selectedBooking.type}</span>
              </div>
              <div className="border-t border-slate-200 pt-2.5 flex justify-between items-center text-xs font-extrabold text-slate-800">
                <span>BOOKING FEE:</span>
                <span className="text-purple-600">₹500.00</span>
              </div>
            </div>

            {/* Mock Payment Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                setPaymentLoading(true);
                setTimeout(() => {
                  updateBookingStatus(selectedBooking.id, 'approved');
                  setPaymentLoading(false);
                  setShowPaymentModal(false);
                  alert("Payment Successful! Your reservation is fully approved and confirmed.");
                }, 1800);
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Card Number</label>
                <input
                  type="text"
                  required
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  placeholder="4111 2222 3333 4444"
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none input-interactive"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="text"
                    required
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    placeholder="MM/YY"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none text-center input-interactive"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">CVV</label>
                  <input
                    type="password"
                    required
                    maxLength="3"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    placeholder="•••"
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-xs font-semibold outline-none text-center input-interactive"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={paymentLoading}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3.5 rounded-xl text-xs uppercase tracking-wider transition-all hover-scale flex items-center justify-center gap-2"
              >
                {paymentLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing Payment...
                  </>
                ) : (
                  'Pay & Confirm Booking'
                )}
              </button>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}
