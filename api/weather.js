// @ts-check
/**
 * @fileoverview GET /api/weather — Real-time stadium weather via Open-Meteo.
 *
 * Fetches current weather conditions for a given GPS coordinate.
 * Falls back to simulated MetLife Stadium data if the external API fails —
 * ensuring the UI never breaks in degraded network conditions.
 *
 * No API key required — uses the free Open-Meteo public API.
 *
 * @module api/weather
 */

import { setCors } from './_lib/helpers.js';

/** MetLife Stadium fallback latitude */
const DEFAULT_LAT = 40.8135;

/** MetLife Stadium fallback longitude */
const DEFAULT_LON = -74.0745;

/**
 * @typedef {Object} WeatherData
 * @property {number} tempF        - Temperature in Fahrenheit.
 * @property {number} tempC        - Temperature in Celsius.
 * @property {number} humidity     - Relative humidity percentage (0-100).
 * @property {number} rain         - Precipitation probability percentage (0-100).
 * @property {number} wind         - Wind speed in mph.
 * @property {number} [weatherCode]- WMO weather interpretation code.
 * @property {string} source       - Data source identifier ('open-meteo' | 'simulated').
 * @property {string} updatedAt    - ISO 8601 timestamp of data retrieval.
 */

/**
 * Weather handler. Accepts optional `lat` and `lon` query params.
 * If omitted, defaults to MetLife Stadium coordinates.
 *
 * @param {import('@vercel/node').VercelRequest}  req - Request with optional query: { lat, lon }.
 * @param {import('@vercel/node').VercelResponse} res - Response with { success: boolean, data: WeatherData }.
 * @returns {Promise<void>}
 *
 * @example
 * // GET /api/weather?lat=40.8135&lon=-74.0745
 * // → { success: true, data: { tempF: 72, tempC: 22, ... } }
 */
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const { lat, lon } = req.query;
  const latitude  = parseFloat(lat)  || DEFAULT_LAT;
  const longitude = parseFloat(lon)  || DEFAULT_LON;

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

    // Graceful degradation — return simulated data rather than a 500 error
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
