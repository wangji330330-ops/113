import { drawPerson, DEFAULT_LOOK, normalizeLook } from "./character.js";
import { PLACES, getPlace } from "./place-data.js";

const W = 384;
const H = 216;
const OUT = "#241a2e";

function px(ctx, x, y, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h));
}

function ellipse(ctx, cx, cy, rx, ry, color) {
  ctx.fillStyle = color;
  for (let y = -ry; y < ry; y += 2) {
    const span = Math.sqrt(Math.max(0, 1 - (y * y) / (ry * ry))) * rx;
    const left = Math.round((cx - span) / 2) * 2;
    const right = Math.round((cx + span) / 2) * 2;
    ctx.fillRect(left, Math.round((cy + y) / 2) * 2, Math.max(2, right - left), 2);
  }
}

function glow(ctx, cx, cy, radius, color, alpha) {
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createRadialGradient(cx, cy, 2, cx, cy, radius);
  g.addColorStop(0, color.replace("ALPHA", String(alpha)));
  g.addColorStop(0.55, color.replace("ALPHA", String(alpha * 0.3)));
  g.addColorStop(1, color.replace("ALPHA", "0"));
  ctx.fillStyle = g;
  ctx.fillRect(cx - radius, cy - radius, radius * 2, radius * 2);
  ctx.restore();
}

function skyBands(ctx, bands, x = 0, y = 0, w = W, h = 150) {
  const bandHeight = Math.ceil(h / bands.length);
  bands.forEach((color, index) => {
    const top = y + index * bandHeight;
    const bottom = Math.min(y + h, top + bandHeight);
    px(ctx, x, top, w, bottom - top, color);
  });
}

function stars(ctx, t, count, seed = 1, y = 0, h = 120) {
  for (let i = 0; i < count; i += 1) {
    const x = (i * 71 + seed * 37) % W;
    const py = (i * 43 + seed * 19) % h + y;
    const twinkle = 0.45 + (Math.sin(t * 1.2 + i * 1.7) + 1) * 0.25;
    ctx.globalAlpha = twinkle;
    px(ctx, x, py, i % 5 === 0 ? 2 : 1, 1, "#f6e9cf");
  }
  ctx.globalAlpha = 1;
}

function cloud(ctx, x, y, size, color = "#f1ddc2", alpha = 0.85) {
  ctx.globalAlpha = alpha;
  px(ctx, x, y + size * 0.3, size * 2.3, size * 0.55, color);
  px(ctx, x + size * 0.4, y, size * 1.2, size * 0.42, color);
  px(ctx, x + size * 1.1, y + size * 0.1, size * 0.7, size * 0.4, color);
  ctx.globalAlpha = 1;
}

function windowFrame(ctx, x, y, w, h, opts = {}) {
  const frame = opts.frame || "#d7b284";
  const dark = opts.dark || "#4e3740";
  px(ctx, x - 4, y - 4, w + 8, h + 8, dark);
  px(ctx, x, y, w, h, frame);
  px(ctx, x + 4, y + 4, w - 8, h - 8, opts.inner || "#1a2442");
  px(ctx, x + w / 2 - 2, y, 4, h, frame);
  px(ctx, x, y + h / 2 - 2, w, 4, frame);
  if (opts.sill !== false) px(ctx, x - 7, y + h + 4, w + 14, 5, frame);
}

function drawMoon(ctx, x, y, r, t) {
  px(ctx, x - r, y - r, r * 2, r * 2, "rgba(244,223,168,.08)");
  ellipse(ctx, x, y, r, r, "#f4dfa8");
  ellipse(ctx, x + 3, y - 2, r - 3, r - 2, "#fff0c9");
  px(ctx, x - 2, y + 2, 2, 2, "#d9bd83");
}

function tree(ctx, x, ground, size, leafColor = "#6f8f86", dark = "#4f6b64", trunk = "#5b4035") {
  px(ctx, x - 2, ground - size * 0.55, size * 0.16, size * 0.55, trunk);
  px(ctx, x - size * 0.2 + 2, ground - size * 0.6, size * 0.25, 3, trunk);
  ellipse(ctx, x, ground - size * 0.78, size * 0.42, size * 0.3, dark);
  ellipse(ctx, x - size * 0.2, ground - size * 0.72, size * 0.3, size * 0.24, leafColor);
  ellipse(ctx, x + size * 0.22, ground - size * 0.7, size * 0.28, size * 0.22, leafColor);
  ellipse(ctx, x, ground - size * 0.9, size * 0.25, size * 0.2, leafColor);
  px(ctx, x - size * 0.05, ground - size * 0.86, size * 0.1, size * 0.1, "#a9c29b");
}

function stringLights(ctx, t, fromX, toX, y, sag, colors) {
  for (let i = 0; i <= 30; i += 1) {
    const p = i / 30;
    const x = fromX + (toX - fromX) * p;
    const py = y + Math.sin(Math.PI * p) * sag;
    px(ctx, x, py, 2, 2, "#5b4b63");
  }
  const count = colors.length;
  for (let i = 0; i < count; i += 1) {
    const p = (i + 0.5) / count;
    const x = fromX + (toX - fromX) * p;
    const py = y + Math.sin(Math.PI * p) * sag + 3;
    const color = colors[i];
    px(ctx, x - 1, py - 2, 3, 2, "#3a2b38");
    px(ctx, x - 2, py, 5, 6, color);
    px(ctx, x - 1, py + 1, 3, 3, "#fff0c9");
    glow(ctx, x, py + 3, 16, "rgba(245,196,81,ALPHA)", 0.1 + (Math.sin(t * 2 + i) + 1) * 0.025);
  }
}

function floorBoards(ctx, y, color, line, step = 14) {
  px(ctx, 0, y, W, H - y, color);
  for (let py = y + step; py < H; py += step) px(ctx, 0, py, W, 2, line);
  for (let i = 0; i < 8; i += 1) {
    px(ctx, (i * 97) % W, y + 4, 2, H - y, line);
  }
}

function bookRow(ctx, x, y, w, h, colors) {
  let cursor = x;
  let index = 0;
  while (cursor < x + w - 3) {
    const bw = 4 + (index * 3) % 7;
    const bh = h - (index % 3) * 3;
    px(ctx, cursor, y + h - bh, bw, bh, colors[index % colors.length]);
    px(ctx, cursor + 1, y + h - bh + 2, Math.max(1, bw - 2), 1, "rgba(246,233,207,.45)");
    cursor += bw + 2;
    index += 1;
  }
}

/* ------------------------------------------------------------------ *
 * Drawers
 * ------------------------------------------------------------------ */

