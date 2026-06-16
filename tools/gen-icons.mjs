// Generates BlitzIQ PWA icons (navy rounded tile + gold lightning bolt) as PNGs.
// No external deps — encodes truecolor+alpha PNGs with Node's zlib. Run: node tools/gen-icons.mjs
import zlib from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const NAVY  = [10, 22, 40];    // #0a1628  tile edge
const NAVY3 = [26, 50, 86];    // #1a3256  tile center (lighter, for depth)
const GOLD  = [240, 165, 0];   // #f0a500
const GOLDL = [255, 196, 64];  // brighter gold for ring/bolt highlight
const GOLDD = [200, 138, 0];   // #c88a00  bolt shadow

// Lightning bolt in a 100x100 box.
const BOLT = [[57, 5], [23, 57], [46, 57], [38, 95], [80, 38], [54, 38]];

const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

function pointInPoly(px, py, poly) {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const xi = poly[i][0], yi = poly[i][1], xj = poly[j][0], yj = poly[j][1];
    if ((yi > py) !== (yj > py) && px < ((xj - xi) * (py - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

// signed distance to a rounded rect centered in the SxS canvas (negative = inside)
function sdfRound(x, y, S, margin, rr) {
  const c = S / 2, half = S / 2 - margin - rr;
  const dx = Math.abs(x - c) - half, dy = Math.abs(y - c) - half;
  const out = Math.hypot(Math.max(dx, 0), Math.max(dy, 0));
  return out + Math.min(Math.max(dx, dy), 0) - rr;
}

function buildPixels(S, { maskable }) {
  const SS = 4;                                 // supersampling for smooth edges
  const cx = S / 2, cy = S / 2;
  const rrTile = maskable ? 0 : S * 0.205, mTile = maskable ? 0 : S * 0.012;
  const mRing = S * 0.05, rrRing = S * 0.165, ringThick = S * 0.028;
  const boltBox = S * (maskable ? 0.52 : 0.66), boltOff = (S - boltBox) / 2;
  const inBolt = (x, y) => pointInPoly(((x - boltOff) / boltBox) * 100, ((y - boltOff) / boltBox) * 100, BOLT);
  const px = Buffer.alloc(S * S * 4);

  const sample = (x, y) => {
    // tile shape (transparent outside, for non-maskable rounded tile)
    if (!maskable && sdfRound(x, y, S, mTile, rrTile) > 0) return null;
    // radial navy background — lighter in the center for depth
    const dist = Math.hypot(x - cx, y - cy) / (S * 0.62);
    let col = mix(NAVY3, NAVY, clamp(dist, 0, 1));
    // soft gold glow behind the bolt
    const gd = Math.hypot(x - cx, y - cy) / (S * 0.34);
    if (gd < 1) col = mix(col, GOLD, (1 - gd) * (1 - gd) * 0.18);
    // bolt — vertical gold gradient with a bright top edge
    if (inBolt(x, y)) {
      const ty = clamp((y - boltOff) / boltBox, 0, 1);
      return ty < 0.12 ? mix(GOLDL, GOLD, ty / 0.12) : mix(GOLD, GOLDD, (ty - 0.12) / 0.88);
    }
    // accent ring (skip on maskable so the platform mask can't clip it)
    if (!maskable) {
      const sr = sdfRound(x, y, S, mRing, rrRing);
      if (sr <= 0 && sr >= -ringThick) return mix(GOLD, GOLDL, 0.35);
    }
    return col;
  };

  for (let y = 0; y < S; y++) {
    for (let x = 0; x < S; x++) {
      let R = 0, G = 0, B = 0, A = 0;
      for (let sy = 0; sy < SS; sy++) {
        for (let sx = 0; sx < SS; sx++) {
          const c = sample(x + (sx + 0.5) / SS, y + (sy + 0.5) / SS);
          if (c) { R += c[0]; G += c[1]; B += c[2]; A += 255; }
        }
      }
      const n = SS * SS, i = (y * S + x) * 4;
      px[i] = Math.round(R / n); px[i + 1] = Math.round(G / n); px[i + 2] = Math.round(B / n); px[i + 3] = Math.round(A / n);
    }
  }
  return px;
}

// ── minimal PNG encoder ──
const CRC = (() => {
  const t = new Uint32Array(256);
  for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; }
  return t;
})();
function crc32(buf) { let c = 0xffffffff; for (let i = 0; i < buf.length; i++) c = CRC[(c ^ buf[i]) & 0xff] ^ (c >>> 8); return (c ^ 0xffffffff) >>> 0; }
function chunk(type, data) {
  const len = Buffer.alloc(4); len.writeUInt32BE(data.length, 0);
  const td = Buffer.concat([Buffer.from(type, 'ascii'), data]);
  const crc = Buffer.alloc(4); crc.writeUInt32BE(crc32(td), 0);
  return Buffer.concat([len, td, crc]);
}
function encodePNG(S, px) {
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(S, 0); ihdr.writeUInt32BE(S, 4);
  ihdr[8] = 8; ihdr[9] = 6; ihdr[10] = 0; ihdr[11] = 0; ihdr[12] = 0; // 8-bit RGBA
  const raw = Buffer.alloc(S * (S * 4 + 1));
  for (let y = 0; y < S; y++) { raw[y * (S * 4 + 1)] = 0; px.copy(raw, y * (S * 4 + 1) + 1, y * S * 4, (y + 1) * S * 4); }
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  return Buffer.concat([sig, chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]);
}

const targets = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];
for (const t of targets) {
  writeFileSync(join(ROOT, t.name), encodePNG(t.size, buildPixels(t.size, { maskable: t.maskable })));
  console.log('wrote', t.name, t.size + 'px');
}
