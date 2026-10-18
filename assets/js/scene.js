/*
 * 微光小屋 · 像素客厅
 * A hand-drawn 384×216 canvas scene. No image assets, no dependencies.
 */

const W = 384;
const H = 216;

const C = {
  outline: "#211728",
  wall: "#2b2443",
  wallStripe: "#2f2849",
  wallDot: "#3a3155",
  trim: "#4b3a52",
  floor: "#35283e",
  floorLine: "#2e2337",
  floorSeam: "#40304a",
  frame: "#d7b284",
  frameShade: "#a77c5b",
  frameDark: "#5e3f3a",
  frameInner: "#241d36",
  skyNight: "#121a38",
  skyNight2: "#1b2649",
  skyDusk: "#2e254b",
  skyDusk2: "#82505f",
  skyDusk3: "#d9856c",
  skyDay: "#7fa6bf",
  skyDay2: "#a9c6d1",
  skyDawn: "#5f4f77",
  skyDawn2: "#b57b8f",
  skyDawn3: "#e6a48b",
  star: "#f6e7bd",
  moon: "#f4dfa8",
  moonShade: "#d9bd83",
  curtain: "#70465a",
  curtainLight: "#89566b",
  curtainTie: "#e5ba6c",
  wood: "#8f5d47",
  woodLight: "#b77b5b",
  woodDark: "#5b3b3d",
  woodDeep: "#4a3037",
  shelf: "#8b5b46",
  rug: "#5d4159",
  rugLight: "#7b576d",
  rugDark: "#49334a",
  rugCream: "#c8a88f",
  lampGold: "#e9b85c",
  lampShade: "#b57a4a",
  lampDark: "#6a4735",
  glow: "#ffc46b",
  pot: "#b66a54",
  potLight: "#d2866a",
  leaf: "#7fa887",
  leafDark: "#5f8a70",
  leafLight: "#a9c29b",
  sweater: "#7f9c8f",
  sweaterShade: "#5f7c72",
  sweaterLight: "#9ab7a6",
  sweaterCream: "#ead9b8",
  skin: "#f2c9a1",
  skinShade: "#dca57f",
  hair: "#4a2e3f",
  hairLight: "#6a4051",
  gold: "#f0c05a",
  goldShade: "#c9953f",
  coral: "#e8735a",
  coralShade: "#bf5848",
  pants: "#405a63",
  pantsShade: "#31464f",
  boot: "#4a3040",
  bootLight: "#5e3d4d",
  cat: "#d88b5d",
  catDark: "#b56f4c",
  catCream: "#f0cfaa",
  catStripes: "#a45f42",
  pink: "#e89a90"
};

const NIGHT_STARS = [
  [40, 38], [50, 48], [62, 36], [68, 54], [84, 40], [94, 58],
  [104, 36], [110, 49], [46, 62], [100, 68], [76, 70], [56, 72]
];

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function pixelEllipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let y = -ry; y < ry; y += 2) {
    const span = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) * rx;
    const left = Math.round((cx - span) / 2) * 2;
    const right = Math.round((cx + span) / 2) * 2;
    ctx.fillRect(left, Math.round((cy + y) / 2) * 2, Math.max(2, right - left), 2);
  }
}

function pixelCircle(ctx, cx, cy, radius, color) {
  ctx.fillStyle = color;
  for (let y = -radius; y <= radius; y += 2) {
    const span = Math.sqrt(Math.max(0, radius * radius - y * y));
    ctx.fillRect(
      Math.round((cx - span) / 2) * 2,
      Math.round((cy + y) / 2) * 2,
      Math.max(2, Math.round((span * 2) / 2) * 2),
      2
    );
  }
}

const HEART = [
  [0, 1, 0, 1, 0],
  [1, 1, 1, 1, 1],
  [1, 1, 1, 1, 1],
  [0, 1, 1, 1, 0],
  [0, 0, 1, 0, 0]
];

function drawHeart(ctx, x, y, unit, color) {
  ctx.fillStyle = color;
  const bx = Math.round(x / 2) * 2;
  const by = Math.round(y / 2) * 2;
  for (let row = 0; row < HEART.length; row += 1) {
    for (let col = 0; col < HEART[row].length; col += 1) {
      if (HEART[row][col]) {
        ctx.fillRect(bx + col * unit, by + row * unit, unit, unit);
      }
    }
  }
}

