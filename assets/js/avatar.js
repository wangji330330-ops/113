/*
 * 二次元 Q 版大头特写形象库
 * ---------------------------------------------------------------
 * 纯前端、零依赖、不联网、无外部图片，24 个原创角色全部由参数化
 * SVG 现场绘制。头部（含头发）几乎占满 120 视野：发顶约 y=4，
 * 下巴约 y=108，左右发丝贴到 x=2 / x=118；身体只留肩膀和衣领。
 * 大眼、虹膜上深下浅渐变、瞳孔 + 双高光；统一描边 #5b4a5e。
 * 无 <style>，渐变 id 每次渲染唯一。
 *
 * 用法：
 *   import { avatarSvg, avatarDataUri, avatarById } from "./avatar.js";
 *   el.innerHTML = avatarSvg("a03", { size: 64 });
 *   img.src = avatarDataUri("a03", { size: 160, mood: "happy" });
 */

/* ------------------------------ 配色 ------------------------------ */

const OUTLINE = "#5b4a5e";

const SKINS = {
  light: { base: "#ffe3d2", shade: "#f6c9b4" },
  deep: { base: "#d8a07f", shade: "#bd8564" }
};

const HAIRS = {
  black: "#3b3140",
  chestnut: "#6b4a3a",
  honey: "#c98b6b",
  sakura: "#e8a0b4",
  mist: "#9aa5d6",
  lav: "#b9a7d9",
  silver: "#d9d3cf",
  grape: "#7f6a9e"
};

const CLOTHS = {
  pink: "#f4a0b5",
  sky: "#93b8d9",
  matcha: "#a8c9a0",
  cream: "#e8c07d",
  lav: "#b9a7d9"
};

/* 眼珠：主色 / 高光提亮色 */
const IRIS = {
  amber: ["#c4894f", "#e9b982"],
  brown: ["#7a5442", "#b08468"],
  blue: ["#7e9cc4", "#b9d2e6"],
  green: ["#7aa17c", "#b2d3a9"],
  rose: ["#c98a9d", "#f2bfcd"],
  plum: ["#8874a6", "#c3b2e0"],
  grey: ["#8d8598", "#cbc5d2"]
};

/* 大眼：d 以眼睛中心为原点；每只眼约 18–19 宽、20–22 高 */
const EYE_STYLES = {
  round: {
    d: "M-9 .5C-9-6.5-5-10.5 0-10.5 5-10.5 9-6.5 9 .5 9 6.5 5 10.5 0 10.5-5 10.5-9 6.5-9 .5Z",
    tilt: 0,
    irx: 7.7,
    iry: 9.1,
    hl: "big",
    lash: "M-9.2-1.2C-8.4-7.2-4.6-10.8 .4-10.6 5.4-10.4 9.2-6.8 9.4-1.4"
  },
  cat: {
    d: "M-9.4-1C-9.4-7-5.2-10 0-10 5.2-10 9.4-7 9.4-1 9.4 5.8 5.2 10 0 10-5.2 10-9.4 5.8-9.4-1Z",
    tilt: -5,
    irx: 8,
    iry: 8.8,
    hl: "big",
    flick: 1,
    lash: "M-9.6-1.4C-9-7.2-5.4-10.2-.2-10.2 5-10.2 9.2-6.8 9.6-1.4"
  },
  droop: {
    d: "M-9-1.2C-8.6-7-5-10.4 .2-10 5.4-9.6 9.2-5.8 9-1 8.8 5.4 5.2 9.6 .2 9.8-4.8 10-9.4 4.8-9-1.2Z",
    tilt: 6,
    irx: 7.6,
    iry: 8.9,
    hl: "big",
    lash: "M-9.2-1.4C-8.8-7-5-10.4 .2-10.2 5.4-10 9.2-6.2 9.2-1.2"
  },
  doe: {
    d: "M0 11C-5.6 11-9.6 6.8-9.6 .4-9.6-6.8-5.4-11 .6-10.8 5.8-10.6 9.8-6.4 9.6 .2 9.4 6.8 5.6 11 0 11Z",
    tilt: 0,
    irx: 8.1,
    iry: 9.4,
    hl: "doe",
    lash: "M-9.6-1.2C-8.8-7.4-5-11 .4-10.8 5.8-10.6 9.6-6.8 9.8-1.4"
  },
  sharp: {
    d: "M-9.4 .8C-9.8-4-6.4-8.6-1.8-9.6 2.4-10.6 6.8-8.2 8.6-4.2 9.8-1.8 8.4 2.8 5.8 5.8 2.6 9.4-6.8 8.4-9.4 .8Z",
    tilt: -8,
    irx: 7.9,
    iry: 8,
    hl: "small",
    flick: 1,
    lash: "M-9.6-1C-9.4-5.4-6-8.8-1.6-9.6 2.6-10.4 7-8.4 9-4.4"
  },
  star: {
    d: "M-9 .5C-9-6.5-5-10.5 0-10.5 5-10.5 9-6.5 9 .5 9 6.5 5 10.5 0 10.5-5 10.5-9 6.5-9 .5Z",
    tilt: 2,
    irx: 7.7,
    iry: 9.1,
    hl: "star",
    lash: "M-9.2-1.2C-8.4-7.2-4.6-10.8 .4-10.6 5.4-10.4 9.2-6.8 9.4-1.4"
  }
};

