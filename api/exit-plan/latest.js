import { setCors } from '../_lib/helpers.js';

// In-memory store per serverless instance (resets on cold start — acceptable for demo)
// For production persistence, swap this for a KV store (Vercel KV, Redis, etc.)
let lastExitPlan = null;

export function setLastExitPlan(plan) { lastExitPlan = plan; }

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  res.json({ success: true, data: lastExitPlan });
}