function drawSpark(ctx, x, y, size, color) {
  ctx.fillStyle = color;
  const s = Math.max(2, size);
  const bx = Math.round(x / 2) * 2;
  const by = Math.round(y / 2) * 2;
  ctx.fillRect(bx, by - s, s, s * 3);
  ctx.fillRect(bx - s, by, s * 3, s);
}

function drawSky(ctx, hour) {
  const x = 32;
  const y = 30;
  const w = 88;
  const h = 60;
  if (hour >= 5 && hour < 8) {
    px(ctx, x, y, w, h, C.skyDawn);
    px(ctx, x, y + 14, w, 20, C.skyDawn2);
    px(ctx, x, y + 34, w, 26, C.skyDawn3);
    pixelCircle(ctx, x + 60, y + 44, 8, "#f8d29b");
    px(ctx, x + 10, y + 42, 20, 2, "#e9b5a1");
    px(ctx, x + 16, y + 46, 24, 2, "#e9b5a1");
  } else if (hour >= 8 && hour < 16) {
    px(ctx, x, y, w, h, C.skyDay);
    px(ctx, x, y + 26, w, 34, C.skyDay2);
    px(ctx, x + 10, y + 14, 22, 4, "#e9ddc7");
    px(ctx, x + 6, y + 18, 30, 4, "#e9ddc7");
    px(ctx, x + 48, y + 26, 26, 4, "#e9ddc7");
    px(ctx, x + 44, y + 30, 34, 3, "#e9ddc7");
    px(ctx, x + 34, y + 48, 18, 2, "#c4dce3");
  } else if (hour >= 16 && hour < 19) {
    px(ctx, x, y, w, h, C.skyDusk);
    px(ctx, x, y + 12, w, 16, "#4a3557");
    px(ctx, x, y + 28, w, 16, C.skyDusk2);
    px(ctx, x, y + 44, w, 12, C.skyDusk3);
    px(ctx, x, y + 56, w, 4, "#e09a78");
    pixelCircle(ctx, x + 62, y + 51, 7, "#f6c17f");
    px(ctx, x + 8, y + 22, 26, 2, "#6a4660");
    px(ctx, x + 16, y + 26, 30, 2, "#6a4660");
    px(ctx, x + 20, y + 10, 2, 2, C.star);
    px(ctx, x + 44, y + 18, 1, 1, "#f4d79c");
    px(ctx, x + 74, y + 8, 2, 1, "#f4d79c");
  } else {
    px(ctx, x, y, w, h, C.skyNight);
    px(ctx, x, y + 20, w, 20, C.skyNight2);
    px(ctx, x, y + 42, w, 18, "#253157");
    for (const [sx, sy] of NIGHT_STARS) {
      px(ctx, x + sx, y + sy, 2, 2, C.star);
    }
    px(ctx, x + 18, y + 16, 2, 2, "#fff5d9");
    px(ctx, x + 72, y + 20, 1, 1, "#fff5d9");
    pixelCircle(ctx, x + 66, y + 26, 9, C.moon);
    pixelCircle(ctx, x + 68, y + 28, 2, C.moonShade);
    px(ctx, x + 60, y + 22, 2, 2, C.moonShade);
  }
}

