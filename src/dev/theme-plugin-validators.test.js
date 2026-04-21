import { describe, it, expect } from 'vitest';
import {
  LOOPBACK_ADDRESSES,
  ID_RE,
  PROP_KEY_RE,
  SCHEME_KEYS,
  MAX_BODY_BYTES,
  isLocalhost,
  isValidId,
  validateBundle,
} from './theme-plugin-validators.js';

/* ---------- helpers ------------------------------------------------- */

const validBundle = () => ({
  schemaVersion: 1,
  id: 'thm_test1234',
  name: 'Test',
  description: '',
  isDefault: false,
  createdAt: '2026-04-21T00:00:00Z',
  updatedAt: '2026-04-21T00:00:00Z',
  typography: {},
  schemes: {
    default: { light: {}, dark: {} },
    subtle: { light: {}, dark: {} },
    accent: { light: {}, dark: {} },
  },
});

const mockReq = (remoteAddress) => ({
  socket: typeof remoteAddress === 'undefined' ? null : { remoteAddress },
});

/* ---------- constants ---------------------------------------------- */

describe('constants', () => {
  it('MAX_BODY_BYTES is 64 KB', () => {
    expect(MAX_BODY_BYTES).toBe(64 * 1024);
  });

  it('SCHEME_KEYS enumerates exactly the three schemes', () => {
    expect([...SCHEME_KEYS]).toEqual(['default', 'subtle', 'accent']);
  });

  it('LOOPBACK_ADDRESSES covers both IPv4 and IPv6 loopback forms', () => {
    expect(LOOPBACK_ADDRESSES.has('127.0.0.1')).toBe(true);
    expect(LOOPBACK_ADDRESSES.has('::1')).toBe(true);
    expect(LOOPBACK_ADDRESSES.has('::ffff:127.0.0.1')).toBe(true);
  });

  it('ID_RE rejects path-traversal shapes', () => {
    expect(ID_RE.test('thm_test')).toBe(true);
    expect(ID_RE.test('thm_')).toBe(false); // must have at least 1 char
    expect(ID_RE.test('../evil')).toBe(false);
    expect(ID_RE.test('thm_../evil')).toBe(false);
    expect(ID_RE.test('thm_UPPERCASE')).toBe(false);
    expect(ID_RE.test('thm_with space')).toBe(false);
    expect(ID_RE.test('thm_' + 'a'.repeat(33))).toBe(false); // length cap
    expect(ID_RE.test('')).toBe(false);
  });

  it('PROP_KEY_RE matches valid CSS custom properties', () => {
    expect(PROP_KEY_RE.test('--type-scale-ratio')).toBe(true);
    expect(PROP_KEY_RE.test('--color-bg')).toBe(true);
    expect(PROP_KEY_RE.test('--x')).toBe(true);
  });

  it('PROP_KEY_RE rejects prototype-pollution + shell-meta shapes', () => {
    expect(PROP_KEY_RE.test('__proto__')).toBe(false);
    expect(PROP_KEY_RE.test('constructor')).toBe(false);
    expect(PROP_KEY_RE.test('--UPPERCASE')).toBe(false);
    expect(PROP_KEY_RE.test('--space inside')).toBe(false);
    expect(PROP_KEY_RE.test('--leading-digit9invalid')).toBe(true); // digits after first letter are ok
    expect(PROP_KEY_RE.test('--9leading-digit')).toBe(false);
    expect(PROP_KEY_RE.test('regular-name')).toBe(false); // must start with --
  });
});

/* ---------- isLocalhost -------------------------------------------- */

describe('isLocalhost', () => {
  it('accepts IPv4 loopback', () => {
    expect(isLocalhost(mockReq('127.0.0.1'))).toBe(true);
  });

  it('accepts IPv6 loopback', () => {
    expect(isLocalhost(mockReq('::1'))).toBe(true);
    expect(isLocalhost(mockReq('::ffff:127.0.0.1'))).toBe(true);
  });

  it('rejects non-loopback addresses', () => {
    expect(isLocalhost(mockReq('10.0.0.1'))).toBe(false);
    expect(isLocalhost(mockReq('192.168.1.1'))).toBe(false);
    expect(isLocalhost(mockReq('::ffff:192.168.1.1'))).toBe(false);
  });

  it('rejects missing socket or address', () => {
    expect(isLocalhost(null)).toBe(false);
    expect(isLocalhost({})).toBe(false);
    expect(isLocalhost(mockReq(undefined))).toBe(false);
  });

  it('ignores X-Forwarded-For entirely (socket.remoteAddress is authoritative)', () => {
    // Spoofed header on a non-loopback socket -> still rejected.
    const spoofed = {
      socket: { remoteAddress: '8.8.8.8' },
      headers: { 'x-forwarded-for': '127.0.0.1' },
    };
    expect(isLocalhost(spoofed)).toBe(false);
  });
});

/* ---------- isValidId --------------------------------------------- */

