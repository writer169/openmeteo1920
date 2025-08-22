export default async function handler(req, res) {
  try {
    // Open-Meteo: ближайшие 2 часа с шагом 15 минут (8 точек)
    const omUrl =
      "https://api.open-meteo.com/v1/forecast" +
      "?latitude=43.2567&longitude=76.9286" +
      "&minutely_15=temperature_2m,precipitation,precipitation_probability,weather_code" +
      "&forecast_minutely_15=8" +
      "&timezone=auto" +
      "&models=best_match,ecmwf_aifs025_single";

    const openMeteoResp = await fetch(omUrl);
    const openMeteo = await openMeteoResp.json();

    // Яндекс (не критично, может отсутствовать)
    let yandex = null;
    try {
      const yandexResp = await fetch(
        "https://api.weather.yandex.ru/v2/forecast?lat=43.2567&lon=76.9286&lang=ru_RU&hours=true",
        {
          headers: {
            // у Яндекса корректный заголовок так:
            "X-Yandex-API-Key": process.env.YANDEX_WEATHER_KEY || "YANDEX_KEY",
          },
        }
      );
      if (yandexResp.ok) {
        yandex = await yandexResp.json();
      }
    } catch (e) {
      console.warn("Yandex API failed:", e);
    }

    // Время обновления — серверное "сейчас"
    const nowISO = new Date().toISOString();
    const updateTimeText = new Date(nowISO).toLocaleString("ru-RU", {
      day: "numeric",
      month: "long",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Almaty",
    });

    res.status(200).json({
      updateTimeISO: nowISO,
      updateTimeText,       // уже отформатировано под Алматы
      openMeteo,
      yandex,
    });
  } catch (error) {
    console.error("API error:", error);
    res.status(500).json({ error: "Не удалось получить прогноз" });
  }
}