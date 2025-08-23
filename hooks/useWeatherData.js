// hooks/useWeatherData.js
import { useState, useEffect, useCallback } from 'react';
import { fetchWeatherWithTimeout } from '../utils/weatherUtils';

export const useWeatherData = () => {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [serverTime, setServerTime] = useState(null);
  const [lastFetchTime, setLastFetchTime] = useState(null);

  const fetchWeatherData = useCallback(async () => {
    // Проверяем, не слишком ли часто происходят запросы (минимум 10 секунд между запросами)
    if (lastFetchTime && Date.now() - lastFetchTime < 10000) {
      setError('Подождите 10 секунд между обновлениями');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setLastFetchTime(Date.now());
      
      const controller = new AbortController();
      const data = await fetchWeatherWithTimeout(controller);
      
      console.log('Полученные данные:', data); // Для отладки
      
      setWeatherData(data);
      // Используем готовую строку времени с сервера
      setServerTime(data.formattedTime);
      
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
  }, []); // Убираем lastFetchTime из зависимостей

  useEffect(() => {
    fetchWeatherData();
  }, [fetchWeatherData]);

  // Безопасный refetch с проверкой частоты
  const safeRefetch = useCallback(() => {
    if (lastFetchTime && Date.now() - lastFetchTime < 10000) {
      setError('Подождите 10 секунд между обновлениями');
      return;
    }
    
    // Сбрасываем ошибку перед новым запросом
    setError(null);
    fetchWeatherData();
  }, [fetchWeatherData, lastFetchTime]);

  return {
    weatherData,
    loading,
    error,
    serverTime,
    refetch: safeRefetch
  };
};

export const useToggleState = (initialValue = null) => {
  const [state, setState] = useState(initialValue);

  const toggle = useCallback((value) => {
    setState(prev => prev === value ? null : value);
  }, []);

  return [state, toggle];
};