describe('isValidId', () => {
  it('accepts well-formed thm_ ids', () => {
    expect(isValidId('thm_default')).toBe(true);
    expect(isValidId('thm_abc123')).toBe(true);
  });

  it('rejects traversal attempts', () => {
    expect(isValidId('../evil')).toBe(false);
    expect(isValidId('thm_..%2fescape')).toBe(false);
    expect(isValidId('/etc/passwd')).toBe(false);
  });

  it('rejects non-string inputs', () => {
    expect(isValidId(null)).toBe(false);
    expect(isValidId(undefined)).toBe(false);
    expect(isValidId(42)).toBe(false);
    expect(isValidId({})).toBe(false);
  });
});

/* ---------- validateBundle ---------------------------------------- */

describe('validateBundle - valid', () => {
  it('returns null for a fully valid bundle', () => {
    expect(validateBundle(validBundle(), 'thm_test1234')).toBeNull();
  });

  it('accepts populated typography with valid property keys', () => {
    const body = validBundle();
    body.typography = { '--type-scale-ratio': '1.25', '--font-body': 'Georgia' };
    expect(validateBundle(body, 'thm_test1234')).toBeNull();
  });
});

describe('validateBundle - shape failures', () => {
  it('rejects null body', () => {
    expect(validateBundle(null, 'thm_x').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects non-object body', () => {
    expect(validateBundle('string', 'thm_x').code).toBe('SCHEMA_MISMATCH');
    expect(validateBundle(42, 'thm_x').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects array body', () => {
    expect(validateBundle([], 'thm_x').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects mismatched body.id vs URL id', () => {
    const body = validBundle();
    body.id = 'thm_other';
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_ID');
  });

  it('rejects missing typography', () => {
    const body = validBundle();
    delete body.typography;
    expect(validateBundle(body, 'thm_test1234').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects missing schemes', () => {
    const body = validBundle();
    delete body.schemes;
    expect(validateBundle(body, 'thm_test1234').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects array typography', () => {
    const body = validBundle();
    body.typography = [];
    expect(validateBundle(body, 'thm_test1234').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects schemaVersion other than 1', () => {
    const body = validBundle();
    body.schemaVersion = 2;
    expect(validateBundle(body, 'thm_test1234').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects missing scheme key', () => {
    const body = validBundle();
    delete body.schemes.subtle;
    expect(validateBundle(body, 'thm_test1234').code).toBe('SCHEMA_MISMATCH');
  });

  it('rejects missing mode inside a scheme', () => {
    const body = validBundle();
    delete body.schemes.default.dark;
    expect(validateBundle(body, 'thm_test1234').code).toBe('SCHEMA_MISMATCH');
  });
});

describe('validateBundle - name', () => {
  it('rejects empty name', () => {
    const body = validBundle();
    body.name = '';
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_NAME');
  });

  it('rejects name longer than 80 chars', () => {
    const body = validBundle();
    body.name = 'a'.repeat(81);
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_NAME');
  });

  it('rejects non-string name', () => {
    const body = validBundle();
    body.name = 42;
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_NAME');
  });

  it('accepts name at both length boundaries', () => {
    const shortest = validBundle();
    shortest.name = 'a';
    expect(validateBundle(shortest, 'thm_test1234')).toBeNull();
    const longest = validBundle();
    longest.name = 'a'.repeat(80);
    expect(validateBundle(longest, 'thm_test1234')).toBeNull();
  });
});

describe('validateBundle - property keys', () => {
  it('rejects prototype-pollution key in typography (parsed from JSON like a real request)', () => {
    const body = validBundle();
    // JSON.parse is how the Vite plugin's readBody actually produces the
    // bundle, and JSON.parse DOES create an own __proto__ property
    // (unlike the JS literal { __proto__: ... } which sets the prototype).
    body.typography = JSON.parse('{"__proto__":"bad"}');
    const err = validateBundle(body, 'thm_test1234');
    expect(err.code).toBe('BAD_PROPERTY_KEY');
  });

  it('rejects key that does not start with --', () => {
    const body = validBundle();
    body.typography = { 'dp-type-ratio': '1.2' };
    const err = validateBundle(body, 'thm_test1234');
    expect(err.code).toBe('BAD_PROPERTY_KEY');
    expect(err.error).toMatch(/dp-type-ratio/);
  });

  it('rejects key with uppercase letters', () => {
    const body = validBundle();
    body.typography = { '--UPPERCASE': 'x' };
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_PROPERTY_KEY');
  });

  it('rejects key with spaces', () => {
    const body = validBundle();
    body.typography = { '--bad key': 'x' };
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_PROPERTY_KEY');
  });

  it('rejects invalid key inside a scheme mode', () => {
    const body = validBundle();
    body.schemes.default.light = { '--BAD': 'blue-500' };
    expect(validateBundle(body, 'thm_test1234').code).toBe('BAD_PROPERTY_KEY');
  });

  it('accepts empty typography + empty scheme modes', () => {
    const body = validBundle();
    expect(validateBundle(body, 'thm_test1234')).toBeNull();
  });
});
