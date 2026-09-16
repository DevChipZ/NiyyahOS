import React, { useState, useEffect } from 'react';
import { useAppLogic } from './hooks';
import { TARGET_PRAYERS, formatTo12Hour, getPrayerDateObject, scheduleLocalNotifications } from './utils';

function App() {
  const { location, setLocation, prayers, loading, error, locationDenied } = useAppLogic();
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [cityInput, setCityInput] = useState('');

  useEffect(() => {
    if (!prayers) return;
    scheduleLocalNotifications(prayers);

    const interval = setInterval(() => {
      const now = new Date();
      let upcoming = null;
      let minDiff = Infinity;

      TARGET_PRAYERS.forEach((prayer) => {
        const timeStr = prayers[prayer].split(' ')[0];
        const prayerDate = getPrayerDateObject(timeStr);
        const diff = prayerDate.getTime() - now.getTime();

        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          upcoming = { name: prayer, time: diff };
        }
      });

      if (upcoming) {
        setNextPrayer(upcoming.name);
        const hours = Math.floor((upcoming.time / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((upcoming.time / 1000 / 60) % 60);
        const seconds = Math.floor((upcoming.time / 1000) % 60);
        
        // Pad single digits with a zero for a cleaner look
        const pad = (num) => String(num).padStart(2, '0');
        setCountdown(`${hours}h ${pad(minutes)}m ${pad(seconds)}s`);
      } else {
        setNextPrayer(null);
        setCountdown('');
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

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-500 font-medium tracking-widest uppercase">
        <div className="animate-pulse">Loading Niyyah...</div>
      </div>
    );
  }

  if (locationDenied && !location.city && !location.lat) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-6">
        <form onSubmit={handleCitySearch} className="bg-slate-900/50 backdrop-blur-xl p-8 rounded-3xl border border-white/10 w-full max-w-md shadow-2xl">
          <h2 className="text-2xl font-serif text-white mb-2">Welcome to Niyyah</h2>
          <p className="text-slate-400 text-sm mb-6">Please enter your city to calculate precise prayer times.</p>
          <input
            type="text"
            placeholder="e.g., London, Dubai, Toronto"
            className="w-full p-4 rounded-xl bg-black/50 border border-white/10 text-white mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all placeholder-slate-600"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit" className="w-full bg-emerald-600 text-white p-4 rounded-xl font-medium hover:bg-emerald-500 transition-colors shadow-[0_0_15px_rgba(5,150,105,0.3)]">
            Find Times
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black text-slate-200 font-sans pb-12 selection:bg-emerald-500/30">
      <header className="px-6 py-12 max-w-md mx-auto">
        <div className="flex justify-center items-center mb-10">
          <h1 className="text-4xl font-serif font-bold tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">
            Niyyah
          </h1>
        </div>

        {error && (
          <div className="p-4 mb-8 bg-red-500/10 border border-red-500/20 text-red-400 rounded-2xl text-sm text-center">
            {error}
          </div>
        )}

        {nextPrayer && (
          <div className="mb-12 flex flex-col items-center justify-center bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-teal-500"></div>
            <p className="text-emerald-400 text-sm font-semibold uppercase tracking-[0.2em] mb-3">Upcoming</p>
            <h2 className="text-5xl font-serif text-white mb-2">{nextPrayer}</h2>
            <p className="text-2xl font-light text-slate-300 font-mono tracking-wider">{countdown}</p>
          </div>
        )}

        <div className="space-y-4">
          {prayers && TARGET_PRAYERS.map((prayer) => {
            const timeStr = prayers[prayer].split(' ')[0];
            const isNext = nextPrayer === prayer;
            
            return (
              <div 
                key={prayer}
                className={`p-6 rounded-2xl flex justify-between items-center transition-all duration-300 backdrop-blur-sm ${
                  isNext 
                    ? 'bg-gradient-to-r from-emerald-900/40 to-teal-900/40 border border-emerald-500/50 shadow-[0_0_20px_rgba(16,185,129,0.15)] scale-[1.02]' 
                    : 'bg-white/5 border border-white/10 hover:bg-white/10'
                }`}
              >
                <span className={`text-xl font-serif ${isNext ? 'text-emerald-300 font-semibold' : 'text-slate-300'}`}>
                  {prayer}
                </span>
                <span className={`text-lg tracking-wider ${isNext ? 'text-white font-medium' : 'text-slate-400'}`}>
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
