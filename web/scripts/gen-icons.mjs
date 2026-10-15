// Generator ikon PWA (murni Node, tanpa dep). Jalankan sekali:
//   node scripts/gen-icons.mjs
// Desain: latar slate-900 + bingkai emerald + inti putih (abstrak keypad OTP).
import { deflateSync } from 'node:zlib'
import { writeFileSync, mkdirSync } from 'node:fs'

mkdirSync(new URL('../public', import.meta.url), { recursive: true })

const CRC_TABLE = (() => {
  const t = new Uint32Array(256)
  for (let n = 0; n < 256; n++) {
    let c = n
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1
    t[n] = c >>> 0
  }
  return t
})()

function crc32(buf) {
  let c = 0xffffffff
  for (const b of buf) c = CRC_TABLE[(c ^ b) & 0xff] ^ (c >>> 8)
  return (c ^ 0xffffffff) >>> 0
}

function chunk(type, data) {
  const len = Buffer.alloc(4)
  len.writeUInt32BE(data.length)
  const body = Buffer.concat([Buffer.from(type, 'ascii'), data])
  const crc = Buffer.alloc(4)
  crc.writeUInt32BE(crc32(body))
  return Buffer.concat([len, body, crc])
}

function png(width, height, pixel) {
  const raw = Buffer.alloc((width * 4 + 1) * height)
  for (let y = 0; y < height; y++) {
    raw[y * (width * 4 + 1)] = 0
    for (let x = 0; x < width; x++) {
      raw.set(pixel(x / width, y / height), y * (width * 4 + 1) + 1 + x * 4)
    }
  }
  const ihdr = Buffer.alloc(13)
  ihdr.writeUInt32BE(width, 0)
  ihdr.writeUInt32BE(height, 4)
  ihdr[8] = 8 // bit depth
  ihdr[9] = 6 // truecolor + alpha
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0))])
}

const SLATE = [15, 23, 42, 255]
const EMERALD = [16, 185, 129, 255]
const WHITE = [255, 255, 255, 255]

// pad = fraksi zona aman untuk maskable (0 = penuh).
function art(pad) {
  return (u, v) => {
    const inBox = (x0, x1) => u >= x0 && u <= x1 && v >= x0 && v <= x1
    if (pad > 0 && (u < pad || u > 1 - pad || v < pad || v > 1 - pad)) return SLATE
    if (inBox(0.22, 0.78)) {
      if (inBox(0.34, 0.66)) {
        // Tiga titik vertikal ala digit OTP.
        if (v >= 0.4 && v <= 0.6 && (u < 0.42 || (u > 0.46 && u < 0.54) || u > 0.58)) return EMERALD
        return WHITE
      }
      return EMERALD
    }
    return SLATE
  }
}

const jobs = [
  ['public/pwa-192x192.png', 192, art(0)],
  ['public/pwa-512x512.png', 512, art(0)],
  ['public/maskable-icon-512x512.png', 512, art(0.1)],
  ['public/apple-touch-icon.png', 180, art(0)],
]
for (const [file, size, px] of jobs) {
  writeFileSync(file, png(size, size, px))
  console.log('tulis', file)
}
