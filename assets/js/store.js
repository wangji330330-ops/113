/*
 * 本地数据。
 * 所有内容只存在这台设备的 localStorage 里，不上传。
 */

const KEY = "riji:v1";
const LEGACY = ["glimmer-nook:v1", "glimmer-nook:deepseek", "glimmer-nook:chat"];

const WEEK = ["星期日", "星期一", "星期二", "星期三", "星期四", "星期五", "星期六"];

const MOODS = [
  { id: "low", label: "低落" },
  { id: "meh", label: "平静" },
  { id: "ok", label: "还行" },
  { id: "good", label: "不错" },
  { id: "great", label: "很好" }
];

let state = load();

function blankState() {
  return {
    version: 1,
    entries: {},
    settings: { theme: "auto", font: "m" }
  };
}

function isEmpty(entry) {
  return !entry.text.trim() && !entry.mood;
}

function load() {
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "null");
    if (!raw || typeof raw !== "object") return blankState();
    const base = blankState();
    const entries = {};
    if (raw.entries && typeof raw.entries === "object") {
      for (const [k, v] of Object.entries(raw.entries)) {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== "object") continue;
        const entry = {
          text: typeof v.text === "string" ? v.text : "",
          mood: MOODS.some((m) => m.id === v.mood) ? v.mood : "",
          updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : ""
        };
        if (!isEmpty(entry)) entries[k] = entry;
      }
    }
    const settings = {
      theme: ["auto", "light", "dark"].includes(raw.settings?.theme) ? raw.settings.theme : "auto",
      font: ["s", "m", "l"].includes(raw.settings?.font) ? raw.settings.font : "m"
    };
    return { ...base, entries, settings };
  } catch {
    return blankState();
  }
}

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    return false;
  }
  return true;
}

export function removeLegacyData() {
  for (const k of LEGACY) {
    try {
      localStorage.removeItem(k);
    } catch {
      /* ignore */
    }
  }
}

/* ---------------------------------------------------------------- 日期 */

export function dateKey(date = new Date()) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayKey() {
  return dateKey(new Date());
}

export function parseKey(key) {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m || 1) - 1, d || 1);
}

export function weekday(key) {
  return WEEK[parseKey(key).getDay()];
}

export function relativeLabel(key) {
  const today = todayKey();
  if (key === today) return "今天";
  const diff = Math.round((parseKey(today) - parseKey(key)) / 86400000);
  if (diff === 1) return "昨天";
  if (diff === 2) return "前天";
  if (diff === -1) return "明天";
  return "";
}

export function dayOfYear(key) {
  const date = parseKey(key);
  const start = new Date(date.getFullYear(), 0, 1);
  return Math.floor((date - start) / 86400000) + 1;
}

export function daysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

export function firstWeekday(year, month) {
  return new Date(year, month - 1, 1).getDay();
}

/* ---------------------------------------------------------------- 读写 */

export function getEntry(key) {
  const entry = state.entries[key];
  if (!entry) return { text: "", mood: "", updatedAt: "" };
  return entry;
}

export function hasEntry(key) {
  const entry = state.entries[key];
  return Boolean(entry && !isEmpty(entry));
}

export function updateEntry(key, patch) {
  const current = getEntry(key);
  const next = {
    text: patch.text !== undefined ? patch.text : current.text,
    mood: patch.mood !== undefined ? patch.mood : current.mood,
    updatedAt: new Date().toISOString()
  };
  if (isEmpty(next)) {
    delete state.entries[key];
  } else {
    state.entries[key] = next;
  }
  persist();
  return next;
}

export function allEntries() {
  return Object.keys(state.entries)
    .sort()
    .reverse()
    .map((key) => ({ key, ...state.entries[key] }));
}

export function entryCount() {
  return Object.keys(state.entries).length;
}

/* ---------------------------------------------------------------- 统计 */

export function stats() {
  const keys = Object.keys(state.entries).sort();
  let chars = 0;
  for (const key of keys) chars += state.entries[key].text.replace(/\s/g, "").length;

  const today = todayKey();
  let streak = 0;
  const cursor = parseKey(today);
  let first = true;
  while (true) {
    const k = dateKey(cursor);
    if (state.entries[k] && !isEmpty(state.entries[k])) {
      streak += 1;
      cursor.setDate(cursor.getDate() - 1);
      first = false;
      continue;
    }
    if (first) {
      // 今天还没写，不算断
      cursor.setDate(cursor.getDate() - 1);
      first = false;
      continue;
    }
    break;
  }

  const monthPrefix = today.slice(0, 7);
  const monthCount = keys.filter((k) => k.startsWith(monthPrefix)).length;

  return {
    days: keys.length,
    chars,
    streak,
    monthCount,
    firstKey: keys[0] || "",
    lastKey: keys[keys.length - 1] || ""
  };
}

/* ---------------------------------------------------------------- 设置 */

export function getSettings() {
  return { ...state.settings };
}

export function setSetting(key, value) {
  if (!(key in state.settings)) return;
  state.settings[key] = value;
  persist();
}

/* ---------------------------------------------------------------- 导入导出 */

export function exportObject() {
  return {
    app: "日记",
    exportedAt: new Date().toISOString(),
    version: 1,
    entries: state.entries,
    settings: state.settings
  };
}

export function exportMarkdown() {
  const list = allEntries();
  if (!list.length) return "# 日记\n\n还没有写过。\n";
  const parts = ["# 日记\n"];
  for (const entry of list) {
    const mood = MOODS.find((m) => m.id === entry.mood);
    parts.push(`## ${entry.key} ${weekday(entry.key)}${mood ? ` · ${mood.label}` : ""}\n`);
    parts.push(`${entry.text.trim() || "（这天只标了心情）"}\n`);
  }
  return parts.join("\n");
}

export function importObject(raw) {
  if (!raw || typeof raw !== "object" || !raw.entries || typeof raw.entries !== "object") {
    throw new Error("这不是一份日记备份。");
  }
  let added = 0;
  for (const [k, v] of Object.entries(raw.entries)) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(k) || !v || typeof v !== "object") continue;
    const entry = {
      text: typeof v.text === "string" ? v.text : "",
      mood: MOODS.some((m) => m.id === v.mood) ? v.mood : "",
      updatedAt: typeof v.updatedAt === "string" ? v.updatedAt : ""
    };
    if (isEmpty(entry)) continue;
    const existing = state.entries[k];
    if (!existing || entry.text.length > existing.text.length) {
      state.entries[k] = entry;
      added += 1;
    }
  }
  if (raw.settings && typeof raw.settings === "object") {
    if (["auto", "light", "dark"].includes(raw.settings.theme)) state.settings.theme = raw.settings.theme;
    if (["s", "m", "l"].includes(raw.settings.font)) state.settings.font = raw.settings.font;
  }
  persist();
  return added;
}

export function clearAll() {
  state = blankState();
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

export { MOODS, WEEK };

/* ---------------------------------------------------------------- 搜索 */

export function searchEntries(query) {
  const q = String(query || "").trim().toLowerCase();
  if (!q) return [];
  return allEntries()
    .filter((entry) => entry.text.toLowerCase().includes(q))
    .slice(0, 60);
}

export function randomPastKey(exclude = "") {
  const keys = Object.keys(state.entries).filter((k) => k !== exclude);
  if (!keys.length) return "";
  return keys[Math.floor(Math.random() * keys.length)];
}
