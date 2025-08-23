// pages/api/weather.js
export default async function handler(req, res) {
  try {
    // Получаем текущее время в UTC+6 (Алматы) и передаем как timestamp
    const now = new Date();
    const almatyTime = new Date(now.getTime() + (6 * 60 * 60 * 1000)); // UTC+6
    const serverTimestamp = almatyTime.getTime(); // Передаем как timestamp
    
    const today = almatyTime.toISOString().split('T')[0]; // YYYY-MM-DD
    
    // Создаем массив промисов для параллельного запроса данных
    const weatherPromises = [];
    
    // Open-Meteo запрос с увеличенным таймаутом
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=43.25&longitude=76.92&timezone=Asia/Almaty&start_hour=${today}T19:00&end_hour=${today}T19:00&minutely_15=temperature_2m,precipitation_probability,precipitation,weather_code&models=best_match,ecmwf_aifs025_single`;
    
    weatherPromises.push(
      fetch(openMeteoUrl, {
        signal: AbortSignal.timeout(20000), // Увеличиваем до 20 секунд
      }).then(response => {
        if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);
        return response.json();
      }).catch(error => {
        console.warn('Failed to fetch Open-Meteo data:', error);
        return null;
      })
    );
    
    // Yandex запрос с увеличенным таймаутом
    if (process.env.YANDEX_WEATHER_KEY && process.env.YANDEX_WEATHER_KEY !== 'YANDEX_KEY') {
      weatherPromises.push(
        fetch('https://api.weather.yandex.ru/v2/forecast?lat=43.23&lon=76.86', {
          headers: {
            'X-Yandex-Weather-Key': process.env.YANDEX_WEATHER_KEY
          },
          signal: AbortSignal.timeout(20000), // Увеличиваем до 20 секунд
        }).then(response => {
          if (!response.ok) throw new Error(`Yandex API error: ${response.status}`);
          return response.json();
        }).catch(error => {
          console.warn('Failed to fetch Yandex weather data:', error);
          return null;
        })
      );
    } else {
      weatherPromises.push(Promise.resolve(null));
    }
    
    // Ожидаем все запросы параллельно
    const [openMeteoData, yandexData] = await Promise.all(weatherPromises);
    
    // Проверяем, что хотя бы один источник данных доступен
    if (!openMeteoData && !yandexData) {
      return res.status(503).json({ 
        error: 'All weather services unavailable',
        serverTimestamp: serverTimestamp
      });
    }
    
    res.setHeader('Cache-Control', 'public, max-age=600'); // Уменьшаем кэш до 10 минут
    
    res.status(200).json({
      openMeteo: openMeteoData,
      yandex: yandexData,
      serverTimestamp: serverTimestamp, // Передаем timestamp вместо строки
      location: 'Almaty, Kazakhstan'
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    
    // Создаем fallback timestamp
    const fallbackTime = new Date().getTime();
    
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message,
      serverTimestamp: fallbackTime
    });
  }
}