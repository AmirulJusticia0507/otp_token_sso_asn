// Library bersama tahap 1 (otp.mjs) & tahap 2 (login.mjs).
// TOTP RFC 6238 (SHA1, langkah 30 detik, 6 digit) + decode JWT untuk tampil saja.
import { createHmac } from 'node:crypto';

export const STEP = 30;
export const DIGITS = 6;

// extractSecret menerima secret base32 polos ATAU url otpauth://...?secret=XXX.
export function extractSecret(raw) {
  let s = String(raw ?? '').trim();
  if (!s) return '';
  if (/^otpauth:\/\//i.test(s)) {
    const m = s.match(/[?&]secret=([^&]+)/i);
    if (!m) throw new Error('URL otpauth tidak memuat param secret.');
    s = decodeURIComponent(m[1]);
  }
  return s.replace(/[\s-]+/g, '').replace(/=+$/, '').toUpperCase();
}

export function base32Decode(b32) {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
  const clean = String(b32).toUpperCase().replace(/[^A-Z2-7]/g, '');
  if (!clean) throw new Error('Secret kosong setelah dibersihkan.');
  let bits = 0;
  let value = 0;
  const out = [];
  for (const ch of clean) {
    value = (value << 5) | ALPHA.indexOf(ch);
    bits += 5;
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff);
      bits -= 8;
    }
  }
  if (out.length === 0) throw new Error('Secret base32 tidak valid.');
  return Buffer.from(out);
}

export function totp(key, nowMs) {
  const counter = Math.floor(nowMs / 1000 / STEP);
  const msg = Buffer.alloc(8);
  msg.writeBigUInt64BE(BigInt(counter));
  const hmac = createHmac('sha1', key).update(msg).digest();
  const offset = hmac[hmac.length - 1] & 0x0f;
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3];
  return { code: String(bin % 10 ** DIGITS).padStart(DIGITS, '0'), counter };
}

export function remainingSecs(nowMs) {
  return STEP - (Math.floor(nowMs / 1000) % STEP);
}

// resolveCode meniru login-mfa.sh: 6 digit -> pakai langsung,
// selain itu -> anggap secret base32 dan generate kodenya.
export function resolveCode(input, nowMs = Date.now()) {
  const s = String(input ?? '').trim().replace(/[\s-]+/g, '');
  if (/^[0-9]{6}$/.test(s)) return { code: s, fromSecret: false };
  const key = base32Decode(extractSecret(s));
  return { code: totp(key, nowMs).code, fromSecret: true };
}

// decodeJwt hanya membaca payload untuk ditampilkan (tanpa verifikasi
// signature — yang berhak memvalidasi adalah identity-service).
export function decodeJwt(token) {
  const parts = String(token).split('.');
  if (parts.length < 2) throw new Error('Format JWT tidak valid.');
  const b64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
  return JSON.parse(Buffer.from(b64, 'base64').toString('utf8'));
}
