/*
 * 小灯的人物渲染器。
 * 头 / 面 / 身 / 腿 / 鞋 自由组合，Today 小屋和场景页共用。
 */

export const LOOK_PARTS = {
  head: [
    { id: "bob", name: "蘑菇头", desc: "软软的短发", swatch: "#4a2e3f" },
    { id: "short", name: "碎短发", desc: "有一点翘", swatch: "#3b304b" },
    { id: "twin", name: "双马尾", desc: "走路会晃", swatch: "#6f4436" },
    { id: "bun", name: "小丸子", desc: "头顶一个包", swatch: "#332438" },
    { id: "long", name: "长发", desc: "安静地披着", swatch: "#5a383f" },
    { id: "beanie", name: "毛线帽", desc: "金色的那顶", swatch: "#f0c05a" },
    { id: "beret", name: "贝雷帽", desc: "有点艺术家", swatch: "#b97786" },
    { id: "cap", name: "鸭舌帽", desc: "出门戴这个", swatch: "#6f8f86" }
  ],
  face: [
    { id: "calm", name: "安静", desc: "平平的，很安心", swatch: "#f2c9a1" },
    { id: "smile", name: "微笑", desc: "眼睛弯弯的", swatch: "#f5d0ab" },
    { id: "sleepy", name: "困困", desc: "还没睡醒", swatch: "#e7bd96" },
    { id: "round", name: "圆眼睛", desc: "好奇地看着", swatch: "#f2c9a1" },
    { id: "blush", name: "害羞", desc: "脸颊红红的", swatch: "#f7d4b2" },
    { id: "glasses", name: "圆眼镜", desc: "看得更清楚", swatch: "#edc49d" },
    { id: "wink", name: "眨眼", desc: "在和你打招呼", swatch: "#f2c9a1" },
    { id: "deep", name: "小麦色", desc: "晒过太阳的颜色", swatch: "#b97a58" }
  ],
  body: [
    { id: "cream", name: "奶油毛衣", desc: "软绵绵的", swatch: "#f0d9b5" },
    { id: "mint", name: "薄荷卫衣", desc: "口袋里能装糖", swatch: "#7f9c8f" },
    { id: "coral", name: "珊瑚外套", desc: "今天有点精神", swatch: "#e8735a" },
    { id: "starry", name: "星星睡衣", desc: "把夜空穿在身上", swatch: "#7b6b9e" },
    { id: "overalls", name: "背带裤", desc: "可以装很多小东西", swatch: "#5b708c" },
    { id: "raincoat", name: "小雨衣", desc: "下雨也不怕", swatch: "#e6c25c" },
    { id: "cardigan", name: "针织开衫", desc: "旧旧的，很暖", swatch: "#b97f88" },
    { id: "hoodie", name: "深夜连帽衫", desc: "帽子里可以躲起来", swatch: "#4a527a" }
  ],
  legs: [
    { id: "pants", name: "直筒长裤", desc: "最常穿的那条", swatch: "#405a63" },
    { id: "shorts", name: "短裤", desc: "露出一点小腿", swatch: "#6f5b7c" },
    { id: "skirt", name: "百褶裙", desc: "走路会转起来", swatch: "#c26a72" },
    { id: "striped", name: "条纹长袜", desc: "暖和又好看", swatch: "#d9b06b" },
    { id: "wide", name: "灯芯绒裤", desc: "宽宽的很舒服", swatch: "#8b6b4f" },
    { id: "longskirt", name: "长裙", desc: "风一吹就动", swatch: "#6f7f9a" },
    { id: "cargo", name: "工装裤", desc: "有四个口袋", swatch: "#6e7557" },
    { id: "pajama", name: "星星睡裤", desc: "和睡衣一套", swatch: "#7b6b9e" }
  ],
  shoes: [
    { id: "boots", name: "小皮靴", desc: "踩水坑很合适", swatch: "#5b3a32" },
    { id: "sneakers", name: "运动鞋", desc: "走很远也不累", swatch: "#e9d8bb" },
    { id: "canvas", name: "帆布鞋", desc: "洗过很多次", swatch: "#40536b" },
    { id: "rainboots", name: "雨靴", desc: "黄色的那双", swatch: "#e6c25c" },
    { id: "slippers", name: "棉拖鞋", desc: "只在家里穿", swatch: "#c98b91" },
    { id: "mary", name: "小皮鞋", desc: "配裙子刚好", swatch: "#3c2d3d" }
  ]
};

export const DEFAULT_LOOK = {
  head: "beanie",
  face: "calm",
  body: "mint",
  legs: "pants",
  shoes: "boots"
};

