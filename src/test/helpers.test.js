/**
 * Tests for api/_lib/helpers.js
 * Covers: KB summary, system prompt builder, lost-found handler, tools definition
 */
import { describe, it, expect, vi } from 'vitest';

// Mock fs so tests don't need the real file on disk
vi.mock('fs', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    readFileSync: vi.fn(() =>
      JSON.stringify({
        venue: {
          realName: 'MetLife Stadium',
          tournamentName: 'New York New Jersey Stadium',
          address: '1 MetLife Stadium Drive, East Rutherford, NJ 07073',
        },
        capacity: { fifaSoccerConfigured: 82000 },
        gates: {
          list: [
            { id: 'amex',    name: 'AMEX Gate'    },
            { id: 'hcltech', name: 'HCLTech Gate' },
            { id: 'verizon', name: 'Verizon Gate' },
          ],
          elevatorsAt: ['HCLTech Gate', 'Verizon Gate'],
        },
        amenities: { paymentPolicy: 'Cashless only.' },
        transportation: {
          rail: { njtransit: { summary: 'NJ Transit from Penn Station.' } },
        },
      })
    ),
  };
});

// Must import AFTER mocking fs
const { buildKbSummary, buildSystemPrompt, handleLostFoundReport, TOOLS, setCors } =
  await import('../../api/_lib/helpers.js');

describe('buildKbSummary()', () => {
  it('includes venue name', () => {
    const summary = buildKbSummary();
    expect(summary).toContain('MetLife Stadium');
  });

  it('includes capacity', () => {
    // capacity may be a number or a descriptive string — just check it's mentioned
    expect(buildKbSummary()).toContain('82');
  });

  it('includes gate names', () => {
    const summary = buildKbSummary();
    expect(summary).toContain('AMEX Gate');
    expect(summary).toContain('Verizon Gate');
  });

  it('includes elevator info', () => {
    expect(buildKbSummary()).toContain('HCLTech Gate');
  });

  it('includes transport info', () => {
    expect(buildKbSummary()).toContain('NJ Transit');
  });
});

describe('buildSystemPrompt()', () => {
  it('returns a non-empty string', () => {
    const prompt = buildSystemPrompt({ zone: 'AMEX Gate', accessibility: false, language: 'English' });
    expect(typeof prompt).toBe('string');
    expect(prompt.length).toBeGreaterThan(100);
  });

  it('includes zone info when zone is provided', () => {
    const prompt = buildSystemPrompt({ zone: 'Verizon Gate', accessibility: false, language: 'English' });
    expect(prompt).toContain('Verizon Gate');
  });

  it('includes accessibility note when enabled', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: true, language: 'English' });
    expect(prompt).toContain('accessibility');
  });

  it('includes language instruction', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: false, language: 'Español' });
    expect(prompt).toContain('Español');
  });

  it('handles Auto-detect language gracefully', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: false, language: 'Auto-detect' });
    expect(prompt).toContain('Detect');
  });

  it('mentions AMEX Gate for lost & found guidance', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: false, language: 'English' });
    expect(prompt).toContain('AMEX Gate');
  });
});

describe('handleLostFoundReport()', () => {
  it('returns a reference number', () => {
    const result = handleLostFoundReport({
      itemType: 'wallet',
      description: 'Black leather wallet',
      lastSeenLocation: 'Section 114',
      contactName: 'Raza',
      contactPhone: '555-1234',
    });
    expect(result.reference).toMatch(/^LF-/);
  });

  it('reference is unique across calls', async () => {
    const r1 = handleLostFoundReport({ description: 'phone' });
    // small delay so Date.now() differs
    await new Promise((r) => setTimeout(r, 2));
    const r2 = handleLostFoundReport({ description: 'bag' });
    expect(r1.reference).not.toBe(r2.reference);
  });

  it('includes a message with desk location', () => {
    const result = handleLostFoundReport({ description: 'backpack' });
    expect(result.message).toContain('AMEX Gate');
  });

  it('sets reportedAt to a valid ISO string when not provided', () => {
    const result = handleLostFoundReport({ description: 'hat' });
    expect(() => new Date(result.reportedAt)).not.toThrow();
    expect(new Date(result.reportedAt).toISOString()).toBe(result.reportedAt);
  });

  it('uses provided reportedAt if supplied', () => {
    const ts = '2026-07-19T15:00:00.000Z';
    const result = handleLostFoundReport({ description: 'scarf', reportedAt: ts });
    expect(result.reportedAt).toBe(ts);
  });
});

