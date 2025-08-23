// utils/weatherUtils.js
import { WEATHER_CODES, YANDEX_CONDITIONS, getWeatherIcon, getYandexIcon } from '../constants/weather';

// Теперь просто возвращаем готовую строку времени с сервера
export const formatUpdateTime = (formattedTime) => {
  return formattedTime || 'Неизвестно';
};

export const formatOpenMeteoData = (data, model) => {
  if (!data?.minutely_15) return null;

  const minutely = data.minutely_15;
  const times = minutely.time;
  
  if (!times || !Array.isArray(times)) return null;

  const formattedData = times.map((time, index) => ({
    time: new Date(time).toLocaleTimeString('ru-RU', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    temperature: minutely[`temperature_2m_${model}`]?.[index] ?? 'N/A',
    precipitation: minutely[`precipitation_${model}`]?.[index] ?? 0,
    precipitationProbability: minutely[`precipitation_probability_${model}`]?.[index] ?? null,
    weatherCode: minutely[`weather_code_${model}`]?.[index] ?? null
  }));

  const validTemps = formattedData
    .map(item => item.temperature)
    .filter(t => t !== 'N/A' && !isNaN(t));
  
  const tempRange = validTemps.length 
    ? `${Math.min(...validTemps).toFixed(1)}–${Math.max(...validTemps).toFixed(1)}°C` 
    : 'N/A';
  
  const hasPrecipitation = formattedData.some(item => item.precipitation > 0);
  const maxPrecipProbability = Math.max(...formattedData.map(item => item.precipitationProbability ?? 0));
  
  const precipText = model === 'ecmwf_aifs025_single' || maxPrecipProbability === null
    ? hasPrecipitation
      ? `Осадки: ${Math.max(...formattedData.map(item => item.precipitation))} мм`
      : 'Осадки: отсутствуют'
    : hasPrecipitation
    ? `Осадки: ${Math.max(...formattedData.map(item => item.precipitation))} мм`
    : maxPrecipProbability > 0
    ? `Осадки: отсутствуют, вероятность ${maxPrecipProbability}% к 19:30`
    : 'Осадки: отсутствуют';
  
  const conditions = [...new Set(formattedData
    .map(item => item.weatherCode)
    .filter(code => code !== null && code !== undefined))];
  
  const conditionText = conditions.length === 1
    ? `Условия: ${WEATHER_CODES[conditions[0]] || 'Неизвестно'}`
    : `Условия: от ${WEATHER_CODES[formattedData[0]?.weatherCode] || 'Неизвестно'} (19:00) до ${
        WEATHER_CODES[formattedData[formattedData.length - 1]?.weatherCode] || 'Неизвестно'
      } (19:45)`;

  return {
    compact: {
      temperature: tempRange,
      precipitation: precipText,
      condition: conditionText,
      icon: getWeatherIcon(formattedData[0]?.weatherCode)
    },
    detailed: formattedData
  };
};

export const formatYandexData = (data) => {
  if (!data?.forecasts?.[0]?.hours) return null;

  const hours = data.forecasts[0].hours;
  const hour19 = hours.find(h => h.hour === '19');
  const hour20 = hours.find(h => h.hour === '20');
  
  if (!hour19 && !hour20) return null;

  const formattedData = [hour19, hour20].filter(Boolean).map(hourData => ({
    time: `${hourData.hour}:00`,
    temperature: hourData.temp,
    condition: YANDEX_CONDITIONS[hourData.condition] || hourData.condition,
    precStrength: hourData.prec_strength || 0,
    precType: hourData.prec_type,
    precPeriod: hourData.prec_period,
    isThunder: hourData.is_thunder
  }));

  const temps = formattedData.map(item => item.temperature).filter(t => !isNaN(t));
  const tempRange = temps.length > 1 
    ? `${Math.min(...temps)}–${Math.max(...temps)}°C`
    : temps.length === 1
    ? `${temps[0]}°C`
    : 'N/A';
  
  const hasPrecipitation = formattedData.some(item => item.precStrength > 0);
  const precipText = hasPrecipitation 
    ? `Осадки: ${Math.max(...formattedData.map(item => item.precStrength))} мм/ч`
    : 'Осадки: отсутствуют';
  
  const conditions = [...new Set(formattedData.map(item => item.condition))];
  const conditionText = conditions.length === 1
    ? `Условия: ${conditions[0]}`
    : `Условия: ${conditions.join(', ')}`;

  return {
    compact: {
      temperature: tempRange,
      precipitation: precipText,
      condition: conditionText,
      icon: getYandexIcon(formattedData[0]?.condition)
    },
    detailed: formattedData
  };
};

export const fetchWeatherWithTimeout = async (controller) => {
  const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 секунд общий таймаут
  
  try {
    const response = await fetch('/api/weather', {
      signal: controller.signal,
      cache: 'no-store' // Принудительно не кэшировать на клиенте
    });
    
    clearTimeout(timeoutId);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.error);
    }
    
    return data;
  } catch (err) {
    clearTimeout(timeoutId);
    throw err;
  }
};