const OUTLINE = "#241a2e";
const FACE_DATA = {
  calm: { skin: "#f2c9a1", shade: "#e1b087", eye: "calm", mouth: "line", blink: true },
  smile: { skin: "#f5d0ab", shade: "#e5b58d", eye: "smile", mouth: "smile", blink: false },
  sleepy: { skin: "#e7bd96", shade: "#d2a47e", eye: "sleepy", mouth: "tiny", blink: false },
  round: { skin: "#f2c9a1", shade: "#e1b087", eye: "round", mouth: "o", blink: true },
  blush: { skin: "#f7d4b2", shade: "#e6b78f", eye: "calm", mouth: "smile", blink: true, blush: true },
  glasses: { skin: "#edc49d", shade: "#d9aa82", eye: "calm", mouth: "line", blink: true, glasses: true },
  wink: { skin: "#f2c9a1", shade: "#e1b087", eye: "wink", mouth: "smile", blink: false },
  deep: { skin: "#b97a58", shade: "#9d6245", eye: "round", mouth: "smile", blink: true }
};

const HEAD_DATA = {
  bob: { hair: "#4a2e3f", light: "#6b4051", dark: "#352131", style: "bob" },
  short: { hair: "#3b304b", light: "#554365", dark: "#291f38", style: "short" },
  twin: { hair: "#6f4436", light: "#8b5744", dark: "#513027", style: "twin" },
  bun: { hair: "#332438", light: "#4c354f", dark: "#231827", style: "bun" },
  long: { hair: "#5a383f", light: "#774b52", dark: "#41252d", style: "long" },
  beanie: { hair: "#5a3b32", light: "#745045", dark: "#3d2824", style: "beanie" },
  beret: { hair: "#3d2b38", light: "#584050", dark: "#2b1d29", style: "beret" },
  cap: { hair: "#4a3a32", light: "#665044", dark: "#332620", style: "cap" }
};

const BODY_DATA = {
  cream: { main: "#f0d9b5", shade: "#d8bb93", light: "#f8e8cb", accent: "#e8735a", style: "sweater" },
  mint: { main: "#7f9c8f", shade: "#5f7c72", light: "#9ab7a6", accent: "#f0d9b5", style: "hoodie" },
  coral: { main: "#e8735a", shade: "#bf5848", light: "#f28b6e", accent: "#f0d9b5", style: "jacket" },
  starry: { main: "#7b6b9e", shade: "#5e517d", light: "#9686b5", accent: "#f5c451", style: "pajama" },
  overalls: { main: "#5b708c", shade: "#455874", light: "#748ba5", accent: "#f0d9b5", style: "overalls" },
  raincoat: { main: "#e6c25c", shade: "#c9a344", light: "#f5d982", accent: "#8a6b2d", style: "raincoat" },
  cardigan: { main: "#b97f88", shade: "#99646d", light: "#d19ba2", accent: "#f0d9b5", style: "cardigan" },
  hoodie: { main: "#4a527a", shade: "#353b5e", light: "#65709b", accent: "#9aa9cf", style: "nightHoodie" }
};

const LEG_DATA = {
  pants: { main: "#405a63", shade: "#31464f", style: "pants" },
  shorts: { main: "#6f5b7c", shade: "#584763", style: "shorts" },
  skirt: { main: "#c26a72", shade: "#a2505a", light: "#d98a91", style: "skirt" },
  striped: { main: "#405a63", shade: "#31464f", light: "#d9b06b", style: "striped" },
  wide: { main: "#8b6b4f", shade: "#70543d", style: "wide" },
  longskirt: { main: "#6f7f9a", shade: "#57657e", light: "#8a9bb3", style: "longskirt" },
  cargo: { main: "#6e7557", shade: "#565c43", style: "cargo" },
  pajama: { main: "#7b6b9e", shade: "#5e517d", accent: "#f5c451", style: "pajama" }
};

const SHOE_DATA = {
  boots: { main: "#5b3a32", light: "#775044", sole: "#2d2028", style: "boots" },
  sneakers: { main: "#e9d8bb", light: "#fff0d2", sole: "#b9a98e", accent: "#e8735a", style: "sneakers" },
  canvas: { main: "#40536b", light: "#5d7189", sole: "#d8c6a8", style: "canvas" },
  rainboots: { main: "#e6c25c", light: "#f5d982", sole: "#725c2d", style: "rainboots" },
  slippers: { main: "#c98b91", light: "#eab1b4", sole: "#8d5c66", style: "slippers" },
  mary: { main: "#3c2d3d", light: "#5b465c", sole: "#241b2a", style: "mary" }
};

function pick(table, id) {
  return table[id] || table[Object.keys(table)[0]];
}

export function normalizeLook(raw) {
  const look = raw && typeof raw === "object" ? raw : {};
  const result = { ...DEFAULT_LOOK };
  for (const part of Object.keys(LOOK_PARTS)) {
    const ids = LOOK_PARTS[part].map((item) => item.id);
    if (ids.includes(look[part])) result[part] = look[part];
  }
  return result;
}

export function randomLook() {
  const look = {};
  for (const [part, options] of Object.entries(LOOK_PARTS)) {
    look[part] = options[Math.floor(Math.random() * options.length)].id;
  }
  return look;
}

export function lookLabel(part, id) {
  return LOOK_PARTS[part]?.find((item) => item.id === id)?.name || id;
}

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

