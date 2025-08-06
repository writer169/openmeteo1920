// pages/api/weather.js
export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const openMeteoUrl = `https://api.open-meteo.com/v1/forecast?latitude=43.25&longitude=76.92&timezone=auto&start_hour=${today}T19:00&end_hour=${today}T19:00&minutely_15=temperature_2m,precipitation_probability,precipitation,weather_code&models=best_match,ecmwf_aifs025_single`;
    
    // Fetch Open-Meteo data
    const openMeteoResponse = await fetch(openMeteoUrl);
    const openMeteoData = await openMeteoResponse.json();
    
    // Fetch Yandex data
    let yandexData = null;
    try {
      console.log('Attempting to fetch Yandex data...');
      console.log('Yandex API Key:', process.env.YANDEX_WEATHER_KEY ? 'Present' : 'Missing');
      
      const yandexResponse = await fetch('https://api.weather.yandex.ru/v2/forecast?lat=43.23&lon=76.86', {
        headers: {
          'X-Yandex-Weather-Key': process.env.YANDEX_WEATHER_KEY || 'YANDEX_KEY'
        }
      });
      
      console.log('Yandex Response Status:', yandexResponse.status);
      console.log('Yandex Response OK:', yandexResponse.ok);
      
      if (yandexResponse.ok) {
        yandexData = await yandexResponse.json();
        console.log('Yandex Data Structure:', JSON.stringify(yandexData, null, 2));
      } else {
        const errorText = await yandexResponse.text();
        console.error('Yandex API Error:', errorText);
      }
    } catch (yandexError) {
      console.error('Failed to fetch Yandex weather data:', yandexError);
    }
    
    res.status(200).json({
      openMeteo: openMeteoData,
      yandex: yandexData
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}