function paintRoom(hour) {
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;

  // Wall + wallpaper
  px(ctx, 0, 0, W, 150, C.wall);
  for (let x = 0; x < W; x += 32) {
    px(ctx, x, 0, 2, 150, C.wallStripe);
  }
  for (let y = 18; y < 142; y += 30) {
    for (let x = 12; x < W; x += 64) {
      px(ctx, x + ((y / 30) % 2) * 18, y, 2, 2, C.wallDot);
    }
  }

  // Floor
  px(ctx, 0, 148, W, H - 148, C.floor);
  px(ctx, 0, 148, W, 4, C.trim);
  px(ctx, 0, 152, W, 2, "#3e2f47");
  for (let y = 162; y < H; y += 14) {
    px(ctx, 0, y, W, 2, C.floorLine);
    for (let x = (y * 3) % 40; x < W; x += 76) {
      px(ctx, x, y - 12, 2, 12, C.floorLine);
    }
  }
  for (let i = 0; i < 90; i += 1) {
    const x = (i * 71) % W;
    const y = 156 + ((i * 37) % 56);
    px(ctx, x, y, 2, 1, C.floorSeam);
  }

  // Window glow
  px(ctx, 20, 20, 112, 80, "#1c1528");
  px(ctx, 24, 24, 102, 72, C.frameShade);
  px(ctx, 26, 26, 98, 68, C.frame);
  px(ctx, 30, 30, 90, 60, C.frameDark);
  px(ctx, 32, 30, 88, 60, C.frame);

  drawSky(ctx, hour);

  // Window frame + sill
  px(ctx, 72, 30, 6, 60, C.frame);
  px(ctx, 32, 56, 88, 6, C.frame);
  px(ctx, 34, 32, 2, 24, "#f1d6a8");
  px(ctx, 19, 92, 110, 4, C.frameShade);
  px(ctx, 23, 96, 104, 6, C.frame);
  px(ctx, 27, 96, 96, 2, "#e9c89b");
  px(ctx, 33, 31, 4, 2, "#f7e2ba");

  // Curtains
  px(ctx, 14, 26, 14, 68, C.curtain);
  px(ctx, 16, 26, 4, 68, C.curtainLight);
  px(ctx, 24, 26, 4, 68, "#5d384a");
  px(ctx, 14, 88, 14, 4, C.curtainTie);
  px(ctx, 116, 26, 14, 68, C.curtain);
  px(ctx, 118, 26, 4, 68, "#5d384a");
  px(ctx, 124, 26, 4, 68, C.curtainLight);
  px(ctx, 116, 88, 14, 4, C.curtainTie);
  px(ctx, 8, 22, 128, 4, "#7b5664");
  px(ctx, 12, 18, 4, 6, "#d7b284");
  px(ctx, 126, 18, 4, 6, "#d7b284");

  // Picture frame
  px(ctx, 148, 31, 42, 34, "#1e172b");
  px(ctx, 150, 33, 38, 30, "#8f6a4f");
  px(ctx, 154, 37, 30, 22, "#261f3a");
  drawHeart(ctx, 163, 42, 2, C.coral);
  px(ctx, 178, 39, 2, 2, C.star);
  px(ctx, 158, 53, 2, 2, "#6e8fa8");
  px(ctx, 157, 56, 10, 2, "#3e4d68");

  // Shelf
  px(ctx, 286, 62, 74, 3, "#3a2833");
  px(ctx, 288, 56, 72, 6, C.shelf);
  px(ctx, 288, 56, 72, 2, "#a87054");
  px(ctx, 294, 61, 4, 8, C.woodDark);
  px(ctx, 352, 61, 4, 8, C.woodDark);

  // Books on shelf
  px(ctx, 296, 42, 7, 14, "#9d5b56");
  px(ctx, 296, 42, 7, 3, "#d7b284");
  px(ctx, 304, 46, 6, 10, "#d9b06b");
  px(ctx, 311, 40, 8, 16, "#688b7a");
  px(ctx, 312, 43, 6, 2, "#c8a88f");
  px(ctx, 320, 47, 6, 9, "#7c6688");

  // Tiny plant on shelf
  px(ctx, 338, 50, 10, 6, C.pot);
  px(ctx, 336, 48, 14, 4, C.potLight);
  px(ctx, 342, 40, 2, 10, C.leafDark);
  px(ctx, 338, 38, 5, 5, C.leaf);
  px(ctx, 345, 35, 5, 6, C.leafLight);
  px(ctx, 334, 36, 4, 4, C.leaf);
  px(ctx, 349, 42, 4, 4, C.leafDark);

  // Floor plant
  px(ctx, 17, 164, 30, 22, "#251b2b");
  for (let row = 0; row < 20; row += 2) {
    const inset = Math.floor(row / 8) * 2;
    px(ctx, 23 + inset, 166 + row, 26 - inset * 2, 2, C.pot);
  }
  px(ctx, 20, 164, 30, 5, C.potLight);
  px(ctx, 21, 162, 28, 3, "#8f4d42");
  px(ctx, 30, 154, 3, 12, C.leafDark);
  px(ctx, 34, 148, 3, 12, C.leafDark);
  px(ctx, 26, 150, 3, 10, C.leafDark);
  px(ctx, 24, 140, 10, 8, C.leaf);
  px(ctx, 34, 134, 12, 10, C.leafLight);
  px(ctx, 20, 132, 8, 10, C.leaf);
  px(ctx, 39, 144, 10, 8, C.leaf);
  px(ctx, 30, 126, 8, 9, C.leafLight);
  px(ctx, 27, 138, 7, 7, C.leaf);
  px(ctx, 43, 132, 6, 8, C.leafDark);

  // Rug
  pixelEllipse(ctx, 204, 184, 100, 21, "#2b2034");
  pixelEllipse(ctx, 204, 183, 96, 19, C.rugLight);
  pixelEllipse(ctx, 204, 183, 90, 16, C.rug);
  pixelEllipse(ctx, 204, 183, 62, 10, C.rugDark);
  px(ctx, 122, 184, 164, 2, "#6f4e62");
  for (let x = 146; x < 266; x += 18) {
    px(ctx, x, 176, 6, 2, "#6f4e62");
    px(ctx, x + 6, 190, 6, 2, "#4f384f");
  }
  px(ctx, 106, 186, 5, 2, C.rugCream);
  px(ctx, 111, 184, 3, 2, C.rugCream);
  px(ctx, 296, 184, 5, 2, C.rugCream);
  px(ctx, 291, 186, 3, 2, C.rugCream);

  // Desk
  px(ctx, 268, 134, 108, 3, "#2a1d2d");
  px(ctx, 270, 136, 102, 6, C.wood);
  px(ctx, 270, 136, 102, 2, C.woodLight);
  px(ctx, 274, 142, 94, 4, C.woodDark);
  px(ctx, 280, 146, 6, 36, C.woodDark);
  px(ctx, 282, 146, 3, 34, "#724d4b");
  px(ctx, 356, 146, 6, 36, C.woodDark);
  px(ctx, 358, 146, 3, 34, "#724d4b");
  px(ctx, 286, 162, 70, 4, C.woodDeep);
  px(ctx, 286, 162, 70, 2, "#5e3f3d");
  px(ctx, 272, 178, 10, 4, "#241a2a");
  px(ctx, 354, 178, 10, 4, "#241a2a");

  // Desk clutter
  px(ctx, 296, 126, 12, 10, "#d8c0a0");
  px(ctx, 298, 124, 8, 3, "#f0dcba");
  px(ctx, 298, 136, 8, 2, "#a77c5b");
  px(ctx, 292, 129, 4, 4, "#d8c0a0");
  px(ctx, 346, 129, 18, 3, "#9d5b56");
  px(ctx, 348, 124, 16, 3, "#688b7a");
  px(ctx, 350, 119, 12, 3, "#d9b06b");

  // Lamp fixture
  px(ctx, 312, 114, 36, 4, C.lampShade);
  px(ctx, 316, 110, 28, 4, C.lampGold);
  px(ctx, 320, 106, 20, 4, C.lampGold);
  px(ctx, 324, 102, 12, 4, C.lampGold);
  px(ctx, 318, 108, 4, 2, "#f8d78f");
  px(ctx, 329, 118, 5, 16, C.lampDark);
  px(ctx, 330, 118, 2, 14, "#8b6143");
  px(ctx, 322, 132, 20, 4, C.lampDark);
  px(ctx, 320, 134, 24, 2, "#3b2730");
  px(ctx, 326, 112, 8, 2, "#f8d78f");

  return canvas;
}

