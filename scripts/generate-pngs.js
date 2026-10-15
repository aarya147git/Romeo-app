import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

function crc32(buf) {
  let table = new Uint32Array(256);
  for (let i = 0; i < 256; i++) {
    let c = i;
    for (let k = 0; k < 8; k++) {
      c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
    }
    table[i] = c;
  }
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c = table[(c ^ buf[i]) & 0xff] ^ (c >>> 8);
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);

  const crcTarget = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(crcTarget);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createPng(width, height, isMaskable = false) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8-bit depth
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0;
  ihdrData[11] = 0;
  ihdrData[12] = 0;
  const ihdrChunk = makeChunk('IHDR', ihdrData);

  // Generate pixels
  const rowLength = 1 + width * 4;
  const rawData = Buffer.alloc(rowLength * height);

  const cx = width / 2;
  const cy = height / 2;
  const radius = isMaskable ? width * 0.48 : width * 0.44;

  for (let y = 0; y < height; y++) {
    const rowOffset = y * rowLength;
    rawData[rowOffset] = 0; // Filter: None

    for (let x = 0; x < width; x++) {
      const pxOffset = rowOffset + 1 + x * 4;

      // Gradient background from violet (124, 58, 237) to rose (244, 63, 94)
      const gradT = (x + y) / (width + height);
      let r = Math.round(124 + (244 - 124) * gradT);
      let g = Math.round(58 + (63 - 58) * gradT);
      let b = Math.round(237 + (94 - 237) * gradT);
      let a = 255;

      // Icon graphic inside safe area
      // Draw modern Home roof & body
      const iconScale = isMaskable ? 0.65 : 0.72;
      const nx = (x - cx) / (cx * iconScale);
      const ny = (y - cy) / (cy * iconScale);

      let inIcon = false;

      // Roof triangle: ny between -0.6 and 0.0, |nx| <= (ny + 0.6) * 1.2
      if (ny >= -0.6 && ny <= 0.0) {
        if (Math.abs(nx) <= (ny + 0.6) * 1.1) {
          inIcon = true;
        }
      }
      // House base rectangle: ny between 0.0 and 0.55, |nx| <= 0.55
      if (ny >= 0.0 && ny <= 0.55 && Math.abs(nx) <= 0.55) {
        inIcon = true;
      }
      // Door cutout: ny between 0.15 and 0.55, |nx| <= 0.22
      if (ny >= 0.15 && ny <= 0.55 && Math.abs(nx) <= 0.22) {
        inIcon = false;
      }
      // Chimney
      if (nx >= 0.25 && nx <= 0.42 && ny >= -0.55 && ny <= -0.1) {
        inIcon = true;
      }

      // If in icon, color white with slight soft shading
      if (inIcon) {
        r = 255;
        g = 255;
        b = 255;
        a = 255;
      }

      // Corner rounding for non-maskable icons
      if (!isMaskable) {
        // Rounded rectangle mask (corner radius ~ 22%)
        const cr = width * 0.22;
        const dx = Math.max(0, Math.abs(x - cx) - (cx - cr));
        const dy = Math.max(0, Math.abs(y - cy) - (cy - cr));
        if (dx * dx + dy * dy > cr * cr) {
          a = 0;
        }
      }

      rawData[pxOffset] = r;
      rawData[pxOffset + 1] = g;
      rawData[pxOffset + 2] = b;
      rawData[pxOffset + 3] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// Write PNG icons
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPng(192, 192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPng(512, 512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPng(512, 512, true));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPng(180, 180, false));
fs.writeFileSync(path.join(publicDir, 'favicon.ico'), createPng(64, 64, false));

// Write SVG icon
const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="romeoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#7C3AED" />
      <stop offset="100%" stop-color="#F43F5E" />
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="12" stdDeviation="16" flood-color="#7C3AED" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect width="512" height="512" rx="128" fill="url(#romeoGrad)" />
  <g filter="url(#shadow)">
    <!-- Chimney -->
    <rect x="310" y="140" width="45" height="90" rx="8" fill="#FFFFFF" />
    <!-- Roof Triangle -->
    <path d="M256 120 L395 240 C403 247 398 260 387 260 H125 C114 260 109 247 117 240 Z" fill="#FFFFFF" />
    <!-- House Base -->
    <rect x="146" y="255" width="220" height="150" rx="16" fill="#FFFFFF" />
    <!-- Door Archway -->
    <path d="M226 405 V315 C226 298 240 285 256 285 C272 285 286 298 286 315 V405 Z" fill="url(#romeoGrad)" />
    <!-- Heart Accent Symbol above door -->
    <circle cx="256" cy="225" r="14" fill="#F43F5E" />
  </g>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'icon.svg'), svgContent);

console.log('Successfully generated all PWA icons in /public!');
