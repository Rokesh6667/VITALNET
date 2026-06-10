import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, Heart, User, Activity, Loader2 } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // patient, hospital, admin
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const loggedUser = await login(email, password, role);
      if (loggedUser.role === 'admin') {
        navigate('/admin');
      } else if (loggedUser.role === 'hospital') {
        navigate('/hospital');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Kindly enter the valid email ID and password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = (selectedRole) => {
    setRole(selectedRole);
    if (selectedRole === 'patient') {
      setEmail('patient@vitalnet.com');
      setPassword('password123');
    } else if (selectedRole === 'hospital') {
      setEmail('hospital@vitalnet.com');
      setPassword('password123');
    } else if (selectedRole === 'admin') {
      setEmail('rokesh@vitalnet.com');
      setPassword('2006');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-fade-in card-interactive">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4 hover-scale">
            <div className="bg-emergency-600 text-white p-2 rounded-xl">
              <Heart className="h-6 w-6 animate-heartbeat" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800 font-sans">
              Vital<span className="text-emergency-600">Net</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">Welcome Back</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Access your secure portal panel
          </p>
        </div>

        {/* Role Tabs */}
        <div className="grid grid-cols-3 gap-2 bg-slate-100 p-1 rounded-2xl">
          {['patient', 'hospital', 'admin'].map((r) => (
            <button
              key={r}
              type="button"
              onClick={() => {
                setRole(r);
                setError('');
              }}
              className={`py-2 text-xs font-bold rounded-xl transition-all capitalize hover-scale ${
                role === r
                  ? 'bg-white text-medblue-600 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        {/* Demo Prefills */}
        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex flex-col items-center gap-2">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Demo Credentials</span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => handleDemoFill('patient')}
              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg hover:border-medblue-300 font-semibold hover-scale"
            >
              Patient
            </button>
            <button
              type="button"
              onClick={() => handleDemoFill('hospital')}
              className="text-[10px] bg-white border border-slate-200 text-slate-600 px-2.5 py-1 rounded-lg hover:border-medblue-300 font-semibold hover-scale"
            >
              Hospital
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-emergency-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2 animate-pulse">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Login Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. name@vitalnet.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-medblue-600 hover:bg-medblue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-medblue-100 hover:shadow-xl hover-scale transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <LogIn className="h-5 w-5" />
                Sign In
              </>
            )}
          </button>
        </form>

        {/* Register Redirect */}
        <p className="text-center text-xs font-semibold text-slate-400">
          Need a hospital or patient profile?{' '}
          <Link to="/register" className="text-medblue-600 hover:underline">
            Create account
          </Link>
        </p>
      </div>
    </div>
  );
}