function drawShoes(ctx, R, shoe, ground) {
  const s = pick(SHOE_DATA, shoe);
  const parts = [
    { x: -16, y: -7, w: 14, h: 7 },
    { x: 2, y: -7, w: 14, h: 7 }
  ];
  for (const p of parts) {
    if (s.style === "slippers") {
      px(ctx, R.x + p.x - 1, R.y + p.y, p.w + 2, 6, OUTLINE);
      px(ctx, R.x + p.x, R.y + p.y + 1, p.w, 4, s.main);
      px(ctx, R.x + p.x, R.y + p.y + 1, p.w, 2, s.light);
      px(ctx, R.x + p.x + 2, R.y + p.y + 1, p.w - 4, 2, "#f0d9b5");
      px(ctx, R.x + p.x, R.y + p.y + 5, p.w, 2, s.sole);
    } else if (s.style === "rainboots") {
      px(ctx, R.x + p.x, R.y + p.y - 5, p.w, 12, OUTLINE);
      px(ctx, R.x + p.x + 1, R.y + p.y - 4, p.w - 2, 10, s.main);
      px(ctx, R.x + p.x + 1, R.y + p.y - 4, p.w - 2, 3, s.light);
      px(ctx, R.x + p.x, R.y + p.y + 5, p.w, 3, s.sole);
    } else if (s.style === "boots") {
      px(ctx, R.x + p.x, R.y + p.y - 2, p.w, 9, OUTLINE);
      px(ctx, R.x + p.x + 1, R.y + p.y - 1, p.w - 2, 7, s.main);
      px(ctx, R.x + p.x + 2, R.y + p.y, p.w - 4, 3, s.light);
      px(ctx, R.x + p.x, R.y + p.y + 5, p.w, 3, s.sole);
    } else {
      px(ctx, R.x + p.x, R.y + p.y, p.w, 7, OUTLINE);
      px(ctx, R.x + p.x + 1, R.y + p.y + 1, p.w - 2, 4, s.main);
      px(ctx, R.x + p.x + 1, R.y + p.y + 1, p.w - 2, 2, s.light);
      if (s.accent) px(ctx, R.x + p.x + 2, R.y + p.y + 3, p.w - 4, 1, s.accent);
      px(ctx, R.x + p.x, R.y + p.y + 5, p.w, 2, s.sole);
    }
  }
}

function drawLegs(ctx, R, leg, face) {
  const l = pick(LEG_DATA, leg);
  const skin = face.skin;
  const shade = face.shade;
  const isSkirt = l.style === "skirt" || l.style === "longskirt";
  const bare = l.style === "shorts" || isSkirt || l.style === "striped";

  // legs / socks
  if (bare) {
    px(ctx, R.x - 12, R.y - 21, 10, 16, OUTLINE);
    px(ctx, R.x + 2, R.y - 21, 10, 16, OUTLINE);
    px(ctx, R.x - 10, R.y - 20, 6, 14, skin);
    px(ctx, R.x + 4, R.y - 20, 6, 14, skin);
    px(ctx, R.x - 10, R.y - 10, 6, 2, shade);
    px(ctx, R.x + 4, R.y - 10, 6, 2, shade);
    if (l.style === "striped") {
      for (let y = -18; y < -7; y += 4) {
        px(ctx, R.x - 10, R.y + y, 6, 2, l.light);
        px(ctx, R.x + 4, R.y + y, 6, 2, l.light);
      }
    }
  } else {
    px(ctx, R.x - 13, R.y - 22, 11, 17, OUTLINE);
    px(ctx, R.x + 2, R.y - 22, 11, 17, OUTLINE);
    px(ctx, R.x - 11, R.y - 21, 7, 15, l.main);
    px(ctx, R.x + 4, R.y - 21, 7, 15, l.main);
    px(ctx, R.x - 11, R.y - 11, 7, 2, l.shade);
    px(ctx, R.x + 4, R.y - 11, 7, 2, l.shade);
    if (l.style === "wide") {
      px(ctx, R.x - 13, R.y - 10, 11, 4, l.shade);
      px(ctx, R.x + 2, R.y - 10, 11, 4, l.shade);
    }
    if (l.style === "cargo") {
      px(ctx, R.x - 13, R.y - 16, 5, 4, l.shade);
      px(ctx, R.x + 8, R.y - 16, 5, 4, l.shade);
    }
    if (l.style === "pajama") {
      px(ctx, R.x - 9, R.y - 17, 2, 2, l.accent);
      px(ctx, R.x + 7, R.y - 13, 2, 2, l.accent);
      px(ctx, R.x - 7, R.y - 9, 2, 2, l.accent);
    }
  }

  // shorts / skirt on top
  if (l.style === "shorts") {
    px(ctx, R.x - 15, R.y - 23, 30, 8, OUTLINE);
    px(ctx, R.x - 13, R.y - 22, 26, 6, l.main);
    px(ctx, R.x - 13, R.y - 22, 26, 2, l.shade);
  } else if (l.style === "skirt") {
    px(ctx, R.x - 14, R.y - 24, 28, 4, OUTLINE);
    px(ctx, R.x - 16, R.y - 21, 32, 4, OUTLINE);
    px(ctx, R.x - 18, R.y - 18, 36, 4, OUTLINE);
    px(ctx, R.x - 15, R.y - 21, 30, 3, l.main);
    px(ctx, R.x - 17, R.y - 18, 34, 4, l.main);
    for (let x = -14; x <= 14; x += 7) {
      px(ctx, R.x + x, R.y - 20, 1, 6, l.shade);
    }
    px(ctx, R.x - 17, R.y - 14, 34, 2, l.shade);
  } else if (l.style === "longskirt") {
    px(ctx, R.x - 14, R.y - 25, 28, 4, OUTLINE);
    px(ctx, R.x - 16, R.y - 21, 32, 18, OUTLINE);
    px(ctx, R.x - 15, R.y - 23, 30, 18, l.main);
    px(ctx, R.x - 17, R.y - 6, 34, 3, l.shade);
    px(ctx, R.x - 7, R.y - 20, 2, 14, l.light);
    px(ctx, R.x + 5, R.y - 18, 2, 12, l.shade);
  }
}

