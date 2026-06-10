import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, AlertTriangle, Shield, Volume2, VolumeX } from 'lucide-react';

export default function MapComponent({ 
  vehicleNo, 
  onTelemetryChange, 
  sirensActive = true,
  setSirensActive
}) {
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [traffic, setTraffic] = useState('medium'); // low, medium, heavy
  const [speedMultiplier, setSpeedMultiplier] = useState(1); // 1x, 2x, 5x
  const [progress, setProgress] = useState(0);
  const [soundActive, setSoundActive] = useState(false);

  // Audio Context for optional siren beep
  const audioCtxRef = useRef(null);
  const oscillatorRef = useRef(null);

  useEffect(() => {
    if (soundActive && isPlaying && progress < 100) {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const ctx = audioCtxRef.current;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Alternate frequencies for siren sound
      let toggle = true;
      const interval = setInterval(() => {
        if (!isPlaying || progress >= 100) return;
        
        try {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(toggle ? 650 : 850, ctx.currentTime);
          gain.gain.setValueAtTime(0.02, ctx.currentTime); // very low volume
          gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.35);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start();
          osc.stop(ctx.currentTime + 0.4);
          toggle = !toggle;
        } catch (e) {
          console.error(e);
        }
      }, 400);

      return () => clearInterval(interval);
    }
  }, [soundActive, isPlaying, progress]);

  // Handle progress reset
  const handleReset = () => {
    setProgress(0);
    setIsPlaying(true);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * 2;
    canvas.height = rect.height * 2;
    ctx.scale(2, 2);

    let animationFrameId;
    let currentProgress = progress;

    const pathPoints = [
      { x: 40, y: rect.height - 40, street: 'Oak Avenue (Residences)' }, 
      { x: 120, y: rect.height - 40, street: 'Oak Avenue' },
      { x: 120, y: rect.height - 130, street: 'Grand Parkway (Express)' },
      { x: 260, y: rect.height - 130, street: 'Grand Parkway (Express)' },
      { x: 260, y: 50, street: 'Medical Plaza Way' },
      { x: rect.width - 50, y: 50, street: 'Hospital Entrance' },
    ];

    const drawMap = () => {
      const w = rect.width;
      const h = rect.height;

      // Clear
      ctx.clearRect(0, 0, w, h);

      // Draw futuristic grid background
      ctx.strokeStyle = '#f1f5f9';
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 25) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 25) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }

      // Draw secondary background streets
      ctx.strokeStyle = '#e2e8f0';
      ctx.lineWidth = 3;
      
      // Grid of minor streets
      const minorStreets = [
        { s: {x: 40, y: 0}, e: {x: 40, y: h} },
        { s: {x: 200, y: 0}, e: {x: 200, y: h} },
        { s: {x: 320, y: 0}, e: {x: 320, y: h} },
        { s: {x: 0, y: 80}, e: {x: w, y: 80} },
        { s: {x: 0, y: 180}, e: {x: w, y: 180} },
      ];
      minorStreets.forEach(st => {
        ctx.beginPath();
        ctx.moveTo(st.s.x, st.s.y);
        ctx.lineTo(st.e.x, st.e.y);
        ctx.stroke();
      });

      // Draw Traffic Congestion Zones
      if (traffic === 'heavy' || traffic === 'medium') {
        ctx.fillStyle = traffic === 'heavy' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.12)';
        ctx.beginPath();
        ctx.arc(180, h - 130, 35, 0, 2 * Math.PI);
        ctx.fill();

        ctx.strokeStyle = traffic === 'heavy' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)';
        ctx.lineWidth = 1;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(180, h - 130, 35, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw Main Route Road (Backing)
      ctx.strokeStyle = '#cbd5e1';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let k = 1; k < pathPoints.length; k++) {
        ctx.lineTo(pathPoints[k].x, pathPoints[k].y);
      }
      ctx.stroke();

      // Main Route Road Lane Line
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let k = 1; k < pathPoints.length; k++) {
        ctx.lineTo(pathPoints[k].x, pathPoints[k].y);
      }
      ctx.stroke();

      // Inner dashed road divider
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 1;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(pathPoints[0].x, pathPoints[0].y);
      for (let k = 1; k < pathPoints.length; k++) {
        ctx.lineTo(pathPoints[k].x, pathPoints[k].y);
      }
      ctx.stroke();
      ctx.setLineDash([]);

      // Calculate ambulance position
      let ambX = pathPoints[0].x;
      let ambY = pathPoints[0].y;
      let angle = 0;
      let currentStreetName = pathPoints[0].street;

      const segments = [];
      let totalLen = 0;
      for (let s = 0; s < pathPoints.length - 1; s++) {
        const dx = pathPoints[s+1].x - pathPoints[s].x;
        const dy = pathPoints[s+1].y - pathPoints[s].y;
        const len = Math.sqrt(dx*dx + dy*dy);
        segments.push({ start: pathPoints[s], end: pathPoints[s+1], dx, dy, len });
        totalLen += len;
      }

      const targetLen = (currentProgress / 100) * totalLen;
      let accumulated = 0;
      for (let s = 0; s < segments.length; s++) {
        const seg = segments[s];
        if (accumulated + seg.len >= targetLen) {
          const ratio = (targetLen - accumulated) / seg.len;
          ambX = seg.start.x + seg.dx * ratio;
          ambY = seg.start.y + seg.dy * ratio;
          angle = Math.atan2(seg.dy, seg.dx);
          currentStreetName = seg.start.street;
          break;
        }
        accumulated += seg.len;
        if (s === segments.length - 1) {
          ambX = seg.end.x;
          ambY = seg.end.y;
          angle = Math.atan2(seg.dy, seg.dx);
          currentStreetName = seg.end.street;
        }
      }

      // Draw Patient Spot (Start Pin)
      ctx.fillStyle = '#ef4444';
      ctx.shadowColor = 'rgba(239, 68, 68, 0.4)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pathPoints[0].x, pathPoints[0].y, 9, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(pathPoints[0].x, pathPoints[0].y, 3.5, 0, 2 * Math.PI);
      ctx.fill();
      ctx.shadowBlur = 0;

      // Draw Hospital (End Pin)
      ctx.fillStyle = '#10b981';
      ctx.shadowColor = 'rgba(16, 185, 129, 0.4)';
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y, 11, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('H', pathPoints[pathPoints.length - 1].x, pathPoints[pathPoints.length - 1].y);
      ctx.shadowBlur = 0;

      // Draw Siren Light Rings around Ambulance
      if (sirensActive && currentProgress < 100) {
        const pulseCycle = (Date.now() / 120) % 2;
        ctx.strokeStyle = pulseCycle < 1 ? 'rgba(239, 68, 68, 0.6)' : 'rgba(59, 130, 246, 0.6)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(ambX, ambY, 18 + Math.sin(Date.now() / 80) * 3, 0, 2 * Math.PI);
        ctx.stroke();
      }

      // Draw Ambulance Custom Sprite
      ctx.save();
      ctx.translate(ambX, ambY);
      ctx.rotate(angle);

      // Chassis shadow
      ctx.fillStyle = 'rgba(15, 23, 42, 0.15)';
      ctx.fillRect(-13, -6, 26, 14);

      // White Body
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.roundRect(-12, -7, 24, 14, 4);
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#cbd5e1';
      ctx.stroke();

      // Red Stripe
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-8, -7, 16, 3);
      ctx.fillRect(-8, 4, 16, 3);

      // Red Cross on top
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-2, -5, 4, 10);
      ctx.fillRect(-5, -2, 10, 4);

      // Windshield
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(6, -5, 3, 10);

      // Siren lights on top
      if (sirensActive) {
        const lightToggle = (Date.now() / 150) % 2;
        ctx.fillStyle = lightToggle < 1 ? '#ef4444' : '#3b82f6';
        ctx.beginPath();
        ctx.arc(2, 0, 2.5, 0, 2 * Math.PI);
        ctx.fill();
      }

      ctx.restore();

      // Report telemetry updates up
      if (onTelemetryChange) {
        // base speeds fluctuate dynamically
        let baseSpeed = 45;
        if (traffic === 'low') baseSpeed = 58;
        if (traffic === 'heavy') baseSpeed = 14;

        const fluctuation = Math.sin(Date.now() / 1000) * 3;
        const currentSpeed = isPlaying && currentProgress < 100 ? Math.max(0, Math.round(baseSpeed + fluctuation)) : 0;
        const remainingDistance = Math.max(0, (5.2 * (100 - currentProgress) / 100)).toFixed(1);
        const etaMinutes = Math.max(0, Math.ceil((100 - currentProgress) * (traffic === 'heavy' ? 0.22 : traffic === 'medium' ? 0.12 : 0.07)));

        onTelemetryChange({
          progress: Math.floor(currentProgress),
          speed: currentSpeed,
          distance: remainingDistance,
          eta: etaMinutes,
          currentStreet: currentProgress >= 100 ? 'Arrived at Destination' : currentStreetName,
          traffic,
          isPlaying
        });
      }
    };

    const animate = () => {
      if (isPlaying && currentProgress < 100) {
        let step = 0.08;
        if (traffic === 'low') step = 0.16;
        if (traffic === 'heavy') step = 0.035;

        currentProgress = Math.min(100, currentProgress + step * speedMultiplier);
        setProgress(currentProgress);
      }
      
      drawMap();
      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, traffic, speedMultiplier, sirensActive, progress]);

  return (
    <div className="relative border border-slate-100 rounded-3xl overflow-hidden bg-slate-50 shadow-inner flex flex-col">
      {/* Top Hud Bar */}
      <div className="absolute top-4 left-4 z-10 bg-white/95 backdrop-blur-sm border border-slate-100 p-3.5 rounded-2xl shadow-md flex items-center gap-3">
        <span className="relative flex h-3 w-3">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${progress >= 100 ? 'bg-brand-500' : 'bg-red-500'}`}></span>
          <span className={`relative inline-flex rounded-full h-3 w-3 ${progress >= 100 ? 'bg-brand-500' : 'bg-red-500'}`}></span>
        </span>
        <div>
          <h4 className="font-extrabold text-slate-800 text-xs tracking-tight uppercase">
            {progress >= 100 ? 'Arrived at Destination' : 'Ambulance In-Transit'}
          </h4>
          <span className="text-[10px] text-slate-400 font-bold block">{vehicleNo || 'AMB-911'}</span>
        </div>
      </div>

      {/* Audio & Flash Controls top right */}
      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button
          onClick={() => setSoundActive(!soundActive)}
          className={`p-2.5 rounded-xl border backdrop-blur-sm shadow-md transition-all ${
            soundActive 
              ? 'bg-amber-500 border-amber-600 text-white animate-pulse' 
              : 'bg-white/90 border-slate-100 text-slate-500 hover:text-slate-700'
          }`}
          title="Toggle Siren Beep Sound"
        >
          {soundActive ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </button>

        <button
          onClick={() => setSirensActive(!sirensActive)}
          className={`p-2.5 rounded-xl border backdrop-blur-sm shadow-md transition-all ${
            sirensActive 
              ? 'bg-red-500 border-red-600 text-white animate-pulse' 
              : 'bg-white/90 border-slate-100 text-slate-500 hover:text-slate-700'
          }`}
          title="Toggle Siren Flashing"
        >
          <Shield className="h-4 w-4" />
        </button>
      </div>

      {/* Canvas */}
      <canvas ref={canvasRef} className="w-full h-80 block" />

      {/* Simulation Controls Footer Panel */}
      <div className="bg-white border-t border-slate-100 p-4 flex flex-wrap gap-4 items-center justify-between z-10">
        
        {/* Playback Controls */}
        <div className="flex items-center gap-2">
          {progress >= 100 ? (
            <button
              onClick={handleReset}
              className="bg-slate-800 hover:bg-slate-950 text-white font-bold p-2.5 rounded-xl flex items-center justify-center transition-all"
              title="Restart Simulation"
            >
              <RotateCcw className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="bg-slate-800 hover:bg-slate-950 text-white font-bold p-2.5 rounded-xl flex items-center justify-center transition-all"
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </button>
          )}

          {/* Speed Multiplier */}
          <div className="flex bg-slate-100 p-0.5 rounded-xl">
            {[1, 2, 5].map((mul) => (
              <button
                key={mul}
                onClick={() => setSpeedMultiplier(mul)}
                className={`px-2.5 py-1.5 rounded-lg text-[10px] font-black transition-all ${
                  speedMultiplier === mul
                    ? 'bg-white text-slate-800 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {mul}x
              </button>
            ))}
          </div>
        </div>

        {/* Traffic Density Selector */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
            <AlertTriangle className="h-3 w-3 text-amber-500" />
            Traffic
          </span>
          <div className="flex bg-slate-100 p-0.5 rounded-xl">
            {[
              { level: 'low', label: 'Low' },
              { level: 'medium', label: 'Med' },
              { level: 'heavy', label: 'Heavy' }
            ].map((t) => (
              <button
                key={t.level}
                onClick={() => setTraffic(t.level)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase transition-all ${
                  traffic === t.level
                    ? t.level === 'heavy'
                      ? 'bg-red-500 text-white shadow-sm'
                      : t.level === 'medium'
                        ? 'bg-amber-500 text-white shadow-sm'
                        : 'bg-brand-500 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

