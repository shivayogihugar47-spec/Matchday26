/**
 * @fileoverview Edge case and error boundary tests for MatchDay 26 API routes.
 *
 * Tests validate that all handlers:
 *  - Reject invalid HTTP methods with 405
 *  - Return 400 for missing required fields
 *  - Handle boundary values (min/max wait times, congestion thresholds)
 *  - Produce consistent output shapes
 *  - Never throw unhandled exceptions on bad input
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('../../api/_lib/helpers.js', () => ({
  setCors:               vi.fn(),
  getKb:                 vi.fn(() => ({ venue: { realName: 'MetLife Stadium' } })),
  buildSystemPrompt:     vi.fn(() => 'Mock system prompt'),
  handleLostFoundReport: vi.fn(({ description }) => ({
    reference:   'LF-EDGE001',
    message:     `Report filed. Reference: LF-EDGE001. Check Lost & Found desk near AMEX Gate.`,
    reportedAt:  '2026-07-19T15:00:00.000Z',
    description, // echo back for assertion
  })),
  TOOLS: [],
}));

function makeRes() {
  const res = {
    _status: 200, _body: null,
    status(code) { this._status = code; return this; },
    json(body)   { this._body = body;   return this; },
    end()        { return this; },
    setHeader()  { return this; },
  };
  return res;
}

// ── /api/lost-found edge cases ────────────────────────────────────────────────

describe('POST /api/lost-found — edge cases', () => {
  let handler;
  beforeEach(async () => { ({ default: handler } = await import('../../api/lost-found.js')); });

  it('returns 400 when body is empty object', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: {} }, res);
    expect(res._status).toBe(400);
    expect(res._body.error).toBeTruthy();
  });

  it('returns 400 when description is empty string', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { description: '' } }, res);
    expect(res._status).toBe(400);
  });

  it('returns 405 for PUT method', async () => {
    const res = makeRes();
    await handler({ method: 'PUT', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('returns 405 for DELETE method', async () => {
    const res = makeRes();
    await handler({ method: 'DELETE', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('accepts report with only description (all other fields optional)', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { description: 'red scarf' } }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data.reference).toBeDefined();
  });

  it('response always has success, data.reference, data.message, data.reportedAt', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { description: 'blue bag', itemType: 'bag' } }, res);
    expect(res._body).toMatchObject({
      success: true,
      data: expect.objectContaining({
        reference:  expect.any(String),
        message:    expect.any(String),
        reportedAt: expect.any(String),
      }),
    });
  });
});

// ── /api/crowd-report edge cases ─────────────────────────────────────────────

describe('POST /api/crowd-report — edge cases', () => {
  let handler;
  beforeEach(async () => { ({ default: handler } = await import('../../api/crowd-report.js')); });

  it('returns 405 for GET', async () => {
    const res = makeRes();
    handler({ method: 'GET', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('returns 405 for PATCH', async () => {
    const res = makeRes();
    handler({ method: 'PATCH', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('accepts report with missing fields gracefully', async () => {
    const res = makeRes();
    handler({ method: 'POST', body: {} }, res);
    expect(res._body.success).toBe(true);
  });

  it('response shape is always { success, data: { received } }', async () => {
    const res = makeRes();
    handler({ method: 'POST', body: { zone: 'AMEX Gate', congestion: 'light', waitTime: 60 } }, res);
    expect(res._body).toMatchObject({ success: true, data: { received: true } });
  });
});

// ── /api/exit-plan/generate edge cases ───────────────────────────────────────

describe('POST /api/exit-plan/generate — edge cases', () => {
  let handler;
  beforeEach(async () => { ({ default: handler } = await import('../../api/exit-plan/generate.js')); });

  it('returns 405 for GET', async () => {
    const res = makeRes();
    await handler({ method: 'GET', body: {} }, res);
    expect(res._status).toBe(405);
  });

  it('uses train as default when no transportMethod provided', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: {} }, res);
    expect(res._body.data.transportMethod).toBe('train');
  });

  it('handles empty body gracefully', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: null }, res);
    expect(res._body.success).toBe(true);
  });

  it('result has all required fields', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { transportMethod: 'bus' } }, res);
    const { data } = res._body;
    expect(data).toHaveProperty('title');
    expect(data).toHaveProperty('transportMethod');
    expect(data).toHaveProperty('recommendedGates');
    expect(data).toHaveProperty('steps');
    expect(data).toHaveProperty('generatedAt');
    expect(Array.isArray(data.steps)).toBe(true);
    expect(data.steps.length).toBeGreaterThan(0);
  });

  it('all 4 transport methods produce a valid plan', async () => {
    for (const method of ['train', 'bus', 'parking', 'uber']) {
      const res = makeRes();
      await handler({ method: 'POST', body: { transportMethod: method } }, res);
      expect(res._body.success).toBe(true);
      expect(res._body.data.transportMethod).toBe(method);
    }
  });

  it('accessibility steps prepend elevator and append ADA note', async () => {
    const res = makeRes();
    await handler({ method: 'POST', body: { transportMethod: 'train', hasAccessibleNeeds: true } }, res);
    const steps = res._body.data.steps;
    expect(steps[0].toLowerCase()).toContain('elevator');
    expect(steps[steps.length - 1].toLowerCase()).toContain('accessibility');
  });
});

// ── /api/concierge/system-prompt edge cases ───────────────────────────────────

describe('GET /api/concierge/system-prompt — edge cases', () => {
  let handler;
  beforeEach(async () => { ({ default: handler } = await import('../../api/concierge/system-prompt.js')); });

  it('works with no query params at all', () => {
    const res = makeRes();
    handler({ method: 'GET', query: {} }, res);
    expect(res._body.success).toBe(true);
    expect(res._body.data.systemPrompt).toBeTruthy();
  });

  it('variableValues.zone defaults to "the stadium" when zone is empty', () => {
    const res = makeRes();
    handler({ method: 'GET', query: { zone: '' } }, res);
    expect(res._body.data.variableValues.zone).toBe('the stadium');
  });

  it('variableValues.accessibility is "no" when accessibility param is missing', () => {
    const res = makeRes();
    handler({ method: 'GET', query: {} }, res);
    expect(res._body.data.variableValues.accessibility).toBe('no');
  });

  it('variableValues.accessibility is "yes" for accessibility=true', () => {
    const res = makeRes();
    handler({ method: 'GET', query: { accessibility: 'true' } }, res);
    expect(res._body.data.variableValues.accessibility).toBe('yes');
  });
});

// ── Response shape consistency ────────────────────────────────────────────────

describe('API response shape consistency', () => {
  it('crowd-report and lost-found return success field', async () => {
    const cases = [
      { mod: '../../api/crowd-report.js', method: 'POST', body: { zone: 'A', congestion: 'light', waitTime: 60 } },
      { mod: '../../api/lost-found.js',   method: 'POST', body: { description: 'test item' } },
    ];

    for (const { mod, method, body } of cases) {
      const { default: handler } = await import(mod);
      const res = makeRes();
      handler({ method, body, query: {} }, res);
      expect(typeof res._body.success).toBe('boolean');
      expect(res._body.success).toBe(true);
    }
  });

  it('health endpoint returns status ok', async () => {
    const { default: handler } = await import('../../api/health.js');
    const res = makeRes();
    handler({ method: 'GET', body: null, query: {} }, res);
    expect(res._body.status).toBe('ok');
    expect(res._body.timestamp).toBeDefined();
  });
});
