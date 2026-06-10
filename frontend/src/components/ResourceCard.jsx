import React from 'react';
import { Activity } from 'lucide-react';

export default function ResourceCard({ title, count, max, icon: Icon, color = 'blue' }) {
  const colorMap = {
    blue: {
      bg: 'bg-medblue-50 border-medblue-100',
      text: 'text-medblue-700',
      iconBg: 'bg-medblue-500 text-white',
      badge: 'bg-medblue-100 text-medblue-800'
    },
    green: {
      bg: 'bg-brand-50 border-brand-100',
      text: 'text-brand-700',
      iconBg: 'bg-brand-500 text-white',
      badge: 'bg-brand-100 text-brand-800'
    },
    red: {
      bg: 'bg-red-50 border-red-100',
      text: 'text-red-700',
      iconBg: 'bg-red-500 text-white',
      badge: 'bg-red-100 text-red-800'
    }
  };

  const currentTheme = colorMap[color] || colorMap.blue;

  return (
    <div className={`p-5 rounded-2xl border ${currentTheme.bg} flex items-center justify-between shadow-sm`}>
      <div className="flex items-center gap-4">
        <div className={`p-3 rounded-xl ${currentTheme.iconBg}`}>
          <Icon className="h-6 w-6" />
        </div>
        <div>
          <span className="text-slate-500 text-xs font-bold uppercase tracking-wider block mb-0.5">{title}</span>
          <div className="flex items-baseline gap-1.5">
            <span className={`text-2xl font-black ${currentTheme.text}`}>{count}</span>
            {max !== undefined && <span className="text-slate-400 text-xs font-semibold">/ {max} available</span>}
          </div>
        </div>
      </div>
      <div className={`text-xs px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${currentTheme.badge}`}>
        {count > 0 ? 'Functional' : 'Depleted'}
      </div>
    </div>
  );
}
