'use client';

import React, { useEffect, useState } from 'react';

interface HourlyForecast {
  time: string;
  temp: number;
  icon: string;
  condition: string;
  dt: number;
}

interface WeatherData {
  location: string;
  temperature: number;
  feelsLike: number;
  condition: string;
  conditionMain: string;
  humidity: number;
  windSpeed: number;
  windDir: string;
  rain: number;
  high: number;
  low: number;
  visibility: number;
  hourly: HourlyForecast[];
}

const WeatherWidget: React.FC = () => {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [error, setError] = useState(false);
  const [isCelsius, setIsCelsius] = useState(false);

  const API_KEY = '52ea06597b4d38b69a2eb5b8db90bd3f';

  const celsiusToFahrenheit = (celsius: number) =>
    Math.round((celsius * 9) / 5 + 32);
  const fahrenheitToCelsius = (fahrenheit: number) =>
    Math.round(((fahrenheit - 32) * 5) / 9);

  const convertTemp = (temp: number) => {
    return isCelsius ? temp : celsiusToFahrenheit(temp);
  };

  const getTempUnit = () => (isCelsius ? 'C' : 'F');

  const getWindDirection = (deg: number) => {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(deg / 45) % 8];
  };

  const getConditionEmoji = (main: string) => {
    switch (main.toLowerCase()) {
      case 'rain':
        return '🌧';
      case 'clouds':
        return '☁';
      case 'clear':
        return '🌞';
      case 'snow':
        return '❄';
      case 'thunderstorm':
        return '⛈';
      case 'drizzle':
        return '🌦';
      case 'fog':
      case 'mist':
      case 'haze':
        return '🌫';
      default:
        return '🌡';
    }
  };

  const getFormattedDateTime = () => {
    const now = new Date();
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    };
    const date = now.toLocaleDateString(undefined, options);
    const time = now.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${date} • ${time}`;
  };

  const toggleTemperatureUnit = () => {
    setIsCelsius(!isCelsius);
  };

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        navigator.geolocation.getCurrentPosition(
          async ({ coords }) => {
            const { latitude, longitude } = coords;

            const currentRes = await fetch(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );

            const forecastRes = await fetch(
              `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );

            if (!currentRes.ok || !forecastRes.ok)
              throw new Error('API failed');

            const current = await currentRes.json();
            const forecast = await forecastRes.json();

            const now = new Date();
            const currentHour = now.getHours();
            const todayDate = now.toDateString();

            const hourly = forecast.list
              .map((h: any) => {
                const dtObj = new Date(h.dt * 1000);
                const hour = dtObj.getHours();
                const dateStr = dtObj.toDateString();
                const day = dtObj.toLocaleDateString(undefined, {
                  weekday: 'short',
                });
                const timeStr = dtObj.toLocaleTimeString([], {
                  hour: 'numeric',
                  hour12: true,
                });

                return {
                  time: `${day} • ${timeStr}`,
                  temp: Math.round(h.main.temp),
                  icon: `https://openweathermap.org/img/wn/${h.weather[0].icon}@2x.png`,
                  condition: h.weather[0].main,
                  dt: h.dt,
                  hour,
                  isToday: dateStr === todayDate,
                };
              })
              .filter((h: any) => {
                return (h.isToday && h.hour > currentHour) || !h.isToday;
              })
              .slice(0, 5);

            setWeather({
              location: `${current.name}, ${current.sys.country}`,
              temperature: Math.round(current.main.temp),
              feelsLike: Math.round(current.main.feels_like),
              condition: current.weather[0].description,
              conditionMain: current.weather[0].main,
              humidity: current.main.humidity,
              windSpeed: Math.round(current.wind.speed * 2.237),
              windDir: getWindDirection(current.wind.deg),
              rain: current.rain?.['1h'] ?? 0,
              high: Math.round(current.main.temp_max),
              low: Math.round(current.main.temp_min),
              visibility: Math.round(current.visibility / 1609),
              hourly,
            });
          },
          () => setError(true)
        );
      } catch (err) {
        console.error(err);
        setError(true);
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return (
      <div
        className="widget-card"
        style={{ padding: '12px', fontSize: '11px', color: '#fef2f2' }}>
        ❌ Failed to load weather data.
      </div>
    );
  }

  if (!weather) {
    return (
      <div
        className="widget-card"
        style={{ padding: '12px', fontSize: '11px', color: '#fef2f2' }}>
        ⏳ Loading weather...
      </div>
    );
  }

  return (
    <div className="widget-card weather-card">
      {/* Top-right date and icon */}
      <div
        style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          textAlign: 'right',
        }}>
        <div style={{ fontSize: '10px', fontWeight: 500 }}>
          {getFormattedDateTime()}
        </div>
        <div style={{ fontSize: '20px' }}>
          {getConditionEmoji(weather.conditionMain)}
        </div>

        {/* Temperature Unit Toggle - F/C Switch */}
        <div
          style={{
            marginTop: '8px',
            display: 'flex',
            backgroundColor: 'rgba(255, 255, 255, 0.12)',
            borderRadius: '20px',
            padding: '2px',
            fontSize: '9px',
            fontWeight: 600,
            width: '70px',
            justifyContent: 'space-between',
          }}>
          <div
            style={{
              padding: '3px 6px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: !isCelsius
                ? 'rgba(255, 255, 255, 0.3)'
                : 'transparent',
              color: !isCelsius ? 'white' : 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              flex: 1,
            }}
            onClick={() => setIsCelsius(false)}>
            °F
          </div>
          <div
            style={{
              padding: '3px 6px',
              borderRadius: '12px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              backgroundColor: isCelsius
                ? 'rgba(255, 255, 255, 0.3)'
                : 'transparent',
              color: isCelsius ? 'white' : 'rgba(255, 255, 255, 0.7)',
              textAlign: 'center',
              flex: 1,
            }}
            onClick={() => setIsCelsius(true)}>
            °C
          </div>
        </div>
      </div>

      {/* Header */}
      <div style={{ fontSize: '20px', fontWeight: 600, marginBottom: '5px' }}>
        Weather
      </div>
      <div style={{ fontSize: '13px', opacity: 0.85, marginBottom: '5px' }}>
        {weather.location}
      </div>

      {/* Main Temp */}
      <div style={{ fontSize: '36px', fontWeight: 700, marginBottom: '5px' }}>
        {convertTemp(weather.temperature)}°{getTempUnit()}
      </div>
      <div
        style={{
          fontSize: '10px',
          textTransform: 'capitalize',
          opacity: 0.9,
          marginBottom: '12px',
        }}>
        {weather.condition}
      </div>

      {/* High / Low / Feels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: '13px',
          marginBottom: '15px',
          fontWeight: 500,
        }}>
        <div>
          H: {convertTemp(weather.high)}°{getTempUnit()}
        </div>
        <div>
          L: {convertTemp(weather.low)}°{getTempUnit()}
        </div>
        <div>
          Feels {convertTemp(weather.feelsLike)}°{getTempUnit()}
        </div>
      </div>

      {/* Hourly Forecast */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          backgroundColor: 'rgba(255, 255, 255, 0.1)',
          padding: '6px',
          borderRadius: '8px',
          gap: '4px',
          marginBottom: '4px',
        }}>
        {weather.hourly.map((h, i) => (
          <div
            key={i}
            style={{ textAlign: 'center', fontSize: '9px', flex: 1 }}>
            <div style={{ marginBottom: '1px' }}>{h.time}</div>
            <img
              src={h.icon}
              alt={h.condition}
              style={{ width: 32, height: 32 }}
            />
            <div style={{ fontWeight: 600 }}>
              {convertTemp(h.temp)}°{getTempUnit()}
            </div>
          </div>
        ))}
      </div>

      <style>{`
  .weather-card {
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto,
      "Helvetica Neue", Arial, sans-serif;
    background: white;
    color: #1e293b; /* dark readable text */
    padding: 16px;
    border-radius: 16px;
    border: 1px solid #e2e8f0;
    position: relative;
    overflow: hidden;
    opacity: 0;
    transform: translateY(10px);
    animation: fadeInUp 0.6s ease-out 0.3s forwards;
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
    cursor: pointer;
  }

  .weather-card:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
    transform: translateY(0);
  }

  .weather-hourly {
    display: flex;
    justify-content: space-between;
    background: #f8fafc;
    padding: 6px;
    border-radius: 10px;
    border: 1px solid #0960da30;
    gap: 4px;
    margin-bottom: 4px;
  }

  .weather-hourly > div {
    text-align: center;
    font-size: 9px;
    flex: 1;
  }

  .weather-hourly img {
    width: 32px;
    height: 32px;
  }

  @keyframes fadeInUp {
    from { opacity: 0; transform: translateY(10px); }
    to   { opacity: 1; transform: translateY(0); }
  }
`}</style>
    </div>
  );
};

export default WeatherWidget;
