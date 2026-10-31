/*
 * 二次元 Q 版大头形象库
 * ---------------------------------------------------------------
 * 纯前端、零依赖、不联网、无外部图片，24 个原创角色全部由参数化
 * SVG 现场绘制。头身比约 1 : 0.7（头非常大），扁平色块 + 极轻渐变，
 * 统一描边 #5b4a5e，无 <style>，渐变 id 每次渲染唯一。
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

/* 眼珠：主色 / 反光色 */
const IRIS = {
  amber: ["#c4894f", "#e9b982"],
  brown: ["#7a5442", "#b08468"],
  blue: ["#7e9cc4", "#b9d2e6"],
  green: ["#7aa17c", "#b2d3a9"],
  rose: ["#c98a9d", "#f2bfcd"],
  plum: ["#8874a6", "#c3b2e0"],
  grey: ["#8d8598", "#cbc5d2"]
};

/* 眼睛形状：d 以眼睛中心为原点，向右为 +x */
const EYE_STYLES = {
  round: {
    d: "M0 8.6C-4.6 8.8-7.3 5.4-7.3 .4-7.3-4.8-4-8.7 .9-8.5 5.5-8.3 7.5-4.4 7.2 .2 6.9 4.8 4 8.4 0 8.6Z",
    tilt: 0,
    hl: "big"
  },
  cat: {
    d: "M-6.6 2.6C-7.6-1.8-6-6-2-7.2 1.8-8.4 5.8-6.6 7.4-3.2 8.6-1 7.2 1.6 5 4.2 2 7.6-4.8 7.4-6.6 2.6Z",
    tilt: -9,
    hl: "big",
    lash: 1
  },
  droop: {
    d: "M-6.8-2.4C-5.6-6.6-1.8-8.4 1.8-7.8 5.6-7 7.8-3.6 7.4 .8 7 5 3.4 8.2-.4 8.2-4.2 8.2-7.8 3.6-6.8-2.4Z",
    tilt: 7,
    hl: "big"
  },
  doe: {
    d: "M0 9.2C-4.9 9.4-7.7 5.6-7.7 .4-7.7-5.4-4.3-9.2 .9-9 5.9-8.8 8-4.6 7.6 .2 7.3 5.2 4.3 9 0 9.2Z",
    tilt: 0,
    hl: "doe"
  },
  sharp: {
    d: "M-6.8 1.8C-7.4-2.8-5.4-6.6-1.2-7.4 2.6-8.2 6.4-6.4 7.8-3 8.6-.6 6.8 2.4 4.2 4.6 .8 7.6-5.8 6.4-6.8 1.8Z",
    tilt: -13,
    hl: "small",
    lash: 1
  },
  star: {
    d: "M0 8.6C-4.6 8.8-7.3 5.4-7.3 .4-7.3-4.8-4-8.7 .9-8.5 5.5-8.3 7.5-4.4 7.2 .2 6.9 4.8 4 8.4 0 8.6Z",
    tilt: 2,
    hl: "star"
  }
};

const HIGHLIGHTS = {
  big: '<circle cx="-2.6" cy="-4" r="2.7" fill="#fff" stroke="none"/><circle cx="2.6" cy="3.6" r="1.15" fill="#fff" stroke="none" opacity=".9"/>',
  doe: '<circle cx="-2.6" cy="-4.2" r="3.1" fill="#fff" stroke="none"/><circle cx="1.7" cy="3.8" r="1.25" fill="#fff" stroke="none" opacity=".9"/><circle cx="-5" cy="2.6" r=".85" fill="#fff" stroke="none" opacity=".7"/>',
  small: '<circle cx="-2.1" cy="-3.6" r="2.2" fill="#fff" stroke="none"/><circle cx="2.4" cy="3.1" r="1" fill="#fff" stroke="none" opacity=".9"/>',
  star: '<path d="M-2.2-7l1 2.2 2.2 1-2.2 1-1 2.2-1-2.2-2.2-1 2.2-1Z" fill="#fff" stroke="none"/><circle cx="2.7" cy="3.4" r="1.05" fill="#fff" stroke="none" opacity=".9"/>'
};

