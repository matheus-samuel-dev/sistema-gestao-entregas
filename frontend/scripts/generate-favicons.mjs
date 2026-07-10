import { deflateSync } from 'node:zlib';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const publicDir = fileURLToPath(new URL('../public/', import.meta.url));

function rgba(hex, alpha = 255) {
  const clean = hex.replace('#', '');
  return [
    Number.parseInt(clean.slice(0, 2), 16),
    Number.parseInt(clean.slice(2, 4), 16),
    Number.parseInt(clean.slice(4, 6), 16),
    alpha
  ];
}

function createCanvas(size) {
  return new Uint8Array(size * size * 4);
}

function setPixel(data, size, x, y, color) {
  if (x < 0 || y < 0 || x >= size || y >= size) return;
  const index = (Math.floor(y) * size + Math.floor(x)) * 4;
  data[index] = color[0];
  data[index + 1] = color[1];
  data[index + 2] = color[2];
  data[index + 3] = color[3];
}

function fillRect(data, size, x, y, width, height, color) {
  for (let yy = y; yy < y + height; yy += 1) {
    for (let xx = x; xx < x + width; xx += 1) {
      setPixel(data, size, xx, yy, color);
    }
  }
}

function fillCircle(data, size, cx, cy, radius, color) {
  const r2 = radius * radius;
  for (let y = Math.floor(cy - radius); y <= Math.ceil(cy + radius); y += 1) {
    for (let x = Math.floor(cx - radius); x <= Math.ceil(cx + radius); x += 1) {
      const dx = x - cx;
      const dy = y - cy;
      if (dx * dx + dy * dy <= r2) {
        setPixel(data, size, x, y, color);
      }
    }
  }
}

function drawLine(data, size, x1, y1, x2, y2, width, color) {
  const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
  for (let index = 0; index <= steps; index += 1) {
    const t = steps === 0 ? 0 : index / steps;
    fillCircle(data, size, x1 + (x2 - x1) * t, y1 + (y2 - y1) * t, width / 2, color);
  }
}

function drawIcon(size) {
  const data = createCanvas(size);
  const dark = rgba('#003d2f');
  const green = rgba('#10b981');
  const mint = rgba('#d1fae5');
  const white = rgba('#ffffff');
  const blue = rgba('#2563eb');

  fillRect(data, size, 0, 0, size, size, dark);
  fillCircle(data, size, size * 0.18, size * 0.18, size * 0.42, rgba('#075f47'));

  drawLine(data, size, size * 0.18, size * 0.72, size * 0.42, size * 0.48, size * 0.055, green);
  drawLine(data, size, size * 0.42, size * 0.48, size * 0.76, size * 0.62, size * 0.055, green);
  fillCircle(data, size, size * 0.18, size * 0.72, size * 0.055, mint);
  fillCircle(data, size, size * 0.42, size * 0.48, size * 0.055, mint);
  fillCircle(data, size, size * 0.76, size * 0.62, size * 0.055, mint);

  fillRect(data, size, size * 0.24, size * 0.28, size * 0.31, size * 0.23, white);
  fillRect(data, size, size * 0.55, size * 0.35, size * 0.17, size * 0.16, white);
  fillRect(data, size, size * 0.6, size * 0.31, size * 0.08, size * 0.08, white);
  fillRect(data, size, size * 0.28, size * 0.32, size * 0.22, size * 0.055, green);
  fillCircle(data, size, size * 0.34, size * 0.54, size * 0.055, dark);
  fillCircle(data, size, size * 0.64, size * 0.54, size * 0.055, dark);
  fillCircle(data, size, size * 0.34, size * 0.54, size * 0.028, blue);
  fillCircle(data, size, size * 0.64, size * 0.54, size * 0.028, blue);

  return data;
}

const crcTable = new Uint32Array(256).map((_, index) => {
  let c = index;
  for (let k = 0; k < 8; k += 1) {
    c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  }
  return c >>> 0;
});

function crc32(buffer) {
  let c = 0xffffffff;
  for (const byte of buffer) {
    c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const typeBuffer = Buffer.from(type);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(Buffer.concat([typeBuffer, data])));
  return Buffer.concat([length, typeBuffer, data, crc]);
}

function png(size) {
  const raw = drawIcon(size);
  const scanlines = Buffer.alloc((size * 4 + 1) * size);
  for (let y = 0; y < size; y += 1) {
    scanlines[y * (size * 4 + 1)] = 0;
    Buffer.from(raw.subarray(y * size * 4, (y + 1) * size * 4)).copy(scanlines, y * (size * 4 + 1) + 1);
  }
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr),
    chunk('IDAT', deflateSync(scanlines)),
    chunk('IEND', Buffer.alloc(0))
  ]);
}

function ico(images) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0);
  header.writeUInt16LE(1, 2);
  header.writeUInt16LE(images.length, 4);
  let offset = 6 + images.length * 16;
  const entries = images.map(({ size, data }) => {
    const entry = Buffer.alloc(16);
    entry[0] = size >= 256 ? 0 : size;
    entry[1] = size >= 256 ? 0 : size;
    entry[2] = 0;
    entry[3] = 0;
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(data.length, 8);
    entry.writeUInt32LE(offset, 12);
    offset += data.length;
    return entry;
  });
  return Buffer.concat([header, ...entries, ...images.map((image) => image.data)]);
}

const assets = {
  'favicon-16x16.png': png(16),
  'favicon-32x32.png': png(32),
  'apple-touch-icon.png': png(180),
  'android-chrome-192x192.png': png(192),
  'android-chrome-512x512.png': png(512)
};

for (const [name, data] of Object.entries(assets)) {
  writeFileSync(join(publicDir, name), data);
}

writeFileSync(
  join(publicDir, 'favicon.ico'),
  ico([
    { size: 16, data: assets['favicon-16x16.png'] },
    { size: 32, data: assets['favicon-32x32.png'] }
  ])
);

writeFileSync(
  join(publicDir, 'manifest.webmanifest'),
  JSON.stringify(
    {
      name: 'LogiTrack - Gestao de Entregas',
      short_name: 'LogiTrack',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png' }
      ],
      theme_color: '#003d2f',
      background_color: '#f5f8f7',
      display: 'standalone'
    },
    null,
    2
  )
);