function drawStringLights(ctx, litCount, total, now) {
  const startX = 154;
  const endX = 374;
  const startY = 24;
  const sag = 26;
  const points = [];
  for (let i = 0; i <= 40; i += 1) {
    const t = i / 40;
    const x = startX + (endX - startX) * t;
    const y = startY + Math.sin(Math.PI * t) * sag;
    points.push([x, y]);
  }
  ctx.fillStyle = "#65566c";
  for (const [x, y] of points) {
    ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, 2, 2);
  }
  const bulbs = 7;
  const lit = total > 0 ? Math.max(0, Math.min(bulbs, Math.round((litCount / total) * bulbs))) : 0;
  for (let i = 0; i < bulbs; i += 1) {
    const t = (i + 0.5) / bulbs;
    const x = startX + (endX - startX) * t;
    const y = startY + Math.sin(Math.PI * t) * sag + 2;
    const isLit = i < lit;
    px(ctx, x - 1, y, 3, 2, "#3a2b38");
    if (isLit) {
      const pulse = 0.82 + Math.sin(now * 0.004 + i * 1.2) * 0.18;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      const g = ctx.createRadialGradient(x, y + 4, 1, x, y + 4, 18);
      g.addColorStop(0, `rgba(255, 207, 115, ${0.34 * pulse})`);
      g.addColorStop(1, "rgba(255, 207, 115, 0)");
      ctx.fillStyle = g;
      ctx.fillRect(x - 20, y - 16, 40, 40);
      ctx.restore();
      px(ctx, x - 2, y + 2, 5, 6, C.lampGold);
      px(ctx, x - 1, y + 3, 3, 4, "#ffe3a1");
      px(ctx, x - 1, y + 7, 3, 1, "#c9953f");
    } else {
      px(ctx, x - 2, y + 2, 5, 6, "#48405b");
      px(ctx, x, y + 4, 1, 2, "#5e5570");
    }
  }
}

