import { pbkdf2Sync, randomBytes, timingSafeEqual } from 'node:crypto';

// PIN handling for child mode unlock. Plain electron-store storage on
// purpose: the hash is salted PBKDF2 with 200k iterations (one-way), so
// it does not need keychain encryption — and crucially, NOT using
// safeStorage means setting a PIN during the onboarding wizard does not
// trigger the macOS keychain prompt before the user is ready for it.
//
// Iteration count tuned for ~250ms on a 2024-era M-series Mac, ~400ms on
// an older Intel laptop. This is fast enough to feel instant on the
// happy path, slow enough to make brute-force unattractive offline.
//
// We expose the simplest possible surface: hashPin returns the salt and
// hash together; verifyPin recomputes and timing-safe-compares. The
// store layer owns persistence — see settings.ts:setPinHash.

const ITERATIONS = 200_000;
const KEYLEN = 32;
const SALT_LEN = 16;

export type PinHash = {
  saltHex: string;
  hashHex: string;
};

export function hashPin(pin: string, saltHex?: string): PinHash {
  const salt = saltHex ? Buffer.from(saltHex, 'hex') : randomBytes(SALT_LEN);
  const derived = pbkdf2Sync(pin, salt, ITERATIONS, KEYLEN, 'sha256');
  return { saltHex: salt.toString('hex'), hashHex: derived.toString('hex') };
}

// Timing-safe verifier. Crucially, the PBKDF2 cost is paid on EVERY
// call — including the no-PIN-set case and malformed-input cases —
// so an attacker measuring response time can't distinguish "no PIN
// configured" from "wrong PIN" from "wrong length". A dummy salt is
// used when the stored salt is missing/garbled, keeping all paths
// constant-cost. The pre-compute checks (pin length, hex parse) are
// done in constant order and the final compare is timingSafeEqual.
const DUMMY_SALT = Buffer.alloc(SALT_LEN, 0x00);
const DUMMY_EXPECTED = Buffer.alloc(KEYLEN, 0x00);

export function verifyPin(pin: string, saltHex: string, hashHex: string): boolean {
  // Always parse salt + expected; on failure substitute a fixed-size
  // dummy so the pbkdf2 call below ALWAYS runs against a KEYLEN buffer.
  let salt: Buffer = DUMMY_SALT;
  let expected: Buffer = DUMMY_EXPECTED;
  let validInputs = true;
  if (!pin || typeof pin !== 'string') validInputs = false;
  if (saltHex) {
    try {
      const parsed = Buffer.from(saltHex, 'hex');
      if (parsed.length === SALT_LEN) salt = parsed;
      else validInputs = false;
    } catch {
      validInputs = false;
    }
  } else {
    validInputs = false;
  }
  if (hashHex) {
    try {
      const parsed = Buffer.from(hashHex, 'hex');
      if (parsed.length === KEYLEN) expected = parsed;
      else validInputs = false;
    } catch {
      validInputs = false;
    }
  } else {
    validInputs = false;
  }
  // Always pay the PBKDF2 cost — even with a dummy pin / salt — so
  // timing is constant whether or not a PIN is configured. The pin
  // input here is bounded to typing speed; padding to a fixed length
  // would be over-engineering for the threat model (offline file
  // access already gets the salt + hash) but the equal-cost compare
  // closes the live-timing observable.
  const pinForHash = typeof pin === 'string' && pin.length > 0 ? pin : '\0';
  const actual = pbkdf2Sync(pinForHash, salt, ITERATIONS, KEYLEN, 'sha256');
  const eq = timingSafeEqual(actual, expected);
  return validInputs && eq;
}

// Lightweight PIN format validator. Used by the IPC handler before we
// burn 200k iterations on garbage input. 4–6 digit PIN; rejects letters,
// whitespace, leading zeros-only (e.g. "0000" — discourage trivial).
export function isValidPinFormat(pin: string): boolean {
  if (typeof pin !== 'string') return false;
  if (pin.length < 4 || pin.length > 6) return false;
  if (!/^\d+$/.test(pin)) return false;
  if (/^(.)\1+$/.test(pin)) return false; // all same digit
  return true;
}