const living = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 152, "#302845");
    for (let x = 0; x < W; x += 32) px(ctx, x, 0, 2, 152, "#352c4e");
    floorBoards(ctx, 150, "#3a2b3b", "#302333");
    ellipse(ctx, 186, 186, 128, 22, "#2b1f31");
    ellipse(ctx, 186, 185, 121, 19, "#5d4159");
    ellipse(ctx, 186, 185, 88, 13, "#4a354d");

    // window and curtains
    px(ctx, 24, 26, 92, 70, "#1a1428");
    px(ctx, 28, 30, 84, 62, "#d7b284");
    px(ctx, 32, 34, 76, 54, "#172140");
    skyBands(ctx, ["#172140", "#263157", "#3d3e66", "#7a5366", "#c97a6e"], 32, 34, 76, 54);
    stars(ctx, t, 6, 4, 36, 26);
    drawMoon(ctx, 92, 47, 7, t);
    px(ctx, 68, 34, 4, 54, "#d7b284");
    px(ctx, 32, 58, 76, 4, "#d7b284");
    px(ctx, 20, 30, 9, 62, "#6b4358");
    px(ctx, 22, 30, 3, 62, "#875569");
    px(ctx, 110, 30, 9, 62, "#6b4358");
    px(ctx, 116, 30, 3, 62, "#875569");
    px(ctx, 20, 84, 9, 3, "#e5ba6c");
    px(ctx, 110, 84, 9, 3, "#e5ba6c");

    // wall-mounted TV
    px(ctx, 120, 68, 86, 54, "#17121f");
    px(ctx, 124, 72, 78, 44, "#263454");
    px(ctx, 124, 72, 78, 44, `rgba(55,80,118,${0.9 + Math.sin(t * 2.3) * 0.05})`);
    px(ctx, 132, 98, 16, 6, "#738ba8");
    px(ctx, 150, 88, 26, 3, "#a7c2d9");
    px(ctx, 152, 94, 16, 2, "#8bb8d8");
    px(ctx, 130, 78, 8, 8, "#f5c451");
    px(ctx, 180, 80, 2, 2, "#f6e9cf");
    px(ctx, 128, 122, 70, 4, "#5b3f3d");

    // sofa
    px(ctx, 224, 126, 142, 16, "#2a1d2f");
    px(ctx, 228, 128, 134, 44, "#6b4b62");
    px(ctx, 234, 132, 122, 34, "#866077");
    px(ctx, 232, 118, 28, 28, "#5b4057");
    px(ctx, 326, 118, 28, 28, "#5b4057");
    px(ctx, 240, 134, 52, 16, "#966e84");
    px(ctx, 298, 134, 50, 16, "#966e84");
    px(ctx, 240, 154, 112, 12, "#4f374b");
    px(ctx, 230, 166, 8, 20, "#3b293c");
    px(ctx, 352, 166, 8, 20, "#3b293c");
    px(ctx, 262, 128, 18, 12, "#e8735a");
    px(ctx, 266, 130, 10, 8, "#f29a82");

    // floor lamp
    px(ctx, 204, 98, 4, 66, "#4a3341");
    px(ctx, 196, 160, 20, 5, "#3a2837");
    px(ctx, 198, 90, 16, 10, "#e9b85c");
    px(ctx, 200, 92, 12, 6, "#f8d78f");
    glow(ctx, 206, 98, 42, "rgba(245,196,81,ALPHA)", 0.09);

    // cat and rug details
    const breathe = Math.sin(t * 1.8) > 0.3 ? 1 : 0;
    ellipse(ctx, 276, 184, 22, 7, "rgba(20,13,25,.35)");
    ellipse(ctx, 276, 180 + breathe, 21, 9, "#b56f4c");
    ellipse(ctx, 276, 181 + breathe, 17, 6, "#f0cfaa");
    ellipse(ctx, 292, 176 + breathe, 9, 8, OUT);
    ellipse(ctx, 292, 175 + breathe, 7, 6, "#d88b5d");
    px(ctx, 285, 169 + breathe, 4, 3, OUT);
    px(ctx, 288, 168 + breathe, 4, 3, "#d88b5d");
    px(ctx, 298, 170 + breathe, 4, 3, OUT);
    px(ctx, 299, 169 + breathe, 2, 2, "#d88b5d");
    px(ctx, 289, 176 + breathe, 3, 1, "#3a2634");
    px(ctx, 297, 176 + breathe, 3, 1, "#3a2634");

    // plant
    px(ctx, 22, 154, 26, 28, "#2a1e2e");
    px(ctx, 24, 156, 22, 22, "#b66a54");
    px(ctx, 26, 154, 18, 4, "#d2866a");
    px(ctx, 32, 134, 3, 22, "#5f8a70");
    ellipse(ctx, 28, 134, 8, 5, "#7fa887");
    ellipse(ctx, 39, 127, 9, 6, "#a9c29b");
    ellipse(ctx, 21, 142, 6, 5, "#5f8a70");
    px(ctx, 35, 116, 2, 2, "#f6e9cf");

    stringLights(ctx, t, 142, 362, 24, 28, ["#f5c451", "#f5c451", "#f5c451", "#f5c451", "#f5c451", "#f5c451"]);
  }
};

const bedroom = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 152, "#2d2742");
    for (let x = 0; x < W; x += 40) px(ctx, x, 0, 2, 152, "#342c4c");
    floorBoards(ctx, 150, "#3b2d3f", "#312438");
    px(ctx, 0, 148, W, 4, "#503c50");

    // window with moon
    px(ctx, 276, 24, 82, 70, "#1b1527");
    px(ctx, 280, 28, 74, 62, "#d0ae86");
    px(ctx, 284, 32, 66, 54, "#141d3a");
    skyBands(ctx, ["#141d3a", "#202a4d", "#2d3359"], 284, 32, 66, 54);
    stars(ctx, t, 8, 7, 35, 40);
    drawMoon(ctx, 326, 53, 8, t);
    px(ctx, 315, 32, 4, 54, "#d0ae86");
    px(ctx, 284, 56, 66, 4, "#d0ae86");
    px(ctx, 270, 30, 8, 58, "#68465b");
    px(ctx, 360, 30, 8, 58, "#68465b");
    px(ctx, 268, 88, 13, 3, "#e5ba6c");
    px(ctx, 356, 88, 13, 3, "#e5ba6c");

    // bed
    px(ctx, 16, 116, 14, 84, "#4d3444");
    px(ctx, 20, 138, 168, 58, "#241a2e");
    px(ctx, 24, 142, 160, 50, "#6b4f69");
    px(ctx, 28, 144, 152, 18, "#d8c3ad");
    px(ctx, 30, 144, 44, 14, "#f0d9b5");
    px(ctx, 48, 148, 3, 2, "#e8c6a0");
    px(ctx, 34, 158, 140, 30, "#7b6388");
    px(ctx, 34, 168, 140, 20, "#8b7298");
    px(ctx, 46, 160, 26, 3, "#d8c3ad");
    px(ctx, 80, 160, 18, 3, "#b7a4d8");
    px(ctx, 26, 190, 158, 5, "#3c2a3b");

    // desk
    px(ctx, 286, 136, 84, 6, "#8b5b46");
    px(ctx, 292, 142, 6, 36, "#5b3b3d");
    px(ctx, 358, 142, 6, 36, "#5b3b3d");
    px(ctx, 300, 118, 10, 18, "#c8a88f");
    px(ctx, 303, 112, 24, 6, "#e9b85c");
    px(ctx, 307, 114, 16, 3, "#f8d78f");
    px(ctx, 330, 128, 18, 4, "#9d5b56");
    px(ctx, 332, 123, 14, 4, "#688b7a");

    // fairy lights
    stringLights(ctx, t, 138, 286, 32, 22, ["#f5c451", "#f2a68c", "#b7a4d8", "#f5c451", "#f2a68c"]);

    // small plant / rug
    ellipse(ctx, 198, 186, 64, 14, "#533b53");
    ellipse(ctx, 198, 185, 57, 11, "#684b67");
    px(ctx, 256, 174, 18, 3, "#463247");
    px(ctx, 258, 160, 3, 14, "#6f8f86");
    ellipse(ctx, 257, 158, 6, 4, "#9fc79b");
    ellipse(ctx, 264, 154, 5, 3, "#7fa887");
  }
};

