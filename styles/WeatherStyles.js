export const weatherStyles = `
  .container {
    min-height: calc(100vh - 3rem); /* Adjust for address bar (~3rem is typical) */
    background: #e5e7eb;
    border-radius: 1rem;
    padding: 0.5rem; /* Reduced padding */
    display: flex;
    flex-direction: column;
    box-sizing: border-box; /* Ensure padding doesn't add to height */
  }

  .main {
    max-width: 20rem;
    margin: 0 auto;
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden; /* Prevent overflow */
  }

  .header {
    text-align: center;
    margin-bottom: 1rem; /* Reduced margin */
    margin-top: 0.25rem;
  }

  .title {
    font-size: 1.5rem; /* Slightly smaller */
    font-weight: 700;
    color: #1f2937;
    margin-bottom: 0.2rem; /* Reduced margin */
    font-family: 'Playfair Display', serif;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .update-time {
    font-size: 0.7rem; /* Slightly smaller */
    color: #6b7280;
    font-family: 'Inter', sans-serif;
    margin: 0 0 0.4rem 0; /* Reduced margin */
  }

  .refresh-button {
    background: #3b82f6;
    color: white;
    border: none;
    padding: 0.2rem 0.6rem; /* Reduced padding */
    border-radius: 0.375rem;
    cursor: pointer;
    font-family: 'Inter', sans-serif;
    font-size: 0.7rem; /* Slightly smaller */
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
    border-radius: 0.75rem; /* Slightly smaller radius */
    padding: 0.75rem; /* Reduced padding */
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    margin-bottom: 0.75rem; /* Reduced margin */
    cursor: pointer;
    transition: transform 0.2s;
  }

  .card:hover {
    transform: scale(1.02);
  }

  .card-title {
    font-size: 0.7rem; /* Slightly smaller */
    font-weight: 700;
    color: #9ca3af;
    text-transform: uppercase;
    text-align: center;
    margin-bottom: 0.5rem; /* Reduced margin */
    font-family: 'Inter', sans-serif;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  }

  .card-content {
    text-align: center;
  }

  .card-content .temp {
    font-size: clamp(1.75rem, 5vw, 2rem); /* Smaller font */
    font-weight: 700;
    color: #f97316;
    font-family: 'Poppins', sans-serif;
    margin: 0.3rem 0; /* Reduced margin */
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.4rem; /* Slightly smaller gap */
    white-space: nowrap;
    text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .card-content p {
    color: #4b5563;
    font-size: 0.8rem; /* Slightly smaller */
    line-height: 1.4; /* Reduced line height */
    margin: 0.2rem 0; /* Reduced margin */
    font-family: 'Inter', sans-serif;
  }

  .detailed-view {
    max-height: 0;
    overflow: auto;
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out;
    background: rgba(255, 255, 255, 0.9);
    border-radius: 0 0 0.75rem 0.75rem; /* Match card radius */
    padding: 0 0.75rem; /* Reduced padding */
    opacity: 0;
  }

  .detailed-view.open {
    max-height: 300px; /* Reduced max-height */
    padding: 0.75rem; /* Reduced padding */
    opacity: 1;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  .detailed-view .detail-item {
    margin-bottom: 0.75rem; /* Reduced margin */
    text-align: center;
    font-family: 'Inter', sans-serif;
  }

  .detailed-view .detail-item:last-child {
    margin-bottom: 0;
  }

  .detailed-view .detail-time {
    font-size: 0.9rem; /* Slightly smaller */
    font-weight: 600;
    color: #1f2937;
  }

  .detailed-view .detail-temp {
    font-size: 1.1rem; /* Slightly smaller */
    color: #f97316;
    font-family: 'Poppins', sans-serif;
  }

  .detailed-view .detail-text {
    font-size: 0.7rem; /* Slightly smaller */
    color: #4b5563;
  }

  @media (max-width: 480px) {
    .main {
      max-width: 100%;
      padding: 0 0.5rem; /* Added padding to prevent edge clipping */
    }

    .title {
      font-size: 1.25rem; /* Smaller */
    }

    .update-time {
      font-size: 0.65rem; /* Smaller */
    }

    .card-content .temp {
      font-size: clamp(1.5rem, 5vw, 1.75rem); /* Smaller */
    }

    .card-content p {
      font-size: 0.75rem; /* Smaller */
    }

    .card-title {
      font-size: 0.65rem; /* Smaller */
    }

    .detailed-view .detail-time {
      font-size: 0.8rem; /* Smaller */
    }

    .detailed-view .detail-temp {
      font-size: 0.9rem; /* Smaller */
    }

    .detailed-view .detail-text {
      font-size: 0.7rem; /* Smaller */
    }

    .card {
      padding: 0.5rem; /* Further reduced padding */
      margin-bottom: 0.5rem; /* Further reduced margin */
    }

    .detailed-view.open {
      max-height: 250px; /* Further reduced max-height */
      padding: 0.5rem; /* Further reduced padding */
    }
  }
`;