// Short, URL-friendly public list code (the permalink is /l/{code}). 7 chars of
// base62 ≈ 3.5 trillion space; unique index + insert-retry handles collisions.
// Avoids look-alike chars (0/O, 1/l/I) so codes are easy to read aloud / type.
const ALPHABET = "23456789abcdefghijkmnpqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ";

export function generateCode(len = 7): string {
  const bytes = new Uint8Array(len);
  (globalThis.crypto ?? require("crypto").webcrypto).getRandomValues(bytes);
  let out = "";
  for (let i = 0; i < len; i++) out += ALPHABET[bytes[i] % ALPHABET.length];
  return out;
}
