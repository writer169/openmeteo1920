// styles/WeatherStyles.js

export const weatherStyles = `
  .container {
    height: 90vh;
    height: 90svh; /* Small viewport height - учитывает адресную строку */
    height: 90dvh; /* Dynamic viewport height - адаптируется к изменениям */
    max-height: 90vh;
    max-height: 90svh;
    max-height: 90dvh;
    background: #e5e7eb;
    border-radius: 1rem;
    padding: 0rem;
    display: flex;
    flex-direction: column;
    box-sizing: border-box;
    overflow: hidden; /* Предотвращаем переполнение контейнера */
    margin: 5vh auto; /* Центрируем по вертикали */
  }

  .main {
    max-width: 20rem;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0.5rem 0.5rem 0.5rem; /* Убрали увеличенный нижний отступ */
    box-sizing: border-box;
    overflow-y: auto; /* Добавляем прокрутку если контент не влазит */
    min-height: 0; /* Позволяет flex-элементу сжиматься */
  }

  .header {
    text-align: center;
    margin-bottom: 1.5rem;
    margin-top: 0.25rem;
  }

  .title {
    font-size: 1.75rem;
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.25rem;
    font-family: 'Playfair Display', serif;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .update-time {
    font-size: 0.75rem;
    color: #6b7280;
    font-family: 'Inter', sans-serif;
    margin: 0 0 0.5rem 0;
  }

  .refresh-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.25rem 0.75rem;
    border-radius: 0.375rem;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 0.75rem;
    transition: background-color 0.2s;
    margin: 0 auto;
    display: block;
  }

  .refresh-button:hover {
    background: #2563eb;
  }

  .refresh-button:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }

  .card {
    background: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    border-radius: 1rem;
    padding: 1.25rem;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 1rem;
    cursor: pointer;
    transition: transform 0.2s;
    box-sizing: border-box;
  }

  .card:hover {
    transform: scale(1.02);
  }

  .card:last-child {
    margin-bottom: 1.5rem; /* Дополнительный отступ только у последней карточки */
  }

  .card-title {
    font-size: 0.75rem;
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 0.75rem;
    font-family: 'Inter', sans-serif;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .card-content {
    text-align: center;
  }

  .card-content .temp {
    font-size: clamp(2rem, 6vw, 2.5rem);
    font-weight: 700;
    color: #f97316;
    font-family: 'Poppins', sans-serif;
    margin: 0.5rem 0;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    white-space: nowrap;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-content p {
    color: #4b5563;
    font-size: 0.875rem;
    line-height: 1.5;
    margin: 0.25rem 0;
    font-family: 'Inter', sans-serif;
  }

  .detailed-view {
    max-height: 0;
    overflow: auto;
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0 0 1rem 1rem;
    padding: 0 1.25rem;
    opacity: 0;
  }

  .detailed-view.open {
    max-height: 400px;
    padding: 1rem 1.25rem;
    opacity: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .detailed-view .detail-item {
    margin-bottom: 1rem;
    text-align: center;
    font-family: 'Inter', sans-serif;
  }

  .detailed-view .detail-item:last-child {
    margin-bottom: 0;
  }

  .detailed-view .detail-time {
    font-size: 1rem;
    font-weight: 600;
    color: #1f2937;
  }

  .detailed-view .detail-temp {
    font-size: 1.25rem;
    color: #f97316;
    font-family: 'Poppins', sans-serif;
  }

  .detailed-view .detail-text {
    font-size: 0.8125rem;
    color: #4b5563;
  }

  @media (max-width: 480px) {
    .container {
      padding: 0;
      border-radius: 0; /* Убираем скругления на мобильных для лучшего использования пространства */
    }
    
    .main {
      max-width: 100%;
      padding: 0.25rem; /* Возвращаем обычный отступ */
    }

    .header {
      margin-bottom: 1rem;
    }

    .title {
      font-size: 1.5rem;
    }

    .update-time {
      font-size: 0.6875rem;
    }

    .card {
      margin-bottom: 0.75rem;
      padding: 1rem;
    }

    .card-content .temp {
      font-size: clamp(1.75rem, 5.5vw, 2.25rem);
    }

    .card-content p {
      font-size: 0.8125rem;
    }

    .card-title {
      font-size: 0.6875rem;
    }

    .detailed-view .detail-time {
      font-size: 0.875rem;
    }

    .detailed-view .detail-temp {
      font-size: 1rem;
    }

    .detailed-view .detail-text {
      font-size: 0.75rem;
    }

    .card:last-child {
      margin-bottom: 2rem; /* Больший отступ на мобильных */
    }
  }
`;

export const loadingStyles = `
  .loading {
    height: 90vh;
    height: 90svh; /* Small viewport height */
    height: 90dvh; /* Dynamic viewport height */
    background: #e5e7eb;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    box-sizing: border-box;
    margin: 5vh auto; /* Центрируем по вертикали */
  }

  .loading-content {
    text-align: center;
  }

  .loading-text {
    color: #1f2937;
    font-size: 1.25rem;
    font-family: 'Inter', sans-serif;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }

  .spinner {
    width: 1.25rem;
    height: 1.25rem;
    border: 2px solid #1f2937;
    border-top-color: transparent;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-right: 0.5rem;
  }

  @keyframes spin {
    to { transform: rotate(360deg); }
  }

  @media (max-width: 480px) {
    .loading {
      border-radius: 0;
    }
  }
`;

export const errorStyles = `
  .error {
    height: 90vh;
    height: 90svh; /* Small viewport height */
    height: 90dvh; /* Dynamic viewport height */
    background: #fee2e2;
    border-radius: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
    box-sizing: border-box;
    margin: 5vh auto; /* Центрируем по вертикали */
  }

  .error-content {
    text-align: center;
  }

  .error-text {
    color: #991b1b;
    font-size: 1.25rem;
    font-family: 'Inter', sans-serif;
    margin-bottom: 1rem;
  }

  .retry-button {
    background: #ef4444;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 0.5rem;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    transition: background-color 0.2s;
  }

  .retry-button:hover {
    background: #dc2626;
  }

  @media (max-width: 480px) {
    .error {
      border-radius: 0;
    }
  }
`;