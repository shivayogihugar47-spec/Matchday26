import { buildSystemPrompt, getKb, setCors } from '../_lib/helpers.js';

export default function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { zone = '', accessibility = 'false', language = 'Auto-detect' } = req.query;
    const isAccessibility = accessibility === 'true';

    const systemPrompt = buildSystemPrompt({ zone, accessibility: isAccessibility, language });
    const kb = getKb();

    const variableValues = {
      zone: zone || 'the stadium',
      accessibility: isAccessibility ? 'yes' : 'no',
      language: language || 'Auto-detect',
      venue: kb.venue?.realName || 'MetLife Stadium',
      systemPrompt,
    };

    res.json({ success: true, data: { systemPrompt, variableValues } });
  } catch (err) {
    console.error('[system-prompt] Error:', err);
    res.status(500).json({ success: false, error: 'Failed to build system prompt' });
  }
}
