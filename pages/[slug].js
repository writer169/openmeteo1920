import { useEffect, useState } from 'react'

export default function WeatherPage() {
  const [data, setData] = useState(null)
  const [updatedAt, setUpdatedAt] = useState(null)

  useEffect(() => {
    async function fetchWeather() {
      const res = await fetch('/api/weather')
      const json = await res.json()
      setData(json)

      // время обновления
      setUpdatedAt(new Date().toLocaleString('ru-RU', { timeZone: 'Asia/Almaty' }))
    }
    fetchWeather()
  }, [])

  return (
    <div className="container">
      <h1>Прогноз погоды Алматы</h1>
      <p className="updated">Обновлено: {updatedAt}</p>

      {data ? (
        <div className="cards">
          {/* --- Open-Meteo --- */}
          {data.openMeteo && (
            <div className="card">
              <h2>Open-Meteo</h2>
              <p>Температура: <b>{data.openMeteo.minutely_15?.temperature_2m?.[0]}°C</b></p>
              <p>Вероятность осадков: <b>{data.openMeteo.minutely_15?.precipitation_probability?.[0]}%</b></p>
              <p>Осадки: <b>{data.openMeteo.minutely_15?.precipitation?.[0]} мм</b></p>
            </div>
          )}

          {/* --- Яндекс --- */}
          {data.yandex && (
            <div className="card">
              <h2>Яндекс.Погода</h2>
              <p>Температура: <b>{data.yandex.fact?.temp}°C</b></p>
              <p>Ощущается как: <b>{data.yandex.fact?.feels_like}°C</b></p>
              <p>Влажность: <b>{data.yandex.fact?.humidity}%</b></p>
              <p>Давление: <b>{data.yandex.fact?.pressure_mm} мм рт. ст.</b></p>
            </div>
          )}
        </div>
      ) : (
        <p>Загрузка...</p>
      )}
    </div>
  )
}