const HIGHLIGHTS = {
  big: '<circle cx="-3.6" cy="-4.2" r="3.2" fill="#fff" stroke="none"/><circle cx="3.2" cy="5.2" r="1.4" fill="#fff" stroke="none" opacity=".9"/>',
  doe: '<circle cx="-3.8" cy="-4.4" r="3.5" fill="#fff" stroke="none"/><circle cx="1.8" cy="5.4" r="1.5" fill="#fff" stroke="none" opacity=".9"/><circle cx="-5.8" cy="2.8" r=".9" fill="#fff" stroke="none" opacity=".75"/>',
  small: '<circle cx="-3.2" cy="-4" r="2.7" fill="#fff" stroke="none"/><circle cx="3" cy="4.8" r="1.2" fill="#fff" stroke="none" opacity=".9"/>',
  star: '<path d="M-3.2-9l1.4 3.1 3.1 1.4-3.1 1.4-1.4 3.1-1.4-3.1-3.1-1.4 3.1-1.4Z" fill="#fff" stroke="none"/><circle cx="3.2" cy="5" r="1.2" fill="#fff" stroke="none" opacity=".9"/>'
};

const FACE = "M60 14C86 14 108 34 108 64 108 84 92 101 74 106 68 108.4 52 108.4 46 106 28 101 12 84 12 64 12 34 34 14 60 14Z";

/* 前发：外轮廓从 x=2 / x=118 包住画面，发顶 y=4；
   不同发型只改刘海、鬓发长度和后方组件。 */
const HAIR_FRONTS = {
  bob: "M2 72C2 30 26 4 60 4 95 4 118 30 118 72C119 80 113 84 109 79L103 64 100 44Q94 35 88 40Q83 32 77 41Q71 35 64 40Q58 32 53 41Q47 35 40 40Q34 36 30 45L26 64 20 79C16 84 3 80 2 72Z",
  twin: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 78 113 82 109 78L104 64 100 44Q94 35 88 40Q83 32 77 41Q71 35 64 40Q58 32 53 41Q47 35 40 40Q34 36 30 44L26 64 20 78C16 82 2 78 2 70Z",
  bun: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 78 113 82 109 78L104 64 100 44Q94 36 88 41Q83 33 77 42Q71 36 64 41Q58 33 53 42Q47 36 40 41Q34 37 30 45L26 64 20 78C16 82 2 78 2 70Z",
  short: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 76 112 80 108 76L104 62 100 44Q94 35 88 40Q83 32 77 41Q71 35 64 40Q58 32 53 41Q47 35 40 40Q34 36 30 44L26 62 20 76C16 80 2 76 2 70Z",
  spiky: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 76 112 80 108 76L104 62 100 44L96 34 90 42 84 33 78 41 72 33 66 41 60 34 54 41 48 34 42 41 36 35 30 44L26 62 20 76C16 80 2 76 2 70Z",
  pixie: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 76 112 80 108 76L104 62 100 44C95 36 90 35 86 38 82 41 78 40 74 37 70 34 64 36 58 40 52 38 46 38 42 42L30 62 22 92C18 100 8 98 6 90 4 82 2 76 2 70Z",
  hime: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70L120 112C121 118 112 120 108 112L100 110 100 40C90 33 75 32 60 32 45 32 30 33 20 40L20 110C18 116 10 118 8 112Z",
  side: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 78 112 82 108 78L102 60 98 44C92 34 84 31 76 36 68 41 60 40 52 39 48 38 42 38 38 40L30 60 24 84C20 92 8 90 4 82 2 76 2 72 2 70Z",
  pony: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C118 76 113 80 109 76L104 62 100 44Q94 36 88 41Q83 33 77 42Q71 36 64 41Q58 33 53 42Q47 36 40 41Q34 37 30 45L26 62 20 76C16 80 2 76 2 70Z",
  long: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C120 88 118 102 120 110 121 116 112 118 108 110L100 74 99 58 100 44C94 36 86 33 78 37 72 40 66 40 62 36 58 33 52 36 46 40 40 36 34 34 30 44L20 58 21 74 24 110C20 118 11 116 9 110 6 102 0 88 2 70Z",
  wavy: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C122 84 114 92 120 104 122 112 116 118 110 112 104 106 108 94 102 84L99 58 100 44C94 36 86 33 78 37 72 40 66 40 62 36 58 33 52 36 46 40 40 36 34 34 30 44L20 58 18 84C14 94 18 106 12 112 6 118 0 112 2 104 8 92 0 84 2 70Z",
  braid: "M2 70C2 28 26 4 60 4 95 4 118 28 118 70C120 88 118 102 120 110 121 116 112 118 108 110L100 74 99 58 100 44C94 36 86 33 78 37 72 40 66 40 62 36 58 33 52 36 46 40 40 36 34 34 30 44L20 58 21 74 24 110C20 118 11 116 9 110 6 102 0 88 2 70Z"
};