const kitchen = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 150, "#303548");
    for (let y = 12; y < 118; y += 26) {
      px(ctx, 0, y, W, 1, "#3b4157");
      for (let x = (y % 52 === 0 ? 0 : 26); x < W; x += 52) px(ctx, x, y, 1, 26, "#3b4157");
    }
    const tile = 24;
    for (let y = 150; y < H; y += tile) {
      for (let x = 0; x < W; x += tile) {
        px(ctx, x, y, tile, tile, (x / tile + y / tile) % 2 === 0 ? "#443a48" : "#393341");
      }
    }
    px(ctx, 0, 146, W, 4, "#2b2533");

    // window
    px(ctx, 158, 24, 92, 68, "#1d1728");
    px(ctx, 162, 28, 84, 60, "#d8b68b");
    px(ctx, 166, 32, 76, 52, "#db8a70");
    skyBands(ctx, ["#4a375c", "#82505f", "#d9856c", "#f0b58e"], 166, 32, 76, 52);
    px(ctx, 202, 32, 4, 52, "#d8b68b");
    px(ctx, 166, 56, 76, 4, "#d8b68b");
    px(ctx, 154, 30, 8, 56, "#70465a");
    px(ctx, 246, 30, 8, 56, "#70465a");

    // cabinets
    px(ctx, 18, 36, 130, 42, "#423b51");
    px(ctx, 22, 40, 56, 34, "#51465f");
    px(ctx, 84, 40, 56, 34, "#51465f");
    px(ctx, 48, 54, 4, 2, "#d8c0a0");
    px(ctx, 110, 54, 4, 2, "#d8c0a0");
    px(ctx, 18, 78, 130, 4, "#2b2533");

    // counter and stove
    px(ctx, 18, 118, 254, 8, "#b88b68");
    px(ctx, 18, 126, 254, 30, "#5d4550");
    px(ctx, 22, 130, 70, 20, "#6e5260");
    px(ctx, 96, 130, 70, 20, "#6e5260");
    px(ctx, 170, 130, 96, 20, "#6e5260");
    px(ctx, 60, 100, 66, 18, "#2c2532");
    px(ctx, 64, 104, 58, 10, "#3c3443");
    px(ctx, 78, 94, 30, 8, "#7e8993");
    px(ctx, 81, 91, 24, 5, "#aeb8bd");
    px(ctx, 84, 86, 18, 4, "#d8c7b5");
    px(ctx, 84, 84, 2, 6, "rgba(240,217,181,.4)");
    px(ctx, 96, 80, 2, 6, "rgba(240,217,181,.28)");
    px(ctx, 102, 76, 2, 6, "rgba(240,217,181,.18)");
    px(ctx, 108, 96, 2, 2, "#e8735a");

    // kettle
    px(ctx, 214, 106, 24, 12, "#b7a4d8");
    px(ctx, 216, 103, 20, 4, "#d8c9ef");
    px(ctx, 238, 108, 7, 4, "#8f7ca9");
    px(ctx, 218, 101, 3, 4, "#f6e9cf");
    px(ctx, 224, 98, 2, 4, "rgba(246,233,207,.4)");
    px(ctx, 229, 94, 2, 5, "rgba(246,233,207,.25)");

    // sink
    px(ctx, 226, 118, 44, 3, "#8b9796");
    px(ctx, 232, 108, 3, 12, "#8b9796");
    px(ctx, 232, 108, 14, 3, "#8b9796");
    px(ctx, 244, 111, 2, 5, "#8bb8d8");

    // fridge
    px(ctx, 302, 74, 70, 112, "#20212c");
    px(ctx, 306, 78, 62, 104, "#b8c2c7");
    px(ctx, 306, 78, 62, 4, "#d8e0e2");
    px(ctx, 306, 118, 62, 3, "#8d979c");
    px(ctx, 350, 96, 4, 16, "#6e767b");
    px(ctx, 350, 136, 4, 16, "#6e767b");
    px(ctx, 318, 88, 18, 16, "#eef3f1");
    px(ctx, 312, 88, 4, 2, "#e8735a");
    px(ctx, 312, 132, 28, 20, "#d8e0e2");

    // utensils
    px(ctx, 286, 40, 3, 22, "#c8a88f");
    px(ctx, 292, 44, 3, 18, "#c8a88f");
    px(ctx, 298, 40, 3, 22, "#c8a88f");
    ellipse(ctx, 287, 38, 5, 4, "#8b9796");
    ellipse(ctx, 293, 42, 4, 3, "#8b9796");
    px(ctx, 280, 60, 30, 3, "#4a3b48");

    glow(ctx, 96, 100, 70, "rgba(245,196,81,ALPHA)", 0.04);
  }
};

const bathroom = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 150, "#3a4654");
    for (let y = 10; y < 150; y += 28) px(ctx, 0, y, W, 1, "#455563");
    for (let x = 0; x < W; x += 38) {
      for (let y = 10; y < 150; y += 28) {
        if ((x / 38 + y / 28) % 2 === 0) px(ctx, x, y, 38, 28, "#3e4c5c");
      }
    }
    for (let y = 150; y < H; y += 22) {
      for (let x = 0; x < W; x += 22) {
        px(ctx, x, y, 22, 22, (x / 22 + y / 22) % 2 === 0 ? "#343d4b" : "#2e3643");
      }
    }

    // mirror
    px(ctx, 34, 42, 76, 74, "#1e1928");
    px(ctx, 38, 46, 68, 66, "#6d8f9e");
    px(ctx, 42, 50, 60, 58, "#4b6878");
    px(ctx, 46, 54, 52, 50, "#7fa8b8");
    px(ctx, 50, 58, 10, 4, "#b9d8e0");
    px(ctx, 74, 88, 16, 2, "#9dc4ce");
    px(ctx, 58, 82, 8, 2, "#6f98a8");

    // sink
    px(ctx, 30, 118, 96, 38, "#2c2836");
    px(ctx, 34, 116, 88, 8, "#d8e0e2");
    px(ctx, 38, 124, 80, 28, "#aeb8bd");
    px(ctx, 44, 130, 68, 16, "#eef3f1");
    px(ctx, 110, 112, 10, 8, "#c0cacd");
    px(ctx, 112, 106, 6, 8, "#d8e0e2");
    px(ctx, 116, 118, 2, 7, "#8bb8d8");
    px(ctx, 92, 148, 3, 20, "#5b6470");

    // tub
    px(ctx, 230, 120, 146, 72, "#1e1928");
    px(ctx, 234, 126, 138, 62, "#d8e0e2");
    px(ctx, 240, 132, 126, 48, "#b9d8e0");
    px(ctx, 240, 132, 126, 10, "#eef3f1");
    px(ctx, 238, 182, 132, 8, "#8d979c");
    px(ctx, 242, 186, 6, 10, "#5b6470");
    px(ctx, 360, 186, 6, 10, "#5b6470");
    px(ctx, 250, 120, 4, 28, "#aeb8bd");
    px(ctx, 250, 120, 22, 4, "#aeb8bd");
    px(ctx, 272, 124, 2, 8, "#8bb8d8");
    for (let i = 0; i < 14; i += 1) {
      const bx = 250 + ((i * 37) % 95);
      const by = 138 + ((i * 23) % 30);
      px(ctx, bx, by, 3 + (i % 2) * 2, 3 + (i % 3), "rgba(238,243,241,.55)");
    }

    // rubber duck
    ellipse(ctx, 268, 160, 10, 7, "#f5c451");
    ellipse(ctx, 274, 154, 6, 6, "#f5c451");
    px(ctx, 278, 153, 3, 2, "#e8735a");
    px(ctx, 271, 152, 2, 2, OUT);
    px(ctx, 258, 158, 8, 3, "#e8a84f");

    // towel + light
    px(ctx, 352, 34, 18, 48, "#b7a4d8");
    px(ctx, 352, 34, 18, 4, "#d8c9ef");
    px(ctx, 348, 30, 26, 3, "#8b7a9e");
    glow(ctx, 326, 16, 52, "rgba(245,196,81,ALPHA)", 0.05);
    px(ctx, 324, 8, 34, 3, "#e9b85c");
  }
};

