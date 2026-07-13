import { setCors } from './_lib/helpers.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lon } = req.query;
  const latitude  = parseFloat(lat)  || 40.8135;  // MetLife Stadium fallback
  const longitude = parseFloat(lon)  || -74.0745;

  try {
    const url = [
      'https://api.open-meteo.com/v1/forecast',
      `?latitude=${latitude}&longitude=${longitude}`,
      '&current=temperature_2m,relative_humidity_2m,precipitation_probability,wind_speed_10m,weather_code',
      '&temperature_unit=fahrenheit&wind_speed_unit=mph&timezone=auto',
    ].join('');

    const response = await fetch(url);
    if (!response.ok) throw new Error(`Open-Meteo ${response.status}`);

    const raw = await response.json();
    const c = raw.current;
    const tempF = Math.round(c.temperature_2m);

    return res.json({
      success: true,
      data: {
        tempF,
        tempC: Math.round((tempF - 32) * 5 / 9),
        humidity: Math.round(c.relative_humidity_2m),
        rain: Math.round(c.precipitation_probability),
        wind: Math.round(c.wind_speed_10m),
        weatherCode: c.weather_code,
        source: 'open-meteo',
        updatedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error('[/api/weather] Error:', err.message, '— using mock fallback');
    return res.json({
      success: true,
      data: {
        tempF: 72, tempC: 22, humidity: 60,
        rain: 10, wind: 5,
        source: 'simulated',
        updatedAt: new Date().toISOString(),
      },
    });
  }
}
