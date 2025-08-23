// pages/[slug].js
import Head from 'next/head';

// Импорты модулей
import { formatUpdateTime, formatOpenMeteoData, formatYandexData } from '../utils/weatherUtils';
import { WeatherCard, LoadingScreen, ErrorScreen, NoDataCard } from '../components/WeatherCard';
import { weatherStyles, loadingStyles, errorStyles } from '../styles/WeatherStyles';
import { useWeatherData, useToggleState } from '../hooks/useWeatherData';

export async function getServerSideProps(context) {
  const { slug } = context.params;
  const expectedSlug = process.env.WEATHER_PAGE_SLUG;

  if (slug !== expectedSlug) {
    return { notFound: true };
  }

  return { props: {} };
}

export default function WeatherPage() {
  const { weatherData, loading, error, serverTime, refetch } = useWeatherData();
  const [selectedSource, toggleDetailedView] = useToggleState();

  // Форматирование данных
  const bestMatchData = weatherData?.openMeteo ? formatOpenMeteoData(weatherData.openMeteo, 'best_match') : null;
  const ecmwfData = weatherData?.openMeteo ? formatOpenMeteoData(weatherData.openMeteo, 'ecmwf_aifs025_single') : null;
  const yandexData = formatYandexData(weatherData?.yandex);

  // Состояния загрузки и ошибок
  if (loading) {
    return (
      <>
        <style jsx>{loadingStyles}</style>
        <LoadingScreen onRefresh={refetch} />
      </>
    );
  }

  if (error) {
    return (
      <>
        <style jsx>{errorStyles}</style>
        <ErrorScreen error={error} onRetry={refetch} />
      </>
    );
  }

  if (!weatherData) return null;

  return (
    <>
      <Head>
        <title>Погода на вечер - Алматы</title>
        <meta name="description" content="Актуальный прогноз погоды на вечер в Алматы от нескольких источников" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Poppins:wght@500;700&family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
      </Head>

      <style jsx>{weatherStyles}</style>

      <div className="container">
        <div className="main">
          <div className="header">
            <h1 className="title">Погода на вечер</h1>
            {serverTime && (
              <p className="update-time">Обновлено: {formatUpdateTime(serverTime)}</p>
            )}
            <button 
              className="refresh-button" 
              onClick={refetch}
              disabled={loading}
            >
              {loading ? 'Обновляется...' : 'Обновить'}
            </button>
          </div>

          {yandexData && (
            <WeatherCard
              title="Yandex Weather"
              data={yandexData}
              isSelected={selectedSource === 'yandex'}
              onToggle={() => toggleDetailedView('yandex')}
              type="yandex"
            />
          )}

          {bestMatchData && (
            <WeatherCard
              title="Open-Meteo Best Match"
              data={bestMatchData}
              isSelected={selectedSource === 'best_match'}
              onToggle={() => toggleDetailedView('best_match')}
              type="openmeteo"
            />
          )}

          {ecmwfData && (
            <WeatherCard
              title="ECMWF AIFS"
              data={ecmwfData}
              isSelected={selectedSource === 'ecmwf'}
              onToggle={() => toggleDetailedView('ecmwf')}
              type="openmeteo"
            />
          )}

          {!yandexData && !bestMatchData && !ecmwfData && (
            <NoDataCard onRefresh={refetch} />
          )}
        </div>
      </div>
    </>
  );
}