const school = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 154, "#3c3444");
    for (let x = 0; x < W; x += 36) px(ctx, x, 0, 2, 154, "#443b4d");
    floorBoards(ctx, 152, "#4d3c3a", "#3d302f", 16);
    px(ctx, 0, 150, W, 5, "#5c4742");

    // blackboard
    px(ctx, 34, 38, 188, 80, "#6b4b3a");
    px(ctx, 38, 42, 180, 72, "#253c37");
    px(ctx, 42, 46, 172, 64, "#2c4a42");
    px(ctx, 54, 58, 48, 2, "#cfe3d7");
    px(ctx, 54, 64, 70, 2, "rgba(207,227,215,.7)");
    px(ctx, 54, 70, 42, 2, "rgba(207,227,215,.5)");
    px(ctx, 54, 84, 28, 14, "rgba(207,227,215,.3)");
    px(ctx, 92, 84, 42, 2, "rgba(207,227,215,.4)");
    px(ctx, 92, 90, 28, 2, "rgba(207,227,215,.3)");
    px(ctx, 174, 92, 20, 4, "#d8c0a0");
    px(ctx, 170, 96, 28, 4, "#e8d6ba");

    // clock
    px(ctx, 265, 38, 42, 42, "#2a2130");
    px(ctx, 269, 42, 34, 34, "#e8d6ba");
    px(ctx, 285, 46, 2, 14, "#3a2d35");
    px(ctx, 286, 58, 10, 2, "#3a2d35");
    px(ctx, 285, 58, 3, 3, "#e8735a");

    // window with trees
    px(ctx, 278, 82, 76, 60, "#1d1728");
    px(ctx, 282, 86, 68, 52, "#d0ae86");
    px(ctx, 286, 90, 60, 44, "#9fc79b");
    px(ctx, 286, 90, 60, 20, "#b9d8e0");
    ellipse(ctx, 302, 120, 16, 12, "#6f8f86");
    ellipse(ctx, 330, 116, 12, 14, "#7fa887");
    px(ctx, 314, 90, 4, 44, "#d0ae86");
    px(ctx, 286, 112, 60, 4, "#d0ae86");
    px(ctx, 272, 86, 8, 50, "#6b4358");
    px(ctx, 354, 86, 8, 50, "#6b4358");

    // desks
    px(ctx, 38, 154, 86, 5, "#9b7655");
    px(ctx, 42, 159, 5, 30, "#5b4035");
    px(ctx, 114, 159, 5, 30, "#5b4035");
    px(ctx, 46, 164, 66, 3, "#5b4035");
    px(ctx, 56, 150, 18, 4, "#e8d6ba");
    px(ctx, 86, 148, 16, 6, "#9d5b56");
    px(ctx, 118, 168, 30, 26, "#4a3844");
    px(ctx, 120, 170, 26, 4, "#6b4b5c");

    // backpacks / hooks
    px(ctx, 244, 156, 18, 26, "#5b708c");
    px(ctx, 246, 160, 14, 3, "#748ba5");
    px(ctx, 238, 148, 30, 4, "#5b4035");
    px(ctx, 252, 128, 3, 20, "#5b4035");
  }
};

const library = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 154, "#2d283a");
    for (let x = 0; x < W; x += 42) px(ctx, x, 0, 2, 154, "#342e44");
    floorBoards(ctx, 152, "#383042", "#2e2738", 16);

    // left bookshelf
    px(ctx, 12, 34, 122, 168, "#241d2f");
    px(ctx, 16, 38, 114, 160, "#5b4035");
    for (let y = 44; y < 190; y += 32) {
      px(ctx, 20, y, 106, 26, "#3e2c2c");
      bookRow(ctx, 22, y + 2, 102, 22, ["#9d5b56", "#d9b06b", "#688b7a", "#7c6688", "#c8a88f"]);
      px(ctx, 18, y + 26, 110, 3, "#8b5b46");
    }

    // right bookshelf
    px(ctx, 280, 20, 98, 182, "#241d2f");
    px(ctx, 284, 24, 90, 174, "#5b4035");
    for (let y = 30; y < 192; y += 32) {
      px(ctx, 288, y, 82, 26, "#3e2c2c");
      bookRow(ctx, 290, y + 2, 78, 22, ["#688b7a", "#9d5b56", "#c8a88f", "#d9b06b", "#7c6688"]);
      px(ctx, 286, y + 26, 86, 3, "#8b5b46");
    }

    // arched window
    px(ctx, 158, 28, 86, 78, "#1d1728");
    px(ctx, 162, 32, 78, 70, "#d0ae86");
    px(ctx, 166, 36, 70, 62, "#1b2443");
    skyBands(ctx, ["#1b2443", "#263157", "#3d3e66"], 166, 36, 70, 62);
    stars(ctx, t, 6, 11, 38, 44);
    drawMoon(ctx, 210, 54, 7, t);
    px(ctx, 198, 36, 4, 62, "#d0ae86");
    px(ctx, 166, 62, 70, 4, "#d0ae86");
    px(ctx, 158, 106, 86, 5, "#8b5b46");

    // rug
    ellipse(ctx, 192, 190, 108, 18, "#42344a");
    ellipse(ctx, 192, 189, 100, 15, "#5b4761");

    // lamp glow behind table
    glow(ctx, 183, 141, 58, "rgba(245,196,81,ALPHA)", 0.07);
  },
  front(ctx, t) {
    // reading table in front of the character's legs
    px(ctx, 112, 148, 180, 8, "#9b7655");
    px(ctx, 118, 156, 168, 6, "#6b4b3d");
    px(ctx, 124, 162, 8, 36, "#5b4035");
    px(ctx, 272, 162, 8, 36, "#5b4035");
    px(ctx, 146, 158, 5, 22, "#4a302a");
    px(ctx, 252, 158, 5, 22, "#4a302a");

    // books and lamp
    px(ctx, 236, 136, 26, 4, "#9d5b56");
    px(ctx, 238, 132, 22, 4, "#688b7a");
    px(ctx, 244, 128, 14, 4, "#d9b06b");

    px(ctx, 172, 126, 4, 22, "#4a3a2b");
    px(ctx, 164, 148, 22, 4, "#3a2d24");
    px(ctx, 158, 118, 30, 10, "#3e6b58");
    px(ctx, 160, 120, 26, 4, "#5f8a70");
    glow(ctx, 175, 134, 52, "rgba(245,196,81,ALPHA)", 0.11);
    px(ctx, 166, 130, 18, 2, "#f5c451");

    // library cat on a chair
    px(ctx, 296, 154, 36, 6, "#6b4b3d");
    px(ctx, 300, 160, 5, 24, "#4a302a");
    px(ctx, 324, 160, 5, 24, "#4a302a");
    px(ctx, 302, 142, 24, 14, "#d88b5d");
    px(ctx, 326, 138, 12, 12, "#d88b5d");
    px(ctx, 326, 133, 4, 6, "#d88b5d");
    px(ctx, 335, 133, 4, 6, "#d88b5d");
    px(ctx, 328, 142, 3, 2, "#3a2634");
    px(ctx, 334, 142, 3, 2, "#3a2634");
  }
};

const cinema = {
  back(ctx, t) {
    px(ctx, 0, 0, W, H, "#14101f");
    // screen
    px(ctx, 54, 24, 276, 108, "#08060d");
    px(ctx, 58, 28, 268, 100, "#1d2c4e");
    skyBands(ctx, ["#1b2949", "#26375e", "#483b65", "#7d5068"], 58, 28, 268, 100);
    stars(ctx, t, 22, 9, 32, 86);
    drawMoon(ctx, 282, 62, 12, t);
    px(ctx, 82, 92, 46, 3, "#b7a4d8");
    px(ctx, 92, 86, 24, 3, "#8bb8d8");
    px(ctx, 190, 76, 30, 2, "#f6e9cf");
    px(ctx, 180, 110, 70, 3, "#3c4a68");
    if (Math.sin(t * 0.9) > 0.95) {
      px(ctx, 118, 44, 3, 14, "#f6e9cf");
      px(ctx, 121, 56, 2, 8, "#f6e9cf");
    }
    // frame
    px(ctx, 50, 20, 284, 4, "#3b303c");
    px(ctx, 50, 128, 284, 4, "#3b303c");

    // projector
    px(ctx, 318, 24, 34, 18, "#2a2533");
    px(ctx, 322, 28, 22, 9, "#4b4556");
    px(ctx, 341, 30, 8, 4, "#8bb8d8");
    px(ctx, 344, 32, 2, 2, "#f6e9cf");
    // beam
    ctx.save();
    ctx.globalAlpha = 0.08 + (Math.sin(t * 3) + 1) * 0.02;
    ctx.fillStyle = "#bcd8e8";
    ctx.beginPath();
    ctx.moveTo(344, 32);
    ctx.lineTo(328, 28);
    ctx.lineTo(240, 118);
    ctx.lineTo(300, 124);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // seat rows at back/sides
    for (let row = 0; row < 3; row += 1) {
      const y = 132 + row * 26;
      for (let i = 0; i < 5; i += 1) {
        if (row === 2 && i === 2) continue;
        const x = 10 + i * 76;
        px(ctx, x, y, 66, 24, row === 0 ? "#241927" : "#2d1d2b");
        px(ctx, x + 4, y + 4, 58, 18, "#4d2938");
      }
    }
    px(ctx, 0, 208, W, 8, "#0c0912");
    px(ctx, 348, 176, 4, 2, "#e8735a");
    glow(ctx, 356, 176, 16, "rgba(232,115,90,ALPHA)", 0.12);
  },
  front(ctx, t) {
    // a single seat back in front of the character, so they appear seated
    px(ctx, 166, 166, 70, 44, "#2a1826");
    px(ctx, 170, 170, 62, 36, "#6b3344");
    px(ctx, 170, 170, 62, 5, "#8e4a5b");
    px(ctx, 174, 178, 54, 24, "#582a3a");
    px(ctx, 160, 184, 10, 18, "#3b2030");
    px(ctx, 232, 184, 10, 18, "#3b2030");
    // popcorn on the armrest
    px(ctx, 236, 152, 22, 22, "#f0d9b5");
    px(ctx, 238, 154, 18, 4, "#e8735a");
    px(ctx, 238, 158, 18, 4, "#f0d9b5");
    px(ctx, 240, 144, 4, 8, "#f5c451");
    px(ctx, 248, 140, 4, 12, "#f5c451");
    px(ctx, 254, 146, 3, 6, "#f5c451");
  }
};

