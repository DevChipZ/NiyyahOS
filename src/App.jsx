import React, { useState, useEffect } from 'react';
import { useAppLogic } from './hooks';
import { TARGET_PRAYERS, formatTo12Hour, getPrayerDateObject, scheduleLocalNotifications } from './utils';

function App() {
  const { location, setLocation, prayers, loading, error, locationDenied } = useAppLogic();
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [progress, setProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState('');

  useEffect(() => {
    if (!prayers) return;
    scheduleLocalNotifications(prayers);

    const interval = setInterval(() => {
      const now = new Date();
      
      // Update live clock
      setCurrentTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true }));

      let upcoming = null;
      let previous = null;
      let minDiff = Infinity;

      // Find upcoming and previous prayers for the progress bar
      TARGET_PRAYERS.forEach((prayer, index) => {
        const timeStr = prayers[prayer].split(' ')[0];
        const prayerDate = getPrayerDateObject(timeStr);
        const diff = prayerDate.getTime() - now.getTime();

        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          upcoming = { name: prayer, time: diff, date: prayerDate };
          
          if (index === 0) {
            const ishaStr = prayers['Isha'].split(' ')[0];
            const prevDate = getPrayerDateObject(ishaStr);
            prevDate.setDate(prevDate.getDate() - 1);
            previous = { date: prevDate };
          } else {
            const prevStr = prayers[TARGET_PRAYERS[index - 1]].split(' ')[0];
            previous = { date: getPrayerDateObject(prevStr) };
          }
        }
      });

      if (upcoming) {
        setNextPrayer(upcoming.name);
        
        // Calculate Countdown
        const hours = Math.floor((upcoming.time / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((upcoming.time / 1000 / 60) % 60);
        const seconds = Math.floor((upcoming.time / 1000) % 60);
        const pad = (num) => String(num).padStart(2, '0');
        setCountdown(`${hours}h ${pad(minutes)}m ${pad(seconds)}s`);

        // Calculate Timeline Progress (%)
        if (previous) {
          const totalDuration = upcoming.date.getTime() - previous.date.getTime();
          const elapsed = now.getTime() - previous.date.getTime();
          const percent = Math.min(Math.max((elapsed / totalDuration) * 100, 0), 100);
          setProgress(percent);
        }
      } else {
        setNextPrayer(null);
        setCountdown('');
        setProgress(0);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [prayers]);

  const handleCitySearch = (e) => {
    e.preventDefault();
    if (cityInput.trim()) {
      setLocation({ lat: null, lng: null, city: cityInput.trim() });
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-medium tracking-widest uppercase animate-pulse">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 font-sans pb-12 selection:bg-emerald-500/30">
      {/* Dynamic Background Mesh */}
      <div className="fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-black pointer-events-none"></div>

      <header className="px-5 py-8 max-w-md mx-auto relative z-10">
        {/* Top Navigation / Clock */}
        <div className="flex justify-between items-center mb-10 px-2">
          <h1 className="text-2xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Niyyah</h1>
          <div className="text-slate-400 font-mono text-sm px-3 py-1 bg-white/5 rounded-full border border-white/5 shadow-inner">
            {currentTime}
          </div>
        </div>

        {error && <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm text-center">{error}</div>}

        {/* Hero Card: Upcoming Prayer */}
        {nextPrayer && (
          <div className="mb-10 glass-panel rounded-3xl p-8 relative overflow-hidden group cursor-default">
            <div className="absolute top-0 left-0 w-full h-1 bg-slate-800/50">
              <div 
                className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-1000 ease-linear" 
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.3em] mb-4">Next Prayer</p>
            <h2 className="text-6xl font-serif text-white mb-4 text-glow">{nextPrayer}</h2>
            
            <div className="flex items-baseline space-x-2">
              <p className="text-3xl font-light text-slate-200 font-mono tracking-wider">{countdown}</p>
            </div>
          </div>
        )}

        {/* Interactive Prayer List */}
        <div className="space-y-3">
          {prayers && TARGET_PRAYERS.map((prayer) => {
            const timeStr = prayers[prayer].split(' ')[0];
            const isNext = nextPrayer === prayer;
            
            return (
              <div 
                key={prayer}
                className={`p-5 rounded-2xl flex justify-between items-center cursor-pointer group ${
                  isNext 
                    ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/40 box-glow scale-[1.02]' 
                    : 'glass-card hover:bg-white/10 hover:scale-[1.01]'
                }`}
              >
                <div className="flex items-center space-x-4">
                  {/* Glowing Dot for active prayer */}
                  <div className={`w-2 h-2 rounded-full transition-all duration-500 ${isNext ? 'bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)]' : 'bg-slate-700 group-hover:bg-slate-500'}`}></div>
                  <span className={`text-xl font-serif transition-colors ${isNext ? 'text-emerald-300 font-semibold' : 'text-slate-300 group-hover:text-white'}`}>
                    {prayer}
                  </span>
                </div>
                <span className={`text-lg tracking-wider transition-colors ${isNext ? 'text-white font-medium' : 'text-slate-500 group-hover:text-slate-300'}`}>
                  {formatTo12Hour(timeStr)}
                </span>
              </div>
            );
          })}
        </div>
      </header>
    </div>
  );
}

export default App;