/* 前发：外轮廓 + 刘海 + 鬓发，一条闭合路径。
   外轮廓比脸宽一圈（27 ~ 93），发顶 3 ~ 4，刘海剪成尖角发绺，
   避免"锅盖/头盔"感；鬓发收成尖，长度按发型区分。 */
const HAIR_FRONTS = {
  bob: "M27 50C25 20 42 4 60 4 78 4 95 20 93 50C92 57 88 59 85.5 56C84 50 83 44 81 38Q78 32 74 36Q70 31 66 36Q62 31 58 36Q54 31 50 36Q46 32 43 38C41 44 39.5 50 38 56C35.5 59 28 57 27 50Z",
  twin: "M27 50C25 20 42 4 60 4 78 4 95 20 93 50C92 57 88 59 85.5 56C84 50 83 44 81 38Q78 32 74 36Q70 31 66 36Q62 31 58 36Q54 31 50 36Q46 32 43 38C41 44 39.5 50 38 56C35.5 59 28 57 27 50Z",
  bun: "M27 50C25 20 42 4 60 4 78 4 95 20 93 50C92 55 88 57 86 54C85 48 84 43 82 38Q79 33 75 36Q71 32 67 36Q63 32 59 36Q55 32 51 36Q47 33 44 38C42 43 41 48 39 53C37 56 28 55 27 50Z",
  short: "M28 46C26 20 42 4 60 4 78 4 94 20 92 46C91 49 88 50 86 47C85 41 84 37 82 33C79 28 74 27 70 30C66 33 61 34 56 32C52 31 48 33 45 36C42 40 40 45 38 50C36 54 31 53 29 49Z",
  spiky: "M28 46C26 20 42 4 60 4 78 4 94 20 92 46C91 49 88 50 86 47C85 41 84 37 82 33L78 27 74 34 70 27 66 34 62 27 58 34 54 27 50 33 46 28 43 35C41 40 38 45 36 53C35 59 31 58 30 54Z",
  pixie: "M28 46C27 20 42 4 60 4 78 4 94 20 92 46C91 49 88 50 86 47C85 41 84 37 82 33C79 28 74 27 70 30C66 33 61 34 56 32C52 31 48 33 44 36C41 40 38 45 36 53C35 59 31 58 30 54C29 51 28 48 28 46Z",
  hime: "M27 50C25 19 42 4 60 4 78 4 95 19 93 50L93 68C93 72 88 72 87.5 68L84 37C78 32 70 31 60 31 50 31 42 32 36 37L37 64 34 70C33 73 27 72 27 67Z",
  side: "M27 50C25 20 42 4 60 4 78 4 95 20 93 50C92 56 88 58 86 54C85 47 84 40 82 34Q79 31 75 33Q71 34 66 35Q61 37 56 38Q51 39 47 38Q43 42 41 48C39 55 37 62 35 67C34 71 28 69 27 63Z",
  pony: "M27 48C26 20 42 4 60 4 78 4 95 20 93 48C92 53 88 55 86 51C85 45 84 39 82 34Q79 31 75 34Q71 32 67 34Q63 33 59 35Q55 36 51 36Q47 36 44 38C42 43 40 49 38 55C36 58 28 56 27 48Z",
  long: "M27 50C25 19 42 4 60 4 78 4 95 19 93 50C92 57 90 64 88 70C87 58 86 48 85 40C82 31 77 30 72 33C67 35 62 35 57 32C52 30 47 31 42 36C39 45 36 58 34 70C32 64 30 57 27 50Z",
  wavy: "M27 50C25 19 42 4 60 4 78 4 95 19 93 50C92 57 90 64 88 70C87 58 86 48 85 40C82 31 77 30 72 33C67 35 62 35 57 32C52 30 47 31 42 36C39 45 36 58 34 70C32 64 30 57 27 50Z",
  braid: "M27 50C25 19 42 4 60 4 78 4 95 19 93 50C92 57 90 64 88 70C87 58 86 48 85 40C82 31 77 30 72 33C67 35 62 35 57 32C52 30 47 31 42 36C39 45 36 58 34 70C32 64 30 57 27 50Z"
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
  // 颜色 / 部件 id 兜底，避免外部传入坏值把画面画坏
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
  switch (cfg.hairStyle) {
    case "long":
    case "braid":
    case "hime":
      return `<path d="M27 46C25 17 42 3 60 3 78 3 95 17 93 46C96 58 92 68 95 80 97 90 91 98 86 94 80 90 77 83 76 76 76 68 76 60 77 54 70 57 50 57 43 54 42 60 42 68 42 76 41 83 39 90 33 94 28 98 23 90 25 80 28 68 24 58 27 46Z" fill="${b}"/>
        <path d="M32 62C30 74 32 85 34 92M88 62C90 74 88 85 86 92" fill="none" stroke="${d}" stroke-width="1.5" opacity=".45"/>`;
    case "wavy":
      return `<path d="M27 46C25 17 42 3 60 3 78 3 95 17 93 46C97 58 91 66 96 78 99 88 92 97 87 93 80 90 78 82 77 74 77 66 77 60 77 54 70 57 50 57 43 54 42 60 42 66 42 74 40 82 38 90 31 93 26 97 19 88 24 78 29 66 23 58 27 46Z" fill="${b}"/>
        <path d="M34 60C29 72 35 82 31 92M86 60C91 72 85 82 89 92" fill="none" stroke="${d}" stroke-width="1.5" opacity=".45"/>`;
    case "twin":
      return `<path d="M32 42C21 45 14 58 15 74 16 86 22 93 27 89 30 81 25 70 29 60 31 53 33 47 36 44Z" fill="${b}"/>
        <path d="M88 42C99 45 106 58 105 74 104 86 98 93 93 89 90 81 95 70 91 60 89 53 87 47 84 44Z" fill="${b}"/>
        <path d="M23 60C22 70 24 79 27 85M97 60C98 70 96 79 93 85" fill="none" stroke="${d}" stroke-width="1.4" opacity=".45"/>
        <path d="M29 42C27 17 42 4 60 4 78 4 93 17 91 42L91 60C91 66 85 67 82 62H38C35 67 29 66 29 60Z" fill="${b}"/>`;
    case "pony":
      return `<path d="M89 24C100 20 109 34 107 52 105 66 99 76 93 82 98 68 99 54 93 45 90 39 89 30 89 24Z" fill="${b}"/>
        <path d="M100 52C101 62 99 71 95 77" fill="none" stroke="${d}" stroke-width="1.4" opacity=".5"/>
        <path d="M29 42C27 17 42 4 60 4 78 4 93 17 91 42L91 58C91 64 85 65 82 60H38C35 65 29 64 29 58Z" fill="${b}"/>`;
    case "bun":
      return `<circle cx="26" cy="17" r="8.5" fill="${b}"/><circle cx="94" cy="17" r="8.5" fill="${b}"/>
        <path d="M30 42C28 16 43 4 60 4 77 4 92 16 90 42L90 58C90 64 84 65 81 60H39C36 65 30 64 30 58Z" fill="${b}"/>`;
    case "bob":
      return `<path d="M29 42C27 16 42 4 60 4 78 4 93 16 91 42L91 60C91 66 85 67 82 62H38C35 67 29 66 29 60Z" fill="${b}"/>`;
    case "short":
    case "spiky":
    case "pixie":
      return `<path d="M31 42C29 17 44 6 60 6 76 6 91 17 89 42L89 55C89 60 84 61 81 56H39C36 61 31 60 31 55Z" fill="${b}"/>`;
    default:
      return "";
  }
}

