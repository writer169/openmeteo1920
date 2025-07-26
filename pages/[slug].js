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
    return { notFound: true };
  }

  return { props: {} };
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
      setLoading(true);
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

  const formatWeatherData = (data, model) => {
    const minutely = data.minutely_15;
    const times = minutely.time;
    const formattedData = times.map((time, index) => ({
      time: new Date(time).toLocaleTimeString('ru-RU', {
        hour: '2-digit',
        minute: '2-digit'
      }),
      temperature: minutely[`temperature_2m_${model}`]?.[index] ?? 'N/A',
      precipitation: minutely[`precipitation_${model}`]?.[index] ?? 0,
      precipitationProbability: minutely[`precipitation_probability_${model}`]?.[index] ?? 0,
      weatherCode: minutely[`weather_code_${model}`]?.[index] ?? null
    }));

    const temps = formattedData.map(item => item.temperature).filter(t => t !== 'N/A');
    const tempRange = temps.length ? `${Math.min(...temps).toFixed(1)}–${Math.max(...temps).toFixed(1)}°C` : 'N/A';
    const hasPrecipitation = formattedData.some(item => item.precipitation > 0);
    const maxPrecipProbability = Math.max(...formattedData.map(item => item.precipitationProbability));
    const precipText = hasPrecipitation
      ? `Осадки: ${Math.max(...formattedData.map(item => item.precipitation))} мм`
      : maxPrecipProbability > 0
        ? `Осадки: отсутствуют, вероятность ${maxPrecipProbability}% к 19:30`
        : 'Осадки: отсутствуют';
    const conditions = [...new Set(formattedData.map(item => item.weatherCode).filter(code => code !== null))];
    const conditionText = conditions.length === 1
      ? `Условия: ${weatherCodes[conditions[0]] || 'Неизвестно'}`
      : `Условия: от ${weatherCodes[formattedData[0]?.weatherCode] || 'Неизвестно'} (19:00) до ${
          weatherCodes[formattedData[formattedData.length - 1]?.weatherCode] || 'Неизвестно'
        } (19:45)`;

    return {
      temperature: tempRange,
      precipitation: precipText,
      condition: conditionText,
      icon: getWeatherIcon(formattedData[0]?.weatherCode)
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
      <div className="loading">
        <style jsx>{`
          .loading {
            min-height: 100vh;
            background: linear-gradient(to bottom right, #60a5fa, #2563eb);
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-text {
            color: white;
            font-size: 1.25rem;
            animation: pulse 1.5s infinite;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }
        `}</style>
        <div className="loading-text">Загрузка...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error">
        <style jsx>{`
          .error {
            min-height: 100vh;
            background: #fee2e2;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-text {
            color: #991b1b;
            font-size: 1.25rem;
          }
        `}</style>
        <div className="error-text">Ошибка: {error}</div>
      </div>
    );
  }

  const bestMatchData = formatWeatherData(weatherData, 'best_match');
  const ecmwfData = formatWeatherData(weatherData, 'ecmwf_aifs025_single');

  return (
    <>
      <Head>
        <title>Прогноз погоды</title>
        <meta name="description" content="Прогноз погоды на вечер в Алматы" />
      </Head>

      <div className="container">
        <style jsx>{`
          .container {
            min-height: 100vh;
            background: linear-gradient(to bottom right, #3b82f6, #1e40af);
            padding: 1rem;
            display: flex;
            flex-direction: column;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          }
          .main {
            max-width: 20rem;
            margin: 0 auto;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .title {
            font-size: 1.5rem;
            font-weight: bold;
            color: white;
            text-align: center;
            margin-bottom: 1.5rem;
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-radius: 1rem;
            padding: 1.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
            transition: transform 0.2s;
          }
          .card:hover {
            transform: scale(1.02);
          }
          .card-title {
            font-size: 1.25rem;
            font-weight: 600;
            color: #1f2937;
            display: flex;
            align-items: center;
            margin-bottom: 0.75rem;
          }
          .card-title span {
            margin-right: 0.5rem;
            font-size: 1.5rem;
          }
          .card p {
            color: #4b5563;
            font-size: 0.875rem;
            line-height: 1.5;
            margin: 0.25rem 0;
          }
          .card p .temp {
            color: #f97316;
            font-weight: 500;
          }
          .button-container {
            text-align: center;
            margin-top: 1.5rem;
          }
          .button {
            background: rgba(255, 255, 255, 0.3);
            color: white;
            font-weight: 500;
            padding: 0.5rem 1.5rem;
            border-radius: 1.5rem;
            border: none;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
          }
          .button:hover {
            background: rgba(255, 255, 255, 0.4);
          }
          .button:active {
            transform: scale(0.95);
          }
          @media (max-width: 480px) {
            .main {
              max-width: 100%;
            }
            .title {
              font-size: 1.25rem;
            }
            .card-title {
              font-size: 1.125rem;
            }
            .card p {
              font-size: 0.8125rem;
            }
          }
        `}</style>

        <div className="main">
          <h1 className="title">Прогноз на вечер (19:00–19:45)</h1>

          <div className="card">
            <h2 className="card-title">
              <span>{bestMatchData.icon}</span>
              Best Match Model
            </h2>
            <p><span className="temp">{bestMatchData.temperature}</span></p>
            <p>{bestMatchData.precipitation}</p>
            <p>{bestMatchData.condition}</p>
          </div>

          <div className="card">
            <h2 className="card-title">
              <span>{ecmwfData.icon}</span>
              ECMWF AIFS Model
            </h2>
            <p><span className="temp">{ecmwfData.temperature}</span></p>
            <p>{ecmwfData.precipitation}</p>
            <p>{ecmwfData.condition}</p>
          </div>

          <div className="button-container">
            <button className="button" onClick={fetchWeatherData}>
              Обновить
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