/* ------------------------------ 角色表 ------------------------------ */

function makeAvatar(id, name, color, config) {
  return { id, name, color, config: { ...config, accent: color } };
}

const C = (skin, hair, hairStyle, eye, eyeColor, mouth, outfit, outfitStyle, accessory, blush) => ({
  skin,
  hair,
  hairStyle,
  eye,
  eyeColor,
  mouth,
  outfit,
  outfitStyle,
  accessory,
  blush
});

export const AVATARS = [
  makeAvatar("a01", "阿柚", "#e8c07d", C("light", "honey", "bob", "round", "amber", "smile", "cream", "sweater", "starClip", 1)),
  makeAvatar("a02", "小满", "#f4a0b5", C("light", "chestnut", "twin", "doe", "brown", "cat", "pink", "sailor", "ribbon", 2)),
  makeAvatar("a03", "暮雪", "#93b8d9", C("light", "silver", "long", "droop", "blue", "small", "sky", "dress", "barClip", 0)),
  makeAvatar("a04", "桃桃", "#e8c07d", C("light", "sakura", "bun", "star", "rose", "open", "pink", "overalls", "earring", 2)),
  makeAvatar("a05", "阿栗", "#a8c9a0", C("light", "chestnut", "short", "sharp", "brown", "grin", "matcha", "hoodie", "ahoge", 1)),
  makeAvatar("a06", "星阑", "#e8c07d", C("light", "black", "hime", "cat", "plum", "small", "lav", "sailor", "starClip", 1)),
  makeAvatar("a07", "云露", "#f4a0b5", C("light", "mist", "wavy", "droop", "blue", "smile", "sky", "sweater", "headband", 1)),
  makeAvatar("a08", "紫苏", "#f4a0b5", C("deep", "lav", "twin", "sharp", "plum", "cat", "lav", "dress", "ribbon", 2)),
  makeAvatar("a09", "麦子", "#93b8d9", C("light", "honey", "spiky", "round", "amber", "grin", "cream", "hoodie", "glasses", 0)),
  makeAvatar("a10", "铃兰", "#f4a0b5", C("light", "black", "long", "doe", "green", "smile", "matcha", "dress", "flower", 1)),
  makeAvatar("a11", "白桃", "#93b8d9", C("light", "sakura", "side", "droop", "rose", "small", "pink", "sweater", "barClip", 2)),
  makeAvatar("a12", "墨墨", "#e8c07d", C("deep", "black", "pixie", "sharp", "grey", "line", "sky", "jacket", "earring", 0)),
  makeAvatar("a13", "柚夏", "#f4a0b5", C("light", "honey", "pony", "star", "amber", "open", "matcha", "hoodie", "ribbon", 1)),
  makeAvatar("a14", "雾岛", "#93b8d9", C("deep", "mist", "short", "cat", "blue", "line", "cream", "jacket", "glasses", 0)),
  makeAvatar("a15", "琥珀", "#f4a0b5", C("light", "chestnut", "wavy", "doe", "amber", "smile", "cream", "dress", "flower", 2)),
  makeAvatar("a16", "十月", "#a8c9a0", C("light", "grape", "braid", "droop", "plum", "small", "lav", "sweater", "scarf", 1)),
  makeAvatar("a17", "鹿鸣", "#e8c07d", C("deep", "black", "spiky", "sharp", "green", "grin", "matcha", "jacket", "ahoge", 0)),
  makeAvatar("a18", "糖糖", "#f4a0b5", C("light", "sakura", "short", "star", "rose", "open", "sky", "overalls", "catEar", 1)),
  makeAvatar("a19", "阿岚", "#f4a0b5", C("light", "mist", "pony", "cat", "blue", "line", "sky", "sailor", "scarf", 1)),
  makeAvatar("a20", "竹青", "#e8c07d", C("light", "grape", "hime", "droop", "green", "small", "matcha", "sweater", "barClip", 0)),
  makeAvatar("a21", "樱璃", "#93b8d9", C("light", "sakura", "long", "round", "rose", "smile", "pink", "dress", "flower", 2)),
  makeAvatar("a22", "夜灯", "#e8c07d", C("light", "black", "bob", "cat", "plum", "line", "lav", "jacket", "starClip", 1)),
  makeAvatar("a23", "可可", "#a8c9a0", C("light", "honey", "short", "round", "brown", "grin", "cream", "overalls", "glasses", 1)),
  makeAvatar("a24", "南栀", "#f4a0b5", C("light", "silver", "wavy", "sharp", "grey", "cat", "sky", "sweater", "scarf", 1))
];

