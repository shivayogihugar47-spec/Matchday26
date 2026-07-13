/**
 * Tests for Vercel API route handlers
 * Covers: /api/health, /api/weather, /api/lost-found,
 *         /api/crowd-report, /api/concierge/system-prompt,
 *         /api/exit-plan/generate, /api/exit-plan/latest
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

// ── Mock helpers so API tests are self-contained ──────────────────────────
vi.mock('../../api/_lib/helpers.js', () => ({
  setCors:            vi.fn(),
  getKb:             vi.fn(() => ({ venue: { realName: 'MetLife Stadium' } })),
  buildSystemPrompt: vi.fn(() => 'You are MatchDay Concierge.'),
  handleLostFoundReport: vi.fn(({ description }) => ({
    reference: 'LF-TEST123',
    message: 'Report filed. Reference: LF-TEST123. Check Lost & Found desk near AMEX Gate.',
    reportedAt: '2026-07-19T15:00:00.000Z',
  })),
  TOOLS: [],
}));

// ── Minimal mock res/req factory ─────────────────────────────────────────
function makeRes() {
  const res = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code) { this._status = code; return this; },
    json(body)   { this._body = body; return this; },
    end()        { return this; },
    setHeader(k, v) { this._headers[k] = v; return this; },
  };
  return res;
}

// ── /api/health ───────────────────────────────────────────────────────────
describe('GET /api/health', () => {
  it('returns status ok', async () => {
    const { default: handler } = await import('../../api/health.js');
    const res = makeRes();
    handler({ method: 'GET' }, res);
    expect(res._body.status).toBe('ok');
    expect(res._body.timestamp).toBeDefined();
  });
});

// ── /api/lost-found ───────────────────────────────────────────────────────
describe('POST /api/lost-found', () => {
  let handler;
  beforeEach(async () => {
    const mod = await import('../../api/lost-found.js');
    handler = mod.default;
  });

  it('returns 405 for GET', async () => {
    const res = makeRes();
    await handler({ method: 'GET', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('returns 400 when description missing', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: {} }, res);
    expect(res._status).toBe(400);
  });

  it('returns reference for valid report', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { description: 'blue backpack', itemType: 'bag' } }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data.reference).toMatch(/^LF-/);
  });

  it('includes AMEX Gate in message', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { description: 'wallet' } }, res);
    expect(res._body.data.message).toContain('AMEX Gate');
  });
});

// ── /api/crowd-report ─────────────────────────────────────────────────────
describe('POST /api/crowd-report', () => {
  it('accepts a crowd report and returns received: true', async () => {
    const { default: handler } = await import('../../api/crowd-report.js');
    const res = makeRes();
    handler({ method: 'POST', body: { zone: 'AMEX Gate', congestion: 'medium', waitTime: 600 } }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data.received).toBe(true);
  });

  it('returns 405 for GET', async () => {
    const { default: handler } = await import('../../api/crowd-report.js');
    const res = makeRes();
    handler({ method: 'GET', body: {} }, res);
    expect(res._status).toBe(405);
  });
});

// ── /api/concierge/system-prompt ──────────────────────────────────────────
describe('GET /api/concierge/system-prompt', () => {
  it('returns systemPrompt and variableValues', async () => {
    const { default: handler } = await import('../../api/concierge/system-prompt.js');
    const res = makeRes();
    handler({ method: 'GET', query: { zone: 'AMEX Gate', accessibility: 'false', language: 'English' } }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data).toHaveProperty('systemPrompt');
    expect(res._body.data).toHaveProperty('variableValues');
  });

  it('variableValues contains zone', async () => {
    const { default: handler } = await import('../../api/concierge/system-prompt.js');
    const res = makeRes();
    handler({ method: 'GET', query: { zone: 'Verizon Gate', accessibility: 'false', language: 'English' } }, res);
    expect(res._body.data.variableValues.zone).toBe('Verizon Gate');
  });

  it('variableValues accessibility is yes when true', async () => {
    const { default: handler } = await import('../../api/concierge/system-prompt.js');
    const res = makeRes();
    handler({ method: 'GET', query: { zone: '', accessibility: 'true', language: 'English' } }, res);
    expect(res._body.data.variableValues.accessibility).toBe('yes');
  });
});

// ── /api/exit-plan/generate ───────────────────────────────────────────────
describe('POST /api/exit-plan/generate', () => {
  let handler;
  beforeEach(async () => {
    const mod = await import('../../api/exit-plan/generate.js');
    handler = mod.default;
  });

  it('returns 405 for GET', async () => {
    const res = makeRes();
    await handler({ method: 'GET', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('generates a train exit plan by default', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { transportMethod: 'train' } }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data.transportMethod).toBe('train');
    expect(res._body.data.steps.length).toBeGreaterThan(0);
    expect(res._body.data.recommendedGates.length).toBeGreaterThan(0);
  });

  it('generates an uber exit plan', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { transportMethod: 'uber' } }, res);
    expect(res._body.data.transportMethod).toBe('uber');
  });

  it('adds accessibility steps when hasAccessibleNeeds is true', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { transportMethod: 'train', hasAccessibleNeeds: true } }, res);
    const steps = res._body.data.steps.join(' ');
    expect(steps.toLowerCase()).toContain('elevator');
  });

  it('exit plan has generatedAt timestamp', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { transportMethod: 'bus' } }, res);
    expect(res._body.data.generatedAt).toBeDefined();
    expect(() => new Date(res._body.data.generatedAt)).not.toThrow();
  });
});

// ── /api/exit-plan/latest ─────────────────────────────────────────────────
describe('GET /api/exit-plan/latest', () => {
  it('returns null data initially', async () => {
    const { default: handler } = await import('../../api/exit-plan/latest.js');
    const res = makeRes();
    handler({ method: 'GET' }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data).toBeNull();
  });
});
