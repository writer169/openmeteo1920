import { useEffect, useState } from "react";
import { weatherCodes, yandexConditions } from "../utils/weatherDictionaries";
import WeatherCard from "../components/WeatherCard";
import styles from "../styles/WeatherPage.module.css";

export default function WeatherPage() {
  const [yandexData, setYandexData] = useState(null);
  const [bestMatchData, setBestMatchData] = useState(null);
  const [ecmwfData, setEcmwfData] = useState(null);
  const [updateTime, setUpdateTime] = useState(null);
  const [selectedSource, setSelectedSource] = useState(null);

  useEffect(() => {
    const fetchWeatherData = async () => {
      try {
        const response = await fetch("/api/weather");
        const data = await response.json();
        if (!data) return;

        if (data.openMeteo) {
          const bestMatch = data.openMeteo.minutely_15.find(
            (entry) => entry.model === "best_match"
          );
          const ecmwf = data.openMeteo.minutely_15.find(
            (entry) => entry.model === "ecmwf_aifs025_single"
          );

          setBestMatchData(formatForecast(bestMatch, "openMeteo"));
          setEcmwfData(formatForecast(ecmwf, "openMeteo"));
          setUpdateTime(new Date(data.openMeteo.generationtime_ms));
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
    if (source === "openMeteo") {
      return {
        compact: {
          temperature: data.temperature_2m[0] + "°C",
          precipitation: `Осадки: ${data.precipitation[0]} мм`,
          condition: weatherCodes[data.weather_code[0]] || "N/A",
          icon: "🌤",
        },
        detailed: data.time.map((time, i) => ({
          time: new Date(time).toLocaleTimeString("ru-RU", { hour: "2-digit", minute: "2-digit" }),
          temperature: data.temperature_2m[i],
          precipitation: data.precipitation[i],
          precipitationProbability: data.precipitation_probability[i],
          condition: weatherCodes[data.weather_code[i]],
        })),
      };
    }
    if (source === "yandex") {
      return {
        compact: {
          temperature: data.fact.temp + "°C",
          precipitation: data.fact.precipitation_type ? "Осадки" : "Без осадков",
          condition: yandexConditions[data.fact.condition] || data.fact.condition,
          icon: "☀️",
        },
        detailed: data.forecasts[0].hours.map((hour) => ({
          time: hour.hour + ":00",
          temperature: hour.temp,
          precipitation: hour.prec_mm,
          condition: yandexConditions[hour.condition] || hour.condition,
        })),
      };
    }
  };

  const formatUpdateTime = (date) =>
    new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);

  const toggleDetailedView = (source) => {
    setSelectedSource(selectedSource === source ? null : source);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.header}>Прогноз погоды</h1>
      {updateTime && <p className={styles.update}>Обновлено: {formatUpdateTime(updateTime)}</p>}

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