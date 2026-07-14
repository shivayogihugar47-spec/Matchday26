// @ts-check
/**
 * @fileoverview POST /api/crowd-report — Submit a live crowd congestion report.
 *
 * Accepts fan-submitted crowd reports for a specific stadium gate.
 * The frontend uses these reports to update the real-time crowd radar map
 * and calculate live wait time estimates.
 *
 * In production this would persist to a database or real-time store (e.g. Redis).
 * For this demo the frontend manages state locally via Zustand + localStorage.
 *
 * @module api/crowd-report
 */

import { setCors } from './_lib/helpers.js';

/**
 * @typedef {Object} CrowdReportBody
 * @property {string} zone        - Gate name (e.g. "AMEX Gate").
 * @property {string} congestion  - Congestion level: 'light' | 'medium' | 'heavy' | 'extreme'.
 * @property {number} waitTime    - Estimated wait time in seconds.
 */

/**
 * Crowd report handler.
 *
 * Logs the incoming report and returns a simple acknowledgement.
 * The frontend applies a weighted blend of the reported value
 * against the existing zone state to smooth out outlier reports.
 *
 * @param {import('@vercel/node').VercelRequest}  req - POST body: CrowdReportBody
 * @param {import('@vercel/node').VercelResponse} res - Response: { success: true, data: { received: true } }
 * @returns {void}
 *
 * @example
 * // POST /api/crowd-report
 * // Body: { "zone": "AMEX Gate", "congestion": "medium", "waitTime": 600 }
 * // → { success: true, data: { received: true } }
 */
export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { zone, congestion, waitTime } = req.body;
  console.log(`[Crowd report] Zone: ${zone}, Congestion: ${congestion}, Wait: ${waitTime}s`);
  res.json({ success: true, data: { received: true } });
}
