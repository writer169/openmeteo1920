import { useEffect, useState } from "react";
import "../styles.css";

export default function WeatherPage() {
  const [updateTime, setUpdateTime] = useState("");
  const [bestMatchData, setBestMatchData] = useState(null);
  const [ecmwfData, setEcmwfData] = useState(null);
  const [yandexData, setYandexData] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        const data = await response.json();
        if (!data) return;

        setUpdateTime(data.updateTime); // уже форматированное время

        // --- OpenMeteo: берём первые 6 точек прогноза ---
        if (data.openMeteo?.minutely_15) {
          const times = data.openMeteo.minutely_15.time;
          const temps = data.openMeteo.minutely_15.temperature_2m;
          const prec = data.openMeteo.minutely_15.precipitation_probability;

          const forecasts = times.slice(0, 6).map((t, i) => ({
            time: t,
            temperature: temps[i],
            precipitation: prec[i],
          }));

          setBestMatchData(forecasts); // кладём в карточки
        }

        // --- Yandex ---
        if (data.yandex) {
          const forecasts = data.yandex.forecasts[0].hours.slice(0, 6).map((h) => ({
            time: h.hour + ":00",
            temperature: h.temp,
            precipitation: h.prec_mm,
          }));
          setYandexData(forecasts);
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    fetchWeatherData();
  }, []);

  const renderForecastCards = (title, data) => (
    <div className="forecast-section">
      <h2>{title}</h2>
      <div className="forecast-cards">
        {data && data.length > 0 ? (
          data.map((item, idx) => (
            <div key={idx} className="card">
              <p><strong>{item.time}</strong></p>
              <p>{item.temperature}°C</p>
              <p>Осадки: {item.precipitation ?? 0}%</p>
            </div>
          ))
        ) : (
          <p>Нет данных</p>
        )}
      </div>
    </div>
  );

  return (
    <div className="container">
      <h1>Прогноз погоды Алматы</h1>
      <p>Обновлено: {updateTime}</p>

      {renderForecastCards("Open-Meteo (Best Match)", bestMatchData)}
      {renderForecastCards("Yandex", yandexData)}
    </div>
  );
}