function hairFrontMarkup(cfg, hair) {
  const d = HAIR_FRONTS[cfg.hairStyle] || HAIR_FRONTS.bob;
  const long = cfg.hairStyle === "long" || cfg.hairStyle === "wavy" || cfg.hairStyle === "braid" || cfg.hairStyle === "hime";
  const strands = long
    ? `<path d="M31.5 46C30.5 54 31.5 62 33 68M88.5 46C89.5 54 88.5 62 87 68" fill="none" stroke="${hair.dark}" stroke-width="1.4" opacity=".4"/>`
    : cfg.hairStyle === "side"
      ? `<path d="M31.5 46C30.5 54 31.5 60 32.5 65" fill="none" stroke="${hair.dark}" stroke-width="1.4" opacity=".4"/>`
      : "";
  const sheen = `<path d="M37 24C40 15 49 9 58 7.6" fill="none" stroke="${hair.light}" stroke-width="2.3" opacity=".6"/>`;
  return `<path d="${d}" fill="${hair.base}"/>${strands}${sheen}`;
}

function hairExtrasMarkup(cfg, hair, accent) {
  if (cfg.hairStyle === "twin") {
    return `<circle cx="31.5" cy="46" r="3.1" fill="${accent}"/><circle cx="88.5" cy="46" r="3.1" fill="${accent}"/>`;
  }
  if (cfg.hairStyle === "pony") {
    return `<circle cx="87" cy="30" r="3.4" fill="${accent}"/>`;
  }
  return "";
}

