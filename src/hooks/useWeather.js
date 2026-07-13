import { useQuery } from '@tanstack/react-query';
import { useMatchDayStore } from '../store/useMatchDayStore';
import { useEffect } from 'react';

export const useWeather = () => {
  const { userLocation, setUserLocation } = useMatchDayStore();

  // Fetch user location when hook initializes
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lon: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting user location:', error);
          // Fallback to stadium coordinates if no user location
          setUserLocation({ lat: 40.8135, lon: -74.0745 });
        }
      );
    } else {
      // Fallback if browser doesn't support geolocation
      setUserLocation({ lat: 40.8135, lon: -74.0745 });
    }
  }, [setUserLocation]);

  return useQuery({
    queryKey: ['weather', userLocation?.lat, userLocation?.lon],
    queryFn: async () => {
      if (!userLocation) return null;
      const res = await fetch(`http://localhost:3001/api/weather?lat=${userLocation.lat}&lon=${userLocation.lon}`);
      if (!res.ok) throw new Error('Failed to fetch weather');
      const data = await res.json();
      return data.data;
    },
    enabled: !!userLocation,
    refetchInterval: 60000 // Refresh every 60 seconds
  });
};
