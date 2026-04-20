import { test, expect, describe } from 'vitest';
import {
  generateRamp,
  STEPS,
  FAMILY_NAMES,
  DEFAULT_L_TARGETS,
  DEFAULT_CHROMA_PROFILE,
  registerOnWindow
} from './ramp.js';
import fixtures from './ramp-fixtures.json';

function parseHex(hex) {
  const h = hex.replace(/^#/, '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

describe('STEPS / FAMILY_NAMES / DEFAULT_*', () => {
  test('STEPS matches canonical 11-step sequence', () => {
    expect([...STEPS]).toEqual([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);
  });
  test('STEPS is frozen', () => {
    expect(Object.isFrozen(STEPS)).toBe(true);
  });
  test('FAMILY_NAMES matches design_panel_token_data.go ordering', () => {
    expect([...FAMILY_NAMES]).toEqual(['blue', 'red', 'orange', 'yellow', 'green', 'grey']);
  });
  test('DEFAULT_L_TARGETS is frozen and has 11 entries', () => {
    expect(Object.isFrozen(DEFAULT_L_TARGETS)).toBe(true);
    expect(Object.keys(DEFAULT_L_TARGETS)).toHaveLength(11);
  });
  test('DEFAULT_CHROMA_PROFILE is frozen and has 11 entries', () => {
    expect(Object.isFrozen(DEFAULT_CHROMA_PROFILE)).toBe(true);
    expect(Object.keys(DEFAULT_CHROMA_PROFILE)).toHaveLength(11);
  });
  test('500 step has L target 0.58', () => {
    expect(DEFAULT_L_TARGETS[500]).toBe(0.58);
  });
  test('500 step has chroma profile 0.8', () => {
    expect(DEFAULT_CHROMA_PROFILE[500]).toBe(0.8);
  });
});

describe('generateRamp shape', () => {
  test('returns array of 11 entries for blue anchor', () => {
    const ramp = generateRamp({ anchorHex: '#1966D9', anchorStep: 500 });
    expect(ramp).toHaveLength(11);
    for (const entry of ramp) {
      expect(typeof entry.step).toBe('number');
      expect(typeof entry.hex).toBe('string');
      expect(entry.hex).toMatch(/^#[0-9a-f]{6}$/);
      expect(typeof entry.L).toBe('number');
      expect(typeof entry.C).toBe('number');
      expect(typeof entry.H).toBe('number');
    }
  });

  test('steps appear in canonical order', () => {
    const ramp = generateRamp({ anchorHex: '#1966D9', anchorStep: 500 });
    expect(ramp.map(r => r.step)).toEqual([...STEPS]);
  });

  test('throws on missing anchorHex', () => {
    expect(() => generateRamp({})).toThrow();
    expect(() => generateRamp(null)).toThrow();
  });

  test('isNeutral without neutralChroma/Hue throws', () => {
    expect(() =>
      generateRamp({ anchorHex: '#f9f5f0', anchorStep: 100, isNeutral: true })
    ).toThrow();
  });
});

describe('generateRamp byte parity with Assembly Go output', () => {
  for (const family of FAMILY_NAMES) {
    test(`${family} ramp matches Go within ±1 RGB byte across all 11 steps`, () => {
      const fixture = fixtures.families[family];
      expect(fixture, `missing fixture for ${family}`).toBeDefined();

      const { config, ramp: expected } = fixture;
      const actual = generateRamp(config);

      expect(actual).toHaveLength(expected.length);

      for (let i = 0; i < expected.length; i++) {
        const e = expected[i];
        const a = actual[i];
        expect(a.step).toBe(e.step);

        const [er, eg, eb] = parseHex(e.hex);
        const [ar, ag, ab] = parseHex(a.hex);
        const dr = Math.abs(er - ar);
        const dg = Math.abs(eg - ag);
        const db = Math.abs(eb - ab);

        expect(
          dr,
          `${family}-${e.step} R channel: expected ${e.hex}, got ${a.hex} (diff R=${dr} G=${dg} B=${db})`
        ).toBeLessThanOrEqual(1);
        expect(dg, `${family}-${e.step} G channel: expected ${e.hex}, got ${a.hex}`).toBeLessThanOrEqual(1);
        expect(db, `${family}-${e.step} B channel: expected ${e.hex}, got ${a.hex}`).toBeLessThanOrEqual(1);
      }
    });
  }
});

describe('generateRamp anchor-step pinning', () => {
  test('blue step 500 hex matches anchor within ±1 byte', () => {
    const { config } = fixtures.families.blue;
    const ramp = generateRamp(config);
    const anchor = ramp.find(r => r.step === config.anchorStep);
    const [er, eg, eb] = parseHex(config.anchorHex);
    const [ar, ag, ab] = parseHex(anchor.hex);
    expect(Math.abs(er - ar)).toBeLessThanOrEqual(1);
    expect(Math.abs(eg - ag)).toBeLessThanOrEqual(1);
    expect(Math.abs(eb - ab)).toBeLessThanOrEqual(1);
  });

  test('anchor step uses anchor L/C/H directly (not derived from profile)', () => {
    const config = { anchorHex: '#1966D9', anchorStep: 500 };
    const ramp = generateRamp(config);
    const anchor = ramp.find(r => r.step === 500);
    // anchor.L should match the OKLCH of #1966D9 exactly (post-clamp), not
    // DEFAULT_L_TARGETS[500] = 0.58.
    expect(anchor.L).not.toBe(0.58);
  });
});

describe('generateRamp neutral branch', () => {
  test('matches neutralFamily fixture within ±1 RGB byte', () => {
    const { config, ramp: expected } = fixtures.neutralFamily;
    const actual = generateRamp(config);

    expect(actual).toHaveLength(expected.length);

    for (let i = 0; i < expected.length; i++) {
      const e = expected[i];
      const a = actual[i];
      const [er, eg, eb] = parseHex(e.hex);
      const [ar, ag, ab] = parseHex(a.hex);
      expect(Math.abs(er - ar)).toBeLessThanOrEqual(1);
      expect(Math.abs(eg - ag)).toBeLessThanOrEqual(1);
      expect(Math.abs(eb - ab)).toBeLessThanOrEqual(1);
    }
  });

  test('all 11 steps have near-zero chroma', () => {
    const { config } = fixtures.neutralFamily;
    const ramp = generateRamp(config);
    for (const entry of ramp) {
      expect(entry.C).toBeLessThan(0.03);
    }
  });

  test('all 11 steps use the neutralHue', () => {
    const config = {
      anchorHex: '#f9f5f0',
      anchorStep: 100,
      isNeutral: true,
      neutralChroma: 0.012,
      neutralHue: 75
    };
    const ramp = generateRamp(config);
    // Anchor step pins to actual hue; other steps should be at neutralHue.
    for (const entry of ramp) {
      if (entry.step === config.anchorStep) continue;
      expect(Math.abs(entry.H - 75)).toBeLessThan(1);
    }
  });
});

describe('generateRamp overrides', () => {
  test('override L/C/H wins over computed path for that step', () => {
    const ramp = generateRamp({
      anchorHex: '#1966D9',
      anchorStep: 500,
      overrides: { 300: [0.5, 0.1, 30] }
    });
    const override = ramp.find(r => r.step === 300);
    expect(override.L).toBeCloseTo(0.5, 3);
    expect(override.H).toBeCloseTo(30, 3);
  });

  test('other steps remain unaffected by an override on one step', () => {
    const withOverride = generateRamp({
      anchorHex: '#1966D9',
      anchorStep: 500,
      overrides: { 300: [0.5, 0.1, 30] }
    });
    const without = generateRamp({ anchorHex: '#1966D9', anchorStep: 500 });
    const hexAt = (arr, step) => arr.find(r => r.step === step).hex;
    expect(hexAt(withOverride, 500)).toBe(hexAt(without, 500));
    expect(hexAt(withOverride, 100)).toBe(hexAt(without, 100));
  });
});

describe('generateRamp hueFn', () => {
  test('hueFn overrides per-step hue', () => {
    const ramp = generateRamp({
      anchorHex: '#1966D9',
      anchorStep: 500,
      hueFn: (step) => step / 10 // arbitrary mapping
    });
    const at100 = ramp.find(r => r.step === 100);
    const at500 = ramp.find(r => r.step === 500);
    // step 500 is anchor-pinned and bypasses hueFn.
    expect(at500.hex).toBeDefined();
    // step 100 uses hueFn(100) = 10, clampChroma may adjust C but H should survive.
    expect(Math.abs(at100.H - 10)).toBeLessThan(1);
  });
});

describe('registerOnWindow', () => {
  test('attaches ramp surface to a window-like object', () => {
    const fakeWindow = {};
    registerOnWindow(fakeWindow);
    expect(typeof fakeWindow.DesignPanelColor.generateRamp).toBe('function');
    expect(fakeWindow.DesignPanelColor.STEPS).toEqual([...STEPS]);
    expect(fakeWindow.DesignPanelColor.FAMILY_NAMES).toEqual([...FAMILY_NAMES]);
  });
  test('merges with existing DesignPanelColor namespace', () => {
    const fakeWindow = { DesignPanelColor: { hexToOKLCH: () => null } };
    registerOnWindow(fakeWindow);
    expect(typeof fakeWindow.DesignPanelColor.hexToOKLCH).toBe('function');
    expect(typeof fakeWindow.DesignPanelColor.generateRamp).toBe('function');
  });
});