function braidMarkup(hair, accent) {
  return `<circle cx="90" cy="55" r="5.4" fill="${hair.base}"/><circle cx="92.5" cy="64" r="4.9" fill="${hair.base}"/>
    <circle cx="93.5" cy="72.5" r="4.4" fill="${hair.base}"/><circle cx="92" cy="80.5" r="3.9" fill="${hair.base}"/>
    <circle cx="89" cy="87.5" r="3.4" fill="${hair.base}"/>
    <circle cx="87.5" cy="91.5" r="2.4" fill="${accent}"/>`;
}

/* ------------------------------ 身体 ------------------------------ */

function bodyMarkup(cfg, skin, cloth, gradId) {
  const style = cfg.outfitStyle;
  const skirt = style === "sailor" || style === "dress";
  const legs = `<rect x="47.5" y="88" width="9.5" height="18" rx="4.6" fill="${skin.shade}"/>
    <rect x="63" y="88" width="9.5" height="18" rx="4.6" fill="${skin.base}"/>`;
  const shoes = `<rect x="45" y="101" width="13.5" height="8" rx="4" fill="${OUTLINE}"/>
    <rect x="61.5" y="101" width="13.5" height="8" rx="4" fill="${OUTLINE}"/>`;
  const torsoFill = style === "overalls" ? "#fff4e8" : `url(#${gradId})`;
  const torso = `<path d="M60 65C50 65 43.5 71 41.5 81 40 87 40.5 91 42.5 92.5H77.5C79.5 91 80 87 78.5 81 76.5 71 70 65 60 65Z" fill="${torsoFill}"/>`;
  const skirtShape = `<path d="M44 80L34.5 94C33.5 97 35.5 98 38.5 98H81.5C84.5 98 86.5 97 85.5 94L76 80Z" fill="${cloth.dark}"/>`;

  let detail = "";
  if (style === "sweater") {
    detail = `<path d="M42.5 88Q60 91 77.5 88" fill="none" stroke="${cloth.dark}" stroke-width="1.6"/>
      <path d="M52 73.5Q60 78.5 68 73.5" fill="none" stroke="${cloth.dark}" stroke-width="1.6"/>`;
  } else if (style === "hoodie") {
    detail = `<path d="M57 74V84M63 74V84" fill="none" stroke="${cloth.light}" stroke-width="1.7"/>
      <circle cx="57" cy="85" r="1.4" fill="${cloth.light}" stroke="none"/>
      <circle cx="63" cy="85" r="1.4" fill="${cloth.light}" stroke="none"/>
      <path d="M49 83H71" fill="none" stroke="${cloth.dark}" stroke-width="1.6"/>`;
  } else if (style === "sailor") {
    detail = `<path d="M46 68L60 80L74 68 68 66 60 72.5 52 66Z" fill="#fff6ee" stroke-width="1.7"/>
      <path d="M57 73H63L60 82Z" fill="${cfg.accent}" stroke-width="1.5"/>
      <path d="M40 92.5H80" fill="none" stroke="${cloth.dark}" stroke-width="1.6"/>`;
  } else if (style === "jacket") {
    detail = `<path d="M54 66L60 79L66 66Z" fill="#fff6ee" stroke-width="1.6"/>
      <path d="M60 79V91" fill="none" stroke="${OUTLINE}" stroke-width="1.3"/>
      <path d="M52 66L60 78M68 66L60 78" fill="none" stroke="${cloth.dark}" stroke-width="2"/>`;
  } else if (style === "overalls") {
    detail = `<path d="M53 76H67V89H53Z" fill="${cloth.base}" stroke-width="1.7"/>
      <path d="M53 76L47.5 67M67 76L72.5 67" fill="none" stroke="${cloth.base}" stroke-width="4.6"/>
      <circle cx="55" cy="80" r="1.5" fill="${cfg.accent}" stroke="none"/>
      <circle cx="65" cy="80" r="1.5" fill="${cfg.accent}" stroke="none"/>`;
  } else if (style === "dress") {
    detail = `<path d="M53 68Q60 75.5 67 68Q60 71 53 68Z" fill="#fff6ee" stroke-width="1.6"/>
      <path d="M42 80H78" fill="none" stroke="${cfg.accent}" stroke-width="2.6"/>`;
  }

  const hood = style === "hoodie"
    ? `<path d="M46 63C47 57 73 57 74 63 76 70 70 76 60 76 50 76 44 70 46 63Z" fill="${cloth.dark}"/>`
    : "";
  const arms = `<rect x="73" y="69" width="9.5" height="22" rx="4.7" fill="${cloth.base}"/>
    <rect x="37.5" y="69" width="9.5" height="22" rx="4.7" fill="${cloth.base}"/>
    <circle cx="77.8" cy="91.5" r="3.4" fill="${skin.base}"/>
    <circle cx="42.2" cy="91.5" r="3.4" fill="${skin.base}"/>`;

  return `${legs}${shoes}${hood}${torso}${skirt ? skirtShape : ""}${detail}${arms}`;
}