describe('TOOLS definition', () => {
  it('exports an array with at least one tool', () => {
    expect(Array.isArray(TOOLS)).toBe(true);
    expect(TOOLS.length).toBeGreaterThan(0);
  });

  it('report_lost_item tool exists', () => {
    const tool = TOOLS.find((t) => t.function?.name === 'report_lost_item');
    expect(tool).toBeDefined();
  });

  it('report_lost_item has required parameters', () => {
    const tool = TOOLS.find((t) => t.function?.name === 'report_lost_item');
    expect(tool.function.parameters.required).toContain('description');
    expect(tool.function.parameters.required).toContain('itemType');
  });

  it('tool type is function', () => {
    TOOLS.forEach((t) => expect(t.type).toBe('function'));
  });
});

// ── Edge cases ───────────────────────────────────────────────────────────────

describe('buildSystemPrompt() — edge cases', () => {
  it('handles empty zone string gracefully', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: false, language: 'English' });
    expect(prompt).toContain('not specified a gate');
  });

  it('handles "null" string as zone gracefully', () => {
    const prompt = buildSystemPrompt({ zone: 'null', accessibility: false, language: 'English' });
    expect(prompt).toContain('not specified a gate');
  });

  it('handles "undefined" string as zone gracefully', () => {
    const prompt = buildSystemPrompt({ zone: 'undefined', accessibility: false, language: 'English' });
    expect(prompt).toContain('not specified a gate');
  });

  it('always includes safety behavior rule', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: false, language: 'English' });
    expect(prompt).toContain('safety');
  });

  it('always includes medical emergency instruction', () => {
    const prompt = buildSystemPrompt({ zone: '', accessibility: false, language: 'English' });
    expect(prompt).toContain('medical');
  });
});

describe('handleLostFoundReport() — edge cases', () => {
  it('handles missing optional fields gracefully', () => {
    const result = handleLostFoundReport({ description: 'red umbrella' });
    expect(result.reference).toMatch(/^LF-/);
    expect(result.message).toBeTruthy();
  });

  it('returns valid ISO 8601 reportedAt', () => {
    const result = handleLostFoundReport({ description: 'laptop' });
    const parsed = new Date(result.reportedAt);
    expect(isNaN(parsed.getTime())).toBe(false);
  });

  it('message always contains stadium desk info', () => {
    const result = handleLostFoundReport({ description: 'glasses' });
    expect(result.message).toContain('AMEX Gate');
    expect(result.message).toContain('Reference:');
  });
});

describe('setCors()', () => {
  it('sets Access-Control-Allow-Origin to *', () => {
    const headers = {};
    const mockRes = { setHeader: (k, v) => { headers[k] = v; } };
    setCors(mockRes);
    expect(headers['Access-Control-Allow-Origin']).toBe('*');
  });

  it('sets Access-Control-Allow-Methods', () => {
    const headers = {};
    const mockRes = { setHeader: (k, v) => { headers[k] = v; } };
    setCors(mockRes);
    expect(headers['Access-Control-Allow-Methods']).toContain('POST');
    expect(headers['Access-Control-Allow-Methods']).toContain('GET');
  });

  it('sets Content-Type in allowed headers', () => {
    const headers = {};
    const mockRes = { setHeader: (k, v) => { headers[k] = v; } };
    setCors(mockRes);
    expect(headers['Access-Control-Allow-Headers']).toContain('Content-Type');
  });
});
