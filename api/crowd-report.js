import { setCors } from './_lib/helpers.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { zone, congestion, waitTime } = req.body;
  console.log(`[Crowd report] Zone: ${zone}, Congestion: ${congestion}, Wait: ${waitTime}s`);
  res.json({ success: true, data: { received: true } });
}