/* ------------------------------ 脸 ------------------------------ */

function eyeDefs(cfg, iris, mood, id) {
  const style = EYE_STYLES[mood === "sad" ? "droop" : cfg.eye];
  let inner;
  if (mood === "happy") {
    inner = `<path d="M-6.8 2.4C-4-2.4 4-2.4 6.8 2.4" stroke-width="2.5"/>`;
  } else if (mood === "tired") {
    inner = `<path d="M-7.3-1H7.3C7.3 4.2 4 8 0 8-4 8-7.3 4.2-7.3-1Z" fill="${iris[0]}"/>
      <circle cx="-2.2" cy="2.2" r="1.3" fill="#fff" stroke="none"/>
      <circle cx="2.4" cy="4.4" r=".8" fill="#fff" stroke="none" opacity=".8"/>
      <path d="M-7.6-1.2H7.6" stroke-width="2.4"/>`;
  } else {
    const lash = style.lash ? `<path d="M6.4-4.8L9.4-6.8"/>` : "";
    const shape = `<path d="${style.d}" fill="${iris[0]}"/><ellipse cx="0" cy=".8" rx="4" ry="5.6" fill="${darken(iris[0], 0.46)}" stroke="none"/>${HIGHLIGHTS[style.hl]}${lash}`;
    inner = style.tilt ? `<g transform="rotate(${style.tilt})">${shape}</g>` : shape;
  }
  return `<g id="${id}">${inner}</g>`;
}

function browMarkup(mood, hair) {
  const paths = {
    idle: "M66.5 36.4Q73 34.6 79.6 36.2M40.4 36.2Q47 34.6 53.5 36.4",
    happy: "M66.5 35.2Q73 33.4 79.6 35M40.4 35Q47 33.4 53.5 35.2",
    tired: "M66.5 37.4Q73 36.1 79.6 37.4M40.4 37.4Q47 36.1 53.5 37.4",
    sad: "M66.5 34.5Q73 35.2 79.6 38.5M40.4 38.5Q47 35.2 53.5 34.5"
  };
  return `<path d="${paths[mood]}" fill="none" stroke="${hair.dark}" stroke-width="2" opacity=".85"/>`;
}