const picnic = {
  back(ctx, t) {
    skyBands(ctx, ["#7fa6bf", "#9fc2d0", "#c8ddd8", "#e9ddc7"], 0, 0, W, 150);
    glow(ctx, 310, 44, 42, "rgba(255,231,170,ALPHA)", 0.2);
    px(ctx, 300, 34, 20, 20, "#f6d98f");
    cloud(ctx, (40 + t * 4) % 430 - 60, 30, 18);
    cloud(ctx, (220 + t * 2.2) % 470 - 90, 64, 12, "#f1ddc2", 0.65);
    // hills
    ellipse(ctx, 80, 168, 150, 44, "#a9c29b");
    ellipse(ctx, 300, 170, 180, 48, "#94b58e");
    px(ctx, 0, 146, W, 70, "#7fa887");
    px(ctx, 0, 160, W, 56, "#6f9b7c");
    for (let i = 0; i < 70; i += 1) {
      const x = (i * 53) % W;
      const y = 154 + (i * 31) % 52;
      px(ctx, x, y, 2, 2, i % 3 === 0 ? "#a9c29b" : "#5f8a70");
    }
    // trees
    tree(ctx, 42, 168, 122, "#7fa887", "#5f8a70");
    tree(ctx, 338, 160, 92, "#8fb28f", "#6f9b7c");
    // blanket
    ellipse(ctx, 202, 188, 100, 20, "#c26a72");
    ellipse(ctx, 202, 187, 94, 17, "#e8b4a2");
    px(ctx, 128, 182, 146, 3, "#f0d9b5");
    px(ctx, 146, 194, 110, 3, "#d98a91");
    for (let i = 0; i < 6; i += 1) {
      px(ctx, 154 + i * 20, 186, 8, 8, i % 2 === 0 ? "#f5c451" : "#9fc79b");
    }
    // basket
    px(ctx, 76, 160, 46, 28, "#8b5b46");
    px(ctx, 80, 156, 38, 8, "#b77b5b");
    px(ctx, 82, 162, 34, 3, "#d9a06b");
    px(ctx, 98, 154, 4, 12, "#6b4b3d");
    px(ctx, 82, 174, 34, 3, "#6b4b3d");
    // food
    px(ctx, 150, 176, 20, 8, "#f0d9b5");
    px(ctx, 154, 173, 12, 4, "#e8735a");
    px(ctx, 176, 178, 12, 6, "#9fc79b");
    // butterfly
    const bx = 270 + Math.sin(t * 1.6) * 12;
    const by = 122 + Math.cos(t * 2.1) * 8;
    px(ctx, bx, by, 2, 2, "#f6e9cf");
    px(ctx, bx - 4, by - 2, 4, 4, "#f6e9cf");
    px(ctx, bx + 2, by - 2, 4, 4, "#f6e9cf");
    px(ctx, bx - 3, by + 2, 3, 3, "#e8d6b8");
    px(ctx, bx + 2, by + 2, 3, 3, "#e8d6b8");
  }
};

const market = {
  back(ctx, t) {
    px(ctx, 0, 0, W, 150, "#37313f");
    for (let x = 0; x < W; x += 48) px(ctx, x, 0, 2, 150, "#3f3948");
    // floor
    for (let y = 150; y < H; y += 22) {
      for (let x = 0; x < W; x += 22) {
        px(ctx, x, y, 22, 22, (x / 22 + y / 22) % 2 === 0 ? "#4c434a" : "#423a42");
      }
    }
    // ceiling lights
    for (let i = 0; i < 3; i += 1) {
      const x = 58 + i * 112;
      px(ctx, x, 10, 56, 4, "#b7c0c5");
      const flicker = 0.7 + Math.sin(t * 6 + i * 1.7) * 0.08;
      px(ctx, x + 8, 14, 40, 3, `rgba(238,243,241,${flicker})`);
      glow(ctx, x + 28, 30, 54, "rgba(238,243,241,ALPHA)", 0.06);
    }
    // shelves left
    px(ctx, 14, 66, 106, 118, "#26212d");
    for (let y = 76; y < 174; y += 32) {
      px(ctx, 18, y, 98, 26, "#4a3a3d");
      for (let i = 0; i < 9; i += 1) {
        const colors = ["#e8735a", "#f5c451", "#9fc79b", "#b7a4d8", "#8bb8d8", "#c8a88f"];
        px(ctx, 22 + i * 10, y + 7 + (i % 3) * 4, 7, 12 - (i % 3) * 2, colors[(i + y) % colors.length]);
      }
      px(ctx, 16, y + 26, 102, 3, "#6b4b3d");
    }
    // freezer right
    px(ctx, 300, 74, 72, 96, "#26212d");
    px(ctx, 304, 78, 64, 88, "#8bb8d8");
    px(ctx, 308, 82, 56, 80, "#b9d8e0");
    px(ctx, 308, 82, 56, 6, "#eef3f1");
    px(ctx, 308, 118, 56, 2, "#8bb8d8");
    px(ctx, 308, 154, 56, 2, "#8bb8d8");
    px(ctx, 318, 132, 18, 14, "#f0d9b5");
    px(ctx, 342, 96, 14, 16, "#e8735a");
    px(ctx, 342, 132, 14, 18, "#9fc79b");
    // sign
    px(ctx, 156, 24, 72, 28, "#2a2533");
    px(ctx, 160, 28, 64, 20, "#f0d9b5");
    px(ctx, 166, 34, 18, 2, "#6b4b3d");
    px(ctx, 166, 40, 30, 2, "#9d5b56");
    px(ctx, 202, 34, 10, 8, "#e8735a");
    // mid aisle displays
    px(ctx, 126, 128, 40, 58, "#4a3a3d");
    px(ctx, 130, 134, 32, 3, "#8b5b46");
    px(ctx, 130, 148, 32, 3, "#8b5b46");
    px(ctx, 130, 162, 32, 3, "#8b5b46");
    px(ctx, 134, 138, 8, 8, "#d9b06b");
    px(ctx, 146, 152, 8, 8, "#9d5b56");
    px(ctx, 134, 166, 8, 8, "#688b7a");

    // cart
    px(ctx, 238, 154, 72, 4, "#c8c9d0");
    px(ctx, 246, 158, 58, 24, "#b7b9c2");
    px(ctx, 246, 158, 58, 4, "#e0e1e6");
    px(ctx, 252, 182, 7, 9, "#3b3440");
    px(ctx, 296, 182, 7, 9, "#3b3440");
    px(ctx, 310, 156, 4, 16, "#8b8e99");
    px(ctx, 302, 170, 12, 3, "#8b8e99");
    for (let i = 0; i < 5; i += 1) px(ctx, 252 + i * 9, 158, 2, 24, "rgba(60,55,70,.4)");
    px(ctx, 260, 148, 20, 10, "#e8735a");
    px(ctx, 264, 144, 12, 5, "#f5c451");
  }
};

