import React, { useState, useEffect } from 'react';
import { useAppLogic } from './hooks';
import { TARGET_PRAYERS, formatTo12Hour, getPrayerDateObject, scheduleLocalNotifications } from './utils';

const CALCULATION_METHODS = [
  { id: '3', name: 'Muslim World League' },
  { id: '2', name: 'ISNA' },
  { id: '4', name: 'Umm al-Qura' },
  { id: '1', name: 'Karachi' },
  { id: '5', name: 'Egyptian' },
];

function App() {
  const { location, setLocation, method, setMethod, prayers, loading, error, locationDenied } = useAppLogic();
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [cityInput, setCityInput] = useState('');

  // Determine next prayer and update countdown
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
        setCountdown(`${hours}h ${minutes}m`);
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
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500 font-medium">Loading Niyyah...</div>;
  }

  if (locationDenied && !location.city && !location.lat) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <form onSubmit={handleCitySearch} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 w-full max-w-md">
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Location Required</h2>
          <p className="text-stone-500 text-sm mb-4">Please enter your city to calculate prayer times.</p>
          <input
            type="text"
            placeholder="e.g., London, Dubai, Toronto"
            className="w-full p-3 rounded-lg border border-stone-200 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit" className="w-full bg-stone-800 text-white p-3 rounded-lg font-medium hover:bg-stone-900 transition-colors">
            Find Times
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-12">
      <header className="px-6 py-8 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Niyyah</h1>
          
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className="bg-transparent text-sm font-medium text-stone-500 focus:outline-none cursor-pointer"
          >
            {CALCULATION_METHODS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

        {nextPrayer && (
          <div className="mb-8">
            <p className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-1">Upcoming</p>
            <h2 className="text-3xl font-semibold text-emerald-700">
              {nextPrayer} in {countdown}
            </h2>
          </div>
        )}

        <div className="space-y-3">
          {prayers && TARGET_PRAYERS.map((prayer) => {
            const timeStr = prayers[prayer].split(' ')[0];
            const isNext = nextPrayer === prayer;
            
            return (
              <div 
                key={prayer}
                className={`p-5 rounded-2xl flex justify-between items-center transition-all ${
                  isNext 
                    ? 'bg-emerald-50 border border-emerald-100 shadow-sm' 
                    : 'bg-white border border-stone-100 hover:border-stone-200'
                }`}
              >
                <span className={`text-lg font-medium ${isNext ? 'text-emerald-800' : 'text-stone-700'}`}>
                  {prayer}
                </span>
                <span className={`text-lg tracking-wide ${isNext ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
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

export default App;import React, { useState, useEffect } from 'react';
import { useAppLogic } from './hooks';
import { TARGET_PRAYERS, formatTo12Hour, getPrayerDateObject, scheduleLocalNotifications } from './utils';

const CALCULATION_METHODS = [
  { id: '3', name: 'Muslim World League' },
  { id: '2', name: 'ISNA' },
  { id: '4', name: 'Umm al-Qura' },
  { id: '1', name: 'Karachi' },
  { id: '5', name: 'Egyptian' },
];

function App() {
  const { location, setLocation, method, setMethod, prayers, loading, error, locationDenied } = useAppLogic();
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState('');
  const [cityInput, setCityInput] = useState('');

  // Determine next prayer and update countdown
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
        setCountdown(`${hours}h ${minutes}m`);
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
    return <div className="min-h-screen bg-stone-50 flex items-center justify-center text-stone-500 font-medium">Loading Niyyah...</div>;
  }

  if (locationDenied && !location.city && !location.lat) {
    return (
      <div className="min-h-screen bg-stone-50 flex items-center justify-center p-6">
        <form onSubmit={handleCitySearch} className="bg-white p-6 rounded-2xl shadow-sm border border-stone-100 w-full max-w-md">
          <h2 className="text-xl font-semibold text-stone-800 mb-2">Location Required</h2>
          <p className="text-stone-500 text-sm mb-4">Please enter your city to calculate prayer times.</p>
          <input
            type="text"
            placeholder="e.g., London, Dubai, Toronto"
            className="w-full p-3 rounded-lg border border-stone-200 mb-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
            value={cityInput}
            onChange={(e) => setCityInput(e.target.value)}
          />
          <button type="submit" className="w-full bg-stone-800 text-white p-3 rounded-lg font-medium hover:bg-stone-900 transition-colors">
            Find Times
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-12">
      <header className="px-6 py-8 max-w-md mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold tracking-tight text-stone-900">Niyyah</h1>
          
          <select 
            value={method} 
            onChange={(e) => setMethod(e.target.value)}
            className="bg-transparent text-sm font-medium text-stone-500 focus:outline-none cursor-pointer"
          >
            {CALCULATION_METHODS.map(m => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
        </div>

        {error && <div className="p-4 mb-6 bg-red-50 text-red-600 rounded-xl text-sm">{error}</div>}

        {nextPrayer && (
          <div className="mb-8">
            <p className="text-stone-500 text-sm font-medium uppercase tracking-wider mb-1">Upcoming</p>
            <h2 className="text-3xl font-semibold text-emerald-700">
              {nextPrayer} in {countdown}
            </h2>
          </div>
        )}

        <div className="space-y-3">
          {prayers && TARGET_PRAYERS.map((prayer) => {
            const timeStr = prayers[prayer].split(' ')[0];
            const isNext = nextPrayer === prayer;
            
            return (
              <div 
                key={prayer}
                className={`p-5 rounded-2xl flex justify-between items-center transition-all ${
                  isNext 
                    ? 'bg-emerald-50 border border-emerald-100 shadow-sm' 
                    : 'bg-white border border-stone-100 hover:border-stone-200'
                }`}
              >
                <span className={`text-lg font-medium ${isNext ? 'text-emerald-800' : 'text-stone-700'}`}>
                  {prayer}
                </span>
                <span className={`text-lg tracking-wide ${isNext ? 'text-emerald-700 font-semibold' : 'text-stone-500'}`}>
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
