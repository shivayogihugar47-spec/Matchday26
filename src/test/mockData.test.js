/**
 * Tests for src/services/mockData.js
 * Covers: weather, match, zones, language translations
 */
import { describe, it, expect } from 'vitest';
import { mockWeather, mockMatch, mockZones, languageTranslations } from '../services/mockData.js';

describe('mockWeather', () => {
  it('has tempF as a number', () => expect(typeof mockWeather.tempF).toBe('number'));
  it('has tempC as a number', () => expect(typeof mockWeather.tempC).toBe('number'));
  it('tempF is within realistic range', () => {
    expect(mockWeather.tempF).toBeGreaterThan(-20);
    expect(mockWeather.tempF).toBeLessThan(130);
  });
  it('humidity is 0-100', () => {
    expect(mockWeather.humidity).toBeGreaterThanOrEqual(0);
    expect(mockWeather.humidity).toBeLessThanOrEqual(100);
  });
  it('rain is 0-100', () => {
    expect(mockWeather.rain).toBeGreaterThanOrEqual(0);
    expect(mockWeather.rain).toBeLessThanOrEqual(100);
  });
});

describe('mockMatch', () => {
  it('has homeTeam string', () => expect(typeof mockMatch.homeTeam).toBe('string'));
  it('has awayTeam string', () => expect(typeof mockMatch.awayTeam).toBe('string'));
  it('has a score object with home and away', () => {
    expect(mockMatch.score).toHaveProperty('home');
    expect(mockMatch.score).toHaveProperty('away');
  });
  it('score values are numbers or objects', () => {
    // score may be { home: number, away: number } or nested
    const score = mockMatch.score;
    expect(score).toBeDefined();
    expect(typeof score).toBe('object');
  });
  it('has a venue string', () => expect(typeof mockMatch.venue).toBe('string'));
  it('status is a non-empty string', () => {
    expect(typeof mockMatch.status).toBe('string');
    expect(mockMatch.status.length).toBeGreaterThan(0);
  });
});

describe('mockZones', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(mockZones)).toBe(true);
    expect(mockZones.length).toBeGreaterThan(0);
  });

  it('every zone has required fields', () => {
    mockZones.forEach((zone) => {
      expect(zone).toHaveProperty('id');
      expect(zone).toHaveProperty('name');
      expect(zone).toHaveProperty('congestion');
      expect(zone).toHaveProperty('waitTime');
      expect(zone).toHaveProperty('trend');
      expect(zone).toHaveProperty('reportCount');
    });
  });

  it('congestion values are between 0 and 1', () => {
    mockZones.forEach((zone) => {
      expect(zone.congestion).toBeGreaterThanOrEqual(0);
      expect(zone.congestion).toBeLessThanOrEqual(1);
    });
  });

  it('waitTime values are positive', () => {
    mockZones.forEach((zone) => {
      expect(zone.waitTime).toBeGreaterThan(0);
    });
  });

  it('trend values are valid', () => {
    const valid = ['stable', 'increasing', 'decreasing', 'steady'];
    mockZones.forEach((zone) => {
      expect(valid).toContain(zone.trend);
    });
  });

  it('has at least one recommended zone', () => {
    const recommended = mockZones.filter((z) => z.recommended);
    expect(recommended.length).toBeGreaterThan(0);
  });
});

describe('languageTranslations', () => {
  const requiredKeys = ['appTitle', 'weather', 'matchStatus', 'exitPlan', 'crowdReports', 'language'];
  const supportedLanguages = ['en', 'es', 'fr', 'de', 'pt', 'hi'];

  it('contains all supported languages', () => {
    supportedLanguages.forEach((lang) => {
      expect(languageTranslations).toHaveProperty(lang);
    });
  });

  supportedLanguages.forEach((lang) => {
    describe(`language: ${lang}`, () => {
      requiredKeys.forEach((key) => {
        it(`has key "${key}"`, () => {
          expect(languageTranslations[lang]).toHaveProperty(key);
          expect(typeof languageTranslations[lang][key]).toBe('string');
          expect(languageTranslations[lang][key].length).toBeGreaterThan(0);
        });
      });
    });
  });
});
