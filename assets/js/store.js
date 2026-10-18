import {
  STORE_KEY,
  STARTER_HABITS,
  STARTER_REWARDS,
  EFFORTS,
  ENERGY,
  CONDITION_TYPES,
  levelFor
} from "./data.js";
import { DEFAULT_LOOK, normalizeLook } from "./character.js";

const MAX_DONE_PER_DAY = 60;

export function uid(prefix = "id") {
  if (globalThis.crypto && typeof globalThis.crypto.randomUUID === "function") {
    return `${prefix}_${globalThis.crypto.randomUUID()}`;
  }
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 9)}`;
}

export function dateKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function dateFromKey(key) {
  const [year, month, day] = String(key).split("-").map(Number);
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

export function addDays(key, amount) {
  const date = dateFromKey(key);
  date.setDate(date.getDate() + amount);
  return dateKey(date);
}

export function monthKey(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function isToday(key) {
  return key === dateKey();
}

function nowIso() {
  return new Date().toISOString();
}

function clampText(value, max) {
  return String(value ?? "").replace(/\s+/g, " ").trim().slice(0, max);
}

function safeId(value, prefix) {
  const id = String(value || "");
  return /^[A-Za-z0-9_-]{1,80}$/.test(id) ? id : uid(prefix);
}

function makeHabit(seed = {}) {
  const effort = Number(seed.effort) in EFFORTS ? Number(seed.effort) : 2;
  return {
    id: safeId(seed.id, "habit"),
    name: clampText(seed.name, 30) || "一件小事",
    icon: seed.icon || "spark",
    effort,
    active: seed.active !== false,
    createdAt: seed.createdAt || nowIso(),
    updatedAt: seed.updatedAt || nowIso()
  };
}

function makeReward(seed = {}) {
  const type = seed.condition && CONDITION_TYPES[seed.condition.type]
    ? seed.condition.type
    : "days";
  const value = Math.max(1, Math.min(9999, Math.round(Number(seed.condition?.value)) || CONDITION_TYPES[type].default));
  return {
    id: safeId(seed.id, "reward"),
    title: clampText(seed.title, 40) || "给自己的小奖励",
    note: clampText(seed.note, 120),
    icon: seed.icon || "gift",
    condition: { type, value },
    createdAt: seed.createdAt || nowIso(),
    updatedAt: seed.updatedAt || nowIso(),
    unlockedAt: seed.unlockedAt || null,
    claimedAt: seed.claimedAt || null
  };
}

function makeLogEntry(raw = {}) {
  const energy = Object.prototype.hasOwnProperty.call(ENERGY, raw.energy) ? raw.energy : null;
  const seen = new Set();
  const done = [];
  if (Array.isArray(raw.done)) {
    for (const item of raw.done.slice(0, MAX_DONE_PER_DAY)) {
      const habitId = typeof item === "string" ? item : item?.habitId;
      if (!habitId || seen.has(habitId)) continue;
      seen.add(habitId);
      const points = Math.max(1, Math.min(3, Math.round(Number(item?.points)) || 1));
      done.push({ habitId: String(habitId), points, at: item?.at || nowIso() });
    }
  }
  return {
    energy,
    done,
    rest: Boolean(raw.rest),
    restAt: raw.restAt || null,
    note: clampText(raw.note, 280),
    noteAt: raw.noteAt || null
  };
}

function createInitialState() {
  const now = nowIso();
  return {
    version: 1,
    profile: {
      name: "",
      createdAt: now,
      onboarded: false,
      look: { ...DEFAULT_LOOK }
    },
    settings: {
      sound: true,
      motion: true
    },
    habits: STARTER_HABITS.map((habit) => makeHabit({ ...habit, createdAt: now })),
    rewards: STARTER_REWARDS.map((reward) => makeReward({ ...reward, createdAt: now })),
    logs: {},
    meta: {
      lastOpenAt: now,
      updatedAt: now
    }
  };
}

function sanitizeState(raw, { strict = false } = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) {
    throw new Error("这不是一份微光小屋的备份。");
  }
  if (strict && (!Array.isArray(raw.habits) || !Array.isArray(raw.rewards) || typeof raw.logs !== "object")) {
    throw new Error("备份文件缺少必要的数据。");
  }
  const base = createInitialState();
  const profile = raw.profile && typeof raw.profile === "object" ? raw.profile : {};
  const settings = raw.settings && typeof raw.settings === "object" ? raw.settings : {};
  const habits = Array.isArray(raw.habits)
    ? raw.habits.filter((habit) => habit && typeof habit === "object").map(makeHabit)
    : base.habits;
  const rewards = Array.isArray(raw.rewards)
    ? raw.rewards.filter((reward) => reward && typeof reward === "object").map(makeReward)
    : base.rewards;
  const logs = {};
  if (raw.logs && typeof raw.logs === "object" && !Array.isArray(raw.logs)) {
    for (const [key, entry] of Object.entries(raw.logs)) {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(key)) continue;
      logs[key] = makeLogEntry(entry && typeof entry === "object" ? entry : {});
    }
  }
  return {
    version: 1,
    profile: {
      name: clampText(profile.name, 20),
      createdAt: profile.createdAt || base.profile.createdAt,
      onboarded: Boolean(profile.onboarded),
      look: normalizeLook(profile.look)
    },
    settings: {
      sound: settings.sound !== false,
      motion: settings.motion !== false
    },
    habits,
    rewards,
    logs,
    meta: {
      lastOpenAt: nowIso(),
      updatedAt: nowIso()
    }
  };
}

function loadState() {
  if (typeof localStorage === "undefined") return createInitialState();
  let raw = null;
  try {
    raw = localStorage.getItem(STORE_KEY);
  } catch {
    return createInitialState();
  }
  if (!raw) return createInitialState();
  try {
    const parsed = JSON.parse(raw);
    return sanitizeState(parsed);
  } catch (error) {
    console.warn("微光小屋：本地数据读取失败，已保留原数据副本。", error);
    try {
      localStorage.setItem(`${STORE_KEY}:broken`, raw);
    } catch {
      /* storage might be full or blocked */
    }
    return createInitialState();
  }
}

let state = loadState();

function persist() {
  if (typeof localStorage === "undefined") return;
  try {
    state.meta.updatedAt = nowIso();
    state.meta.lastOpenAt = nowIso();
    localStorage.setItem(STORE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn("微光小屋：暂时无法保存数据。", error);
  }
}

export function getState() {
  return state;
}

export function ensureTodayLog() {
  const key = dateKey();
  if (!state.logs[key]) {
    state.logs[key] = makeLogEntry({});
  }
  return state.logs[key];
}

export function getLog(key = dateKey()) {
  return state.logs[key] || null;
}

export function setProfileName(name) {
  state.profile.name = clampText(name, 20);
  persist();
  return state.profile.name;
}

export function setLook(look) {
  state.profile.look = normalizeLook(look);
  persist();
  return state.profile.look;
}

export function getLook() {
  return normalizeLook(state.profile.look);
}

export function completeOnboarding(name) {
  state.profile.name = clampText(name, 20);
  state.profile.onboarded = true;
  persist();
}

export function setSetting(key, value) {
  if (key !== "sound" && key !== "motion") return;
  state.settings[key] = Boolean(value);
  persist();
}

export function setEnergy(energy) {
  const log = ensureTodayLog();
  log.energy = Object.prototype.hasOwnProperty.call(ENERGY, energy) ? energy : null;
  persist();
  return log.energy;
}

export function setNote(note) {
  const log = ensureTodayLog();
  log.note = clampText(note, 280);
  log.noteAt = log.note ? nowIso() : null;
  persist();
  return log.note;
}

function activeDayKeys() {
  return Object.entries(state.logs)
    .filter(([, log]) => (Array.isArray(log.done) && log.done.length > 0) || log.rest)
    .map(([key]) => key)
    .sort();
}

export function getStats() {
  const keys = activeDayKeys();
  const activeSet = new Set(keys);
  let totalTasks = 0;
  let totalPoints = 0;
  const tasksByHabit = {};
  for (const log of Object.values(state.logs)) {
    if (!Array.isArray(log.done)) continue;
    totalTasks += log.done.length;
    for (const entry of log.done) {
      totalPoints += Number(entry.points) || 0;
      tasksByHabit[entry.habitId] = (tasksByHabit[entry.habitId] || 0) + 1;
    }
  }

  const today = dateKey();
  let cursor = activeSet.has(today) ? today : addDays(today, -1);
  let currentStreak = 0;
  while (activeSet.has(cursor)) {
    currentStreak += 1;
    cursor = addDays(cursor, -1);
  }

  let longestStreak = 0;
  let run = 0;
  let previous = null;
  for (const key of keys) {
    run = previous && addDays(previous, 1) === key ? run + 1 : 1;
    longestStreak = Math.max(longestStreak, run);
    previous = key;
  }

  const thisMonth = monthKey();
  const monthActiveDays = keys.filter((key) => key.startsWith(thisMonth)).length;
  const claimable = state.rewards.filter((reward) => reward.unlockedAt && !reward.claimedAt).length;
  const claimed = state.rewards.filter((reward) => reward.claimedAt).length;
  const todayLog = state.logs[today] || null;

  return {
    today,
    activeDays: keys,
    totalDays: keys.length,
    totalTasks,
    totalPoints,
    tasksByHabit,
    currentStreak,
    longestStreak,
    ongoingToday: Boolean(todayLog && ((todayLog.done && todayLog.done.length) || todayLog.rest)),
    monthActiveDays,
    claimableCount: claimable,
    claimedCount: claimed,
    rewardCount: state.rewards.length,
    level: levelFor(totalPoints)
  };
}

export function rewardProgress(reward, stats = getStats()) {
  const type = reward.condition.type;
  const value = Math.max(1, Number(reward.condition.value) || 1);
  let current = 0;
  if (type === "days") current = stats.totalDays;
  else if (type === "tasks") current = stats.totalTasks;
  else if (type === "points") current = stats.totalPoints;
  else if (type === "streak") current = stats.longestStreak;
  return {
    current: Math.min(current, value),
    rawCurrent: current,
    value,
    remaining: Math.max(0, value - current),
    pct: value > 0 ? Math.min(1, current / value) : 1,
    met: current >= value
  };
}

export function refreshRewards() {
  const stats = getStats();
  const unlocked = [];
  for (const reward of state.rewards) {
    if (reward.claimedAt) {
      reward.unlockedAt = reward.unlockedAt || reward.claimedAt;
      continue;
    }
    const progress = rewardProgress(reward, stats);
    if (!reward.unlockedAt && progress.met) {
      reward.unlockedAt = nowIso();
      unlocked.push(reward);
    }
  }
  return unlocked;
}

export function toggleHabitDone(habitId) {
  const habit = state.habits.find((item) => item.id === habitId);
  if (!habit || !habit.active) return null;
  const log = ensureTodayLog();
  const index = log.done.findIndex((entry) => entry.habitId === habitId);
  let completed;
  if (index >= 0) {
    log.done.splice(index, 1);
    completed = false;
  } else {
    log.done.push({
      habitId,
      points: EFFORTS[habit.effort]?.points || 1,
      at: nowIso()
    });
    completed = true;
  }
  const unlocked = refreshRewards();
  persist();
  return {
    completed,
    points: EFFORTS[habit.effort]?.points || 1,
    unlocked
  };
}

export function markRest() {
  const log = ensureTodayLog();
  const wasRest = log.rest;
  log.rest = true;
  log.restAt = log.restAt || nowIso();
  const unlocked = refreshRewards();
  persist();
  return { wasRest, unlocked };
}

export function addHabit(data) {
  const habit = makeHabit(data);
  state.habits.unshift(habit);
  persist();
  return habit;
}

export function updateHabit(id, patch) {
  const habit = state.habits.find((item) => item.id === id);
  if (!habit) return null;
  if (patch.name !== undefined) habit.name = clampText(patch.name, 30) || habit.name;
  if (patch.icon !== undefined) habit.icon = String(patch.icon);
  if (patch.effort !== undefined && Number(patch.effort) in EFFORTS) habit.effort = Number(patch.effort);
  if (patch.active !== undefined) habit.active = Boolean(patch.active);
  habit.updatedAt = nowIso();
  persist();
  return habit;
}

export function deleteHabit(id) {
  const before = state.habits.length;
  state.habits = state.habits.filter((habit) => habit.id !== id);
  persist();
  return state.habits.length !== before;
}

export function addReward(data) {
  const reward = makeReward(data);
  state.rewards.unshift(reward);
  const unlocked = refreshRewards();
  persist();
  return { reward, unlocked };
}

export function updateReward(id, patch) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward) return null;
  if (patch.title !== undefined) reward.title = clampText(patch.title, 40) || reward.title;
  if (patch.note !== undefined) reward.note = clampText(patch.note, 120);
  if (patch.icon !== undefined) reward.icon = String(patch.icon);
  if (patch.condition && CONDITION_TYPES[patch.condition.type]) {
    const type = patch.condition.type;
    const value = Math.max(1, Math.min(9999, Math.round(Number(patch.condition.value)) || CONDITION_TYPES[type].default));
    if (reward.condition.type !== type || reward.condition.value !== value) {
      reward.unlockedAt = null;
      if (reward.claimedAt) reward.claimedAt = null;
      reward.condition = { type, value };
    }
  }
  reward.updatedAt = nowIso();
  const unlocked = refreshRewards();
  persist();
  return { reward, unlocked };
}

export function claimReward(id) {
  const reward = state.rewards.find((item) => item.id === id);
  if (!reward || !reward.unlockedAt || reward.claimedAt) return null;
  reward.claimedAt = nowIso();
  persist();
  return reward;
}

export function deleteReward(id) {
  const before = state.rewards.length;
  state.rewards = state.rewards.filter((reward) => reward.id !== id);
  persist();
  return state.rewards.length !== before;
}

export function getHabitCompletionCount(habitId) {
  let count = 0;
  for (const log of Object.values(state.logs)) {
    if (log.done.some((entry) => entry.habitId === habitId)) count += 1;
  }
  return count;
}

export function getTodayOverview() {
  const log = state.logs[dateKey()] || null;
  const activeHabits = state.habits.filter((habit) => habit.active);
  const doneIds = new Set(log?.done.map((entry) => entry.habitId) || []);
  const doneCount = activeHabits.filter((habit) => doneIds.has(habit.id)).length;
  return {
    log,
    activeHabits,
    doneIds,
    doneCount,
    total: activeHabits.length,
    allDone: activeHabits.length > 0 && doneCount === activeHabits.length,
    todayPoints: (log?.done || []).reduce((sum, entry) => sum + (Number(entry.points) || 0), 0)
  };
}

export function getNextReward() {
  const stats = getStats();
  const unclaimed = state.rewards.filter((reward) => !reward.claimedAt);
  if (!unclaimed.length) return null;
  const claimable = unclaimed.find((reward) => reward.unlockedAt);
  if (claimable) {
    return { reward: claimable, progress: rewardProgress(claimable, stats), claimable: true };
  }
  const ranked = unclaimed
    .map((reward) => ({ reward, progress: rewardProgress(reward, stats) }))
    .sort((a, b) => b.progress.pct - a.progress.pct || a.progress.remaining - b.progress.remaining);
  return { ...ranked[0], claimable: false };
}

export function getMonthGrid(year, month) {
  const first = new Date(year, month - 1, 1, 12);
  const daysInMonth = new Date(year, month, 0, 12).getDate();
  const mondayOffset = (first.getDay() + 6) % 7;
  const cells = [];
  for (let i = 0; i < mondayOffset; i += 1) cells.push(null);
  for (let day = 1; day <= daysInMonth; day += 1) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const log = state.logs[key];
    const taskCount = log?.done?.length || 0;
    cells.push({
      day,
      key,
      taskCount,
      rest: Boolean(log?.rest),
      shown: taskCount > 0 || Boolean(log?.rest),
      isToday: key === dateKey(),
      isFuture: key > dateKey()
    });
  }
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function exportData() {
  return JSON.stringify({
    app: "glimmer-nook",
    exportedAt: nowIso(),
    version: 1,
    state
  }, null, 2);
}

export function importData(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new Error("文件不是有效的 JSON，可能下载不完整。");
  }
  const payload = parsed.state || parsed;
  if (!payload || !Array.isArray(payload.habits) || !Array.isArray(payload.rewards) || typeof payload.logs !== "object") {
    throw new Error("这不是微光小屋的备份文件。");
  }
  const next = sanitizeState(payload, { strict: true });
  state = next;
  refreshRewards();
  persist();
  return state;
}

export function resetAll() {
  try {
    localStorage.removeItem(STORE_KEY);
  } catch {
    /* ignore */
  }
  state = createInitialState();
  persist();
  return state;
}

// Unlock rewards that were earned before this version or in a previous session.
refreshRewards();
persist();
