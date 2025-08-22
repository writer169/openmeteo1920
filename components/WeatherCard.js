// components/WeatherCard.js
export default function WeatherCard({ title, data, source, selectedSource, toggleDetailedView }) {
  if (!data) return null;

  return (
    <div className="card" onClick={() => toggleDetailedView(source)}>
      <h2 className="card-title">{title}</h2>
      <div className="card-content">
        <p className="temp">
          <span>{data.compact.icon}</span>
          {data.compact.temperature}
        </p>
        <p>{data.compact.precipitation}</p>
        <p>{data.compact.condition}</p>
      </div>
      <div className={`detailed-view ${selectedSource === source ? "open" : ""}`}>
        {data.detailed.map((point, index) => (
          <div key={index} className="detail-item">
            <div className="detail-time">{point.time}</div>
            <div className="detail-temp">
              {point.temperature !== "N/A" ? `${point.temperature}°C` : "N/A"}
            </div>
            {point.precipitation !== undefined && (
              <div className="detail-text">Осадки: {point.precipitation} мм</div>
            )}
            {point.precipitationProbability !== undefined && (
              <div className="detail-text">Вероятность: {point.precipitationProbability}%</div>
            )}
            {point.condition && <div className="detail-text">{point.condition}</div>}
          </div>
        ))}
      </div>
    </div>
  );
}