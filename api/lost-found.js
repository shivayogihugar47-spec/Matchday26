import { handleLostFoundReport, setCors } from './_lib/helpers.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { itemType, description, lastSeenLocation, contactName, contactPhone, reportedAt } = req.body;

  if (!description) {
    return res.status(400).json({ error: 'Description is required' });
  }

  const data = handleLostFoundReport({ itemType, description, lastSeenLocation, contactName, contactPhone, reportedAt });
  res.json({ success: true, data });
}
