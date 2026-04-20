// OKLCH color space conversions, ported line-for-line from Assembly's
// backend/internal/color/oklch.go (Bjorn Ottosson's reference matrices).
//
// Pure functions only -- no document, window, localStorage, fetch, or
// event handlers at call sites. The module is tree-shake-safe: side-effectful
// registration on `window` is opt-in via the exported `registerOnWindow`
// helper, which the main entry point calls once at boot.
//
// Types are plain objects:
//   { R, G, B }  -- sRGB or LinearRGB, each channel in [0, 1]
//   { L, a, b }  -- OKLab
//   { L, C, H }  -- OKLCH, L in [0, 1], C in [0, ~0.4], H in [0, 360)

// --- Hex <-> sRGB ---

// Parse #RRGGBB or #rrggbb into { R, G, B } in [0, 1].
export function hexToSRGB(hex) {
  const h = String(hex).replace(/^#/, '');
  if (h.length !== 6 || /[^0-9a-fA-F]/.test(h)) {
    throw new Error(`invalid hex color: "${hex}"`);
  }
  const n = parseInt(h, 16);
  return {
    R: ((n >> 16) & 0xff) / 255,
    G: ((n >> 8) & 0xff) / 255,
    B: (n & 0xff) / 255
  };
}

// Guarded 0-1 float to 0-255 int with clamping and finite check.
function clampByte(v) {
  if (!Number.isFinite(v)) return 0;
  const i = Math.round(v * 255);
  if (i < 0) return 0;
  if (i > 255) return 255;
  return i;
}

// { R, G, B } in [0, 1] -> "#rrggbb".
export function sRGBToHex({ R, G, B }) {
  const r = clampByte(R);
  const g = clampByte(G);
  const b = clampByte(B);
  return (
    '#' +
    r.toString(16).padStart(2, '0') +
    g.toString(16).padStart(2, '0') +
    b.toString(16).padStart(2, '0')
  );
}

// --- sRGB <-> Linear RGB (gamma) ---

// Per-channel sRGB -> linear. 0.04045 is the IEC 61966-2-1 breakpoint (exact).
function sRGBToLinear(c) {
  if (c <= 0.04045) return c / 12.92;
  return Math.pow((c + 0.055) / 1.055, 2.4);
}

// Per-channel linear -> sRGB. 0.0031308 is the exact breakpoint.
function linearToSRGB(c) {
  if (c <= 0.0031308) return c * 12.92;
  return 1.055 * Math.pow(c, 1 / 2.4) - 0.055;
}

export function sRGBToLinearRGB({ R, G, B }) {
  return {
    R: sRGBToLinear(R),
    G: sRGBToLinear(G),
    B: sRGBToLinear(B)
  };
}

export function linearRGBToSRGB({ R, G, B }) {
  return {
    R: linearToSRGB(R),
    G: linearToSRGB(G),
    B: linearToSRGB(B)
  };
}

// --- Linear RGB <-> OKLab ---

// Signed cube root: matches Go's cbrt helper (math.Cbrt is signed, this mirrors that).
function cbrt(v) {
  if (v >= 0) return Math.cbrt(v);
  return -Math.cbrt(-v);
}

export function linearRGBToOKLab({ R, G, B }) {
  let l_ = 0.4122214708 * R + 0.5363325363 * G + 0.0514459929 * B;
  let m_ = 0.2119034982 * R + 0.6806995451 * G + 0.1073969566 * B;
  let s_ = 0.0883024619 * R + 0.2817188376 * G + 0.6299787005 * B;

  l_ = cbrt(l_);
  m_ = cbrt(m_);
  s_ = cbrt(s_);

  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const b = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  return { L, a, b };
}

export function oklabToLinearRGB({ L, a, b }) {
  let l_ = L + 0.3963377774 * a + 0.2158037573 * b;
  let m_ = L - 0.1055613458 * a - 0.0638541728 * b;
  let s_ = L - 0.0894841775 * a - 1.2914855480 * b;

  l_ = l_ * l_ * l_;
  m_ = m_ * m_ * m_;
  s_ = s_ * s_ * s_;

  const R = +4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_;
  const G = -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_;
  const B = -0.0041960863 * l_ - 0.7034186147 * m_ + 1.7076147010 * s_;
  return { R, G, B };
}

// --- OKLab <-> OKLCH ---

export function oklabToOKLCH({ L, a, b }) {
  const C = Math.sqrt(a * a + b * b);
  // Hue in degrees. JS `%` is truncated (like Go's math.Mod); double-wrap for negatives.
  const Hraw = Math.atan2(b, a) * 180 / Math.PI;
  const H = ((Hraw % 360) + 360) % 360;
  return { L, C, H };
}

export function oklchToOKLab({ L, C, H }) {
  const hRad = H * Math.PI / 180;
  return { L, a: C * Math.cos(hRad), b: C * Math.sin(hRad) };
}

// --- Convenience: hex <-> OKLCH ---

export function hexToOKLCH(hex) {
  return oklabToOKLCH(linearRGBToOKLab(sRGBToLinearRGB(hexToSRGB(hex))));
}

export function oklchToHex({ L, C, H }) {
  return sRGBToHex(linearRGBToSRGB(oklabToLinearRGB(oklchToOKLab({ L, C, H }))));
}

// --- sRGB gamut checking ---

// CRITICAL: checks gamut in LINEAR RGB space (not sRGB-encoded) with tol = 0.002.
// Getting either wrong silently shifts the gamut boundary and cascades to
// maxChromaSRGB returning different values from Go, breaking every ramp test.
export function isInSRGBGamut({ L, C, H }) {
  const lab = oklchToOKLab({ L, C, H });
  const lin = oklabToLinearRGB(lab);
  const tol = 0.002;
  return (
    lin.R >= -tol && lin.R <= 1 + tol &&
    lin.G >= -tol && lin.G <= 1 + tol &&
    lin.B >= -tol && lin.B <= 1 + tol
  );
}

// CRITICAL: literal 40-iteration binary search, not a tolerance loop.
// Fixed iteration count is what guarantees cross-language determinism --
// a tolerance loop (`while hi - lo > 1e-6`) might exit at different iteration
// counts in Go vs JS due to ULP drift, producing different final values.
export function maxChromaSRGB(L, H) {
  let lo = 0;
  let hi = 0.4;
  for (let i = 0; i < 40; i++) {
    const mid = (lo + hi) / 2;
    if (isInSRGBGamut({ L, C: mid, H })) lo = mid;
    else hi = mid;
  }
  return lo;
}

export function clampChroma({ L, C, H }) {
  if (isInSRGBGamut({ L, C, H })) return { L, C, H };
  return { L, C: maxChromaSRGB(L, H), H };
}

// --- Utility ---

// Generic numeric clamp, used by ramp.js. Included here so B3 can import
// it without duplicating the helper.
export function clampFloat(v, lo, hi) {
  if (v < lo) return lo;
  if (v > hi) return hi;
  return v;
}

// --- Browser registration (tree-shake safe) ---
//
// Vite's tree-shaker may drop a bare `window.DesignPanelColor = ...` side-effect
// in prod builds if nothing in the ESM graph imports a name that forces the
// module to execute. The explicit `registerOnWindow` function prevents that:
// main.js imports and calls it, so the registration can't be pruned.
//
// Tests use the ESM exports directly and never call this.
export function registerOnWindow(w = globalThis) {
  if (!w) return;
  w.DesignPanelColor = w.DesignPanelColor || {};
  Object.assign(w.DesignPanelColor, {
    hexToSRGB,
    sRGBToHex,
    sRGBToLinearRGB,
    linearRGBToSRGB,
    linearRGBToOKLab,
    oklabToLinearRGB,
    oklabToOKLCH,
    oklchToOKLab,
    hexToOKLCH,
    oklchToHex,
    isInSRGBGamut,
    maxChromaSRGB,
    clampChroma,
    clampFloat
  });
}
