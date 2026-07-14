// @ts-check
/**
 * @fileoverview Application-wide constants for MatchDay 26.
 * Centralising magic values here improves maintainability and testability.
 */

/** MetLife Stadium GPS coordinates */
export const STADIUM_COORDS = { lat: 40.8135, lon: -74.0745 };

/** Congestion threshold — below this value a gate is considered flowing */
export const CONGESTION_LOW = 0.4;

/** Congestion threshold — below this value a gate is considered steady */
export const CONGESTION_HIGH = 0.7;

/** LocalStorage key for persisted crowd zone state */
export const CROWD_ZONES_STORAGE_KEY = 'crowd-map-zones';

/** Default wait time (minutes) shown in the report form */
export const DEFAULT_WAIT_TIME = 5;

/** Vapi SDK is considered ready only when both env vars are present */
export const VAPI_READY =
  !!import.meta.env.VITE_VAPI_PUBLIC_KEY &&
  !!import.meta.env.VITE_VAPI_ASSISTANT_ID;

/** Supported UI languages */
export const SUPPORTED_LANGUAGES = ['en', 'es', 'fr', 'de', 'pt', 'hi'];

/** Lost & Found desk location shown to fans */
export const LOST_FOUND_DESK_LOCATION = 'AMEX Gate concourse';

/** Reference number prefix for Lost & Found reports */
export const LF_REFERENCE_PREFIX = 'LF-';

/** Open-Meteo base URL */
export const OPEN_METEO_BASE_URL = 'https://api.open-meteo.com/v1/forecast';

/** OpenRouter API base URL */
export const OPENROUTER_BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';

/** OpenRouter model identifier */
export const OPENROUTER_MODEL = 'tencent/hy3:free';
