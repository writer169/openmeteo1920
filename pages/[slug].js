// pages/[slug].js
import { useState, useEffect } from 'react';
import Head from 'next/head';

const weatherCodes = {
  0: 'Clear sky',
  1: 'Mainly clear',
  2: 'Partly cloudy',
  3: 'Overcast',
  45: 'Fog',
  48: 'Depositing rime fog',
  51: 'Light drizzle',
  53: 'Moderate drizzle',
  55: 'Dense drizzle',
  56: 'Light freezing drizzle',
  57: 'Dense freezing drizzle',
  61: 'Slight rain',
  63: 'Moderate rain',
  65: 'Heavy rain',
  66: 'Light freezing rain',
  67: 'Heavy freezing rain',
  71: 'Slight snow fall',
  73: 'Moderate snow fall',
  75: 'Heavy snow fall',
  77: 'Snow grains',
  80: 'Slight rain showers',
  81: 'Moderate rain showers',
  82: 'Violent rain showers',
  85: 'Slight snow showers',
  86: 'Heavy snow showers',
  95: 'Thunderstorm',
  96: 'Thunderstorm with slight hail',
  99: 'Thunderstorm with heavy hail'
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

  const formatData = (data, model) => {
    const minutely = data.minutely_15;
    const time = minutely.time[0]; // First time point (19:00)
    
    return {
      time: new Date(time).toLocaleString('ru-RU'),
      temperature: minutely[`temperature_2m_${model}`] ? minutely[`temperature_2m_${model}`][0] : 'N/A',
      precipitationProbability: minutely[`precipitation_probability_${model}`] ? minutely[`precipitation_probability_${model}`][0] : null,
      precipitation: minutely[`precipitation_${model}`] ? minutely[`precipitation_${model}`][0] : 'N/A',
      weatherCode: minutely[`weather_code_${model}`] ? minutely[`weather_code_${model}`][0] : null,
    };
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

  const bestMatch = formatData(weatherData, 'best_match');
  const ecmwf = formatData(weatherData, 'ecmwf_aifs025_single');

  return (
    <>
      <Head>
        <title>Weather Forecast</title>
        <meta name="description" content="Weather forecast for Almaty" />
      </Head>
      
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-blue-500 to-blue-600 p-4">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-white text-center mb-8">
            Прогноз погоды на 19:00
          </h1>
          
          <div className="grid md:grid-cols-2 gap-6">
            {/* Best Match Model */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">{getWeatherIcon(bestMatch.weatherCode)}</span>
                Best Match Model
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Время:</span>
                  <span className="font-medium">{bestMatch.time}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Температура:</span>
                  <span className="font-bold text-2xl text-orange-500">
                    {bestMatch.temperature !== 'N/A' ? `${bestMatch.temperature}°C` : 'N/A'}
                  </span>
                </div>
                
                {bestMatch.precipitationProbability !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Вероятность осадков:</span>
                    <span className="font-medium text-blue-600">
                      {bestMatch.precipitationProbability}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Количество осадков:</span>
                  <span className="font-medium">
                    {bestMatch.precipitation !== 'N/A' ? `${bestMatch.precipitation} мм` : 'N/A'}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <span className="text-gray-600">Погода:</span>
                  <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                    <span className="font-medium text-blue-800">
                      {bestMatch.weatherCode ? weatherCodes[bestMatch.weatherCode] || 'Неизвестно' : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* ECMWF Model */}
            <div className="bg-white/90 backdrop-blur-sm rounded-xl p-6 shadow-lg">
              <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
                <span className="mr-2">{getWeatherIcon(ecmwf.weatherCode)}</span>
                ECMWF AIFS Model
              </h2>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Время:</span>
                  <span className="font-medium">{ecmwf.time}</span>
                </div>
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Температура:</span>
                  <span className="font-bold text-2xl text-orange-500">
                    {ecmwf.temperature !== 'N/A' ? `${ecmwf.temperature}°C` : 'N/A'}
                  </span>
                </div>
                
                {ecmwf.precipitationProbability !== null && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Вероятность осадков:</span>
                    <span className="font-medium text-blue-600">
                      {ecmwf.precipitationProbability}%
                    </span>
                  </div>
                )}
                
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Количество осадков:</span>
                  <span className="font-medium">
                    {ecmwf.precipitation !== 'N/A' ? `${ecmwf.precipitation} мм` : 'N/A'}
                  </span>
                </div>
                
                <div className="border-t pt-4">
                  <span className="text-gray-600">Погода:</span>
                  <div className="mt-2 p-3 bg-green-50 rounded-lg">
                    <span className="font-medium text-green-800">
                      {ecmwf.weatherCode ? weatherCodes[ecmwf.weatherCode] || 'Неизвестно' : 'N/A'}
                    </span>
                  </div>
                </div>
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
          
          <div className="mt-6 text-center text-white/80 text-sm">
            <p>Координаты: {weatherData.latitude}, {weatherData.longitude}</p>
            <p>Часовой пояс: {weatherData.timezone}</p>
          </div>
        </div>
      </div>
    </>
  );
}