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
  const sourceAlpha = color[3] / 255;
  const destinationAlpha = data[index + 3] / 255;
  const outputAlpha = sourceAlpha + destinationAlpha * (1 - sourceAlpha);
  if (outputAlpha === 0) return;
  data[index] = Math.round((color[0] * sourceAlpha + data[index] * destinationAlpha * (1 - sourceAlpha)) / outputAlpha);
  data[index + 1] = Math.round((color[1] * sourceAlpha + data[index + 1] * destinationAlpha * (1 - sourceAlpha)) / outputAlpha);
  data[index + 2] = Math.round((color[2] * sourceAlpha + data[index + 2] * destinationAlpha * (1 - sourceAlpha)) / outputAlpha);
  data[index + 3] = Math.round(outputAlpha * 255);
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

function fillRoundedRect(data, size, x, y, width, height, radius, color) {
  fillRect(data, size, x + radius, y, width - radius * 2, height, color);
  fillRect(data, size, x, y + radius, width, height - radius * 2, color);
  fillCircle(data, size, x + radius, y + radius, radius, color);
  fillCircle(data, size, x + width - radius, y + radius, radius, color);
  fillCircle(data, size, x + radius, y + height - radius, radius, color);
  fillCircle(data, size, x + width - radius, y + height - radius, radius, color);
}

function fillPolygon(data, size, points, color) {
  const minY = Math.floor(Math.min(...points.map((point) => point[1])));
  const maxY = Math.ceil(Math.max(...points.map((point) => point[1])));
  for (let y = minY; y <= maxY; y += 1) {
    const intersections = [];
    for (let index = 0; index < points.length; index += 1) {
      const current = points[index];
      const next = points[(index + 1) % points.length];
      if ((current[1] <= y && next[1] > y) || (next[1] <= y && current[1] > y)) {
        intersections.push(current[0] + ((y - current[1]) * (next[0] - current[0])) / (next[1] - current[1]));
      }
    }
    intersections.sort((a, b) => a - b);
    for (let index = 0; index < intersections.length; index += 2) {
      for (let x = Math.ceil(intersections[index]); x <= Math.floor(intersections[index + 1]); x += 1) {
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

function drawBezier(data, size, points, width, color) {
  let previous = points[0];
  for (let step = 1; step <= 60; step += 1) {
    const t = step / 60;
    const inverse = 1 - t;
    const current = [
      inverse ** 3 * points[0][0] + 3 * inverse ** 2 * t * points[1][0] + 3 * inverse * t ** 2 * points[2][0] + t ** 3 * points[3][0],
      inverse ** 3 * points[0][1] + 3 * inverse ** 2 * t * points[1][1] + 3 * inverse * t ** 2 * points[2][1] + t ** 3 * points[3][1]
    ];
    drawLine(data, size, previous[0], previous[1], current[0], current[1], width, color);
    previous = current;
  }
}

function renderIcon(size) {
  const data = createCanvas(size);
  const navy = rgba('#0b1f33');
  const emerald = rgba('#10b981');
  const mint = rgba('#d1fae5');
  const amber = rgba('#f59e0b');

  fillRoundedRect(data, size, size * 0.035, size * 0.035, size * 0.93, size * 0.93, size * 0.2, navy);
  fillCircle(data, size, size * 0.78, size * 0.16, size * 0.36, rgba('#173b50', 155));
  fillCircle(data, size, size * 0.13, size * 0.82, size * 0.32, rgba('#0b5449', 100));

  const route = [
    [size * 0.22, size * 0.72],
    [size * 0.35, size * 0.44],
    [size * 0.52, size * 0.69],
    [size * 0.68, size * 0.48]
  ];
  drawBezier(data, size, route, size * 0.072, rgba('#071724', 150));
  drawBezier(data, size, route, size * 0.047, emerald);

  fillCircle(data, size, size * 0.22, size * 0.72, size * 0.085, navy);
  fillCircle(data, size, size * 0.22, size * 0.72, size * 0.058, mint);
  fillCircle(data, size, size * 0.22, size * 0.72, size * 0.023, emerald);

  fillPolygon(data, size, [
    [size * 0.46, size * 0.49],
    [size * 0.61, size * 0.54],
    [size * 0.49, size * 0.63]
  ], mint);

  fillPolygon(data, size, [
    [size * 0.68, size * 0.59],
    [size * 0.58, size * 0.39],
    [size * 0.78, size * 0.39]
  ], amber);
  fillCircle(data, size, size * 0.68, size * 0.34, size * 0.145, amber);
  fillCircle(data, size, size * 0.68, size * 0.34, size * 0.067, navy);
  fillCircle(data, size, size * 0.68, size * 0.34, size * 0.027, mint);

  return data;
}

function drawIcon(size) {
  const scale = 4;
  const sourceSize = size * scale;
  const source = renderIcon(sourceSize);
  const output = createCanvas(size);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const totals = [0, 0, 0, 0];
      for (let sourceY = y * scale; sourceY < (y + 1) * scale; sourceY += 1) {
        for (let sourceX = x * scale; sourceX < (x + 1) * scale; sourceX += 1) {
          const index = (sourceY * sourceSize + sourceX) * 4;
          for (let channel = 0; channel < 4; channel += 1) totals[channel] += source[index + channel];
        }
      }
      const outputIndex = (y * size + x) * 4;
      for (let channel = 0; channel < 4; channel += 1) output[outputIndex + channel] = Math.round(totals[channel] / scale ** 2);
    }
  }
  return output;
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
  `${JSON.stringify(
    {
      id: '/',
      name: 'LogiTrack — Gestão inteligente de entregas',
      short_name: 'LogiTrack',
      description: 'Gestão de entregas, rotas, frota e ocorrências em uma única plataforma.',
      lang: 'pt-BR',
      start_url: '/',
      scope: '/',
      icons: [
        { src: '/android-chrome-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any maskable' },
        { src: '/android-chrome-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' }
      ],
      theme_color: '#0b1f33',
      background_color: '#f4f7f6',
      display: 'standalone',
      orientation: 'any',
      categories: ['business', 'navigation', 'productivity'],
      shortcuts: [
        {
          name: 'Operações',
          short_name: 'Operações',
          description: 'Acompanhar as entregas em andamento',
          url: '/operations'
        }
      ]
    },
    null,
    2
  )}\n`
);