const court = {
  back(ctx, t) {
    skyBands(ctx, ["#4a375c", "#82505f", "#c97a6e", "#e9a47d"], 0, 0, W, 128);
    glow(ctx, 326, 74, 50, "rgba(255,205,140,ALPHA)", 0.16);
    ellipse(ctx, 326, 78, 18, 18, "#f6c17f");
    cloud(ctx, 48 + Math.sin(t * 0.2) * 6, 28, 14, "#e8b4a2", 0.55);
    // distant trees
    for (let i = 0; i < 9; i += 1) {
      ellipse(ctx, 20 + i * 46, 132, 22, 16, "#4c4657");
      px(ctx, 18 + i * 46, 128, 4, 14, "#3c3442");
    }
    // fence
    px(ctx, 0, 128, W, 54, "#5a5562");
    for (let x = 0; x < W; x += 30) px(ctx, x, 118, 3, 62, "#6b6571");
    for (let y = 122; y < 168; y += 12) px(ctx, 0, y, W, 2, "#6b6571");
    // court floor
    px(ctx, 0, 170, W, 46, "#6b5b5a");
    px(ctx, 0, 170, W, 3, "#d8c0a0");
    px(ctx, 0, 202, W, 3, "#d8c0a0");
    px(ctx, 176, 170, 3, 46, "#d8c0a0");
    // hoop
    px(ctx, 300, 70, 4, 100, "#4a4554");
    px(ctx, 270, 58, 70, 48, "#e8d6ba");
    px(ctx, 276, 64, 58, 36, "#f5e9d3");
    px(ctx, 286, 104, 34, 4, "#e8735a");
    px(ctx, 292, 108, 24, 2, "#f5c451");
    for (let i = 0; i < 5; i += 1) {
      px(ctx, 292 + i * 5, 110, 1, 12, "rgba(246,233,207,.5)");
    }
    px(ctx, 286, 122, 38, 2, "rgba(246,233,207,.5)");
    // bench
    px(ctx, 30, 138, 88, 7, "#9b7655");
    px(ctx, 34, 145, 6, 26, "#5b4035");
    px(ctx, 108, 145, 6, 26, "#5b4035");
    px(ctx, 36, 148, 74, 3, "#5b4035");
    px(ctx, 38, 136, 24, 5, "#8bb8d8");
    // ball
    const bounce = Math.abs(Math.sin(t * 2.7)) * 16;
    ellipse(ctx, 300, 198, 13, 4, "rgba(20,13,25,.28)");
    ellipse(ctx, 300, 172 - bounce, 12, 12, "#c96b45");
    px(ctx, 292, 164 - bounce, 16, 2, "#8f3f2e");
    px(ctx, 300, 160 - bounce, 2, 16, "#8f3f2e");
    px(ctx, 294, 168 - bounce, 2, 2, "#f5c451");
  }
};

const river = {
  back(ctx, t) {
    skyBands(ctx, ["#2e254b", "#4a3557", "#82505f", "#d9856c", "#e9a47d"], 0, 0, W, 128);
    stars(ctx, t, 10, 3, 8, 58);
    // distant city
    for (let i = 0; i < 9; i += 1) {
      const h = 20 + (i * 13) % 30;
      px(ctx, i * 44 - 10, 118 - h, 30, h, "#3a2e45");
      if (i % 2 === 0) px(ctx, i * 44, 112 - h, 3, 3, "#f5c451");
    }
    // bridge
    px(ctx, 28, 58, 208, 5, "#5b4a5e");
    px(ctx, 36, 62, 8, 48, "#4a3a4d");
    px(ctx, 96, 62, 8, 48, "#4a3a4d");
    px(ctx, 160, 62, 8, 48, "#4a3a4d");
    px(ctx, 220, 62, 8, 48, "#4a3a4d");
    for (let i = 0; i < 5; i += 1) {
      px(ctx, 46 + i * 38, 62, 3, 40, "#5b4a5e");
      px(ctx, 46 + i * 38, 62, 2, 2, "#f5c451");
      glow(ctx, 47 + i * 38, 63, 12, "rgba(245,196,81,ALPHA)", 0.06);
    }
    // water
    px(ctx, 0, 118, W, 98, "#23304d");
    for (let y = 122; y < H; y += 8) {
      px(ctx, 0, y, W, 3, y % 16 === 0 ? "#2e3e61" : "#1c2843");
    }
    for (let i = 0; i < 12; i += 1) {
      const x = (i * 61 + t * 9) % W;
      const y = 130 + (i * 29) % 70;
      px(ctx, x, y, 14, 2, "rgba(139,184,216,.18)");
    }
    // boat
    const bob = Math.sin(t * 1.4) * 2;
    px(ctx, 202, 124 + bob, 58, 6, "#4a3545");
    px(ctx, 208, 130 + bob, 46, 8, "#6b4b5b");
    px(ctx, 218, 116 + bob, 4, 10, "#c8a88f");
    px(ctx, 220, 114 + bob, 20, 12, "#8f6b4f");
    px(ctx, 226, 108 + bob, 2, 10, "#d7b284");
    px(ctx, 240, 116 + bob, 2, 10, "#d7b284");
    px(ctx, 252, 124 + bob, 8, 3, "#f5c451");
    glow(ctx, 256, 126 + bob, 18, "rgba(245,196,81,ALPHA)", 0.1);
    // reeds
    for (let i = 0; i < 7; i += 1) {
      const x = 28 + i * 8;
      const sway = Math.sin(t * 1.8 + i) * 3;
      px(ctx, x + sway, 148, 2, 34, "#6f8f86");
      px(ctx, x - 2 + sway, 144, 4, 8, "#9fc79b");
    }
    // birds
    for (let i = 0; i < 3; i += 1) {
      const x = 60 + i * 28 + Math.sin(t * 0.7 + i) * 12;
      const y = 78 + i * 10;
      px(ctx, x, y, 3, 1, "#f6e9cf");
      px(ctx, x + 3, y - 1, 3, 1, "#f6e9cf");
    }
  },
  front(ctx, t) {
    // river railing
    px(ctx, 0, 174, W, 4, "#4a3c45");
    px(ctx, 0, 190, W, 4, "#4a3c45");
    for (let x = 10; x < W; x += 52) {
      px(ctx, x, 170, 4, 34, "#3a2d38");
      px(ctx, x, 168, 6, 4, "#5b4a55");
    }
    px(ctx, 0, 204, W, 12, "#2a2430");
  }
};

