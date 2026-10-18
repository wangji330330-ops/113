import { CONDITION_TYPES } from "./data.js";

const ESCAPES = {
  "&": "&amp;",
  "<": "&lt;",
  ">": "&gt;",
  '"': "&quot;",
  "'": "&#39;"
};

export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, (char) => ESCAPES[char]);
}

export function pad2(value) {
  return String(value).padStart(2, "0");
}

export function dateLabel(date = new Date()) {
  const weekday = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${weekday}`;
}

export function dateKicker(date = new Date()) {
  const weekday = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"][date.getDay()];
  return `${date.getFullYear()}.${pad2(date.getMonth() + 1)}.${pad2(date.getDate())} / ${weekday}`;
}

export function timeBucket(date = new Date()) {
  const hour = date.getHours();
  if (hour < 5) return "night";
  if (hour < 8) return "dawn";
  if (hour < 11) return "morning";
  if (hour < 14) return "noon";
  if (hour < 18) return "afternoon";
  if (hour < 23) return "evening";
  return "night";
}

export function greetingFor(bucket, name = "") {
  const greetings = {
    dawn: "天快亮了",
    morning: "早上好",
    noon: "中午好",
    afternoon: "下午好",
    evening: "晚上好",
    night: "夜深了"
  };
  const base = greetings[bucket] || "你好";
  return name ? `${base}，${esc(name)}` : base;
}

export function pickDaily(list, seed = new Date()) {
  const dayNumber = Math.floor(
    new Date(seed.getFullYear(), seed.getMonth(), seed.getDate(), 12).getTime() / 86400000
  );
  return list[Math.abs(dayNumber) % list.length];
}

export function shortDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getMonth() + 1} 月 ${date.getDate()} 日`;
}

export function conditionText(type, value) {
  const condition = CONDITION_TYPES[type] || CONDITION_TYPES.days;
  return `${condition.label} ${value} ${condition.unit}`;
}

export function conditionUnit(type) {
  return (CONDITION_TYPES[type] || CONDITION_TYPES.days).unit;
}

export function monthTitle(year, month) {
  return `${year} 年 ${month} 月`;
}

export function clamp(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

export function pointsWord(points) {
  return `${points} 微光`;
}