function drawArm(ctx, R, side, body, action, skin) {
  // side: -1 left, 1 right
  const isRight = side > 0;
  const x = isRight ? 16 : -24;
  if (action === "happy") {
    px(ctx, R.x + x, R.y - 53, 8, 22, OUTLINE);
    px(ctx, R.x + x + 1, R.y - 51, 6, 18, body.main);
    px(ctx, R.x + x + 1, R.y - 35, 6, 3, body.light);
    px(ctx, R.x + x + 1, R.y - 58, 6, 7, OUTLINE);
    px(ctx, R.x + x + 2, R.y - 57, 4, 5, skin);
  } else if (action === "wave" && isRight) {
    px(ctx, R.x + x + 2, R.y - 50, 8, 19, OUTLINE);
    px(ctx, R.x + x + 3, R.y - 48, 6, 15, body.main);
    px(ctx, R.x + x + 2, R.y - 55, 7, 7, OUTLINE);
    px(ctx, R.x + x + 3, R.y - 54, 5, 5, skin);
  } else {
    px(ctx, R.x + x, R.y - 36, 8, 18, OUTLINE);
    px(ctx, R.x + x + 1, R.y - 35, 5, 15, body.main);
    px(ctx, R.x + x + 1, R.y - 22, 5, 4, body.light);
    px(ctx, R.x + x - 1, R.y - 20, 7, 6, OUTLINE);
    px(ctx, R.x + x, R.y - 19, 5, 4, skin);
  }
}