const mountain = {
  back(ctx, t) {
    skyBands(ctx, ["#5f4f77", "#b57b8f", "#e6a48b", "#f0c9a0"], 0, 0, W, 150);
    glow(ctx, 314, 54, 55, "rgba(255,231,170,ALPHA)", 0.18);
    ellipse(ctx, 314, 54, 16, 16, "#f6d98f");
    // distant peaks
    ctx.fillStyle = "#6b5876";
    ctx.beginPath();
    ctx.moveTo(0, 150);
    ctx.lineTo(66, 72);
    ctx.lineTo(112, 126);
    ctx.lineTo(178, 56);
    ctx.lineTo(246, 130);
    ctx.lineTo(306, 82);
    ctx.lineTo(384, 150);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = "#7d6884";
    ctx.beginPath();
    ctx.moveTo(0, 160);
    ctx.lineTo(94, 108);
    ctx.lineTo(160, 146);
    ctx.lineTo(236, 94);
    ctx.lineTo(314, 144);
    ctx.lineTo(384, 112);
    ctx.lineTo(384, 176);
    ctx.lineTo(0, 176);
    ctx.closePath();
    ctx.fill();
    // snow caps
    px(ctx, 62, 88, 14, 8, "#f1ddc2");
    px(ctx, 174, 70, 14, 8, "#f1ddc2");
    // foreground
    ellipse(ctx, 70, 174, 120, 46, "#5f705c");
    ellipse(ctx, 310, 184, 170, 54, "#6f8268");
    ellipse(ctx, 190, 196, 140, 40, "#697c62");
    // trail
    ctx.strokeStyle = "#8a7b61";
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(150, 216);
    ctx.quadraticCurveTo(214, 188, 194, 160);
    ctx.quadraticCurveTo(180, 140, 236, 112);
    ctx.stroke();
    // tree
    tree(ctx, 64, 174, 108, "#7fa887", "#5f8a70", "#5b4035");
    // birds
    for (let i = 0; i < 4; i += 1) {
      const x = 250 + i * 22 + Math.sin(t * 0.6 + i) * 9;
      const y = 58 + i * 8;
      px(ctx, x, y, 3, 1, "#3a2e45");
      px(ctx, x + 3, y - 1, 3, 1, "#3a2e45");
    }
    // mist
    for (let i = 0; i < 4; i += 1) {
      const x = ((i * 90 - t * 8) % 440) - 30;
      px(ctx, x, 128 + i * 10, 90, 3, "rgba(246,233,207,.1)");
    }
    // grass blades
    for (let i = 0; i < 24; i += 1) {
      px(ctx, (i * 37) % W, 186 + (i * 13) % 26, 2, 5, "#4f6b54");
    }
  }
};

const drive = {
  back(ctx, t) {
    skyBands(ctx, ["#10172e", "#18213e", "#2b2f53"], 0, 0, W, 128);
    stars(ctx, t, 16, 8, 8, 90);
    // moving hills / city lights
    const shift = (t * 18) % 220;
    for (let i = 0; i < 8; i += 1) {
      const x = ((i * 46 - shift) % 400) - 20;
      const h = 20 + (i * 17) % 38;
      px(ctx, x, 128 - h, 28, h, "#1b2438");
      px(ctx, x + 8, 122 - h, 2, 2, "#f5c451");
    }
    ellipse(ctx, 80, 136, 180, 32, "#1a2430");
    ellipse(ctx, 320, 140, 170, 36, "#1a2430");
    // road
    px(ctx, 0, 136, W, 80, "#24242f");
    for (let i = 0; i < 7; i += 1) {
      const x = ((i * 64 - t * 80) % 480) - 40;
      px(ctx, x, 196, 30, 4, "#d8c0a0");
    }
    // streetlights scroll
    for (let i = 0; i < 4; i += 1) {
      const x = ((i * 120 - t * 34) % 480) - 40;
      px(ctx, x, 84, 3, 52, "#3f3a46");
      px(ctx, x - 6, 82, 16, 4, "#f5c451");
      px(ctx, x, 90, 4, 2, "#f5c451");
      glow(ctx, x + 2, 88, 34, "rgba(245,196,81,ALPHA)", 0.06);
    }
    // car window frame behind person
    px(ctx, 108, 84, 184, 90, "rgba(10,8,16,.22)");
    px(ctx, 108, 84, 184, 5, "#3a2d38");
    px(ctx, 108, 84, 5, 100, "#3a2d38");
    px(ctx, 288, 84, 5, 100, "#3a2d38");
    // rearview mirror
    px(ctx, 176, 78, 34, 10, "#2a2330");
    px(ctx, 180, 80, 26, 6, "#4a4350");
    // streetlight inside car area? no
    // dash lights
    px(ctx, 136, 154, 8, 4, "#e8735a");
    px(ctx, 156, 150, 5, 4, "#9fc79b");
    glow(ctx, 174, 154, 22, "rgba(139,184,216,ALPHA)", 0.08);
  },
  front(ctx, t) {
    // car body covers lower half, so the character appears seated in a convertible
    px(ctx, 110, 160, 180, 22, "#8f4f4c");
    px(ctx, 114, 158, 172, 8, "#b5655d");
    px(ctx, 124, 180, 152, 26, "#713c3f");
    px(ctx, 120, 182, 6, 20, "#5b3037");
    px(ctx, 276, 182, 6, 20, "#5b3037");
    px(ctx, 130, 186, 20, 18, "#2a2029");
    px(ctx, 258, 186, 20, 18, "#2a2029");
    px(ctx, 136, 190, 8, 8, "#5b4e57");
    px(ctx, 264, 190, 8, 8, "#5b4e57");
    // dashboard
    px(ctx, 126, 154, 148, 6, "#3a2d38");
    px(ctx, 140, 148, 12, 5, "#e8735a");
    px(ctx, 158, 146, 12, 5, "#9fc79b");
    // radio
    px(ctx, 220, 144, 40, 14, "#2a2330");
    px(ctx, 224, 147, 20, 8, "#8bb8d8");
    px(ctx, 248, 148, 4, 6, "#f5c451");
    px(ctx, 254, 148, 4, 6, "#f5c451");
    // steering wheel
    px(ctx, 162, 158, 48, 30, "#2a2330");
    px(ctx, 166, 162, 40, 22, "#4a3d47");
    px(ctx, 174, 168, 24, 10, "#2a2330");
    px(ctx, 180, 170, 12, 6, "#713c3f");
    px(ctx, 184, 166, 4, 4, "#f5c451");
    // side mirror / roof edge
    px(ctx, 294, 150, 10, 6, "#3a2d38");
    // speed lines
    for (let i = 0; i < 5; i += 1) {
      const x = ((i * 90 - t * 120) % 500) - 60;
      px(ctx, x, 120 + i * 9, 20 + i * 4, 1, "rgba(246,233,207,.12)");
    }
  }
};

const PLACE_DRAWERS = {
  living,
  bedroom,
  kitchen,
  bathroom,
  school,
  library,
  cinema,
  picnic,
  market,
  court,
  river,
  mountain,
  drive
};

/* ------------------------------------------------------------------ *
 * Ambient + effects
 * ------------------------------------------------------------------ */

function drawAmbient(ctx, t, ambient = {}) {
  const type = ambient.type || "none";
  const count = ambient.count || 0;
  if (type === "none" || !count) return;

  for (let i = 0; i < count; i += 1) {
    const seed = i * 37.3;
    if (type === "dust" || type === "chalk" || type === "projector") {
      const x = 30 + ((i * 67 + t * 4) % 330);
      const y = 44 + ((i * 31 + t * 7) % 130);
      const alpha = type === "projector" ? 0.25 : 0.12;
      ctx.globalAlpha = alpha + (Math.sin(t * 1.3 + seed) + 1) * 0.06;
      px(ctx, x, y, 1 + (i % 3 === 0 ? 1 : 0), 1, "#f6e9cf");
      ctx.globalAlpha = 1;
    } else if (type === "leaves") {
      const x = (30 + i * 57 + Math.sin(t * 0.6 + seed) * 16 + t * 10) % 370;
      const y = (54 + i * 19 + t * 12) % 140;
      px(ctx, x, y, 3, 2, i % 2 === 0 ? "#9fc79b" : "#c8a88f");
    } else if (type === "bubbles") {
      const x = 40 + (i * 61) % 290;
      const y = 160 - ((t * 14 + i * 23) % 120);
      ctx.globalAlpha = 0.25 + (Math.sin(t + i) + 1) * 0.1;
      px(ctx, x, y, 3 + (i % 3), 3 + (i % 3), "#d8e0e2");
      ctx.globalAlpha = 1;
    } else if (type === "steam") {
      const spots = [96, 222];
      const sx = spots[i % 2];
      const x = sx + Math.sin(t * 0.8 + i) * 5;
      const y = 90 - ((t * 12 + i * 15) % 54);
      ctx.globalAlpha = 0.12 + (1 - (90 - y) / 54) * 0.12;
      px(ctx, x, y, 4, 3, "#f6e9cf");
      ctx.globalAlpha = 1;
    } else if (type === "birds") {
      const x = (20 + i * 72 + t * 8) % 390;
      const y = 62 + i * 13 + Math.sin(t + i) * 4;
      px(ctx, x, y, 3, 1, "#f6e9cf");
      px(ctx, x + 3, y - 1, 3, 1, "#f6e9cf");
    } else if (type === "mist") {
      const x = ((i * 100 - t * 5) % 440) - 30;
      px(ctx, x, 130 + i * 12, 100, 3, "rgba(246,233,207,.09)");
    } else if (type === "speed") {
      const x = ((i * 110 - t * 150) % 520) - 60;
      px(ctx, x, 100 + i * 8, 18 + i * 3, 1, "rgba(246,233,207,.12)");
    }
  }
}