function mouthMarkup(kind, mood) {
  if (mood === "happy") {
    return `<path d="M53.5 59Q60 69 66.5 59Q60 61.6 53.5 59Z" fill="#b56274" stroke-width="1.8"/>
      <path d="M56.5 63.2Q60 67.4 63.5 63.2Q60 64.4 56.5 63.2Z" fill="#e79aa2" stroke="none"/>`;
  }
  if (mood === "sad") {
    return `<path d="M56.6 62.9Q60 59.7 63.4 62.9" fill="none" stroke="${OUTLINE}" stroke-width="1.9"/>`;
  }
  if (mood === "tired") {
    return `<path d="M57.4 61.6H62.6" fill="none" stroke="${OUTLINE}" stroke-width="1.9"/>`;
  }
  switch (kind) {
    case "cat":
      return `<path d="M54.6 60.2Q57.2 63.4 59.8 60.6Q62.4 63.4 65 60.2" fill="none" stroke="${OUTLINE}" stroke-width="1.9"/>`;
    case "open":
      return `<ellipse cx="60" cy="61.8" rx="3.6" ry="4.2" fill="#b56274" stroke-width="1.7"/>`;
    case "grin":
      return `<path d="M54.5 59.6Q60 68.4 65.5 59.6Q60 61.4 54.5 59.6Z" fill="#b56274" stroke-width="1.7"/>`;
    case "small":
      return `<path d="M57.6 60.8Q60 62.8 62.4 60.8" fill="none" stroke="${OUTLINE}" stroke-width="1.9"/>`;
    case "line":
      return `<path d="M57.2 61.2H62.8" fill="none" stroke="${OUTLINE}" stroke-width="1.9"/>`;
    default:
      return `<path d="M55.2 60.2Q60 64.4 64.8 60.2" fill="none" stroke="${OUTLINE}" stroke-width="1.9"/>`;
  }
}

function faceMarkup(cfg, skin, hair, iris, mood, eyeId) {
  const blushAlpha = Math.round((mood === "happy" ? 0.62 : mood === "sad" ? 0.3 : cfg.blush === 0 ? 0 : 0.42 + cfg.blush * 0.07) * 100) / 100;
  const blushColor = cfg.skin === "deep" ? "#e58a92" : "#f4a0b5";
  const blush = blushAlpha > 0
    ? `<g fill="${blushColor}" opacity="${blushAlpha}" stroke="none"><ellipse cx="42.8" cy="57" rx="6.2" ry="3.1"/><ellipse cx="77.2" cy="57" rx="6.2" ry="3.1"/></g>`
    : "";
  const tear = mood === "sad"
    ? `<path d="M80.4 53.4C82.6 56.8 83 59 80.8 60 78.6 59 78.6 56.8 80.4 53.4Z" fill="#aacbe8" stroke-width="1.3"/>`
    : "";
  return `<ellipse cx="30.6" cy="47" rx="4.2" ry="5.8" fill="${skin.base}"/>
    <ellipse cx="89.4" cy="47" rx="4.2" ry="5.8" fill="${skin.base}"/>
    <path d="M60 11.5C77 11.5 88.5 23.5 88.5 40.5 88.5 51 82.5 60.5 73 66 67 69.4 53 69.4 47 66 37.5 60.5 31.5 51 31.5 40.5 31.5 23.5 43 11.5 60 11.5Z" fill="${skin.base}"/>
    ${browMarkup(mood, hair)}
    <use href="#${eyeId}" transform="translate(47 47) scale(-1 1)"/>
    <use href="#${eyeId}" transform="translate(73 47)"/>${blush}
    ${mouthMarkup(cfg.mouth, mood)}${tear}`;
}

/* ------------------------------ 配饰 ------------------------------ */

