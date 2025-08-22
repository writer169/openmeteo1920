import { useState, useEffect } from "react";
import styles from "../styles/WeatherPage.module.css";
import { weatherCodes, yandexConditions } from "../utils/weatherDictionaries";

function WeatherCard({ title, data, source, selectedSource, toggleDetailedView }) {
  if (!data) return null;

  return (
    <div className={styles.card} onClick={() => toggleDetailedView(source)}>
      <h2 className={styles.cardTitle}>{title}</h2>
      <div className={styles.cardContent}>
        <p className={styles.temp}>
          <span>{data.compact.icon}</span>
          {data.compact.temperature}
        </p>
        <p>{data.compact.precipitation}</p>
        <p>{data.compact.condition}</p>
      </div>
      <div className={`${styles.detailedView} ${selectedSource === source ? styles.open : ""}`}>
        {data.detailed.map((point, index) => (
          <div key={index} className={styles.detailItem}>
            <div className={styles.detailTime}>{point.time}</div>
            <div className={styles.detailTemp}>
              {point.temperature !== "N/A" ? `${point.temperature}°C` : "N/A"}
            </div>
            {point.precipitation !== undefined && (
              <div className={styles.detailText}>Осадки: {point.precipitation} мм</div>
            )}
            {point.precipitationProbability !== undefined && (
              <div className={styles.detailText}>Вероятность: {point.precipitationProbability}%</div>
            )}
            {point.condition && <div className={styles.detailText}>{point.condition}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function WeatherPage() {
  const [updateTime, setUpdateTime] = useState(null);
  const [yandexData, setYandexData] = useState(null);
  const [bestMatchData, setBestMatchData] = useState(null);
  const [ecmwfData, setEcmwfData] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        const data = await response.json();
        if (!data) return;

        setUpdateTime(data.updateTime); // ⚡ сразу из API, без форматирования

        if (data.openMeteo) {
          const bestMatch = data.openMeteo.minutely_15.find(
            (entry) => entry.model === "best_match"
          );
          const ecmwf = data.openMeteo.minutely_15.find(
            (entry) => entry.model === "ecmwf_aifs025_single"
          );

          setBestMatchData(formatForecast(bestMatch, "openMeteo"));
          setEcmwfData(formatForecast(ecmwf, "openMeteo"));
        }

        if (data.yandex) {
          setYandexData(formatForecast(data.yandex, "yandex"));
        }
      } catch (error) {
        console.error("Ошибка загрузки данных:", error);
      }
    };

    fetchWeatherData();
  }, []);

  const formatForecast = (data, source) => {
    if (!data) return null;

    if (source === "yandex") {
      const current = data.fact || {};
      return {
        compact: {
          icon: getYandexIcon(current.condition),
          temperature: `${current.temp ?? "N/A"}°C`,
          precipitation: current.prec_type !== undefined ? `Тип осадков: ${current.prec_type}` : "Без осадков",
          condition: yandexConditions[current.condition] || "Нет данных",
        },
        detailed: (data.forecasts?.[0]?.hours || []).map((hour) => ({
          time: hour.hour,
          temperature: hour.temp,
          precipitation: hour.prec_mm,
          precipitationProbability: hour.prec_prob,
          condition: yandexConditions[hour.condition] || hour.condition,
        })),
      };
    }

    if (source === "openMeteo") {
      return {
        compact: {
          icon: getWeatherIcon(data.weather_code?.[0]),
          temperature: data.temperature_2m?.[0] ? `${data.temperature_2m[0]}°C` : "N/A",
          precipitation: data.precipitation?.[0] ? `${data.precipitation[0]} мм` : "Без осадков",
          condition: weatherCodes[data.weather_code?.[0]] || "Нет данных",
        },
        detailed: (data.time || []).map((time, index) => ({
          time: new Date(time).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          temperature: data.temperature_2m?.[index],
          precipitation: data.precipitation?.[index],
          precipitationProbability: data.precipitation_probability?.[index],
          condition: weatherCodes[data.weather_code?.[index]] || "",
        })),
      };
    }

    return null;
  };

  const getWeatherIcon = (code) => {
    if (code === 0) return "☀️";
    if ([1, 2, 3].includes(code)) return "⛅";
    if ([45, 48].includes(code)) return "🌫️";
    if ([51, 53, 55, 61, 63, 65, 80, 81, 82].includes(code)) return "🌧️";
    if ([71, 73, 75, 77, 85, 86].includes(code)) return "❄️";
    if ([95, 96, 99].includes(code)) return "⛈️";
    return "❔";
  };

  const getYandexIcon = (condition) => {
    if (!condition) return "❔";
    const map = {
      clear: "☀️",
      partlyCloudy: "⛅",
      cloudy: "☁️",
      overcast: "☁️",
      drizzle: "🌧️",
      lightRain: "🌦️",
      rain: "🌧️",
      moderateRain: "🌧️",
      heavyRain: "🌧️",
      showers: "🌧️",
      snow: "❄️",
      snowShowers: "❄️",
      thunderstorm: "⛈️",
    };
    return map[condition] || "❔";
  };

  const toggleDetailedView = (source) => {
    setSelectedSource(selectedSource === source ? null : source);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Прогноз погоды Алматы</h1>
      <p className={styles.updateTime}>Обновлено: {updateTime || "—"}</p>

      <WeatherCard
        title="Yandex"
        data={yandexData}
        source="yandex"
        selectedSource={selectedSource}
        toggleDetailedView={toggleDetailedView}
      />
      <WeatherCard
        title="Best Match"
        data={bestMatchData}
        source="best_match"
        selectedSource={selectedSource}
        toggleDetailedView={toggleDetailedView}
      />
      <WeatherCard
        title="ECMWF AIFS"
        data={ecmwfData}
        source="ecmwf"
        selectedSource={selectedSource}
        toggleDetailedView={toggleDetailedView}
      />
    </div>
  );
}