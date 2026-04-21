// Color module barrel: single registerAll() entry point for main.js.
//
// Previously main.js called registerOklch() + registerRamp() with two
// near-identical 20-line helpers duplicating the same stamp-coupling pattern.
// This file consolidates the two sites so callers don't have to know that
// the DesignPanelColor namespace is split across two modules internally.

import { registerOnWindow as registerOklch } from './oklch.js';
import { registerOnWindow as registerRamp } from './ramp.js';

export function registerAll(w = globalThis) {
  registerOklch(w);
  registerRamp(w);
}
