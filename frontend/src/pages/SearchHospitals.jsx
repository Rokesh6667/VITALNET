import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import HospitalCard from '../components/HospitalCard';
import { Search, SlidersHorizontal, MapPin, Loader2 } from 'lucide-react';
import './SearchHospitals.css';

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

export default function SearchHospitals() {
  const { dbHospitals } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredHospitals, setFilteredHospitals] = useState([]);
  const [sortBy, setSortBy] = useState('distance'); // distance, beds, icuBeds, ventilators
  const [selectedDistrict, setSelectedDistrict] = useState('all');
  const [loading, setLoading] = useState(false);

  // Generate mock distances for demonstration
  const getHospitalsWithDistance = () => {
    return dbHospitals.map(h => ({
      ...h,
      distance: Math.random() * 5 + 0.5 // random distance between 0.5km and 5.5km
    }));
  };

  useEffect(() => {
    setLoading(true);
    const timer = setTimeout(() => {
      let result = getHospitalsWithDistance();
      
      // Filter by Search Term
      if (searchTerm.trim() !== '') {
        result = result.filter(h => 
          h.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          h.address.toLowerCase().includes(searchTerm.toLowerCase())
        );
      }

      // Filter by District
      if (selectedDistrict !== 'all') {
        result = result.filter(h => h.district === selectedDistrict);
      }

      // Sort
      result.sort((a, b) => {
        if (sortBy === 'distance') return a.distance - b.distance;
        if (sortBy === 'beds') return b.resources.beds - a.resources.beds;
        if (sortBy === 'icuBeds') return b.resources.icuBeds - a.resources.icuBeds;
        if (sortBy === 'ventilators') return b.resources.ventilators - a.resources.ventilators;
        return 0;
      });

      setFilteredHospitals(result);
      setLoading(false);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchTerm, sortBy, selectedDistrict, dbHospitals]);

  return (
    <div className="bg-slate-50 min-h-screen py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8 animate-fade-in">
        
        {/* Header */}
        <div className="text-left space-y-2">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight font-sans">Search Nearby Hospitals</h1>
          <p className="text-slate-400 text-sm font-semibold">
            Locate critical care clinics and view active beds, ICU beds, and ventilator capacities.
          </p>
        </div>

        {/* Filter Bar */}
        <div className="bg-white p-4 border border-slate-100 rounded-3xl shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md">
            <Search className="absolute left-4 top-3.5 h-4.5 w-4.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by hospital name or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-150 bg-slate-50 text-sm font-medium focus:bg-white focus:ring-2 focus:ring-medblue-500/20 focus:border-medblue-500 transition-all outline-none input-interactive"
            />
          </div>

          <div className="flex flex-wrap gap-4 items-center w-full md:w-auto">
            <div className="flex gap-2 items-center w-full md:w-auto">
              <SlidersHorizontal className="h-4.5 w-4.5 text-slate-400 shrink-0" />
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wide shrink-0">District</span>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                className="w-full md:w-44 bg-slate-50 border border-slate-150 text-slate-700 font-semibold px-4 py-3 rounded-2xl text-xs focus:bg-white focus:ring-2 focus:ring-medblue-500/20 outline-none input-interactive font-sans"
              >
                <option value="all">All Districts</option>
                {TAMIL_NADU_DISTRICTS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* List of Cards */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="h-10 w-10 text-medblue-600 animate-spin" />
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Syncing hospital database...</span>
          </div>
        ) : filteredHospitals.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredHospitals.map((hosp) => (
              <HospitalCard key={hosp.id} hospital={hosp} distance={hosp.distance} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-slate-100 rounded-3xl p-12 text-center shadow-sm">
            <MapPin className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="font-extrabold text-slate-800 text-lg">No Hospitals Found</h3>
            <p className="text-slate-400 text-xs font-medium mt-1">Try refining search parameters or sort options.</p>
          </div>
        )}
      </div>
    </div>
  );
}
