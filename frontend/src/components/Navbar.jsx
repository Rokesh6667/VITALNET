import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Heart, Menu, X, LogOut, User, Activity, ShieldAlert, Navigation } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getDashboardPath = () => {
    if (!user) return '/';
    if (user.role === 'admin') return '/admin';
    if (user.role === 'hospital') return '/hospital';
    return '/dashboard';
  };

  return (
    <nav className="sticky top-0 z-50 glassmorphism shadow-sm border-b border-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo and Brand */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2 group">
              <div className="bg-gradient-to-tr from-emergency-600 to-red-500 text-white p-2 rounded-xl shadow-md group-hover:scale-105 transition-transform duration-300">
                <Heart className="h-6 w-6 animate-pulse-slow" />
              </div>
              <span className="font-extrabold text-2xl tracking-tight bg-gradient-to-r from-slate-900 to-medblue-700 bg-clip-text text-transparent font-sans">
                Vital<span className="text-emergency-600">Net</span>
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-slate-600 hover:text-medblue-600 font-medium transition-colors">
              Home
            </Link>
            {user && user.role === 'patient' && (
              <>
                <Link to="/search" className="text-slate-600 hover:text-medblue-600 font-medium transition-colors">
                  Search Hospitals
                </Link>
                <Link to="/ambulance-booking" className="text-slate-600 hover:text-medblue-600 font-medium transition-colors">
                  Ambulance Dispatch
                </Link>
              </>
            )}

            {user ? (
              <div className="flex items-center gap-4">
                <Link
                  to={getDashboardPath()}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-medblue-50 text-medblue-600 hover:bg-medblue-100 font-semibold transition-all duration-300"
                >
                  <Activity className="h-4 w-4" />
                  Dashboard
                </Link>
                <div className="flex items-center gap-2 text-slate-700 border-l border-slate-200 pl-4">
                  <div className="bg-slate-100 p-1.5 rounded-full">
                    <User className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="text-sm font-semibold max-w-[120px] truncate">{user.name}</span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1.5 text-slate-500 hover:text-emergency-600 transition-colors py-2 px-3 rounded-lg"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="text-sm font-medium">Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="text-slate-700 hover:text-medblue-600 font-semibold transition-colors px-3 py-2"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="bg-medblue-600 text-white font-semibold px-4 py-2 rounded-xl hover:bg-medblue-700 shadow-md shadow-medblue-100 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-slate-600 hover:text-slate-900 focus:outline-none p-2 rounded-lg"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-b border-slate-100 px-4 pt-2 pb-4 space-y-3">
          <Link
            to="/"
            onClick={() => setIsOpen(false)}
            className="block text-slate-600 hover:text-medblue-600 font-medium py-2 border-b border-slate-50"
          >
            Home
          </Link>
          {user && user.role === 'patient' && (
            <>
              <Link
                to="/search"
                onClick={() => setIsOpen(false)}
                className="block text-slate-600 hover:text-medblue-600 font-medium py-2 border-b border-slate-50"
              >
                Search Hospitals
              </Link>
              <Link
                to="/ambulance-booking"
                onClick={() => setIsOpen(false)}
                className="block text-slate-600 hover:text-medblue-600 font-medium py-2 border-b border-slate-50"
              >
                Ambulance Dispatch
              </Link>
            </>
          )}

          {user ? (
            <div className="pt-2">
              <div className="flex items-center gap-2 mb-3 px-2">
                <User className="h-5 w-5 text-slate-400" />
                <span className="font-semibold text-slate-800">{user.name}</span>
              </div>
              <Link
                to={getDashboardPath()}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-2 w-full text-center bg-medblue-600 text-white font-semibold py-2.5 rounded-xl justify-center shadow-md mb-2"
              >
                <Activity className="h-4 w-4" />
                Go to Dashboard
              </Link>
              <button
                onClick={() => {
                  setIsOpen(false);
                  handleLogout();
                }}
                className="flex items-center gap-2 w-full text-center border border-slate-200 text-slate-600 font-medium py-2.5 rounded-xl justify-center"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 pt-2">
              <Link
                to="/login"
                onClick={() => setIsOpen(false)}
                className="text-center text-slate-700 hover:text-medblue-600 font-semibold border border-slate-200 py-2.5 rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsOpen(false)}
                className="text-center bg-medblue-600 text-white font-semibold py-2.5 rounded-xl"
              >
                Register
              </Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