function drawLampGlow(ctx, now) {
  const flicker = 0.9 + Math.sin(now * 0.0047) * 0.05 + Math.sin(now * 0.013) * 0.02;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(332, 118, 2, 332, 118, 98);
  g.addColorStop(0, `rgba(255, 201, 111, ${0.22 * flicker})`);
  g.addColorStop(0.32, `rgba(255, 190, 100, ${0.10 * flicker})`);
  g.addColorStop(0.72, "rgba(255, 180, 90, 0.025)");
  g.addColorStop(1, "rgba(255, 180, 90, 0)");
  ctx.fillStyle = g;
  ctx.fillRect(228, 24, 154, 178);
  ctx.restore();
}

function drawCharacter(ctx, now, jump, happy, tilt, reduced, mood = null) {
  const cx = 188;
  const bob = reduced ? 0 : (Math.sin(now * 0.0022) > 0.55 ? 2 : 0);
  const baseY = 188 - bob - jump;
  const X = (dx) => cx + dx + (happy ? 0 : tilt);
  const Y = (dy) => baseY + dy;
  const R = (dx, dy, w, h, color) => {
    px(ctx, X(dx), Y(dy), w, h, color);
  };
  const blink = !happy && !reduced && (now % 4200) < 140;
  const low = !happy && mood === "low";

  // Shadow
  const shadowW = 34 - Math.min(12, Math.floor(jump * 0.55));
  pixelEllipse(ctx, cx, 186, shadowW / 2, 4, "rgba(24, 16, 30, 0.45)");

  // Boots
  R(-16, -8, 14, 8, C.outline);
  R(2, -8, 14, 8, C.outline);
  R(-14, -7, 12, 7, C.boot);
  R(2, -7, 12, 7, C.boot);
  R(-13, -7, 8, 2, C.bootLight);
  R(3, -7, 8, 2, C.bootLight);
  R(-14, -2, 12, 2, C.outline);
  R(2, -2, 12, 2, C.outline);

  // Legs
  R(-12, -20, 10, 14, C.outline);
  R(2, -20, 10, 14, C.outline);
  R(-10, -19, 6, 13, C.pants);
  R(4, -19, 6, 13, C.pants);
  R(-10, -12, 6, 2, C.pantsShade);
  R(4, -12, 6, 2, C.pantsShade);

  // Body outline + sweater
  R(-18, -39, 36, 27, C.outline);
  R(-16, -37, 32, 23, C.sweater);
  R(-16, -37, 32, 4, C.sweaterCream);
  R(-16, -34, 32, 2, C.sweaterLight);
  R(-16, -19, 32, 3, C.sweaterShade);
  R(-16, -16, 32, 1, C.sweaterCream);
  R(-10, -29, 20, 2, "#6e8b7f");
  R(-2, -30, 2, 2, C.sweaterCream);
  R(-2, -25, 2, 2, C.sweaterCream);
  R(-2, -35, 3, 5, C.coralShade);

  // Scarf
  R(-15, -41, 30, 6, C.outline);
  R(-14, -40, 28, 5, C.coral);
  R(-14, -40, 28, 2, "#f28b6e");
  R(9, -36, 7, 12, C.outline);
  R(10, -35, 5, 10, C.coralShade);
  R(10, -29, 5, 2, C.coral);

  // Arms
  if (happy) {
    R(-24, -52, 8, 22, C.outline);
    R(16, -52, 8, 22, C.outline);
    R(-22, -50, 5, 18, C.sweater);
    R(17, -50, 5, 18, C.sweater);
    R(-22, -35, 5, 3, C.sweaterCream);
    R(17, -35, 5, 3, C.sweaterCream);
    R(-23, -54, 7, 6, C.outline);
    R(16, -54, 7, 6, C.outline);
    R(-22, -53, 5, 4, C.skin);
    R(17, -53, 5, 4, C.skin);
  } else {
    R(-24, -36, 8, 18, C.outline);
    R(16, -36, 8, 18, C.outline);
    R(-22, -35, 5, 15, C.sweater);
    R(17, -35, 5, 15, C.sweater);
    R(-22, -21, 5, 3, C.sweaterCream);
    R(17, -21, 5, 3, C.sweaterCream);
    R(-23, -20, 7, 6, C.outline);
    R(16, -20, 7, 6, C.outline);
    R(-22, -19, 5, 4, C.skin);
    R(17, -19, 5, 4, C.skin);
  }

  // Head
  R(-17, -66, 34, 30, C.outline);
  R(-15, -64, 30, 26, C.hair);
  R(-15, -64, 30, 8, C.hairLight);
  R(-15, -58, 30, 20, C.hair);
  R(-12, -56, 24, 18, C.skin);
  R(-12, -56, 24, 4, C.skinShade);
  R(-14, -56, 4, 15, C.hair);
  R(10, -56, 4, 15, C.hair);
  R(-15, -57, 6, 4, C.hairLight);
  R(9, -57, 6, 4, C.hairLight);

  // Beanie
  R(-15, -73, 30, 3, C.outline);
  R(-13, -72, 26, 9, C.gold);
  R(-15, -66, 30, 7, C.outline);
  R(-14, -65, 28, 5, C.gold);
  R(-14, -65, 28, 2, "#f8d78f");
  R(-14, -61, 28, 2, C.goldShade);
  R(-12, -69, 4, 4, C.coralShade);

  // Face
  if (happy) {
    R(-10, -51, 5, 2, C.outline);
    R(-11, -52, 2, 2, C.outline);
    R(6, -51, 5, 2, C.outline);
    R(10, -52, 2, 2, C.outline);
  } else if (blink) {
    R(-10, -50, 5, 2, C.outline);
    R(6, -50, 5, 2, C.outline);
  } else if (low) {
    R(-10, -51, 5, 1, C.outline);
    R(6, -51, 5, 1, C.outline);
  } else {
    R(-9, -53, 3, 4, C.outline);
    R(6, -53, 3, 4, C.outline);
    R(-9, -53, 1, 1, "#fff1d5");
    R(6, -53, 1, 1, "#fff1d5");
  }
  ctx.globalAlpha = low ? 0.3 : 0.45;
  R(-12, -46, 4, 2, C.pink);
  R(8, -46, 4, 2, C.pink);
  ctx.globalAlpha = 1;
  if (happy) {
    R(-2, -45, 5, 2, C.outline);
    R(-3, -46, 2, 1, C.outline);
    R(3, -46, 2, 1, C.outline);
  } else if (low) {
    R(-3, -45, 6, 1, "#9d635a");
  } else {
    R(-2, -45, 4, 1, "#9d635a");
  }

  // Mug (only when not cheering)
  if (!happy) {
    R(-28, -27, 11, 10, C.outline);
    R(-27, -26, 9, 8, "#f0dcba");
    R(-27, -26, 9, 2, "#fff1d5");
    R(-28, -23, 8, 4, "#d8b990");
    R(-19, -24, 4, 4, C.outline);
    R(-19, -23, 3, 2, "#f0dcba");
    const steam = reduced ? 0 : Math.sin(now * 0.002) * 2;
    px(ctx, X(-25) + steam, Y(-33), 2, 2, "rgba(240, 230, 210, .35)");
    px(ctx, X(-23) - steam, Y(-37), 2, 2, "rgba(240, 230, 210, .24)");
    px(ctx, X(-26) + steam, Y(-41), 2, 2, "rgba(240, 230, 210, .16)");
  }

  // Small cheek sparkles when very happy
  if (happy && !reduced) {
    const twinkle = Math.sin(now * 0.02) > 0;
    if (twinkle) {
      px(ctx, X(-33), Y(-55), 2, 2, C.star);
      px(ctx, X(29), Y(-59), 2, 2, C.star);
    }
  }
}

