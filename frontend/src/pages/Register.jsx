import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, UserPlus, Heart, Loader2 } from 'lucide-react';
import './Register.css';

const TAMIL_NADU_DISTRICTS = [
  "Ariyalur", "Chengalpattu", "Chennai", "Coimbatore", "Cuddalore",
  "Dharmapuri", "Dindigul", "Erode", "Kallakurichi", "Kancheepuram",
  "Kanyakumari", "Karur", "Krishnagiri", "Madurai", "Mayiladuthurai",
  "Nagapattinam", "Namakkal", "Nilgiris", "Perambalur", "Pudukkottai",
  "Ramanathapuram", "Ranipet", "Salem", "Sivaganga", "Tenkasi",
  "Thanjavur", "Theni", "Thoothukudi", "Tiruchirappalli", "Tirunelveli",
  "Tirupathur", "Tiruppur", "Tiruvallur", "Tiruvannamalai", "Tiruvarur",
  "Vellore", "Viluppuram", "Virudhunagar"
];

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [role, setRole] = useState('patient'); // patient, hospital
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  
  // Hospital-only states
  const [beds, setBeds] = useState('10');
  const [icuBeds, setIcuBeds] = useState('2');
  const [ventilators, setVentilators] = useState('1');
  const [district, setDistrict] = useState('Chennai');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = {
        name,
        email,
        password,
        role,
        phone,
        address,
        beds: role === 'hospital' ? beds : undefined,
        icuBeds: role === 'hospital' ? icuBeds : undefined,
        ventilators: role === 'hospital' ? ventilators : undefined,
        district: role === 'hospital' ? district : undefined
      };
      
      const newUser = await register(data);
      if (newUser.role === 'hospital') {
        navigate('/hospital');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white border border-slate-100 rounded-3xl p-8 shadow-xl space-y-6 animate-fade-in card-interactive">
        
        {/* Header */}
        <div className="text-center">
          <Link to="/" className="inline-flex items-center gap-2 mb-4">
            <div className="bg-emergency-600 text-white p-2 rounded-xl">
              <Heart className="h-6 w-6" />
            </div>
            <span className="font-extrabold text-2xl tracking-tight text-slate-800 font-sans">
              Vital<span className="text-emergency-600">Net</span>
            </span>
          </Link>
          <h2 className="text-2xl font-black text-slate-900 font-sans tracking-tight">Create Account</h2>
          <p className="text-slate-400 text-xs font-semibold mt-1">
            Register as a Patient or Healthcare Provider
          </p>
        </div>

        {/* Role Toggle */}
        <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
          <button
            type="button"
            onClick={() => setRole('patient')}
            className={`py-2 text-xs font-bold rounded-xl transition-all capitalize ${
              role === 'patient'
                ? 'bg-white text-medblue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Patient Portal
          </button>
          <button
            type="button"
            onClick={() => setRole('hospital')}
            className={`py-2 text-xs font-bold rounded-xl transition-all capitalize ${
              role === 'hospital'
                ? 'bg-white text-medblue-600 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Hospital Provider
          </button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-100 text-emergency-700 text-xs font-semibold p-3.5 rounded-xl flex items-center gap-2">
            <ShieldAlert className="h-4.5 w-4.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Registration Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">
              {role === 'hospital' ? 'Hospital Name' : 'Full Name'}
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={role === 'hospital' ? 'e.g. City General Hospital' : 'e.g. Jane Doe'}
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@mail.com"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Phone Number</label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555-0100"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Physical Address</label>
            <input
              type="text"
              required
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="123 Care Street, City"
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
 
          {role === 'hospital' && (
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">District</label>
              <select
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
              >
                {TAMIL_NADU_DISTRICTS.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Conditional Hospital Resources */}
          {role === 'hospital' && (
            <div className="bg-slate-50 p-4 border border-slate-100 rounded-2xl space-y-3 register-provider-highlight">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Resource Capacities</span>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={beds}
                    onChange={(e) => setBeds(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-center outline-none input-interactive"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">ICU Beds</label>
                  <input
                    type="number"
                    min="0"
                    value={icuBeds}
                    onChange={(e) => setIcuBeds(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-center outline-none input-interactive"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 mb-1">Ventilators</label>
                  <input
                    type="number"
                    min="0"
                    value={ventilators}
                    onChange={(e) => setVentilators(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-center outline-none input-interactive"
                  />
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-medblue-600 hover:bg-medblue-700 text-white font-bold py-3.5 rounded-2xl shadow-lg shadow-medblue-100 hover:shadow-xl hover-scale transition-all duration-300 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <UserPlus className="h-5 w-5" />
                Register
              </>
            )}
          </button>
        </form>

        {/* Login Redirect */}
        <p className="text-center text-xs font-semibold text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="text-medblue-600 hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  );
}