export const AVATAR_IDS = AVATARS.map((a) => a.id);

const MOODS = ["idle", "happy", "tired", "sad"];
const DEFAULT_CONFIG = {
  skin: "light",
  hair: "chestnut",
  hairStyle: "bob",
  eye: "round",
  eyeColor: "amber",
  mouth: "smile",
  outfit: "pink",
  outfitStyle: "sweater",
  accessory: "none",
  accent: "#e8c07d",
  blush: 1
};

/* ------------------------------ 小工具 ------------------------------ */

let uidSeq = 0;

function mix(hex, target, t) {
  const s = String(hex).replace("#", "");
  const r = parseInt(s.slice(0, 2), 16);
  const g = parseInt(s.slice(2, 4), 16);
  const b = parseInt(s.slice(4, 6), 16);
  const ch = [r, g, b].map((v, i) => {
    const out = Math.round(v + (target[i] - v) * t);
    return Math.max(0, Math.min(255, out)).toString(16).padStart(2, "0");
  });
  return "#" + ch.join("");
}

const lighten = (hex, t) => mix(hex, [255, 255, 255], t);
const darken = (hex, t) => mix(hex, [28, 20, 32], t);

function normalizeConfig(raw) {
  let src = raw;
  if (src && typeof src === "object" && src.config && typeof src.config === "object") src = src.config;
  if (!src || typeof src !== "object") src = {};
  const out = { ...DEFAULT_CONFIG };
  for (const key of Object.keys(DEFAULT_CONFIG)) {
    if (key === "blush") {
      if (typeof src.blush === "number" && Number.isFinite(src.blush)) {
        out.blush = Math.max(0, Math.min(2, src.blush));
      }
    } else if (typeof src[key] === "string") {
      out[key] = src[key];
    }
  }
  if (!SKINS[out.skin]) out.skin = "light";
  if (!HAIRS[out.hair]) out.hair = "chestnut";
  if (!HAIR_FRONTS[out.hairStyle]) out.hairStyle = "bob";
  if (!EYE_STYLES[out.eye]) out.eye = "round";
  if (!IRIS[out.eyeColor]) out.eyeColor = "amber";
  if (!CLOTHS[out.outfit]) out.outfit = "pink";
  if (!/^#[0-9a-fA-F]{6}$/.test(out.accent)) out.accent = "#e8c07d";
  return out;
}

/* ------------------------------ 头发 ------------------------------ */

function hairBackMarkup(cfg, hair) {
  const b = hair.base;
  const d = hair.dark;
  const mass = `<path d="M0 64C0 26 26 4 60 4 94 4 120 26 120 64V120H0Z" fill="${b}"/>`;
  switch (cfg.hairStyle) {
    case "long":
    case "wavy":
    case "hime":
    case "braid":
    case "side":
      return mass;
    case "twin":
      return `<path d="M18 54C4 56 0 72 2 90 3 102 12 110 18 104 22 96 14 84 20 70 23 62 24 56 28 54Z" fill="${b}"/>
        <path d="M102 54C116 56 120 72 118 90 117 102 108 110 102 104 98 96 106 84 100 70 97 62 96 56 92 54Z" fill="${b}"/>
        <path d="M0 64C0 26 26 4 60 4 94 4 120 26 120 64V92C120 98 110 100 106 94L100 84H20L14 94C10 100 0 98 0 92Z" fill="${b}"/>
        <path d="M10 68C8 80 10 92 13 100M110 68C112 80 110 92 107 100" fill="none" stroke="${d}" stroke-width="1.8" opacity=".35"/>`;
    case "pony":
      return `<path d="M104 30C116 28 120 44 118 62 116 80 112 96 104 108 110 90 110 70 102 52 100 44 102 34 104 30Z" fill="${b}"/>
        <path d="M0 64C0 26 26 4 60 4 94 4 120 26 120 64V92C120 98 110 100 106 94L100 84H20L14 94C10 100 0 98 0 92Z" fill="${b}"/>
        <path d="M110 66C112 80 111 92 107 100" fill="none" stroke="${d}" stroke-width="1.8" opacity=".35"/>`;
    case "bun":
      return `<circle cx="18" cy="20" r="17" fill="${b}"/><circle cx="102" cy="20" r="17" fill="${b}"/>
        <path d="M0 64C0 26 26 4 60 4 94 4 120 26 120 64V90C120 96 110 98 106 92L100 80H20L14 92C10 98 0 96 0 90Z" fill="${b}"/>`;
    case "bob":
      return `<path d="M0 64C0 26 26 4 60 4 94 4 120 26 120 64V94C120 100 110 102 106 96L100 82H20L14 96C10 102 0 100 0 94Z" fill="${b}"/>`;
    default:
      return `<path d="M0 64C0 26 26 4 60 4 94 4 120 26 120 64V84C120 90 110 92 106 86L100 76H20L14 86C10 92 0 90 0 84Z" fill="${b}"/>`;
  }
}

function hairFrontMarkup(cfg, hair) {
  const d = HAIR_FRONTS[cfg.hairStyle] || HAIR_FRONTS.bob;
  const long = cfg.hairStyle === "long" || cfg.hairStyle === "wavy" || cfg.hairStyle === "braid" || cfg.hairStyle === "hime" || cfg.hairStyle === "side";
  const strands = long
    ? `<path d="M14 74C12 88 14 102 16 110M106 74C108 88 106 102 104 110" fill="none" stroke="${hair.dark}" stroke-width="1.8" opacity=".35"/>`
    : "";
  const sheen = `<path d="M22 40C26 20 42 9 58 8" fill="none" stroke="${hair.light}" stroke-width="3" opacity=".55"/>`;
  return `<path d="${d}" fill="${hair.base}"/>${strands}${sheen}`;
}

function hairExtrasMarkup(cfg, hair, accent) {
  if (cfg.hairStyle === "twin") {
    return `<circle cx="28" cy="58" r="5" fill="${accent}"/><circle cx="92" cy="58" r="5" fill="${accent}"/>`;
  }
  if (cfg.hairStyle === "pony") {
    return `<circle cx="105" cy="38" r="5.5" fill="${accent}"/>`;
  }
  return "";
}

function braidMarkup(hair, accent) {
  return `<circle cx="110" cy="76" r="9.5" fill="${hair.base}"/><circle cx="113" cy="90" r="8.6" fill="${hair.base}"/>
    <circle cx="113" cy="103" r="7.7" fill="${hair.base}"/><circle cx="110" cy="114" r="6.8" fill="${hair.base}"/>
    <circle cx="107" cy="118" r="4" fill="${accent}"/>`;
}

/* ------------------------------ 身体（只留肩膀和衣领） ------------------------------ */

function bodyMarkup(cfg, cloth, gradId) {
  const base = cfg.outfitStyle === "overalls" ? "#fff4e8" : `url(#${gradId})`;
  const shoulders = `<path d="M14 120C18 110 36 104 60 104 84 104 102 110 106 120Z" fill="${base}"/>`;
  let detail = "";
  switch (cfg.outfitStyle) {
    case "sweater":
      detail = `<path d="M44 106Q60 117 76 106" stroke="${cloth.dark}" stroke-width="2.6"/>`;
      break;
    case "sailor":
      detail = `<path d="M44 105L60 120 76 105 70 103 60 111 50 103Z" fill="#fff6ee" stroke-width="2"/>
        <path d="M56.5 112H63.5L60 120Z" fill="${cfg.accent}" stroke-width="1.6"/>`;
      break;
    case "hoodie":
      detail = `<path d="M40 104Q60 96 80 104 84 111 76 115 60 108 44 115 36 111 40 104Z" fill="${cloth.dark}"/>`;
      break;
    case "jacket":
      detail = `<path d="M52 103L60 118 55 120 44 105Z" fill="#fff6ee" stroke-width="1.8"/>
        <path d="M68 103L60 118 65 120 76 105Z" fill="#fff6ee" stroke-width="1.8"/>`;
      break;
    case "overalls":
      detail = `<path d="M43 104L47 120M77 104L73 120" stroke="${cloth.base}" stroke-width="8"/>
        <path d="M52 110H68V120H52Z" fill="${cloth.base}" stroke-width="1.8"/>`;
      break;
    case "dress":
      detail = `<path d="M44 105Q52 113 60 107 68 113 76 105" fill="none" stroke="${cfg.accent}" stroke-width="3"/>`;
      break;
  }
  return `${shoulders}${detail}`;
}

/* ------------------------------ 脸 ------------------------------ */

function eyeDefs(cfg, iris, mood, id, irisId) {
  const style = EYE_STYLES[mood === "sad" ? "droop" : cfg.eye];
  let inner;
  if (mood === "happy") {
    inner = `<path d="M-8.4 2.2C-4.8-3.8 4.8-3.8 8.4 2.2" stroke-width="3.2"/>`;
  } else if (mood === "tired") {
    inner = `<path d="M-9-1C-5-.2 5-.2 9-1 9 5.2 5 9.8 0 9.8-5 9.8-9 5.2-9-1Z" fill="url(#${irisId})"/>
      <circle cx="-3.2" cy="2.2" r="1.7" fill="#fff" stroke="none"/>
      <circle cx="3" cy="5.4" r=".9" fill="#fff" stroke="none" opacity=".85"/>
      <path d="M-9.2-1.2C-5-.4 5-.4 9.2-1.2" stroke-width="3.2"/>`;
  } else {
    const lash = `<path d="${style.lash}" stroke-width="3.6"/>`;
    const flick = style.flick ? `<path d="M8.8-5.2L13-8.8" stroke-width="3"/>` : "";
    const pupil = `<ellipse cx="0" cy="2.2" rx="2.9" ry="5.1" fill="${darken(iris[0], 0.55)}" stroke="none"/>`;
    const eye = `<path d="${style.d}" fill="#fff8f4" stroke-width="2.2"/><ellipse cx="0" cy="1" rx="${style.irx}" ry="${style.iry}" fill="url(#${irisId})" stroke="none"/>${pupil}${HIGHLIGHTS[style.hl]}${lash}${flick}`;
    inner = style.tilt ? `<g transform="rotate(${style.tilt})">${eye}</g>` : eye;
  }
  return `<g id="${id}">${inner}</g>`;
}

function browMarkup(mood, hair) {
  const paths = {
    idle: "M66 49.4Q74 47 82 49M38 49Q46 47 54 49.4",
    happy: "M66 48.2Q74 45.8 82 47.8M38 47.8Q46 45.8 54 48.2",
    tired: "M66 50.6Q74 49.4 82 50.6M38 50.6Q46 49.4 54 50.6",
    sad: "M66 47.6Q74 48.4 82 52.4M38 52.4Q46 48.4 54 47.6"
  };
  return `<path d="${paths[mood]}" fill="none" stroke="${hair.dark}" stroke-width="2.6" opacity=".9"/>`;
}

function mouthMarkup(kind, mood) {
  if (mood === "happy") {
    return `<path d="M52 87.6Q60 98.4 68 87.6Q60 90.2 52 87.6Z" fill="#b56274" stroke-width="2"/>
      <path d="M56 92.2Q60 96.4 64 92.2Q60 93.5 56 92.2Z" fill="#e79aa2" stroke="none"/>`;
  }
  if (mood === "sad") {
    return `<path d="M55.4 92.4Q60 88 64.6 92.4" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
  }
  if (mood === "tired") {
    return `<path d="M56.4 90.4H63.6" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
  }
  switch (kind) {
    case "cat":
      return `<path d="M52.6 88.2Q56.4 92.6 60 89.4Q63.6 92.6 67.4 88.2" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
    case "open":
      return `<ellipse cx="60" cy="90" rx="4.2" ry="5" fill="#b56274" stroke-width="2"/>`;
    case "grin":
      return `<path d="M53 88Q60 98 67 88Q60 90.2 53 88Z" fill="#b56274" stroke-width="2"/>`;
    case "small":
      return `<path d="M56.6 89.4Q60 92.2 63.4 89.4" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
    case "line":
      return `<path d="M56 90.2H64" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
    default:
      return `<path d="M53 88.8Q60 94 67 88.8" fill="none" stroke="${OUTLINE}" stroke-width="2.4"/>`;
  }
}

function faceMarkup(cfg, skin, hair, iris, mood, eyeId) {
  const blushAlpha = Math.round((mood === "happy" ? 0.62 : mood === "sad" ? 0.3 : cfg.blush === 0 ? 0 : 0.42 + cfg.blush * 0.07) * 100) / 100;
  const blushColor = cfg.skin === "deep" ? "#e58a92" : "#f4a0b5";
  const blush = blushAlpha > 0
    ? `<g fill="${blushColor}" opacity="${blushAlpha}" stroke="none"><ellipse cx="25" cy="84.5" rx="8.2" ry="4.2"/><ellipse cx="95" cy="84.5" rx="8.2" ry="4.2"/></g>`
    : "";
  const tear = mood === "sad"
    ? `<path d="M86 74C89 79 89.6 82.4 86.6 83.8 83.6 82.4 83.6 79 86 74Z" fill="#aacbe8" stroke-width="1.8"/>`
    : "";
  return `<path d="${FACE}" fill="${skin.base}"/>
    ${browMarkup(mood, hair)}
    <use href="#${eyeId}" transform="translate(45 64) scale(-1.06 1.06)"/>
    <use href="#${eyeId}" transform="translate(75 64) scale(1.06)"/>
    <path d="M58.6 81.2Q60.4 82.8 62.2 81.2" fill="none" stroke="${skin.shade}" stroke-width="1.8"/>${blush}
    ${mouthMarkup(cfg.mouth, mood)}${tear}`;
}

/* ------------------------------ 配饰 ------------------------------ */

function scarfMarkup(a, dark) {
  return `<path d="M26 106Q60 118 94 106L94 116Q60 128 26 116Z" fill="${a}" stroke-width="2"/>
    <path d="M82 112L90 120 84 120Z" fill="${dark}" stroke-width="1.6"/>
    <path d="M34 111Q60 120 86 111" fill="none" stroke="${dark}" stroke-width="1.8" opacity=".6"/>`;
}

function accessoryMarkup(cfg, skin, hair) {
  const a = cfg.accent;
  const dark = darken(a, 0.22);
  switch (cfg.accessory) {
    case "starClip":
      return `<path d="M90 19L92.6 26.4 100 29 92.6 31.6 90 39 87.4 31.6 80 29 87.4 26.4Z" fill="${a}" stroke-width="2"/>
        <circle cx="90" cy="29" r="1.8" fill="#fff" stroke="none"/>`;
    case "barClip":
      return `<rect x="82" y="30" width="20" height="4.6" rx="2.3" transform="rotate(-20 92 32)" fill="${a}"/>
        <rect x="83" y="37" width="17" height="4.2" rx="2.1" transform="rotate(-20 91.5 39)" fill="${dark}"/>`;
    case "ribbon":
      return `<path d="M94 30L81 21C76 26 76 32 81 37Z" fill="${a}" stroke-width="2"/>
        <path d="M94 30L107 21C112 26 112 32 107 37Z" fill="${a}" stroke-width="2"/>
        <circle cx="94" cy="30" r="3.6" fill="${dark}" stroke-width="1.8"/>`;
    case "glasses":
      return `<g fill="none" stroke="${OUTLINE}" stroke-width="2.2">
        <circle cx="45" cy="64" r="13.6"/><circle cx="75" cy="64" r="13.6"/>
        <path d="M58.6 64H61.4M31.5 62L18 59M88.5 62L102 59"/></g>
        <circle cx="45" cy="64" r="12.4" fill="#fff" opacity=".1" stroke="none"/>
        <circle cx="75" cy="64" r="12.4" fill="#fff" opacity=".1" stroke="none"/>`;
    case "earring":
      return `<circle cx="110" cy="78" r="3.2" fill="${a}" stroke-width="1.6"/>
        <path d="M110 81L112.6 87 110 91 107.4 87Z" fill="${a}" stroke-width="1.6"/>`;
    case "headband":
      return `<path d="M8 46C14 20 34 8 60 8 86 8 106 20 112 46" stroke-width="8"/>
        <path d="M8 46C14 20 34 8 60 8 86 8 106 20 112 46" stroke="${a}" stroke-width="5.2"/>
        <path d="M105 42L114 35C118 39 118 44 114 48Z" fill="${a}" stroke-width="1.8"/>`;
    case "ahoge":
      return `<path d="M58 9C53 2 63-1 68 3 71 6 66 9 63.5 6.5" fill="none" stroke="${hair.dark}" stroke-width="3"/>`;
    case "catEar":
      return `<path d="M24 30L28 2 48 18Z" fill="${hair.base}" stroke-width="2.6"/>
        <path d="M29 24L31 8 42 18Z" fill="${cfg.skin === "deep" ? "#e58a92" : "#f6b9c7"}" stroke="none"/>
        <path d="M96 30L92 2 72 18Z" fill="${hair.base}" stroke-width="2.6"/>
        <path d="M91 24L89 8 78 18Z" fill="${cfg.skin === "deep" ? "#e58a92" : "#f6b9c7"}" stroke="none"/>`;
    case "flower":
      return `<g fill="${a}" stroke-width="2">
        <circle cx="88" cy="22" r="5.4"/><circle cx="97" cy="27" r="5.4"/>
        <circle cx="93" cy="36" r="5.4"/><circle cx="84" cy="33" r="5.4"/></g>
        <circle cx="90" cy="29" r="3.4" fill="#e8c07d" stroke-width="1.6"/>`;
    default:
      return "";
  }
}

/* ------------------------------ 渲染 ------------------------------ */

export function avatarById(id) {
  return AVATARS.find((a) => a.id === id) || AVATARS[0];
}

export function randomAvatarId() {
  return AVATARS[Math.floor(Math.random() * AVATARS.length)].id;
}

/**
 * 生成一个大头特写头像的完整 SVG 字符串（同步，可直接 innerHTML）。
 * @param {string|object} configOrId 角色 id 或 config（也可传整条角色）
 * @param {{size?:number, mood?:string, className?:string}} opts
 */
export function avatarSvg(configOrId, { size = 120, mood = "idle", className = "" } = {}) {
  let raw = configOrId;
  if (raw == null) raw = AVATARS[0];
  if (typeof raw === "string") raw = avatarById(raw);
  const cfg = normalizeConfig(raw);
  const m = MOODS.includes(mood) ? mood : "idle";
  const px = Number.isFinite(Number(size)) && Number(size) > 0 ? Number(size) : 120;

  const skin = SKINS[cfg.skin];
  const hairColor = HAIRS[cfg.hair];
  const hair = {
    base: hairColor,
    light: lighten(hairColor, 0.4),
    dark: darken(hairColor, 0.28)
  };
  const cloth = {
    base: CLOTHS[cfg.outfit],
    light: lighten(CLOTHS[cfg.outfit], 0.38),
    dark: darken(CLOTHS[cfg.outfit], 0.17)
  };
  const iris = IRIS[cfg.eyeColor];

  const n = ++uidSeq;
  const gradId = `avc${n}`;
  const eyeId = `ave${n}`;
  const irisId = `avi${n}`;

  const eyeDef = eyeDefs(cfg, iris, m, eyeId, irisId);
  const irisGrad = `<linearGradient id="${irisId}" x2="0" y2="1"><stop stop-color="${darken(iris[0], 0.42)}"/><stop offset=".55" stop-color="${iris[0]}"/><stop offset="1" stop-color="${lighten(iris[0], 0.3)}"/></linearGradient>`;
  const cls = className ? ` class="${String(className).replace(/"/g, "&quot;")}"` : "";
  const isScarf = cfg.accessory === "scarf";
  const under = `${bodyMarkup(cfg, cloth, gradId)}${isScarf ? scarfMarkup(cfg.accent, darken(cfg.accent, 0.22)) : ""}`;
  const face = faceMarkup(cfg, skin, hair, iris, m, eyeId);
  const over = `${hairExtrasMarkup(cfg, hair, cfg.accent)}${cfg.hairStyle === "braid" ? braidMarkup(hair, cfg.accent) : ""}${isScarf ? "" : accessoryMarkup(cfg, skin, hair)}`;

  const inner = `<defs><linearGradient id="${gradId}" x2="0" y2="1"><stop stop-color="${cloth.light}"/><stop offset="1" stop-color="${cloth.base}"/></linearGradient>${irisGrad}${eyeDef}</defs><g fill="none" stroke="${OUTLINE}" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round">${hairBackMarkup(cfg, hair)}${under}${face}${hairFrontMarkup(cfg, hair)}${over}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${px}" height="${px}"${cls} aria-hidden="true">${compact(inner)}</svg>`;
}

/* 压掉多余空格 / 小数前导 0 / 冗余的 fill="none" */
function compact(svg) {
  return svg
    .replace(/(<path[^>]*?) fill="none"/g, "$1")
    .replace(/(\d)\.0+(?=[^\d])/g, "$1")
    .replace(/(^|[^\d])0\.(\d+)/g, "$1.$2")
    .replace(/\s{2,}/g, " ");
}

/** 返回可直接塞进 <img src> 的 data URI。 */
export function avatarDataUri(configOrId, opts = {}) {
  return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(avatarSvg(configOrId, opts));
}