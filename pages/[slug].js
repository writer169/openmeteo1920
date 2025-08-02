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
  const [selectedSource, setSelectedSource] = useState(null);

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
      precipitationProbability: minutely[`precipitation_probability_${model}`]?.[index] ?? null,
      weatherCode: minutely[`weather_code_${model}`]?.[index] ?? null
    }));

    const temps = formattedData.map(item => item.temperature).filter(t => t !== 'N/A');
    const tempRange = temps.length ? `${Math.min(...temps).toFixed(1)}–${Math.max(...temps).toFixed(1)}°C` : 'N/A';
    const hasPrecipitation = formattedData.some(item => item.precipitation > 0);
    const maxPrecipProbability = Math.max(...formattedData.map(item => item.precipitationProbability ?? 0));
    const precipText =
      model === 'ecmwf_aifs025_single' || maxPrecipProbability === null
        ? hasPrecipitation
          ? `Осадки: ${Math.max(...formattedData.map(item => item.precipitation))} мм`
          : 'Осадки: отсутствуют'
        : hasPrecipitation
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
      compact: {
        temperature: tempRange,
        precipitation: precipText,
        condition: conditionText,
        icon: getWeatherIcon(formattedData[0]?.weatherCode)
      },
      detailed: formattedData
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

  const toggleDetailedView = (source) => {
    setSelectedSource(selectedSource === source ? null : source);
  };

  if (loading) {
    return (
      <div className="loading">
        <style jsx>{`
          .loading {
            min-height: 100vh;
            background: #e5e7eb;
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .loading-text {
            color: #1f2937;
            font-size: 1.25rem;
            font-family: 'Inter', sans-serif;
            display: flex;
            align-items: center;
          }
          .spinner {
            width: 1.25rem;
            height: 1.25rem;
            border: 2px solid #1f2937;
            border-top-color: transparent;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-right: 0.5rem;
          }
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
        <div className="loading-text">
          <span className="spinner"></span>
          Загрузка...
        </div>
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
            border-radius: 1rem;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .error-text {
            color: #991b1b;
            font-size: 1.25rem;
            font-family: 'Inter', sans-serif;
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
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <div className="container">
        <style jsx>{`
          .container {
            min-height: 100vh;
            background: #e5e7eb;
            border-radius: 1rem;
            padding: 1rem;
            display: flex;
            flex-direction: column;
          }
          .main {
            max-width: 20rem;
            margin: 0 auto;
            flex: 1;
            display: flex;
            flex-direction: column;
          }
          .title {
            font-size: 1.75rem;
            font-weight: 700;
            color: #1f2937;
            text-align: center;
            margin-bottom: 1.5rem;
            font-family: 'Playfair Display', serif;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .card {
            background: rgba(255, 255, 255, 0.95);
            backdrop-filter: blur(8px);
            border-radius: 1rem;
            padding: 1.25rem;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
            margin-bottom: 1rem;
            cursor: pointer;
            transition: transform 0.2s;
          }
          .card:hover {
            transform: scale(1.02);
          }
          .card-title {
            font-size: 0.75rem;
            font-weight: 700;
            color: #d1d5db;
            text-transform: uppercase;
            text-align: center;
            margin-bottom: 0.75rem;
            font-family: 'Inter', sans-serif;
            text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
          }
          .card-content {
            text-align: center;
          }
          .card-content .temp {
            font-size: clamp(2rem, 6vw, 2.5rem);
            font-weight: 700;
            color: #f97316;
            font-family: 'Poppins', sans-serif;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 0.5rem;
            white-space: nowrap;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          }
          .card-content p {
            color: #4b5563;
            font-size: 0.875rem;
            line-height: 1.5;
            margin: 0.25rem 0;
            font-family: 'Inter', sans-serif;
          }
          .detailed-view {
            max-height: 0;
            overflow: auto;
            transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
            background: rgba(255, 255, 255, 0.9);
            border-radius: 0 0 1rem 1rem;
            padding: 0 1.25rem;
            opacity: 0;
          }
          .detailed-view.open {
            max-height: 400px;
            padding: 1rem 1.25rem;
            opacity: 1;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          .detailed-view .detail-item {
            margin-bottom: 1rem;
            text-align: center;
            font-family: 'Inter', sans-serif;
          }
          .detailed-view .detail-item:last-child {
            margin-bottom: 0;
          }
          .detailed-view .detail-time {
            font-size: 1rem;
            font-weight: 600;
            color: #1f2937;
          }
          .detailed-view .detail-temp {
            font-size: 1.25rem;
            color: #f97316;
            font-family: 'Poppins', sans-serif;
          }
          .detailed-view .detail-text {
            font-size: 0.8125rem;
            color: #4b5563;
          }
          .button-container {
            text-align: center;
            margin-top: 1.5rem;
          }
          .button {
            background: #f97316;
            color: white;
            font-size: 1.25rem;
            width: 2.5rem;
            height: 2.5rem;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            transition: background 0.2s, transform 0.1s;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
          }
          .button:hover {
            background: #ea580c;
          }
          .button:active {
            transform: scale(0.95);
          }
          @media (max-width: 480px) {
            .main {
              max-width: 100%;
            }
            .title {
              font-size: 1.5rem;
            }
            .card-content .temp {
              font-size: clamp(1.75rem, 5.5vw, 2.25rem);
            }
            .card-content p {
              font-size: 0.8125rem;
            }
            .card-title {
              font-size: 0.6875rem;
            }
            .detailed-view .detail-time {
              font-size: 0.875rem;
            }
            .detailed-view .detail-temp {
              font-size: 1rem;
            }
            .detailed-view .detail-text {
              font-size: 0.75rem;
            }
            .button {
              width: 2rem;
              height: 2rem;
              font-size: 1rem;
            }
          }
        `}</style>

        <div className="main">
          <h1 className="title">Прогноз на вечер (19:00–19:45)</h1>

          <div className="card" onClick={() => toggleDetailedView('best_match')}>
            <h2 className="card-title">Best Match</h2>
            <div className="card-content">
              <p className="temp">
                <span>{bestMatchData.compact.icon}</span>
                {bestMatchData.compact.temperature}
              </p>
              <p>{bestMatchData.compact.precipitation}</p>
              <p>{bestMatchData.compact.condition}</p>
            </div>
            <div className={`detailed-view ${selectedSource === 'best_match' ? 'open' : ''}`}>
              {bestMatchData.detailed.map((dataPoint, index) => (
                <div key={index} className="detail-item">
                  <div className="detail-time">{dataPoint.time}</div>
                  <div className="detail-temp">{dataPoint.temperature !== 'N/A' ? `${dataPoint.temperature}°C` : 'N/A'}</div>
                  <div className="detail-text">Осадки: {dataPoint.precipitation} мм</div>
                  {dataPoint.precipitationProbability !== null && (
                    <div className="detail-text">Вероятность: {dataPoint.precipitationProbability}%</div>
                  )}
                  <div className="detail-text">{weatherCodes[dataPoint.weatherCode] || 'Неизвестно'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="card" onClick={() => toggleDetailedView('ecmwf')}>
            <h2 className="card-title">ECMWF AIFS</h2>
            <div className="card-content">
              <p className="temp">
                <span>{ecmwfData.compact.icon}</span>
                {ecmwfData.compact.temperature}
              </p>
              <p>{ecmwfData.compact.precipitation}</p>
              <p>{ecmwfData.compact.condition}</p>
            </div>
            <div className={`detailed-view ${selectedSource === 'ecmwf' ? 'open' : ''}`}>
              {ecmwfData.detailed.map((dataPoint, index) => (
                <div key={index} className="detail-item">
                  <div className="detail-time">{dataPoint.time}</div>
                  <div className="detail-temp">{dataPoint.temperature !== 'N/A' ? `${dataPoint.temperature}°C` : 'N/A'}</div>
                  <div className="detail-text">Осадки: {dataPoint.precipitation} мм</div>
                  {dataPoint.precipitationProbability !== null && (
                    <div className="detail-text">Вероятность: {dataPoint.precipitationProbability}%</div>
                  )}
                  <div className="detail-text">{weatherCodes[dataPoint.weatherCode] || 'Неизвестно'}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="button-container">
            <button className="button" onClick={fetchWeatherData}>
              🔄
            </button>
          </div>
        </div>
      </div>
    </>
  );
}