function drawBody(ctx, R, look, action, holdMug) {
  const b = pick(BODY_DATA, look.body);
  const f = pick(FACE_DATA, look.face);
  const skin = f.skin;

  // neck
  px(ctx, R.x - 4, R.y - 44, 8, 6, OUTLINE);
  px(ctx, R.x - 3, R.y - 44, 6, 5, skin);

  // torso outline
  px(ctx, R.x - 17, R.y - 40, 34, 26, OUTLINE);
  px(ctx, R.x - 15, R.y - 42, 30, 3, OUTLINE);
  px(ctx, R.x - 15, R.y - 38, 30, 22, b.main);
  px(ctx, R.x - 16, R.y - 36, 32, 18, b.main);
  px(ctx, R.x - 16, R.y - 36, 2, 18, b.shade);
  px(ctx, R.x + 14, R.y - 36, 2, 18, b.shade);
  px(ctx, R.x - 16, R.y - 19, 32, 3, b.shade);

  // sleeves / arms
  drawArm(ctx, R, -1, b, action, skin);
  drawArm(ctx, R, 1, b, action, skin);

  // style details
  if (b.style === "sweater") {
    px(ctx, R.x - 13, R.y - 38, 26, 3, b.light);
    px(ctx, R.x - 16, R.y - 17, 32, 2, b.light);
    px(ctx, R.x - 2, R.y - 31, 2, 2, b.shade);
    px(ctx, R.x - 2, R.y - 26, 2, 2, b.shade);
    px(ctx, R.x - 8, R.y - 24, 16, 1, b.shade);
  } else if (b.style === "hoodie" || b.style === "nightHoodie") {
    px(ctx, R.x - 12, R.y - 42, 24, 5, b.shade);
    px(ctx, R.x - 8, R.y - 40, 16, 2, b.light);
    px(ctx, R.x - 7, R.y - 30, 14, 7, b.shade);
    px(ctx, R.x - 6, R.y - 29, 12, 1, b.light);
    px(ctx, R.x - 3, R.y - 37, 1, 6, b.light);
    px(ctx, R.x + 2, R.y - 37, 1, 6, b.light);
    px(ctx, R.x - 2, R.y - 39, 4, 2, b.light);
  } else if (b.style === "jacket") {
    px(ctx, R.x - 7, R.y - 38, 14, 20, b.accent);
    px(ctx, R.x - 1, R.y - 38, 2, 20, b.shade);
    px(ctx, R.x - 12, R.y - 36, 4, 4, b.light);
    px(ctx, R.x - 12, R.y - 28, 4, 4, b.light);
    px(ctx, R.x - 12, R.y - 20, 4, 4, b.light);
    px(ctx, R.x - 8, R.y - 37, 16, 2, b.light);
  } else if (b.style === "pajama") {
    px(ctx, R.x - 12, R.y - 38, 24, 2, b.light);
    px(ctx, R.x - 11, R.y - 33, 2, 2, b.accent);
    px(ctx, R.x + 5, R.y - 30, 2, 2, b.accent);
    px(ctx, R.x - 4, R.y - 25, 2, 2, b.accent);
    px(ctx, R.x + 9, R.y - 22, 2, 2, b.accent);
  } else if (b.style === "overalls") {
    px(ctx, R.x - 7, R.y - 38, 14, 20, b.main);
    px(ctx, R.x - 3, R.y - 38, 6, 12, b.accent);
    px(ctx, R.x - 8, R.y - 39, 3, 9, b.shade);
    px(ctx, R.x + 5, R.y - 39, 3, 9, b.shade);
    px(ctx, R.x - 5, R.y - 34, 2, 2, b.light);
    px(ctx, R.x + 3, R.y - 34, 2, 2, b.light);
  } else if (b.style === "raincoat") {
    px(ctx, R.x - 12, R.y - 42, 24, 4, b.shade);
    px(ctx, R.x - 7, R.y - 38, 14, 2, b.light);
    px(ctx, R.x - 1, R.y - 32, 2, 2, b.accent);
    px(ctx, R.x - 1, R.y - 25, 2, 2, b.accent);
    px(ctx, R.x - 16, R.y - 17, 32, 2, b.accent);
  } else if (b.style === "cardigan") {
    px(ctx, R.x - 7, R.y - 38, 14, 20, b.accent);
    px(ctx, R.x - 7, R.y - 38, 2, 20, b.shade);
    px(ctx, R.x + 5, R.y - 38, 2, 20, b.shade);
    px(ctx, R.x - 2, R.y - 33, 2, 2, b.shade);
    px(ctx, R.x - 2, R.y - 27, 2, 2, b.shade);
    px(ctx, R.x - 2, R.y - 21, 2, 2, b.shade);
  }

  // a little scarf / collar on some looks
  if (b.style === "sweater" || b.style === "jacket" || b.style === "cardigan") {
    px(ctx, R.x - 9, R.y - 40, 18, 3, b.accent === b.main ? b.light : b.accent);
    px(ctx, R.x - 9, R.y - 40, 18, 1, b.light);
  }

  if (holdMug && action === "idle") {
    // held in the left hand, visible at the side
    px(ctx, R.x - 31, R.y - 28, 11, 10, OUTLINE);
    px(ctx, R.x - 30, R.y - 27, 9, 8, "#f0dcba");
    px(ctx, R.x - 30, R.y - 27, 9, 2, "#fff1d5");
    px(ctx, R.x - 31, R.y - 23, 6, 3, "#d8b990");
    px(ctx, R.x - 20, R.y - 25, 4, 4, OUTLINE);
    px(ctx, R.x - 20, R.y - 24, 3, 2, "#f0dcba");
  }
}

function drawBackHair(ctx, R, head) {
  const h = pick(HEAD_DATA, head);
  if (h.style === "twin") {
    px(ctx, R.x - 27, R.y - 60, 9, 24, OUTLINE);
    px(ctx, R.x - 25, R.y - 58, 6, 20, h.hair);
    px(ctx, R.x - 25, R.y - 47, 6, 2, h.light);
    px(ctx, R.x - 25, R.y - 58, 6, 2, h.light);
    px(ctx, R.x + 18, R.y - 60, 9, 24, OUTLINE);
    px(ctx, R.x + 19, R.y - 58, 6, 20, h.hair);
    px(ctx, R.x + 19, R.y - 47, 6, 2, h.light);
    px(ctx, R.x + 19, R.y - 58, 6, 2, h.light);
    px(ctx, R.x - 23, R.y - 61, 5, 4, "#d96d70");
    px(ctx, R.x + 18, R.y - 61, 5, 4, "#d96d70");
  } else if (h.style === "long") {
    px(ctx, R.x - 18, R.y - 61, 36, 28, OUTLINE);
    px(ctx, R.x - 17, R.y - 60, 34, 23, h.hair);
    px(ctx, R.x - 18, R.y - 58, 6, 22, h.dark);
    px(ctx, R.x + 12, R.y - 58, 6, 22, h.dark);
    px(ctx, R.x - 15, R.y - 57, 3, 16, h.light);
    px(ctx, R.x + 12, R.y - 57, 3, 16, h.light);
  } else if (h.style === "bun") {
    px(ctx, R.x - 8, R.y - 77, 16, 10, OUTLINE);
    px(ctx, R.x - 6, R.y - 76, 12, 8, h.hair);
    px(ctx, R.x - 3, R.y - 75, 5, 3, h.light);
  } else if (h.style === "bob") {
    px(ctx, R.x - 17, R.y - 63, 34, 23, OUTLINE);
    px(ctx, R.x - 15, R.y - 62, 30, 20, h.hair);
  } else if (h.style === "short") {
    px(ctx, R.x - 16, R.y - 64, 32, 20, OUTLINE);
    px(ctx, R.x - 15, R.y - 63, 30, 17, h.hair);
  }
}

