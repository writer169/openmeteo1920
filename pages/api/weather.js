// pages/api/weather.js
export default async function handler(req, res) {
  try {
    // Получаем текущую дату в часовом поясе Алматы
    const almatyTime = new Date().toLocaleString("en-CA", {
      timeZone: "Asia/Almaty",
      year: "numeric",
      month: "2-digit", 
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit"
    });
    
    const serverTime = new Date(almatyTime.replace(',', '')).toISOString();
    const today = serverTime.split('T')[0];
    
    // Создаем массив промисов для параллельного запроса данных
    const weatherPromises = [];
    
    // Open-Meteo запрос
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=43.25&longitude=76.92&timezone=Asia/Almaty&start_hour=${today}T19:00&end_hour=${today}T19:00&minutely_15=temperature_2m,precipitation_probability,precipitation,weather_code&models=best_match,ecmwf_aifs025_single`;
    
    weatherPromises.push(
      fetch(openMeteoUrl, {
        timeout: 10000, // 10 секунд таймаут
      }).then(response => {
        if (!response.ok) throw new Error(`Open-Meteo API error: ${response.status}`);
        return response.json();
      }).catch(error => {
        console.warn('Failed to fetch Open-Meteo data:', error);
        return null;
      })
    );
    
    // Yandex запрос
    if (process.env.YANDEX_WEATHER_KEY && process.env.YANDEX_WEATHER_KEY !== 'YANDEX_KEY') {
      weatherPromises.push(
        fetch('https://api.weather.yandex.ru/v2/forecast?lat=43.23&lon=76.86', {
          headers: {
            'X-Yandex-Weather-Key': process.env.YANDEX_WEATHER_KEY
          },
          timeout: 10000,
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
        serverTime: serverTime
      });
    }
    
    res.setHeader('Cache-Control', 'public, max-age=900'); // Кэш на 15 минут
    
    res.status(200).json({
      openMeteo: openMeteoData,
      yandex: yandexData,
      serverTime: serverTime, // Время сервера в ISO формате
      location: 'Almaty, Kazakhstan'
    });
    
  } catch (error) {
    console.error('Weather API error:', error);
    res.status(500).json({ 
      error: 'Failed to fetch weather data',
      message: error.message,
      serverTime: new Date().toISOString()
    });
  }
}