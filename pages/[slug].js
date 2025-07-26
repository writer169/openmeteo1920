// pages/[slug].js
import { useState, useEffect } from 'react';
import Head from 'next/head';

const weatherCodes = {
  0: 'Ясное небо',
  1: 'В основном ясно',
  2: 'Переменная облачность',
  3: 'Пасмурно',
  45: 'Туман',
  48: 'Изморозь',
  51: 'Слабая морось',
  53: 'Умеренная морось',
  55: 'Густая морось',
  56: 'Слабая ледяная морось',
  57: 'Густая ледяная морось',
  61: 'Слабый дождь',
  63: 'Умеренный дождь',
  65: 'Сильный дождь',
  66: 'Слабый ледяной дождь',
  67: 'Сильный ледяной дождь',
  71: 'Слабый снег',
  73: 'Умеренный снег',
  75: 'Сильный снег',
  77: 'Снежная крупа',
  80: 'Слабые дождевые ливни',
  81: 'Умеренные дождевые ливни',
  82: 'Сильные дождевые ливни',
  85: 'Слабые снежные ливни',
  86: 'Сильные снежные ливни',
  95: 'Гроза',
  96: 'Гроза со слабым градом',
  99: 'Гроза с сильным градом'
};

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const expectedSlug = process.env.WEATHER_PAGE_SLUG;
  
  if (slug !== expectedSlug) {
    return {
      notFound: true,
    };
  }
  
  return {
    props: {},
  };
}

export default function WeatherPage() {
  const [weatherData, setWeatherData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('/api/weather');
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      setWeatherData(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const formatAllData = (data, model) => {
    const minutely = data.minutely_15;
    const times = minutely.time; // All four time points
    
    return times.map((time, index) => ({
      time: new Date(time).toLocaleTimeString('ru-RU', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      temperature: minutely[`temperature_2m_${model}`] ? minutely[`temperature_2m_${model}`][index] : 'N/A',
      precipitationProbability: minutely[`precipitation_probability_${model}`] ? minutely[`precipitation_probability_${model}`][index] : null,
      precipitation: minutely[`precipitation_${model}`] ? minutely[`precipitation_${model}`][index] : 'N/A',
      weatherCode: minutely[`weather_code_${model}`] ? minutely[`weather_code_${model}`][index] : null,
    }));
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return '☀️';
    if ([1, 2, 3].includes(code)) return '⛅';
    if ([45, 48].includes(code)) return '🌫️';
    if ([51, 53, 55, 56, 57].includes(code)) return '🌦️';
    if ([61, 63, 65, 66, 67].includes(code)) return '🌧️';
    if ([71, 73, 75, 77].includes(code)) return '❄️';
    if ([80, 81, 82].includes(code)) return '🌦️';
    if ([85, 86].includes(code)) return '🌨️';
    if ([95, 96, 99].includes(code)) return '⛈️';
    return '🌤️';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center">
        <div className="text-white text-2xl">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-red-100 flex items-center justify-center">
        <div className="text-red-800 text-2xl">Ошибка: {error}</div>
      </div>
    );
  }

  const bestMatchData = formatAllData(weatherData, 'best_match');
  const ecmwfData = formatAllData(weatherData, 'ecmwf_aifs025_single');

  return (
    <>
      <Head>
        <title>Weather Forecast</title>
        <meta name="description" content="Weather forecast for Almaty" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Прогноз погоды на вечер
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Best Match Model */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">{getWeatherIcon(bestMatchData[0]?.weatherCode)}</span>
                Best Match Model
              </h2>
              
              <div className="space-y-6">
                {bestMatchData.map((dataPoint, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-700">{dataPoint.time}</span>
                      <span className="text-2xl">{getWeatherIcon(dataPoint.weatherCode)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Температура:</span>
                        <span className="font-bold text-orange-500">
                          {dataPoint.temperature !== 'N/A' ? `${dataPoint.temperature}°C` : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Осадки:</span>
                        <span className="font-medium">
                          {dataPoint.precipitation !== 'N/A' ? `${dataPoint.precipitation} мм` : 'N/A'}
                        </span>
                      </div>
                      
                      {dataPoint.precipitationProbability !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Вероятность:</span>
                          <span className="font-medium text-blue-600">
                            {dataPoint.precipitationProbability}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <span className="font-medium text-blue-800 text-sm">
                          {dataPoint.weatherCode ? weatherCodes[dataPoint.weatherCode] || 'Неизвестно' : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* ECMWF Model */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">{getWeatherIcon(ecmwfData[0]?.weatherCode)}</span>
                ECMWF AIFS Model
              </h2>
              
              <div className="space-y-6">
                {ecmwfData.map((dataPoint, index) => (
                  <div key={index} className="border-b border-gray-200 pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-semibold text-gray-700">{dataPoint.time}</span>
                      <span className="text-2xl">{getWeatherIcon(dataPoint.weatherCode)}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex justify-between">
                        <span className="text-gray-600">Температура:</span>
                        <span className="font-bold text-orange-500">
                          {dataPoint.temperature !== 'N/A' ? `${dataPoint.temperature}°C` : 'N/A'}
                        </span>
                      </div>
                      
                      <div className="flex justify-between">
                        <span className="text-gray-600">Осадки:</span>
                        <span className="font-medium">
                          {dataPoint.precipitation !== 'N/A' ? `${dataPoint.precipitation} мм` : 'N/A'}
                        </span>
                      </div>
                      
                      {dataPoint.precipitationProbability !== null && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">Вероятность:</span>
                          <span className="font-medium text-blue-600">
                            {dataPoint.precipitationProbability}%
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="mt-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <span className="font-medium text-green-800 text-sm">
                          {dataPoint.weatherCode ? weatherCodes[dataPoint.weatherCode] || 'Неизвестно' : 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 text-center">
            <button 
              onClick={fetchWeatherData}
              className="bg-white/20 hover:bg-white/30 text-white font-medium py-2 px-6 rounded-lg transition-colors duration-200"
            >
              Обновить данные
            </button>
          </div>
        </div>
      </div>
    </>
  );
}