function drawHeadwear(ctx, R, head, now, reduced) {
  const h = pick(HEAD_DATA, head);
  if (h.style === "beanie") {
    px(ctx, R.x - 12, R.y - 77, 24, 3, OUTLINE);
    px(ctx, R.x - 14, R.y - 75, 28, 4, OUTLINE);
    px(ctx, R.x - 14, R.y - 73, 28, 7, "#f0c05a");
    px(ctx, R.x - 14, R.y - 73, 28, 2, "#f8d78f");
    px(ctx, R.x - 15, R.y - 68, 30, 7, OUTLINE);
    px(ctx, R.x - 14, R.y - 67, 28, 5, "#d9a23b");
    px(ctx, R.x - 14, R.y - 67, 28, 2, "#f8d78f");
    for (let x = -10; x <= 10; x += 5) {
      px(ctx, R.x + x, R.y - 64, 1, 2, "#b9822f");
    }
    px(ctx, R.x - 11, R.y - 72, 4, 3, "#c95e55");
    px(ctx, R.x + 6, R.y - 71, 3, 2, "#f8d78f");
  } else if (h.style === "beret") {
    px(ctx, R.x - 16, R.y - 75, 32, 4, OUTLINE);
    px(ctx, R.x - 19, R.y - 71, 36, 7, OUTLINE);
    px(ctx, R.x - 17, R.y - 74, 33, 8, "#b97786");
    px(ctx, R.x - 15, R.y - 73, 22, 3, "#d29ba2");
    px(ctx, R.x - 18, R.y - 65, 36, 2, "#8f5564");
    px(ctx, R.x + 3, R.y - 78, 4, 4, "#8f5564");
  } else if (h.style === "cap") {
    px(ctx, R.x - 15, R.y - 75, 30, 5, OUTLINE);
    px(ctx, R.x - 13, R.y - 73, 26, 8, "#6f8f86");
    px(ctx, R.x - 15, R.y - 67, 30, 3, OUTLINE);
    px(ctx, R.x - 14, R.y - 67, 28, 2, "#8aa89d");
    px(ctx, R.x + 11, R.y - 66, 14, 4, OUTLINE);
    px(ctx, R.x + 11, R.y - 66, 13, 3, "#5b7972");
    px(ctx, R.x - 1, R.y - 76, 3, 3, "#8aa89d");
  }
}

