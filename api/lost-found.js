// @ts-check
/**
 * @fileoverview POST /api/lost-found — File a lost item or person report.
 *
 * This endpoint is called both directly (from the Lost & Found UI form)
 * and indirectly by the AI chat tool-calling pipeline when a fan describes
 * a lost item in natural language.
 *
 * The `handleLostFoundReport` utility is shared with `/api/chat` to ensure
 * consistent reference number generation and response format.
 *
 * @module api/lost-found
 */

import { handleLostFoundReport, setCors } from './_lib/helpers.js';

/**
 * Lost & Found report handler.
 *
 * Validates that a `description` is present, then delegates to the shared
 * `handleLostFoundReport` helper which generates a unique reference number
 * and logs the report for stadium staff.
 *
 * @param {import('@vercel/node').VercelRequest}  req - POST body: { itemType?, description, lastSeenLocation?, contactName?, contactPhone?, reportedAt? }
 * @param {import('@vercel/node').VercelResponse} res - Response: { success: true, data: { reference, message, reportedAt } }
 * @returns {void}
 *
 * @example
 * // POST /api/lost-found
 * // Body: { "itemType": "wallet", "description": "Black leather wallet", "lastSeenLocation": "Section 114" }
 * // → { success: true, data: { reference: "LF-ABC123", message: "...", reportedAt: "..." } }
 */
export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { itemType, description, lastSeenLocation, contactName, contactPhone, reportedAt } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const data = handleLostFoundReport({
    itemType,
    description,
    lastSeenLocation,
    contactName,
    contactPhone,
    reportedAt,
  });

  res.json({ success: true, data });
}
