import { test, expect, describe } from 'vitest';
import {
  hexToSRGB,
  sRGBToHex,
  sRGBToLinearRGB,
  linearRGBToSRGB,
  hexToOKLCH,
  oklchToHex,
  isInSRGBGamut,
  maxChromaSRGB,
  clampChroma,
  clampFloat,
  registerOnWindow
} from './oklch.js';
import fixtures from './oklch-fixtures.json';

// Parse "#rrggbb" -> [r, g, b] bytes for tolerance comparisons.
function parseHex(hex) {
  const h = hex.replace(/^#/, '');
  const n = parseInt(h, 16);
  return [(n >> 16) & 0xff, (n >> 8) & 0xff, n & 0xff];
}

describe('hexToSRGB', () => {
  test('white', () => {
    expect(hexToSRGB('#ffffff')).toEqual({ R: 1, G: 1, B: 1 });
  });
  test('black', () => {
    expect(hexToSRGB('#000000')).toEqual({ R: 0, G: 0, B: 0 });
  });
  test('accepts uppercase', () => {
    expect(hexToSRGB('#FF8040')).toEqual({
      R: 1,
      G: 128 / 255,
      B: 64 / 255
    });
  });
  test('throws on invalid input', () => {
    expect(() => hexToSRGB('notahex')).toThrow();
    expect(() => hexToSRGB('#12345')).toThrow();
    expect(() => hexToSRGB('#gghhii')).toThrow();
  });
});

describe('sRGBToHex', () => {
  test('clamps negative to 00', () => {
    expect(sRGBToHex({ R: -0.5, G: 0, B: 0 })).toBe('#000000');
  });
  test('clamps above 1 to ff', () => {
    expect(sRGBToHex({ R: 2, G: 1, B: 1 })).toBe('#ffffff');
  });
  test('handles NaN via guard', () => {
    expect(sRGBToHex({ R: NaN, G: 0, B: 0 })).toBe('#000000');
  });
  test('rounds correctly at midpoint', () => {
    // 0.5 * 255 = 127.5, rounds to 128 = 0x80
    expect(sRGBToHex({ R: 0.5, G: 0.5, B: 0.5 })).toBe('#808080');
  });
  test('zero-pads single hex digit channels', () => {
    expect(sRGBToHex({ R: 1 / 255, G: 0, B: 0 })).toBe('#010000');
  });
});

describe('sRGB gamma round-trip', () => {
  test(`values within ${fixtures.gammaRoundTripTolerance} tolerance`, () => {
    for (const v of fixtures.gammaRoundTripValues) {
      const lin = sRGBToLinearRGB({ R: v, G: v, B: v });
      const back = linearRGBToSRGB(lin);
      expect(Math.abs(back.R - v)).toBeLessThan(fixtures.gammaRoundTripTolerance);
      expect(Math.abs(back.G - v)).toBeLessThan(fixtures.gammaRoundTripTolerance);
      expect(Math.abs(back.B - v)).toBeLessThan(fixtures.gammaRoundTripTolerance);
    }
  });
});

describe('hexToOKLCH / oklchToHex round-trip', () => {
  for (const f of fixtures.roundTripHexes) {
    test(`${f.hex} round-trips within ±2 bytes per channel`, () => {
      const oklch = hexToOKLCH(f.hex);
      const out = oklchToHex(oklch);
      const [er, eg, eb] = parseHex(f.hex);
      const [ar, ag, ab] = parseHex(out);
      expect(Math.abs(er - ar)).toBeLessThanOrEqual(2);
      expect(Math.abs(eg - ag)).toBeLessThanOrEqual(2);
      expect(Math.abs(eb - ab)).toBeLessThanOrEqual(2);
    });
  }
});

describe('hexToOKLCH blue anchor bounds', () => {
  const { hex, LBounds, CBounds, HBounds } = fixtures.blueAnchor;
  const oklch = hexToOKLCH(hex);
  test(`${hex} L in [${LBounds[0]}, ${LBounds[1]}]`, () => {
    expect(oklch.L).toBeGreaterThanOrEqual(LBounds[0]);
    expect(oklch.L).toBeLessThanOrEqual(LBounds[1]);
  });
  test(`${hex} C in [${CBounds[0]}, ${CBounds[1]}]`, () => {
    expect(oklch.C).toBeGreaterThanOrEqual(CBounds[0]);
    expect(oklch.C).toBeLessThanOrEqual(CBounds[1]);
  });
  test(`${hex} H in [${HBounds[0]}, ${HBounds[1]}]`, () => {
    expect(oklch.H).toBeGreaterThanOrEqual(HBounds[0]);
    expect(oklch.H).toBeLessThanOrEqual(HBounds[1]);
  });
});

describe('hexToOKLCH extremes', () => {
  test('white L ≈ 1 and C ≈ 0', () => {
    const w = hexToOKLCH('#ffffff');
    expect(Math.abs(w.L - 1.0)).toBeLessThan(0.01);
    expect(w.C).toBeLessThan(0.001);
  });
  test('black L ≈ 0', () => {
    const b = hexToOKLCH('#000000');
    expect(Math.abs(b.L)).toBeLessThan(0.01);
  });
});

describe('isInSRGBGamut', () => {
  test('pure white is in gamut', () => {
    expect(isInSRGBGamut({ L: 1, C: 0, H: 0 })).toBe(true);
  });
  test('pure black is in gamut', () => {
    expect(isInSRGBGamut({ L: 0, C: 0, H: 0 })).toBe(true);
  });
  test('extreme chroma at mid lightness is out of gamut', () => {
    expect(isInSRGBGamut({ L: 0.5, C: 0.4, H: 180 })).toBe(false);
  });
  test('extreme unit chroma fails', () => {
    expect(isInSRGBGamut({ L: 0.5, C: 1.0, H: 0 })).toBe(false);
  });
});

describe('maxChromaSRGB determinism', () => {
  test('deterministic across repeated calls (exact equality)', () => {
    // A tolerance-based loop would fail this; the literal 40-iteration loop
    // must return the same float64 every time.
    const a = maxChromaSRGB(0.5, 250);
    const b = maxChromaSRGB(0.5, 250);
    expect(a).toBe(b);
  });

  for (const f of fixtures.maxChromaCases) {
    test(`L=${f.L} H=${f.H} within [${f.minExpected}, ${f.maxExpected}]`, () => {
      const c = maxChromaSRGB(f.L, f.H);
      expect(c).toBeGreaterThanOrEqual(f.minExpected);
      expect(c).toBeLessThanOrEqual(f.maxExpected);
    });
  }
});

describe('clampChroma', () => {
  test('in-gamut color passes through unchanged', () => {
    const c = { L: 0.5, C: 0.05, H: 0 };
    const out = clampChroma(c);
    expect(out).toEqual(c);
  });
  test('out-of-gamut color has chroma reduced', () => {
    const out = clampChroma({ L: 0.5, C: 0.4, H: 180 });
    expect(out.L).toBe(0.5);
    expect(out.H).toBe(180);
    expect(out.C).toBeLessThan(0.4);
    expect(isInSRGBGamut(out)).toBe(true);
  });
});

describe('clampFloat', () => {
  test('below lo', () => expect(clampFloat(-1, 0, 1)).toBe(0));
  test('above hi', () => expect(clampFloat(2, 0, 1)).toBe(1));
  test('in range', () => expect(clampFloat(0.5, 0, 1)).toBe(0.5));
  test('at boundaries', () => {
    expect(clampFloat(0, 0, 1)).toBe(0);
    expect(clampFloat(1, 0, 1)).toBe(1);
  });
});

describe('registerOnWindow', () => {
  test('attaches all 14 functions to a window-like object', () => {
    const fakeWindow = {};
    registerOnWindow(fakeWindow);
    const expected = [
      'hexToSRGB',
      'sRGBToHex',
      'sRGBToLinearRGB',
      'linearRGBToSRGB',
      'linearRGBToOKLab',
      'oklabToLinearRGB',
      'oklabToOKLCH',
      'oklchToOKLab',
      'hexToOKLCH',
      'oklchToHex',
      'isInSRGBGamut',
      'maxChromaSRGB',
      'clampChroma',
      'clampFloat'
    ];
    for (const name of expected) {
      expect(typeof fakeWindow.DesignPanelColor[name]).toBe('function');
    }
  });
  test('merges into an existing DesignPanelColor namespace', () => {
    const fakeWindow = { DesignPanelColor: { previous: 1 } };
    registerOnWindow(fakeWindow);
    expect(fakeWindow.DesignPanelColor.previous).toBe(1);
    expect(typeof fakeWindow.DesignPanelColor.hexToOKLCH).toBe('function');
  });
});
