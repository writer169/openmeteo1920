export default async function handler(req, res) {
  try {
    // ⚡ Open-Meteo
    const openMeteoResp = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=43.2567&longitude=76.9286&minutely_15=temperature_2m,precipitation,precipitation_probability,weather_code&forecast_minutely_15=6&timezone=auto&models=best_match,ecmwf_aifs025_single"
    );
    const openMeteo = await openMeteoResp.json();

    // ⚡ Yandex Weather
    const yandexResp = await fetch(
      "https://api.weather.yandex.ru/v2/forecast?lat=43.2567&lon=76.9286&lang=ru_RU&hours=true",
      {
        headers: {
          "X-Yandex-API-Key": process.env.YANDEX_API_KEY, // ключ из .env
        },
      }
    );
    const yandex = await yandexResp.json();

    // ⚡ Форматируем время генерации прогноза
    const updateDate = new Date(openMeteo.generationtime_ms);
    const formattedUpdateTime = updateDate.toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Almaty",
    });

    res.status(200).json({
      updateTime: formattedUpdateTime, // сразу человекочитаемый формат
      openMeteo,
      yandex,
    });
  } catch (error) {
    console.error("Ошибка в API:", error);
    res.status(500).json({ error: "Не удалось получить прогноз" });
  }
}