function drawFace(ctx, R, faceId, action, blink, low, hairColor = OUTLINE) {
  const f = pick(FACE_DATA, faceId);
  const eyeY = -53;
  const happy = action === "happy" || action === "wave";
  const closed = blink || f.eye === "smile" || f.eye === "sleepy" || f.eye === "wink" || happy || low;

  // ears
  px(ctx, R.x - 18, R.y - 52, 3, 5, OUTLINE);
  px(ctx, R.x + 15, R.y - 52, 3, 5, OUTLINE);
  px(ctx, R.x - 17, R.y - 51, 2, 3, f.skin);
  px(ctx, R.x + 15, R.y - 51, 2, 3, f.skin);

  // brows and a tiny nose make the face read better at small sizes
  if (!low && !happy && f.eye !== "smile" && f.eye !== "sleepy") {
    px(ctx, R.x - 10, R.y - 56, 4, 1, hairColor);
    px(ctx, R.x + 6, R.y - 56, 4, 1, hairColor);
  }
  px(ctx, R.x - 1, R.y - 48, 2, 2, f.shade);

  if (low && !happy) {
    px(ctx, R.x - 10, R.y - 51, 5, 1, OUTLINE);
    px(ctx, R.x + 5, R.y - 51, 5, 1, OUTLINE);
  } else if (happy || f.eye === "smile") {
    px(ctx, R.x - 10, R.y - 51, 5, 2, OUTLINE);
    px(ctx, R.x - 11, R.y - 52, 2, 1, OUTLINE);
    px(ctx, R.x + 5, R.y - 51, 5, 2, OUTLINE);
    px(ctx, R.x + 9, R.y - 52, 2, 1, OUTLINE);
  } else if (f.eye === "sleepy") {
    px(ctx, R.x - 10, R.y - 51, 5, 1, OUTLINE);
    px(ctx, R.x + 5, R.y - 51, 5, 1, OUTLINE);
  } else if (f.eye === "wink" && !blink) {
    px(ctx, R.x - 9, R.y - 53, 3, 4, OUTLINE);
    px(ctx, R.x + 5, R.y - 51, 5, 2, OUTLINE);
    px(ctx, R.x + 9, R.y - 52, 2, 1, OUTLINE);
    px(ctx, R.x - 8, R.y - 53, 1, 1, "#fff1d5");
  } else if (closed) {
    px(ctx, R.x - 10, R.y - 51, 5, 2, OUTLINE);
    px(ctx, R.x + 5, R.y - 51, 5, 2, OUTLINE);
  } else if (!blink) {
    const big = f.eye === "round";
    const w = big ? 4 : 3;
    const h = big ? 4 : 3;
    px(ctx, R.x - 10, R.y + eyeY, w, h, OUTLINE);
    px(ctx, R.x + 6, R.y + eyeY, w, h, OUTLINE);
    px(ctx, R.x - 9, R.y + eyeY, 1, 1, "#fff1d5");
    px(ctx, R.x + 7, R.y + eyeY, 1, 1, "#fff1d5");
  }

  if (f.glasses) {
    px(ctx, R.x - 12, R.y - 55, 8, 1, "#5a4c5c");
    px(ctx, R.x - 12, R.y - 55, 1, 7, "#5a4c5c");
    px(ctx, R.x - 5, R.y - 55, 1, 7, "#5a4c5c");
    px(ctx, R.x - 12, R.y - 49, 8, 1, "#5a4c5c");
    px(ctx, R.x + 4, R.y - 55, 8, 1, "#5a4c5c");
    px(ctx, R.x + 4, R.y - 55, 1, 7, "#5a4c5c");
    px(ctx, R.x + 11, R.y - 55, 1, 7, "#5a4c5c");
    px(ctx, R.x + 4, R.y - 49, 8, 1, "#5a4c5c");
    px(ctx, R.x - 4, R.y - 52, 8, 1, "#5a4c5c");
  }

  if (f.blush || f.eye === "wink") {
    ctx.globalAlpha = 0.42;
    px(ctx, R.x - 13, R.y - 46, 4, 2, "#e89a90");
    px(ctx, R.x + 9, R.y - 46, 4, 2, "#e89a90");
    ctx.globalAlpha = 1;
  }

  if (action === "happy") {
    px(ctx, R.x - 2, R.y - 45, 5, 2, OUTLINE);
    px(ctx, R.x - 3, R.y - 46, 2, 1, OUTLINE);
    px(ctx, R.x + 3, R.y - 46, 2, 1, OUTLINE);
  } else if (low) {
    px(ctx, R.x - 3, R.y - 45, 6, 1, "#9d635a");
  } else if (f.mouth === "smile") {
    px(ctx, R.x - 2, R.y - 45, 5, 1, "#9d635a");
    px(ctx, R.x - 3, R.y - 46, 2, 1, "#9d635a");
    px(ctx, R.x + 3, R.y - 46, 2, 1, "#9d635a");
  } else if (f.mouth === "o") {
    px(ctx, R.x - 1, R.y - 46, 3, 2, "#9d635a");
  } else if (f.mouth === "tiny") {
    px(ctx, R.x - 2, R.y - 45, 4, 1, "#9d635a");
  } else {
    px(ctx, R.x - 2, R.y - 45, 4, 1, "#9d635a");
  }
}

