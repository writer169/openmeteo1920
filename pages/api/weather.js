export default async function handler(req, res) {
  try {
    // ⚡ Open-Meteo запрос
    const openMeteoResp = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=43.2567&longitude=76.9286&minutely_15=temperature_2m,precipitation,precipitation_probability,weather_code&forecast_minutely_15=6&timezone=auto&models=best_match,ecmwf_aifs025_single"
    );
    const openMeteo = await openMeteoResp.json();

    // ⚡ Yandex Weather запрос
    let yandex = null;
    try {
      const yandexResp = await fetch(
        "https://api.weather.yandex.ru/v2/forecast?lat=43.2567&lon=76.9286&lang=ru_RU&hours=true",
        {
          headers: {
            "X-Yandex-API-Key": process.env.YANDEX_API_KEY,
          },
        }
      );
      if (yandexResp.ok) {
        yandex = await yandexResp.json();
      }
    } catch (err) {
      console.warn("⚠ Ошибка запроса Yandex:", err);
    }

    // ⚡ Время обновления (берём текущее серверное)
    const now = new Date();
    const formattedTime = new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
    }).format(now);

    res.status(200).json({
      updateTime: formattedTime, // готовая строка, фронту ничего форматировать не нужно
      openMeteo,
      yandex,
    });
  } catch (error) {
    console.error("Ошибка в API:", error);
    res.status(500).json({ error: "Не удалось получить прогноз" });
  }
}