function accessoryMarkup(cfg, skin, hair) {
  const a = cfg.accent;
  const dark = darken(a, 0.22);
  switch (cfg.accessory) {
    case "starClip":
      return `<path d="M78 17L79.7 22.3 85 24 79.7 25.7 78 31 76.3 25.7 71 24 76.3 22.3Z" fill="${a}" stroke-width="1.7"/>
        <circle cx="78" cy="24" r="1.2" fill="#fff8f2" stroke="none"/>`;
    case "barClip":
      return `<rect x="71.5" y="22.5" width="13" height="3.2" rx="1.6" transform="rotate(-22 78 24)" fill="${a}"/>
        <rect x="72.5" y="27.5" width="11" height="3" rx="1.5" transform="rotate(-22 78 29)" fill="${dark}"/>`;
    case "ribbon":
      return `<path d="M82 23L74 17.5C70.8 21 70.8 25 74 28.5Z" fill="${a}" stroke-width="1.6"/>
        <path d="M82 23L90 17.5C93.2 21 93.2 25 90 28.5Z" fill="${a}" stroke-width="1.6"/>
        <circle cx="82" cy="23" r="2.3" fill="${dark}" stroke-width="1.5"/>`;
    case "glasses":
      return `<g fill="none" stroke="${OUTLINE}" stroke-width="1.6">
        <circle cx="47" cy="47" r="9.4"/><circle cx="73" cy="47" r="9.4"/>
        <path d="M56.6 47H63.4M37.6 46L32 44.5M82.4 46L88 44.5"/></g>
        <circle cx="47" cy="47" r="8.6" fill="#ffffff" opacity=".1" stroke="none"/>
        <circle cx="73" cy="47" r="8.6" fill="#ffffff" opacity=".1" stroke="none"/>`;
    case "scarf":
      return `<path d="M40.5 71.5C46 79.5 74 79.5 79.5 71.5L79.5 78C73 86 47 86 40.5 78Z" fill="${a}" stroke-width="1.8"/>
        <path d="M72.5 81L78 98 69.5 96.5 68 82Z" fill="${dark}" stroke-width="1.7"/>
        <path d="M44 75.5Q60 82 76 75.5" fill="none" stroke="${dark}" stroke-width="1.4" opacity=".7"/>`;
    case "earring":
      return `<circle cx="88.8" cy="52" r="2.2" fill="${a}" stroke-width="1.3"/>
        <path d="M88.8 54.2L90.6 58 88.8 60.8 87 58Z" fill="${a}" stroke-width="1.3"/>`;
    case "headband":
      return `<path d="M33 36C37 20 47 13 60 13 73 13 83 20 87 36" stroke-width="5.4"/>
        <path d="M33 36C37 20 47 13 60 13 73 13 83 20 87 36" stroke="${a}" stroke-width="3.2"/>
        <path d="M84 32L90 27.5C92.8 30.5 92.8 34 90 37Z" fill="${a}" stroke-width="1.4"/>`;
    case "ahoge":
      return `<path d="M60 7C56.5 2.5 62.5 0 66 2.5 68 4.5 65 7 62.5 5" fill="none" stroke="${hair.dark}" stroke-width="2.4"/>`;
    case "catEar":
      return `<path d="M36 20L38.5 5 52 14Z" fill="${hair.base}" stroke-width="2"/>
        <path d="M40.5 16L41.8 9 48.2 13.5Z" fill="${cfg.skin === "deep" ? "#e58a92" : "#f6b9c7"}" stroke="none"/>
        <path d="M84 20L81.5 5 68 14Z" fill="${hair.base}" stroke-width="2"/>
        <path d="M79.5 16L78.2 9 71.8 13.5Z" fill="${cfg.skin === "deep" ? "#e58a92" : "#f6b9c7"}" stroke="none"/>`;
    case "flower":
      return `<g fill="${a}" stroke-width="1.5">
        <circle cx="77.5" cy="20.5" r="3.4"/><circle cx="83.5" cy="23" r="3.4"/>
        <circle cx="81" cy="29" r="3.4"/><circle cx="75" cy="27" r="3.4"/></g>
        <circle cx="78.5" cy="25" r="2.2" fill="#e8c07d" stroke-width="1.3"/>`;
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
 * 生成一个头像的完整 SVG 字符串（同步，可直接 innerHTML）。
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

  const eyeDef = eyeDefs(cfg, iris, m, eyeId);
  const cls = className ? ` class="${String(className).replace(/"/g, "&quot;")}"` : "";

  const body = bodyMarkup(cfg, skin, cloth, gradId);
  const face = faceMarkup(cfg, skin, hair, iris, m, eyeId);
  const inner = `<defs><linearGradient id="${gradId}" x2="0" y2="1"><stop stop-color="${cloth.light}"/><stop offset="1" stop-color="${cloth.base}"/></linearGradient>${eyeDef}</defs><g fill="none" stroke="${OUTLINE}" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">${hairBackMarkup(cfg, hair)}${body}${face}${hairFrontMarkup(cfg, hair)}${hairExtrasMarkup(cfg, hair, cfg.accent)}${cfg.hairStyle === "braid" ? braidMarkup(hair, cfg.accent) : ""}${accessoryMarkup(cfg, skin, hair)}</g>`;

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120" width="${px}" height="${px}"${cls} aria-hidden="true">${compact(inner)}</svg>`;
}

/* 压掉多余空格 / 小数前导 0 / 冗余的 fill="none"，24 张合计才装得进 80KB 预算 */
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