function drawHead(ctx, R, look, now, action, blink, low) {
  const h = pick(HEAD_DATA, look.head);
  const f = pick(FACE_DATA, look.face);

  drawBackHair(ctx, R, look.head);

  // head outline & hair base (slightly rounded corners)
  px(ctx, R.x - 14, R.y - 68, 28, 2, OUTLINE);
  px(ctx, R.x - 17, R.y - 66, 34, 2, OUTLINE);
  px(ctx, R.x - 18, R.y - 64, 36, 21, OUTLINE);
  px(ctx, R.x - 16, R.y - 43, 32, 2, OUTLINE);
  px(ctx, R.x - 16, R.y - 65, 32, 23, h.dark);
  px(ctx, R.x - 15, R.y - 64, 30, 22, h.hair);

  // face, tapered at the chin
  px(ctx, R.x - 12, R.y - 58, 24, 13, f.skin);
  px(ctx, R.x - 11, R.y - 45, 22, 3, f.skin);
  px(ctx, R.x - 9, R.y - 42, 18, 2, f.skin);
  px(ctx, R.x - 12, R.y - 57, 2, 11, f.shade);
  px(ctx, R.x + 10, R.y - 57, 2, 11, f.shade);
  px(ctx, R.x - 8, R.y - 43, 16, 1, f.shade);

  // fringe / side hair
  if (h.style === "bob") {
    px(ctx, R.x - 15, R.y - 64, 30, 7, h.hair);
    px(ctx, R.x - 15, R.y - 63, 30, 3, h.light);
    px(ctx, R.x - 15, R.y - 58, 5, 15, h.hair);
    px(ctx, R.x + 10, R.y - 58, 5, 15, h.hair);
    px(ctx, R.x - 8, R.y - 58, 3, 4, h.light);
  } else if (h.style === "short") {
    px(ctx, R.x - 15, R.y - 65, 30, 6, h.hair);
    px(ctx, R.x - 12, R.y - 68, 6, 4, h.hair);
    px(ctx, R.x - 3, R.y - 70, 6, 3, h.hair);
    px(ctx, R.x + 5, R.y - 68, 7, 4, h.hair);
    px(ctx, R.x - 13, R.y - 66, 26, 2, h.light);
    px(ctx, R.x - 14, R.y - 58, 4, 12, h.hair);
    px(ctx, R.x + 10, R.y - 58, 4, 12, h.hair);
  } else if (h.style === "twin" || h.style === "long") {
    px(ctx, R.x - 15, R.y - 64, 30, 7, h.hair);
    px(ctx, R.x - 15, R.y - 63, 30, 3, h.light);
    px(ctx, R.x - 14, R.y - 58, 5, 12, h.hair);
    px(ctx, R.x + 9, R.y - 58, 5, 12, h.hair);
    px(ctx, R.x - 7, R.y - 58, 2, 3, h.light);
  } else if (h.style === "bun") {
    px(ctx, R.x - 15, R.y - 64, 30, 7, h.hair);
    px(ctx, R.x - 15, R.y - 63, 30, 3, h.light);
    px(ctx, R.x - 14, R.y - 58, 4, 12, h.hair);
    px(ctx, R.x + 10, R.y - 58, 4, 12, h.hair);
  } else if (h.style === "beanie" || h.style === "beret" || h.style === "cap") {
    px(ctx, R.x - 15, R.y - 64, 30, 8, h.hair);
    px(ctx, R.x - 14, R.y - 63, 28, 3, h.light);
    px(ctx, R.x - 14, R.y - 58, 4, 10, h.hair);
    px(ctx, R.x + 10, R.y - 58, 4, 10, h.hair);
    px(ctx, R.x - 8, R.y - 57, 3, 3, h.light);
  }

  // a soft fringe under every hairstyle / hat
  px(ctx, R.x - 12, R.y - 58, 9, 2, h.hair);
  px(ctx, R.x + 3, R.y - 58, 9, 2, h.hair);
  px(ctx, R.x - 14, R.y - 60, 3, 10, h.dark);
  px(ctx, R.x + 11, R.y - 60, 3, 10, h.dark);

  drawHeadwear(ctx, R, look.head, now, false);
  drawFace(ctx, R, look.face, action, blink, low, h.dark);
}

/**
 * Draw a customizable little person. Coordinates are scene pixels,
 * (x, groundY) is the point between the feet.
 */
export function drawPerson(ctx, {
  x = 190,
  groundY = 188,
  look = DEFAULT_LOOK,
  now = 0,
  jump = 0,
  action = "idle",
  mood = null,
  reduced = false,
  holdMug = false,
  tilt = 0
} = {}) {
  const normalized = normalizeLook(look);
  const f = pick(FACE_DATA, normalized.face);
  const bob = reduced ? 0 : (Math.sin(now * 0.0022) > 0.55 ? 2 : 0);
  const sway = action === "happy" ? 0 : tilt;
  const baseY = Math.round(groundY - bob - jump);
  const baseX = Math.round(x + sway);
  const R = { x: baseX, y: baseY };
  const blink = !reduced && (now % 4400) < 140;
  const low = mood === "low" && action === "idle";

  // shadow
  const shadowW = 34 - Math.min(12, Math.floor(jump * 0.55));
  ellipse(ctx, baseX, groundY + 2, shadowW / 2, 4, "rgba(24,16,30,.42)");

  drawShoes(ctx, R, normalized.shoes, groundY);
  drawLegs(ctx, R, normalized.legs, f);
  drawBody(ctx, R, normalized, action, holdMug);
  drawHead(ctx, R, normalized, now, action, blink, low);

  if (action === "happy" && !reduced) {
    px(ctx, baseX - 30, baseY - 58, 2, 2, "#f8d78f");
    px(ctx, baseX + 29, baseY - 62, 2, 2, "#f8d78f");
  }
}

export function paintPersonPreview(canvas, look) {
  const ctx = canvas.getContext("2d");
  canvas.width = 180;
  canvas.height = 220;
  ctx.clearRect(0, 0, 180, 220);
  ctx.imageSmoothingEnabled = false;

  // soft spotlight
  const glow = ctx.createRadialGradient(90, 150, 5, 90, 150, 105);
  glow.addColorStop(0, "rgba(245,196,81,.12)");
  glow.addColorStop(1, "rgba(245,196,81,0)");
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 180, 220);
  ctx.fillStyle = "rgba(246,233,207,.05)";
  ctx.fillRect(22, 208, 136, 2);

  ctx.save();
  ctx.scale(2, 2);
  drawPerson(ctx, {
    x: 45,
    groundY: 103,
    look,
    now: 0,
    reduced: true,
    action: "idle",
    holdMug: true
  });
  ctx.restore();
}