function drawCat(ctx, now, awake, reduced) {
  const breathe = reduced ? 0 : (Math.sin(now * 0.0018) > 0.3 ? 1 : 0);
  const lift = awake ? 4 : 0;
  const cy = 182 + breathe - lift;
  const x = 260;
  const outline = C.outline;

  pixelEllipse(ctx, 262, 190, 23, 7, "rgba(24, 16, 30, .32)");

  // Tail
  px(ctx, 231, cy + 2, 12, 5, outline);
  px(ctx, 227, cy - 2, 8, 5, outline);
  px(ctx, 226, cy - 8, 4, 7, outline);
  px(ctx, 234, cy + 3, 9, 3, C.cat);
  px(ctx, 229, cy - 1, 6, 3, C.cat);
  px(ctx, 228, cy - 6, 2, 6, C.catDark);

  // Body
  pixelEllipse(ctx, 260, cy + 4, 25, 11, outline);
  pixelEllipse(ctx, 260, cy + 3, 22, 9, C.cat);
  pixelEllipse(ctx, 264, cy + 7, 13, 5, C.catCream);
  px(ctx, 248, cy - 2, 6, 2, C.catStripes);
  px(ctx, 256, cy - 4, 8, 2, C.catStripes);
  px(ctx, 251, cy + 4, 5, 2, C.catDark);

  // Head
  const hx = 276;
  const hy = cy - 3;
  pixelCircle(ctx, hx, hy, 12, outline);
  pixelCircle(ctx, hx, hy, 10, C.cat);
  pixelCircle(ctx, hx + 2, hy + 3, 6, C.catCream);

  // Ears
  px(ctx, hx - 11, hy - 13, 7, 7, outline);
  px(ctx, hx - 9, hy - 12, 4, 5, C.cat);
  px(ctx, hx + 4, hy - 13, 7, 7, outline);
  px(ctx, hx + 6, hy - 12, 4, 5, C.cat);
  px(ctx, hx - 8, hy - 10, 2, 2, C.pink);
  px(ctx, hx + 7, hy - 10, 2, 2, C.pink);

  // Stripes on forehead
  px(ctx, hx - 4, hy - 8, 2, 3, C.catStripes);
  px(ctx, hx, hy - 9, 2, 4, C.catStripes);
  px(ctx, hx + 4, hy - 8, 2, 3, C.catStripes);

  // Face
  if (awake) {
    px(ctx, hx - 6, hy - 1, 3, 3, C.outline);
    px(ctx, hx + 3, hy - 1, 3, 3, C.outline);
    px(ctx, hx - 5, hy, 1, 1, "#f6de92");
    px(ctx, hx + 4, hy, 1, 1, "#f6de92");
    px(ctx, hx - 2, hy + 4, 4, 2, "#b56f6a");
    px(ctx, hx - 8, hy + 4, 6, 1, "#e8d6b8");
    px(ctx, hx + 4, hy + 4, 6, 1, "#e8d6b8");
  } else {
    px(ctx, hx - 7, hy + 1, 5, 1, C.outline);
    px(ctx, hx + 3, hy + 1, 5, 1, C.outline);
    px(ctx, hx - 2, hy + 4, 4, 2, "#b56f6a");
    px(ctx, hx - 9, hy + 4, 6, 1, "#e8d6b8");
    px(ctx, hx + 4, hy + 4, 6, 1, "#e8d6b8");
  }

  if (awake) {
    px(ctx, x + 30, cy - 24, 3, 3, C.star);
    px(ctx, x + 35, cy - 31, 2, 2, C.star);
  }
}

