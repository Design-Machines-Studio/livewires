// OKLCH ramp generator, ported line-for-line from Assembly's
// backend/internal/color/ramp.go.
//
// Pure functions only -- no document, window, localStorage, fetch, or event
// handlers at call sites. Tree-shake-safe: window-side effect is opt-in via
// the exported registerOnWindow helper.
//
// Algorithm summary (see docs/colour-ramp-generation.md for rationale):
//   1. Convert anchor hex to OKLCH.
//   2. Compute lOffset = anchor.L - lTargets[anchorStep]. This shifts the
//      default lightness curve so the anchor step sits at the anchor's
//      actual lightness and every other step moves with it.
//   3. For each canonical step:
//      - Overrides win outright (still clampChroma-ed, still oklchToHex-ed).
//      - The anchor step is pinned to the anchor's own L/C/H (still
//        clampChroma-ed).
//      - Otherwise: target L = clampFloat(stepLTarget + lOffset, 0.06, 0.985);
//        target H = hueFn(step) or anchor.H; target C = either neutralChroma
//        (with hue replaced by neutralHue) or maxChromaSRGB(L,H) * profile.
//      - All three paths clampChroma before oklchToHex. Never skip that step
//        or out-of-gamut inputs leak through as saturated hex that the
//        browser then remaps unpredictably.

import {
  hexToOKLCH,
  oklchToHex,
  maxChromaSRGB,
  clampChroma,
  clampFloat
} from './oklch.js';

export const STEPS = Object.freeze([50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950]);

export const FAMILY_NAMES = Object.freeze(['blue', 'red', 'orange', 'yellow', 'green', 'grey']);

// DEFAULT_L_TARGETS mirrors ramp.go:DefaultLTargets exactly. If those values
// drift upstream, this port drifts with them -- re-run scripts/export-ramps
// and update fixtures accordingly.
export const DEFAULT_L_TARGETS = Object.freeze({
  50:  0.975,
  100: 0.935,
  200: 0.875,
  300: 0.785,
  400: 0.685,
  500: 0.580,
  600: 0.475,
  700: 0.370,
  800: 0.275,
  900: 0.195,
  950: 0.140
});

// DEFAULT_CHROMA_PROFILE mirrors ramp.go:DefaultChromaProfile exactly
// (saturated mids, tapered extremes, ignored for neutral ramps).
export const DEFAULT_CHROMA_PROFILE = Object.freeze({
  50:  0.20,
  100: 0.28,
  200: 0.38,
  300: 0.50,
  400: 0.70,
  500: 0.80,
  600: 0.75,
  700: 0.65,
  800: 0.55,
  900: 0.45,
  950: 0.38
});

// generateRamp(config) -> array of 11 { step, hex, L, C, H } entries.
//
// config shape (all fields optional except anchorHex / anchorStep):
//   {
//     anchorHex:     string,     // "#1966D9"
//     anchorStep:    number,     // 500
//     lTargets:      object|null,
//     chromaProfile: object|null,
//     overrides:     object|null, // keyed by step -> [L, C, H]
//     hueFn:         function|null, // step -> hue; null means constant anchor hue
//     isNeutral:     boolean,
//     neutralChroma: number,     // required if isNeutral
//     neutralHue:    number      // required if isNeutral
//   }
//
// Null/undefined for lTargets/chromaProfile/overrides/hueFn collapses to
// the same defaults Go's GenerateRamp uses when the corresponding field is nil.
export function generateRamp(config) {
  if (!config || typeof config.anchorHex !== 'string') {
    throw new Error('generateRamp: config.anchorHex is required');
  }

  const anchor = hexToOKLCH(config.anchorHex); // { L, C, H }

  const lTargets      = config.lTargets      || DEFAULT_L_TARGETS;
  const chromaProfile = config.chromaProfile || DEFAULT_CHROMA_PROFILE;
  const overrides     = config.overrides     || {};
  const hueFn         = typeof config.hueFn === 'function' ? config.hueFn : null;

  if (config.isNeutral) {
    if (!Number.isFinite(config.neutralChroma) || !Number.isFinite(config.neutralHue)) {
      throw new Error('generateRamp: isNeutral requires neutralChroma and neutralHue');
    }
  }

  // Lightness offset so the anchor step matches the anchor's actual lightness.
  const anchorLTarget = Object.prototype.hasOwnProperty.call(lTargets, config.anchorStep)
    ? lTargets[config.anchorStep]
    : 0.580; // mirrors Go's `hasL ? : 0.580`
  const lOffset = anchor.L - anchorLTarget;

  const out = [];

  for (const step of STEPS) {
    // Path 1: manual override -- still clamped, still converted.
    if (Object.prototype.hasOwnProperty.call(overrides, step)) {
      const [oL, oC, oH] = overrides[step];
      const clamped = clampChroma({ L: oL, C: oC, H: oH });
      out.push({
        step,
        hex: oklchToHex(clamped),
        L: clamped.L,
        C: clamped.C,
        H: clamped.H
      });
      continue;
    }

    // Path 2: pin the anchor step to the exact input L/C/H.
    if (step === config.anchorStep) {
      const clamped = clampChroma(anchor);
      out.push({
        step,
        hex: oklchToHex(clamped),
        L: clamped.L,
        C: clamped.C,
        H: clamped.H
      });
      continue;
    }

    // Path 3: the main algorithmic path.
    const stepLTarget = Object.prototype.hasOwnProperty.call(lTargets, step)
      ? lTargets[step]
      : 0.580;
    const targetL = clampFloat(stepLTarget + lOffset, 0.06, 0.985);

    let targetH = hueFn ? hueFn(step) : anchor.H;

    let targetC;
    if (config.isNeutral) {
      // Neutrals override both chroma and hue; they are deliberately
      // desaturated and do not pass through maxChromaSRGB.
      targetC = config.neutralChroma;
      targetH = config.neutralHue;
    } else {
      const maxC = maxChromaSRGB(targetL, targetH);
      const profile = Object.prototype.hasOwnProperty.call(chromaProfile, step)
        ? chromaProfile[step]
        : 0.50;
      targetC = maxC * profile;
    }

    const clamped = clampChroma({ L: targetL, C: targetC, H: targetH });
    out.push({
      step,
      hex: oklchToHex(clamped),
      L: clamped.L,
      C: clamped.C,
      H: clamped.H
    });
  }

  return out;
}

// Tree-shake-safe window registration. Matches oklch.js's pattern: explicit
// call from main.js so Vite can't prune the side effect in prod builds.
export function registerOnWindow(w = globalThis) {
  if (!w) return;
  w.DesignPanelColor = w.DesignPanelColor || {};
  Object.assign(w.DesignPanelColor, {
    STEPS,
    FAMILY_NAMES,
    DEFAULT_L_TARGETS,
    DEFAULT_CHROMA_PROFILE,
    generateRamp
  });
}
