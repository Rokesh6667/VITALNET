import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-400 py-12 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-emergency-600 text-white p-1.5 rounded-lg">
                <Heart className="h-5 w-5" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white font-sans">
                Vital<span className="text-emergency-500">Net</span>
              </span>
            </div>
            <p className="text-sm text-slate-400 max-w-sm">
              Real-time healthcare emergency coordination. Booking medical resources, tracking ambulances, and synchronizing hospital availability to save lives.
            </p>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Services</h4>
            <ul className="space-y-2 text-sm">
              <li>Emergency Bed Booking</li>
              <li>ICU and Ventilator Tracking</li>
              <li>Ambulance Fleet Dispatch</li>
              <li>Predictive Occupancy Analytics</li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Contact</h4>
            <ul className="space-y-2 text-sm">
              <li>Support: support@vitalnet.com</li>
              <li>Hotline: +1 (800) VITAL-NET</li>
              <li>System Status: Active</li>
            </ul>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-8 flex flex-col sm:flex-row justify-between items-center text-xs">
          <p>&copy; {new Date().getFullYear()} VitalNet. All rights reserved.</p>
          <div className="flex gap-4 mt-4 sm:mt-0">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact Support</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
