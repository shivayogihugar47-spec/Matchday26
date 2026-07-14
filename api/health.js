// @ts-check
/**
 * @fileoverview GET /api/health — Service health check endpoint.
 *
 * Returns a simple status object to confirm the API is running.
 * Used by monitoring tools and the Vercel deployment pipeline.
 *
 * @module api/health
 */

import { setCors } from './_lib/helpers.js';

/**
 * Health check handler.
 *
 * @param {import('@vercel/node').VercelRequest}  req - Incoming request.
 * @param {import('@vercel/node').VercelResponse} res - Outgoing response.
 * @returns {void}
 *
 * @example
 * // GET /api/health
 * // → { "status": "ok", "timestamp": "2026-07-19T15:00:00.000Z" }
 */
export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
}
