// @ts-check
/**
 * @fileoverview POST /api/exit-plan/generate — Generate a personalised exit plan.
 *
 * Creates a step-by-step exit plan based on the fan's preferred transport method
 * and accessibility needs. Plans are deterministic — the same inputs always
 * produce the same output — making them safe, predictable, and testable.
 *
 * Transport methods supported: 'train' | 'bus' | 'parking' | 'uber'
 *
 * Accessibility: when `hasAccessibleNeeds` is true, elevator-first steps are
 * prepended and an ADA assistance note is appended.
 *
 * @module api/exit-plan/generate
 */

import { setCors } from '../_lib/helpers.js';

/**
 * Gate recommendations keyed by transport method.
 * Based on verified MetLife Stadium layout data.
 *
 * @type {Record<string, string[]>}
 */
const BASE_GATE_RECOMMENDATIONS = {
  train:   ['AMEX Gate', 'Verizon Gate', "Moody's Gate"],
  bus:     ['HCLTech Gate', 'MetLife Gate'],
  parking: ['Platinum Lot Exit', 'Green Lot Exit'],
  uber:    ['Verizon Gate', 'MetLife Gate'],
};

/**
 * @typedef {Object} ExitPlanRequest
 * @property {'train'|'bus'|'parking'|'uber'} [transportMethod='train'] - Preferred transport.
 * @property {boolean}                         [hasAccessibleNeeds=false] - Accessibility routing.
 * @property {string}                          [preferredGate]            - Override for parking gate.
 */

/**
 * @typedef {Object} ExitPlan
 * @property {string}   title            - Human-readable plan title.
 * @property {string}   transportMethod  - Transport method used.
 * @property {string[]} recommendedGates - Ordered list of recommended gates.
 * @property {string[]} steps            - Ordered exit steps.
 * @property {string}   generatedAt      - ISO 8601 generation timestamp.
 */

/**
 * Builds the ordered list of exit steps for a given transport method.
 *
 * @param {string}   method        - Transport method.
 * @param {string[]} gates         - Recommended gates for this method.
 * @param {string}   [preferredGate] - Override gate for parking.
 * @returns {string[]} Ordered steps.
 */
function buildSteps(method, gates, preferredGate) {
  const stepsMap = {
    train: [
      `Exit via one of these recommended gates: ${gates.join(', ')}`,
      'Follow signs to Meadowlands Rail Line station',
      'Take the special event train directly to Secaucus Junction',
      'From Secaucus Junction, connect to your final destination',
    ],
    bus: [
      `Exit via one of these recommended gates: ${gates.join(', ')}`,
      'Proceed to designated bus pick-up zones',
      'Board NJ Transit Route 703 or Coach USA 351 Meadowlands Express',
    ],
    parking: [
      'Wait 10–15 minutes to avoid the initial exit surge',
      `Use ${preferredGate || 'your assigned lot exit'} for less congestion`,
      "Follow parking lot attendants' directions",
    ],
    uber: [
      `Exit via one of these recommended gates: ${gates.join(', ')}`,
      'Proceed to designated Uber/Lyft pick-up lot on-site',
    ],
  };

  return stepsMap[method] || ['Exit via the nearest available gate', 'Follow stadium staff directions'];
}

/**
 * Exit plan generation handler.
 *
 * @param {import('@vercel/node').VercelRequest}  req - POST body: ExitPlanRequest
 * @param {import('@vercel/node').VercelResponse} res - Response: { success: true, data: ExitPlan }
 * @returns {Promise<void>}
 */
export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { transportMethod = 'train', hasAccessibleNeeds = false, preferredGate } = req.body || {};

  const gateRecommendations = {
    ...BASE_GATE_RECOMMENDATIONS,
    parking: preferredGate ? [preferredGate] : BASE_GATE_RECOMMENDATIONS.parking,
  };

  const gates = gateRecommendations[transportMethod] || ['Verizon Gate'];
  let steps = buildSteps(transportMethod, gates, preferredGate);

  if (hasAccessibleNeeds) {
    steps = [
      "Use elevators at HCLTech Gate, Verizon Gate, or Moody's Gate",
      ...steps,
      'Ask any Accessibility Assistant for help if needed',
    ];
  }

  /** @type {ExitPlan} */
  const result = {
    title: `Personalized Exit Plan (${transportMethod})`,
    transportMethod,
    recommendedGates: gates,
    steps,
    generatedAt: new Date().toISOString(),
  };

  res.json({ success: true, result, data: result });
}