function drawFx(ctx, now, fx) {
  for (const item of fx) {
    const age = (now - item.born) / item.ttl;
    if (age < 0 || age > 1) continue;
    const x = Math.round((item.x + item.vx * age) / 2) * 2;
    const y = Math.round((item.y + item.vy * age) / 2) * 2;
    const alpha = 1 - age;
    ctx.globalAlpha = alpha;
    if (item.type === "heart") {
      const h = [
        [0, 1, 0, 1, 0],
        [1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1],
        [0, 1, 1, 1, 0],
        [0, 0, 1, 0, 0]
      ];
      h.forEach((row, ry) => row.forEach((cell, rx) => {
        if (cell) px(ctx, x + rx * 2, y + ry * 2, 2, 2, item.color);
      }));
    } else if (item.type === "star") {
      px(ctx, x, y - 4, 2, 10, item.color);
      px(ctx, x - 4, y, 10, 2, item.color);
    } else if (item.type === "note") {
      px(ctx, x, y, 2, 8, item.color);
      px(ctx, x + 2, y + 1, 4, 3, item.color);
      px(ctx, x - 1, y + 7, 3, 2, item.color);
    } else if (item.type === "leaf") {
      px(ctx, x, y, 4, 2, item.color);
      px(ctx, x + 2, y - 2, 2, 3, item.color);
    } else if (item.type === "bubble") {
      ctx.globalAlpha = alpha * 0.7;
      px(ctx, x, y, 4, 4, item.color);
    } else if (item.type === "ripple") {
      ctx.globalAlpha = alpha * 0.7;
      ellipse(ctx, x, y, 8 + age * 34, 3 + age * 8, "rgba(139,184,216,0)");
      ctx.strokeStyle = item.color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(x, y, 8 + age * 34, 3 + age * 8, 0, 0, Math.PI * 2);
      ctx.stroke();
    } else if (item.type === "pop") {
      px(ctx, x, y, 3, 3, item.color);
    } else if (item.type === "steam") {
      ctx.globalAlpha = alpha * 0.35;
      px(ctx, x, y, 4, 3, item.color);
    }
    ctx.globalAlpha = 1;
  }
}

function effectParticles(type, x, y, color, now) {
  const fx = [];
  const count = type === "ripple" ? 1 : 6;
  for (let i = 0; i < count; i += 1) {
    fx.push({
      type: type === "hearts" ? "heart" : type === "notes" ? "note" : type === "leaves" ? "leaf" : type === "bubbles" ? "bubble" : type === "ripples" ? "ripple" : type === "pop" ? "pop" : type === "steam" ? "steam" : "star",
      x: x + (Math.random() - 0.5) * 18,
      y: y + (Math.random() - 0.5) * 12,
      vx: (Math.random() - 0.5) * 26,
      vy: type === "ripples" || type === "bubbles" ? -12 - Math.random() * 10 : -22 - Math.random() * 18,
      born: now + Math.random() * 60,
      ttl: type === "ripples" ? 900 : 750 + Math.random() * 450,
      color: color || "#f5c451"
    });
  }
  return fx;
}

/* ------------------------------------------------------------------ *
 * Scene controller
 * ------------------------------------------------------------------ */

export class PlaceScene {
  constructor(canvas, options = {}) {
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.canvas.width = W;
    this.canvas.height = H;
    this.ctx.imageSmoothingEnabled = false;
    this.place = typeof options.place === "string" ? getPlace(options.place) : (options.place || PLACES[0]);
    this.drawer = PLACE_DRAWERS[this.place.id] || PLACE_DRAWERS.living;
    this.look = normalizeLook(options.look || DEFAULT_LOOK);
    this.reducedMotion = options.motion === false;
    this.preview = Boolean(options.preview);
    this.mood = options.mood || null;
    this.startedAt = performance.now();
    this.action = "idle";
    this.actionUntil = 0;
    this.fx = [];
    this.destroyed = false;
    this.loop = this.loop.bind(this);
    this.render(this.startedAt);
    if (!this.reducedMotion && !this.preview) {
      this.raf = requestAnimationFrame(this.loop);
    }
  }

  loop(timestamp) {
    if (this.destroyed) return;
    this.render(timestamp);
    this.raf = requestAnimationFrame(this.loop);
  }

  poke() {
    const now = performance.now();
    this.action = "happy";
    this.actionUntil = now + 1200;
    this.fx.push(...effectParticles("hearts", this.place.char.x, this.place.char.groundY - 54, "#e8735a", now));
    if (this.reducedMotion) this.render(now);
  }

  celebrate() {
    const now = performance.now();
    this.poke();
    this.fx.push(...effectParticles("stars", this.place.char.x, this.place.char.groundY - 60, "#f5c451", now));
    if (this.reducedMotion) this.render(now);
  }

  setMood(mood) {
    this.mood = mood || null;
    if (this.reducedMotion) this.render(performance.now());
  }

  wave() {
    const now = performance.now();
    if (now > this.actionUntil) {
      this.action = "wave";
      this.actionUntil = now + 850;
    }
    if (this.reducedMotion) this.render(now);
  }

  hit(hotspot) {
    const now = performance.now();
    const cx = (hotspot.x + hotspot.w / 2) * W;
    const cy = (hotspot.y + hotspot.h / 2) * H;
    this.fx.push(...effectParticles(hotspot.effect, cx, cy, hotspot.color, now));
    this.wave();
  }

  render(now) {
    if (this.destroyed) return;
    const ctx = this.ctx;
    const t = this.preview ? 0.4 : (now - this.startedAt) / 1000;
    ctx.clearRect(0, 0, W, H);
    this.drawer.back?.(ctx, t, this);
    const action = now < this.actionUntil ? this.action : "idle";
    const happy = action === "happy";
    const jump = happy && !this.reducedMotion ? Math.abs(Math.sin((this.actionUntil - now) * 0.012)) * 6 : 0;
    drawPerson(ctx, {
      x: this.place.char.x,
      groundY: this.place.char.groundY,
      look: this.look,
      now: this.preview ? 0 : now,
      jump,
      action: happy ? "happy" : action === "wave" ? "wave" : "idle",
      mood: this.mood,
      reduced: this.reducedMotion || this.preview,
      holdMug: Boolean(this.place.char.holdMug),
      tilt: planPokeTilt(now, this.actionUntil, action)
    });
    this.drawer.front?.(ctx, t, this);
    drawAmbient(ctx, t, this.place.ambient);
    drawFx(ctx, now, this.fx);
    this.fx = this.fx.filter((item) => now - item.born < item.ttl);
  }

  destroy() {
    this.destroyed = true;
    if (this.raf) cancelAnimationFrame(this.raf);
    this.raf = null;
  }
}

function planPokeTilt(now, actionUntil, action) {
  if (action !== "happy") return 0;
  const left = actionUntil - now;
  return Math.sin(left * 0.03) > 0 ? 2 : -2;
}

export function paintPlacePreview(canvas, placeId, look) {
  const scene = new PlaceScene(canvas, {
    place: getPlace(placeId),
    look,
    motion: false,
    preview: true
  });
  scene.destroy();
}
