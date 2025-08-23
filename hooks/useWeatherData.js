// hooks/useWeatherData.js
import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherWithTimeout } from '../utils/weatherUtils';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverTime, setServerTime] = useState(null);

  const fetchWeatherData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const controller = new AbortController();
      const data = await fetchWeatherWithTimeout(controller);
      
      setWeatherData(data);
      setServerTime(data.serverTime ? new Date(data.serverTime) : new Date());
      
    } catch (err) {
      console.error('Weather fetch error:', err);
      if (err.name === 'AbortError') {
        setError('Превышено время ожидания запроса');
      } else {
        setError(err.message || 'Ошибка загрузки данных');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  return {
    weatherData,
    loading,
    error,
    serverTime,
    refetch: fetchWeatherData
  };
};

export const useToggleState = (initialValue = null) => {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback((value) => {
    setState(prev => prev === value ? null : value);
  }, []);

  return [state, toggle];
};