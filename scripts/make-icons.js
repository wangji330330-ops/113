/* Generate crisp pixel-art PNG app icons with zero dependencies. */
const fs = require("node:fs");
const path = require("node:path");
const zlib = require("node:zlib");

// Same lantern as assets/js/icons.js, inlined so this script stays dependency-free.
const LANTERN = [
  ".....##.....",
  "....#..#....",
  "...######...",
  "..#++++++#..",
  "..#+#++#+#..",
  "..#++++++#..",
  "..#+#++#+#..",
  "..#++++++#..",
  "...######...",
  ".....##.....",
  "....####....",
  "............"
];

const OUT = path.resolve(__dirname, "..", "assets", "icons");
fs.mkdirSync(OUT, { recursive: true });

const PALETTE = {
  ".": null,
  "#": [245, 196, 81, 255],
  "+": [248, 217, 143, 255]
};
const BG = [27, 20, 43, 255];
const BORDER = [74, 61, 97, 255];
const GLOW = [57, 43, 74, 255];
const STAR = [246, 233, 207, 255];

function buildGrid() {
  const size = 16;
  const grid = Array.from({ length: size }, () => Array(size).fill(BG));
  // border
  for (let i = 0; i < size; i += 1) {
    grid[0][i] = BORDER;
    grid[size - 1][i] = BORDER;
    grid[i][0] = BORDER;
    grid[i][size - 1] = BORDER;
  }
  // soft pixel glow behind the lantern
  for (let y = 3; y <= 13; y += 1) {
    for (let x = 3; x <= 12; x += 1) {
      if (grid[y][x] === BG) grid[y][x] = GLOW;
    }
  }
  // stars
  grid[12][2] = STAR;
  grid[3][13] = STAR;
  grid[13][13] = STAR;
  // lantern sprite (12x12), centered with a 1px margin
  const sprite = LANTERN;
  for (let y = 0; y < 12; y += 1) {
    for (let x = 0; x < 12; x += 1) {
      const color = PALETTE[sprite[y][x]];
      if (color) grid[y + 2][x + 2] = color;
    }
  }
  return grid;
}

function crc32(buffer) {
  let crc = 0xffffffff;
  for (let i = 0; i < buffer.length; i += 1) {
    crc ^= buffer[i];
    for (let bit = 0; bit < 8; bit += 1) {
      crc = (crc >>> 1) ^ (crc & 1 ? 0xedb88320 : 0);
    }
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function chunk(type, data) {
  const name = Buffer.from(type, "ascii");
  const body = Buffer.concat([name, data]);
  const length = Buffer.alloc(4);
  length.writeUInt32BE(data.length, 0);
  const crc = Buffer.alloc(4);
  crc.writeUInt32BE(crc32(body), 0);
  return Buffer.concat([length, body, crc]);
}

function encodePng(width, height, rgba) {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  const raw = Buffer.alloc((width * 4 + 1) * height);
  for (let y = 0; y < height; y += 1) {
    const rowStart = y * (width * 4 + 1);
    raw[rowStart] = 0;
    rgba.copy(raw, rowStart + 1, y * width * 4, (y + 1) * width * 4);
  }
  const idat = zlib.deflateSync(raw, { level: 9 });
  return Buffer.concat([
    signature,
    chunk("IHDR", ihdr),
    chunk("IDAT", idat),
    chunk("IEND", Buffer.alloc(0))
  ]);
}

function render(size, grid) {
  const rgba = Buffer.alloc(size * size * 4);
  for (let y = 0; y < size; y += 1) {
    for (let x = 0; x < size; x += 1) {
      const sx = Math.floor((x * grid.length) / size);
      const sy = Math.floor((y * grid.length) / size);
      const color = grid[sy][sx];
      const offset = (y * size + x) * 4;
      rgba[offset] = color[0];
      rgba[offset + 1] = color[1];
      rgba[offset + 2] = color[2];
      rgba[offset + 3] = color[3];
    }
  }
  return encodePng(size, size, rgba);
}

const grid = buildGrid();
const outputs = [
  ["icon-512.png", 512],
  ["icon-192.png", 192],
  ["apple-touch-icon.png", 180],
  ["favicon-64.png", 64],
  ["favicon-32.png", 32]
];
for (const [name, size] of outputs) {
  fs.writeFileSync(path.join(OUT, name), render(size, grid));
  console.log(`wrote ${name} (${size}x${size})`);
}

const androidRoot = path.resolve(__dirname, "..", "android", "app", "src", "main", "res");
const mipmaps = [
  ["mipmap-mdpi", 48],
  ["mipmap-hdpi", 72],
  ["mipmap-xhdpi", 96],
  ["mipmap-xxhdpi", 144],
  ["mipmap-xxxhdpi", 192]
];
for (const [folder, size] of mipmaps) {
  const dir = path.join(androidRoot, folder);
  if (!fs.existsSync(dir)) continue;
  fs.writeFileSync(path.join(dir, "ic_launcher.png"), render(size, grid));
  console.log(`wrote android/${folder}/ic_launcher.png (${size}x${size})`);
}