function drawDust(ctx, now, reduced) {
  if (reduced) return;
  for (let i = 0; i < 13; i += 1) {
    const seed = i * 53.7;
    const baseX = 40 + ((i * 67) % 300);
    const span = 46 + ((i * 19) % 56);
    const speed = 0.004 + (i % 5) * 0.001;
    const x = baseX + Math.sin(now * speed + seed) * 8;
    const y = 40 + ((now * (0.002 + (i % 3) * 0.001) + seed) % span);
    const alpha = 0.12 + (Math.sin(now * 0.001 + seed) + 1) * 0.08;
    ctx.fillStyle = `rgba(246, 231, 189, ${alpha})`;
    ctx.fillRect(Math.round(x / 2) * 2, Math.round(y / 2) * 2, i % 4 === 0 ? 2 : 1, 1);
  }
  // Fireflies near the plant
  for (let i = 0; i < 3; i += 1) {
    const x = 34 + Math.sin(now * 0.0012 + i * 2.1) * 14;
    const y = 128 + Math.cos(now * 0.0016 + i * 1.7) * 12;
    const glow = 0.35 + (Math.sin(now * 0.004 + i) + 1) * 0.22;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = `rgba(255, 210, 112, ${glow})`;
    ctx.fillRect(x - 2, y - 2, 4, 4);
    ctx.restore();
  }
}

export function paintPortrait(canvas) {
  const ctx = canvas.getContext("2d");
  canvas.width = 96;
  canvas.height = 96;
  ctx.clearRect(0, 0, 96, 96);
  ctx.imageSmoothingEnabled = false;
  ctx.save();
  ctx.translate(48 - 188, 92 - 188);
  drawCharacter(ctx, 0, 0, false, 0, true, null);
  ctx.restore();
}

