// pages/api/weather.js
export default async function handler(req, res) {
  try {
    const today = new Date().toISOString().split('T')[0];
    const url = `https://api.open-meteo.com/v1/forecast?latitude=43.25&longitude=76.92&timezone=auto&start_hour=${today}T19:00&end_hour=${today}T19:00&minutely_15=temperature_2m,precipitation_probability,precipitation,weather_code&models=best_match,ecmwf_aifs025_single`;
    
    const response = await fetch(url);
    const data = await response.json();
    
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
}
