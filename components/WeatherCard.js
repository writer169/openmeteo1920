// components/WeatherCard.js
import { WEATHER_CODES } from '../constants/weather';

export const WeatherCard = ({ 
  title, 
  data, 
  isSelected, 
  onToggle, 
  type = 'openmeteo' 
}) => {
  if (!data) return null;

  return (
    <div className="card" onClick={onToggle}>
      <h2 className="card-title">{title}</h2>
      <div className="card-content">
        <p className="temp">
          <span>{data.compact.icon}</span>
          {data.compact.temperature}
        </p>
        <p>{data.compact.precipitation}</p>
        <p>{data.compact.condition}</p>
      </div>
      <div className={`detailed-view ${isSelected ? 'open' : ''}`}>
        {data.detailed.map((dataPoint, index) => (
          <DetailItem 
            key={index} 
            dataPoint={dataPoint} 
            type={type} 
          />
        ))}
      </div>
    </div>
  );
};

const DetailItem = ({ dataPoint, type }) => {
  return (
    <div className="detail-item">
      <div className="detail-time">{dataPoint.time}</div>
      <div className="detail-temp">
        {type === 'openmeteo' 
          ? (dataPoint.temperature !== 'N/A' ? `${dataPoint.temperature}°C` : 'N/A')
          : `${dataPoint.temperature}°C`
        }
      </div>
      
      {type === 'openmeteo' ? (
        <>
          <div className="detail-text">Осадки: {dataPoint.precipitation} мм</div>
          {dataPoint.precipitationProbability !== null && (
            <div className="detail-text">Вероятность: {dataPoint.precipitationProbability}%</div>
          )}
          <div className="detail-text">
            {WEATHER_CODES[dataPoint.weatherCode] || 'Неизвестно'}
          </div>
        </>
      ) : (
        <>
          {dataPoint.precStrength > 0 && (
            <div className="detail-text">Осадки: {dataPoint.precStrength} мм/ч</div>
          )}
          {dataPoint.isThunder && (
            <div className="detail-text">Вероятность грозы</div>
          )}
          <div className="detail-text">{dataPoint.condition}</div>
        </>
      )}
    </div>
  );
};

export const LoadingScreen = ({ onRefresh }) => (
  <div className="loading">
    <div className="loading-content">
      <div className="loading-text">
        <span className="spinner"></span>
        Загрузка погоды...
      </div>
      <button className="refresh-button" onClick={onRefresh}>
        Обновить
      </button>
    </div>
  </div>
);

export const ErrorScreen = ({ error, onRetry }) => (
  <div className="error">
    <div className="error-content">
      <div className="error-text">Ошибка: {error}</div>
      <button className="retry-button" onClick={onRetry}>
        Попробовать снова
      </button>
    </div>
  </div>
);

export const NoDataCard = ({ onRefresh }) => (
  <div className="card">
    <div className="card-content">
      <p>Нет доступных данных о погоде</p>
      <button className="refresh-button" onClick={onRefresh}>
        Попробовать снова
      </button>
    </div>
  </div>
);