function drawFx(ctx, now, fx) {
  for (const item of fx) {
    const age = (now - item.born) / item.ttl;
    if (age < 0 || age > 1) continue;
    const x = item.x + item.vx * age;
    const y = item.y - item.vy * age;
    const alpha = 1 - age;
    ctx.globalAlpha = alpha;
    if (item.kind === "heart") {
      drawHeart(ctx, x, y, 2, item.color);
    } else {
      drawSpark(ctx, x, y, item.size || 2, item.color);
    }
    ctx.globalAlpha = 1;
  }
}

export class Scene {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx.imageSmoothingEnabled = false;
    this.reducedMotion = options.motion === false;
    this.done = Number(options.done) || 0;
    this.total = Number(options.total) || 0;
    this.mood = options.mood || null;
    this.now = performance.now();
    this.celebrateAt = 0;
    this.pokeAt = 0;
    this.raf = null;
    this.lastFrame = 0;
    this.fx = [];
    this.bg = paintRoom(new Date().getHours());
    this.bulbsFlashUntil = 0;
    this.destroyed = false;
    this.loop = this.loop.bind(this);
    this.render(this.now);
    if (!this.reducedMotion) {
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  setProgress(done, total) {
    this.done = Math.max(0, Number(done) || 0);
    this.total = Math.max(0, Number(total) || 0);
    this.bulbsFlashUntil = performance.now() + 500;
    if (this.reducedMotion) this.render(performance.now());
  }

  setMood(mood) {
    this.mood = mood;
    if (this.reducedMotion) this.render(performance.now());
  }

  celebrate() {
    const now = performance.now();
    this.celebrateAt = now;
    this.bulbsFlashUntil = now + 750;
    this.spawnSparkles(14);
    if (this.reducedMotion) this.render(now);
  }

  poke() {
    const now = performance.now();
    this.pokeAt = now;
    const colors = [C.coral, C.gold, "#f0cfaa", "#f28b6e"];
    for (let i = 0; i < 5; i += 1) {
      this.fx.push({
        kind: "heart",
        x: 178 + Math.random() * 26,
        y: 116 + Math.random() * 8,
        vx: -18 + Math.random() * 36,
        vy: 24 + Math.random() * 18,
        ttl: 900 + Math.random() * 500,
        born: now + i * 55,
        color: colors[i % colors.length]
      });
    }
    if (this.reducedMotion) this.render(now);
  }

  spawnSparkles(count) {
    const now = performance.now();
    const colors = [C.star, C.gold, C.coral, "#a9c29b"];
    for (let i = 0; i < count; i += 1) {
      this.fx.push({
        kind: "spark",
        x: 160 + Math.random() * 64,
        y: 122 + Math.random() * 54,
        vx: -34 + Math.random() * 68,
        vy: 20 + Math.random() * 36,
        ttl: 700 + Math.random() * 600,
        born: now + Math.random() * 160,
        color: colors[i % colors.length],
        size: i % 3 === 0 ? 2 : 1
      });
    }
  }

  loop(timestamp) {
    if (this.destroyed) return;
    if (timestamp - this.lastFrame >= 33) {
      this.lastFrame = timestamp;
      this.render(timestamp);
    }
    this.raf = requestAnimationFrame(this.loop);
  }

  render(now) {
    if (this.destroyed) return;
    this.now = now;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(this.bg, 0, 0);

    drawLampGlow(ctx, now);
    drawStringLights(ctx, this.done, this.total, now);

    const celebrateAge = this.celebrateAt ? now - this.celebrateAt : Infinity;
    const happy = celebrateAge < 1050;
    const jump = happy ? Math.abs(Math.sin((celebrateAge / 1050) * Math.PI * 2)) * 14 * (1 - celebrateAge / 1600) : 0;
    const pokeAge = this.pokeAt ? now - this.pokeAt : Infinity;
    const tilt = pokeAge < 700 && !this.reducedMotion ? (Math.sin(pokeAge * 0.03) > 0 ? 2 : -2) : 0;

    drawCharacter(ctx, now, jump, happy, tilt, this.reducedMotion, this.mood);
    drawCat(ctx, now, happy || pokeAge < 900, this.reducedMotion);
    drawDust(ctx, now, this.reducedMotion);
    drawFx(ctx, now, this.fx);

    this.fx = this.fx.filter((item) => now - item.born < item.ttl);
  }

  destroy() {
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }
}
