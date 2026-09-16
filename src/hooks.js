import { useState, useEffect } from 'react';

const API_BASE = 'https://api.aladhan.com/v1/timingsByCity';
const API_GEO_BASE = 'https://api.aladhan.com/v1/timings';

export const useAppLogic = () => {
  const [location, setLocation] = useState({ lat: null, lng: null, city: '' });
  const [method, setMethod] = useState(() => localStorage.getItem('niyyah_method') || '3'); // 3 = MWL default
  const [prayers, setPrayers] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [locationDenied, setLocationDenied] = useState(false);

  // 1. Get Location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({ lat: position.coords.latitude, lng: position.coords.longitude, city: '' });
        },
        (err) => {
          console.warn('Geolocation denied or failed:', err);
          setLocationDenied(true);
          setLoading(false);
        }
      );
    } else {
      setLocationDenied(true);
      setLoading(false);
    }
  }, []);

  // 2. Fetch Prayers when location or method changes
  useEffect(() => {
    const fetchPrayers = async () => {
      if (!location.lat && !location.city) return;
      
      setLoading(true);
      setError(null);
      
      const dateStr = new Date().toLocaleDateString('en-GB').replace(/\//g, '-'); // DD-MM-YYYY
      let url = '';

      if (location.lat) {
        url = `${API_GEO_BASE}/${dateStr}?latitude=${location.lat}&longitude=${location.lng}&method=${method}`;
      } else if (location.city) {
        url = `${API_BASE}/${dateStr}?city=${location.city}&country=&method=${method}`;
      }

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.code === 200) {
          setPrayers(data.data.timings);
        } else {
          setError('Failed to fetch prayer times.');
        }
      } catch (err) {
        setError('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchPrayers();
    localStorage.setItem('niyyah_method', method);
  }, [location, method]);

  return { location, setLocation, method, setMethod, prayers, loading, error, locationDenied };
};
