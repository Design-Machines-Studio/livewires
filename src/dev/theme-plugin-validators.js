/*
 * Pure validators used by the dev-only design-panel themes Vite plugin.
 *
 * These live in their own module so vitest can exercise the security and
 * schema-shape guarantees directly without spinning up a dev server. The
 * Vite plugin (vite.config.js) imports from here and wires the validators
 * into its middleware; it is the only caller in production code.
 *
 * The validators MUST stay dependency-free Node code (no DOM, no
 * framework imports, no side effects) so they can be imported by both
 * Vite's server-side plugin context and the vitest node-environment
 * test suite.
 */

export const LOOPBACK_ADDRESSES = new Set([
  '127.0.0.1',
  '::1',
  '::ffff:127.0.0.1',
]);

export const ID_RE = /^thm_[a-z0-9]{1,32}$/;
export const PROP_KEY_RE = /^--[a-z][a-z0-9-]*$/;
export const SCHEME_KEYS = Object.freeze(['default', 'subtle', 'accent']);
export const MODE_KEYS = Object.freeze(['light', 'dark']);
export const MAX_BODY_BYTES = 64 * 1024;
export const NAME_MIN = 1;
export const NAME_MAX = 80;

/*
 * Localhost guard. Consults ONLY req.socket.remoteAddress. X-Forwarded-For
 * and similar headers are deliberately ignored so a malicious proxy cannot
 * spoof them to bypass the check.
 */
export function isLocalhost(req) {
  if (!req || !req.socket) return false;
  const addr = req.socket.remoteAddress;
  return typeof addr === 'string' && LOOPBACK_ADDRESSES.has(addr);
}

/*
 * Validates a theme bundle body against the schema. Returns null if valid,
 * or `{ code, error }` describing the first failure. `urlId` is the id
 * from the URL parameter; `body.id` must match it so the caller can't
 * smuggle a different id through the body.
 */
export function validateBundle(body, urlId) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    return { code: 'SCHEMA_MISMATCH', error: 'body must be a JSON object' };
  }
  if (body.id !== urlId) {
    return { code: 'BAD_ID', error: 'body.id must match URL id' };
  }
  if (typeof body.name !== 'string' || body.name.length < NAME_MIN || body.name.length > NAME_MAX) {
    return { code: 'BAD_NAME', error: `name must be a string of length ${NAME_MIN}-${NAME_MAX}` };
  }
  if (body.schemaVersion !== 1) {
    return { code: 'SCHEMA_MISMATCH', error: 'schemaVersion must be 1' };
  }
  if (!body.typography || typeof body.typography !== 'object' || Array.isArray(body.typography)) {
    return { code: 'SCHEMA_MISMATCH', error: 'typography must be an object' };
  }
  for (const key of Object.keys(body.typography)) {
    if (!PROP_KEY_RE.test(key)) {
      return { code: 'BAD_PROPERTY_KEY', error: `invalid typography property key: ${key}` };
    }
  }
  if (!body.schemes || typeof body.schemes !== 'object' || Array.isArray(body.schemes)) {
    return { code: 'SCHEMA_MISMATCH', error: 'schemes must be an object' };
  }
  for (const schemeKey of SCHEME_KEYS) {
    const scheme = body.schemes[schemeKey];
    if (!scheme || typeof scheme !== 'object' || Array.isArray(scheme)) {
      return { code: 'SCHEMA_MISMATCH', error: `schemes.${schemeKey} must be an object` };
    }
    for (const mode of MODE_KEYS) {
      const modeObj = scheme[mode];
      if (!modeObj || typeof modeObj !== 'object' || Array.isArray(modeObj)) {
        return { code: 'SCHEMA_MISMATCH', error: `schemes.${schemeKey}.${mode} must be an object` };
      }
      for (const key of Object.keys(modeObj)) {
        if (!PROP_KEY_RE.test(key)) {
          return { code: 'BAD_PROPERTY_KEY', error: `invalid schemes.${schemeKey}.${mode} property key: ${key}` };
        }
      }
    }
  }
  return null;
}

/*
 * Returns true if the id parameter from a URL is a safe shape that can be
 * path-joined with the themes directory without opening a traversal.
 */
export function isValidId(id) {
  return typeof id === 'string' && ID_RE.test(id);
}
