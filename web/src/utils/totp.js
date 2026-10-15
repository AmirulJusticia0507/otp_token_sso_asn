// T-OTP.1: TOTP untuk browser (SHA1 + HMAC murni JS, tanpa dep, sinkron).
// Secret TIDAK PERNAH disimpan di sini — selalu dilewat sebagai argumen
// dari memori tab (form), dan hilang saat reload.

export const STEP = 30
export const DIGITS = 6

export function extractSecret(raw) {
  let s = String(raw ?? '').trim()
  if (!s) return ''
  if (/^otpauth:\/\//i.test(s)) {
    const m = s.match(/[?&]secret=([^&]+)/i)
    if (!m) throw new Error('URL otpauth tidak memuat param secret.')
    s = decodeURIComponent(m[1])
  }
  return s.replace(/[\s-]+/g, '').replace(/=+$/, '').toUpperCase()
}

export function base32Decode(b32) {
  const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  const clean = String(b32).toUpperCase().replace(/[^A-Z2-7]/g, '')
  if (!clean) throw new Error('Secret kosong setelah dibersihkan.')
  let bits = 0
  let value = 0
  const out = []
  for (const ch of clean) {
    value = (value << 5) | ALPHA.indexOf(ch)
    bits += 5
    if (bits >= 8) {
      out.push((value >>> (bits - 8)) & 0xff)
      bits -= 8
    }
  }
  if (!out.length) throw new Error('Secret base32 tidak valid.')
  return new Uint8Array(out)
}

// SHA-1 (FIPS 180-4). Teruji: sha1('abc') = a9993e36...
export function sha1(message) {
  const input = message instanceof Uint8Array ? message : new TextEncoder().encode(String(message))
  const bitLen = input.length * 8
  const newLen = (((input.length + 8) >> 6) + 1) * 64
  const padded = new Uint8Array(newLen)
  padded.set(input)
  padded[input.length] = 0x80
  const view = new DataView(padded.buffer)
  view.setUint32(newLen - 8, Math.floor(bitLen / 0x100000000))
  view.setUint32(newLen - 4, bitLen >>> 0)
  let h0 = 0x67452301
  let h1 = 0xefcdab89
  let h2 = 0x98badcfe
  let h3 = 0x10325476
  let h4 = 0xc3d2e1f0
  const w = new Uint32Array(80)
  for (let i = 0; i < newLen; i += 64) {
    for (let t = 0; t < 16; t++) w[t] = view.getUint32(i + t * 4)
    for (let t = 16; t < 80; t++) {
      const x = w[t - 3] ^ w[t - 8] ^ w[t - 14] ^ w[t - 16]
      w[t] = ((x << 1) | (x >>> 31)) >>> 0
    }
    let a = h0
    let b = h1
    let c = h2
    let d = h3
    let e = h4
    for (let t = 0; t < 80; t++) {
      let f
      let k
      if (t < 20) { f = (b & c) | (~b & d); k = 0x5a827999 } else if (t < 40) { f = b ^ c ^ d; k = 0x6ed9eba1 } else if (t < 60) { f = (b & c) | (b & d) | (c & d); k = 0x8f1bbcdc } else { f = b ^ c ^ d; k = 0xca62c1d6 }
      const temp = ((((a << 5) | (a >>> 27)) >>> 0) + f + e + k + w[t]) >>> 0
      e = d
      d = c
      c = ((b << 30) | (b >>> 2)) >>> 0
      b = a
      a = temp
    }
    h0 = (h0 + a) >>> 0
    h1 = (h1 + b) >>> 0
    h2 = (h2 + c) >>> 0
    h3 = (h3 + d) >>> 0
    h4 = (h4 + e) >>> 0
  }
  const out = new Uint8Array(20)
  const ov = new DataView(out.buffer)
  ov.setUint32(0, h0)
  ov.setUint32(4, h1)
  ov.setUint32(8, h2)
  ov.setUint32(12, h3)
  ov.setUint32(16, h4)
  return out
}

export function hmacSha1(key, msg) {
  let k = key instanceof Uint8Array ? key : new TextEncoder().encode(String(key))
  const m = msg instanceof Uint8Array ? msg : new TextEncoder().encode(String(msg))
  if (k.length > 64) k = sha1(k)
  const padded = new Uint8Array(64)
  padded.set(k)
  const o = new Uint8Array(64)
  const inn = new Uint8Array(64)
  for (let i = 0; i < 64; i++) {
    o[i] = padded[i] ^ 0x5c
    inn[i] = padded[i] ^ 0x36
  }
  const inner = new Uint8Array(64 + m.length)
  inner.set(inn)
  inner.set(m, 64)
  const outer = new Uint8Array(64 + 20)
  outer.set(o)
  outer.set(sha1(inner), 64)
  return sha1(outer)
}

function counterBytes(counter) {
  const buf = new Uint8Array(8)
  let c = BigInt(counter)
  for (let i = 7; i >= 0; i--) {
    buf[i] = Number(c & 0xffn)
    c >>= 8n
  }
  return buf
}

// Kode 6 digit + sisa detik. Melempar bila secret tidak valid.
export function totpNow(secretText, nowMs = Date.now()) {
  const key = base32Decode(extractSecret(secretText))
  const counter = Math.floor(nowMs / 1000 / STEP)
  const hmac = hmacSha1(key, counterBytes(counter))
  const offset = hmac[hmac.length - 1] & 0x0f
  const bin =
    ((hmac[offset] & 0x7f) << 24) |
    (hmac[offset + 1] << 16) |
    (hmac[offset + 2] << 8) |
    hmac[offset + 3]
  return {
    code: String(bin % 10 ** DIGITS).padStart(DIGITS, '0'),
    left: STEP - (Math.floor(nowMs / 1000) % STEP),
  }
}
