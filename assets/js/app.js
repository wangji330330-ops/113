import {
  ALL_DONE_LINES,
  APP_BUILD,
  APP_VERSION,
  CHANGELOG,
  CHECK_LINES,
  CONDITION_TYPES,
  EFFORTS,
  ENERGY,
  HABIT_ICON_LABELS,
  HABIT_ICONS,
  IDLE_LINES,
  POKE_LINES,
  REST_LINES,
  REWARD_ICON_LABELS,
  REWARD_ICONS
} from "./data.js";
import * as store from "./store.js";
import { icon } from "./icons.js";
import { audio } from "./audio.js";
import { paintPortrait } from "./scene.js";
import { PlaceScene, paintPlacePreview } from "./places.js";
import { PLACES, getPlace } from "./place-data.js";
import {
  ChatError,
  appendChatMessage,
  clearChatKey,
  clearChatMessages,
  getChatMessages,
  getChatSettings,
  hasChatKey,
  maskKey,
  saveChatSettings,
  sendChatMessage
} from "./chat.js";
import {
  LOOK_PARTS,
  normalizeLook,
  paintPersonPreview,
  randomLook
} from "./character.js";
import {
  applyWebUpdate,
  checkForUpdate,
  compareVersions,
  isAndroidShell,
  openExternal,
  platformLabel,
  shouldCheckOnBoot
} from "./updater.js";
import {
  renderAppBar,
  renderDiary,
  renderHabits,
  renderMe,
  renderNav,
  renderPlaces,
  renderRewards,
  renderToday
} from "./views.js";
import {
  clamp,
  conditionUnit,
  esc
} from "./helpers.js";

const ROUTES = new Set(["today", "places", "habits", "diary", "rewards", "me"]);
const REDUCED_MOTION = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const now = new Date();

const ui = {
  route: "today",
  homePlace: null,
  scene: null,
  placeScene: null,
  activePlace: null,
  placeSpeech: "",
  placeSpeechUntil: 0,
  diaryTab: "journal",
  chatSending: false,
  chatError: "",
  previewToken: 0,
  speech: "",
  speechUntil: 0,
  lastLine: "",
  idleTimer: null,
  noteTimer: null,
  noteDraft: null,
  pendingCelebrate: false,
  focusAfterRender: null,
  calendar: { year: now.getFullYear(), month: now.getMonth() + 1 },
  modalDismissible: true,
  lastFocus: null,
  modalTimer: null,
  confirmAction: null,
  breatheTimer: null,
  breatheUnlocked: [],
  breatheCompleted: false,
  wardrobe: null,
  versionInfo: null,
  updateAvailable: false,
  updateChecking: false,
  booted: false,
  currentDay: store.dateKey()
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

function parseRoute() {
  const raw = String(location.hash || "").replace(/^#\/?/, "").split(/[/?]/)[0];
  return ROUTES.has(raw) ? raw : "today";
}

function pickHomePlace(exclude = "") {
  const pool = PLACES.filter((place) => place.id !== exclude);
  return pool[Math.floor(Math.random() * pool.length)]?.id || PLACES[0].id;
}

function getHomePlace() {
  if (!ui.homePlace) ui.homePlace = pickHomePlace();
  return getPlace(ui.homePlace);
}

function pickLine(list) {
  if (!list.length) return "";
  let line = list[Math.floor(Math.random() * list.length)];
  if (list.length > 1) {
    let guard = 0;
    while (line === ui.lastLine && guard < 6) {
      line = list[Math.floor(Math.random() * list.length)];
      guard += 1;
    }
  }
  ui.lastLine = line;
  return line;
}

function say(text, duration = 4600) {
  if (!text) return;
  ui.speech = text;
  ui.speechUntil = Date.now() + duration;
  updateSpeechDom();
}

function updateSpeechDom() {
  const el = $("#scene-speech");
  if (!el || !ui.speech) return;
  el.textContent = ui.speech;
  el.classList.remove("is-bump");
  void el.offsetWidth;
  el.classList.add("is-bump");
}

function currentSpeech() {
  if (ui.speech && ui.speechUntil > Date.now()) return ui.speech;
  ui.speech = pickLine(IDLE_LINES);
  ui.speechUntil = Date.now() + 7000;
  return ui.speech;
}

function setDocumentTitle() {
  const titles = {
    today: "微光小屋 · 一点点也算数",
    places: "去走走 · 微光小屋",
    habits: "我的小事 · 微光小屋",
    diary: "日记本 · 微光小屋",
    rewards: "给自己的奖励 · 微光小屋",
    me: "我的小屋 · 微光小屋"
  };
  document.title = titles[ui.route] || titles.today;
}

function renderShell({ focusPage = false, animatePage = true } = {}) {
  const state = store.getState();
  const stats = store.getStats();
  document.documentElement.classList.toggle("no-motion", !state.settings.motion);
  $("#app-bar").innerHTML = renderAppBar({ state, stats });
  $("#bottom-nav").innerHTML = renderNav({
    route: ui.route,
    claimableCount: stats.claimableCount,
    updateAvailable: ui.updateAvailable
  });
  renderPage({ focusPage, animatePage });
}

function renderPage({ focusPage = false, animatePage = true } = {}) {
  cleanupPage();
  const state = store.getState();
  const stats = store.getStats();
  const page = $("#page");
  let html = "";
  if (ui.route === "today") {
    const overview = store.getTodayOverview();
    html = renderToday({ state, stats, overview, speech: currentSpeech(), homePlace: getHomePlace() });
  } else if (ui.route === "places") {
    html = renderPlaces({
      state,
      activePlace: ui.activePlace,
      speech: ui.activePlace ? currentPlaceSpeech() : ""
    });
  } else if (ui.route === "habits") {
    html = renderHabits({ state, stats });
  } else if (ui.route === "diary") {
    const entries = store.getDiaryEntries();
    html = renderDiary({
      state,
      entries,
      todayNote: store.getNoteForDate(),
      todayKey: store.dateKey(),
      tab: ui.diaryTab,
      chatMessages: getChatMessages(),
      chatSettings: getChatSettings(),
      chatConfigured: hasChatKey(),
      chatSending: ui.chatSending,
      chatError: ui.chatError
    });
  } else if (ui.route === "rewards") {
    html = renderRewards({ state, stats });
  } else {
    html = renderMe({
      state,
      stats,
      calendar: ui.calendar,
      versionInfo: ui.versionInfo,
      updateAvailable: ui.updateAvailable,
      platform: platformLabel()
    });
  }
  page.className = `page page--${ui.route}`;
  page.innerHTML = html;
  page.classList.remove("page-enter");
  if (animatePage) {
    void page.offsetWidth;
    page.classList.add("page-enter");
  }
  document.body.dataset.route = ui.route;
  setDocumentTitle();
  bindPage();
  if (focusPage) {
    try {
      page.focus({ preventScroll: true });
    } catch {
      page.focus();
    }
  }
  if (ui.focusAfterRender) {
    const selector = ui.focusAfterRender;
    ui.focusAfterRender = null;
    const target = $(selector);
    if (target && typeof target.focus === "function") {
      try {
        target.focus({ preventScroll: true });
      } catch {
        target.focus();
      }
    }
  }
}

function bindPage() {
  const look = store.getLook();
  if (ui.route === "today") {
    const canvas = $("#scene-canvas");
    const overview = store.getTodayOverview();
    if (canvas) {
      ui.scene = new PlaceScene(canvas, {
        place: getHomePlace(),
        mood: overview.log?.energy || null,
        look,
        motion: store.getState().settings.motion && !REDUCED_MOTION
      });
      if (ui.pendingCelebrate) {
        ui.pendingCelebrate = false;
        window.setTimeout(() => ui.scene?.celebrate(), 60);
      }
    }
    startIdleSpeech();
  } else if (ui.route === "places") {
    const placeCanvas = $("#place-canvas");
    if (placeCanvas && ui.activePlace) {
      ui.placeScene = new PlaceScene(placeCanvas, {
        place: getPlace(ui.activePlace),
        look,
        motion: store.getState().settings.motion && !REDUCED_MOTION
      });
    } else {
      const token = (ui.previewToken += 1);
      const canvases = $$("[data-place-preview]");
      let index = 0;
      const paintNext = () => {
        if (token !== ui.previewToken || ui.route !== "places" || ui.activePlace) return;
        const end = Math.min(index + 3, canvases.length);
        for (; index < end; index += 1) {
          const canvas = canvases[index];
          if (canvas && canvas.isConnected) paintPlacePreview(canvas, canvas.dataset.placePreview, look);
        }
        if (index < canvases.length) window.requestAnimationFrame(paintNext);
      };
      window.requestAnimationFrame(paintNext);
    }
  } else if (ui.route === "diary") {
    if (ui.diaryTab === "chat") {
      window.requestAnimationFrame(() => {
        const scroller = $("#chat-scroll");
        if (scroller) scroller.scrollTop = scroller.scrollHeight;
      });
    }
  } else if (ui.route === "me") {
    const portrait = $("#portrait-canvas");
    if (portrait) paintPortrait(portrait, look);
  }
}

function cleanupPage() {
  flushNote();
  ui.previewToken += 1;
  if (ui.scene) {
    ui.scene.destroy();
    ui.scene = null;
  }
  if (ui.placeScene) {
    ui.placeScene.destroy();
    ui.placeScene = null;
  }
  if (ui.idleTimer) {
    window.clearInterval(ui.idleTimer);
    ui.idleTimer = null;
  }
}

function currentPlaceSpeech() {
  if (ui.placeSpeech && ui.placeSpeechUntil > Date.now()) return ui.placeSpeech;
  const place = getPlace(ui.activePlace);
  ui.placeSpeech = pickLine(place.charLines);
  ui.placeSpeechUntil = Date.now() + 7000;
  return ui.placeSpeech;
}

function sayPlace(text, duration = 5000) {
  if (!text) return;
  ui.placeSpeech = text;
  ui.placeSpeechUntil = Date.now() + duration;
  const el = $("#place-speech");
  if (el) {
    el.textContent = text;
    el.classList.remove("is-bump");
    void el.offsetWidth;
    el.classList.add("is-bump");
  }
}

function startIdleSpeech() {
  if (ui.idleTimer) window.clearInterval(ui.idleTimer);
  ui.idleTimer = window.setInterval(() => {
    if (ui.route !== "today") return;
    if (Date.now() < ui.speechUntil) return;
    ui.speech = pickLine(IDLE_LINES);
    ui.speechUntil = Date.now() + 7000;
    updateSpeechDom();
  }, 13000);
}

function refreshAll({ celebrate = false, keepScroll = true, focus = null } = {}) {
  flushNote();
  ui.pendingCelebrate = Boolean(celebrate);
  ui.focusAfterRender = focus;
  const y = window.scrollY;
  renderShell({ animatePage: false });
  window.scrollTo({ top: keepScroll ? y : 0, left: 0, behavior: "auto" });
}

function flushNote() {
  if (ui.noteTimer) {
    window.clearTimeout(ui.noteTimer);
    ui.noteTimer = null;
  }
  if (ui.noteDraft !== null) {
    store.setNote(ui.noteDraft);
    ui.noteDraft = null;
    markNoteSaved("已保存");
  }
}

function transitionTo(route) {
  if (route === ui.route) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }
  if (!$("#modal-root").hidden && ui.modalDismissible) closeModal({ instant: true });
  clearToasts();
  ui.activePlace = null;
  ui.placeSpeech = "";
  ui.placeSpeechUntil = 0;
  ui.route = route;
  renderShell({ focusPage: true });
  window.scrollTo({ top: 0, left: 0, behavior: "auto" });
}

function boot() {
  const initial = parseRoute();
  ui.route = initial;
  if (!location.hash || !location.hash.startsWith("#/")) {
    history.replaceState(null, "", `#/${initial}`);
  }
  renderShell();
  document.body.classList.remove("is-booting");
  window.setTimeout(() => {
    const el = $("#boot");
    if (el) el.classList.add("is-hidden");
  }, 260);
  window.setTimeout(() => $("#boot")?.remove(), 900);
  ui.booted = true;
  bindGlobalEvents();
  audio.setEnabled(store.getState().settings.sound);
  if (!store.getState().profile.onboarded) {
    window.setTimeout(openOnboarding, 700);
  }
  window.setInterval(checkDayChange, 30000);
  registerServiceWorker();
  window.setTimeout(() => maybeCheckUpdatesOnBoot(), 2600);
}

function checkDayChange() {
  const today = store.dateKey();
  if (today === ui.currentDay) return;
  ui.currentDay = today;
  ui.speech = "";
  ui.speechUntil = 0;
  if (!$("#modal-root").hidden) return;
  if (ui.route === "today") {
    refreshAll({ keepScroll: true });
    window.setTimeout(() => toast("新的一天，小屋的灯又亮起来了。", { iconName: "lantern" }), 350);
  }
}

function registerServiceWorker() {
  if (!("serviceWorker" in navigator) || !location.protocol.startsWith("http")) return;
  if (["localhost", "127.0.0.1"].includes(location.hostname)) return;
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((error) => {
      console.warn("微光小屋：离线缓存暂时没有开启。", error);
    });
  });
}

/* ------------------------------------------------------------------ *
 * Actions
 * ------------------------------------------------------------------ */

function onDocumentClick(event) {
  const target = event.target instanceof Element ? event.target : null;
  if (!target) return;

  const nav = target.closest("a[data-nav]");
  if (nav) {
    audio.play("nav");
    const href = nav.getAttribute("href");
    const wasDiaryTab = ui.diaryTab;
    if (href === "#/diary") ui.diaryTab = "journal";
    if (href === `#/${ui.route}`) {
      event.preventDefault();
      if (ui.route === "places" && ui.activePlace) {
        ui.activePlace = null;
        ui.placeSpeech = "";
        renderShell({ focusPage: true });
        window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      } else if (ui.route === "diary" && wasDiaryTab !== "journal") {
        refreshAll({ keepScroll: false });
      } else {
        window.scrollTo({ top: 0, behavior: REDUCED_MOTION ? "auto" : "smooth" });
      }
    }
    return;
  }

  const actionEl = target.closest("[data-action]");
  if (!actionEl) return;
  const action = actionEl.dataset.action;
  if (action === "modal-backdrop") {
    if (event.target === actionEl && ui.modalDismissible) closeModal();
    return;
  }
  if (
    action === "open-deepseek-web" &&
    actionEl.tagName === "A" &&
    !(window.GlimmerAndroid && typeof window.GlimmerAndroid.openDeepSeekWeb === "function")
  ) {
    audio.play("nav");
    return;
  }
  if (actionEl.tagName === "A") event.preventDefault();
  handleAction(action, actionEl, event);
}

function handleAction(action, el) {
  switch (action) {
    case "close-modal":
      audio.play("click");
      closeModal();
      break;
    case "toggle-sound":
      toggleSound();
      break;
    case "toggle-setting":
      toggleSetting(el.dataset.key);
      break;
    case "set-energy":
      chooseEnergy(el.dataset.energy);
      break;
    case "poke-scene":
      pokeScene();
      break;
    case "home-hotspot":
      touchHomeHotspot(el.dataset.hotspot);
      break;
    case "go-places":
      audio.play("nav");
      location.hash = "#/places";
      break;
    case "open-place":
      openPlace(el.dataset.place);
      break;
    case "leave-place":
      leavePlace();
      break;
    case "place-character":
      pokePlaceCharacter();
      break;
    case "place-hotspot":
      touchPlaceHotspot(el.dataset.place, el.dataset.hotspot);
      break;
    case "place-stay":
      stayInPlace();
      break;
    case "go-today":
      audio.play("nav");
      location.hash = "#/today";
      break;
    case "open-wardrobe":
      audio.play("click");
      openWardrobe();
      break;
    case "look-tab":
      selectLookTab(el.dataset.part);
      break;
    case "look-choice":
      chooseLookOption(el.dataset.part, el.dataset.value);
      break;
    case "look-random":
      randomizeLook();
      break;
    case "save-look":
      saveLook();
      break;
    case "check-update":
      runUpdateCheck(true);
      break;
    case "open-changelog":
      audio.play("click");
      openChangelog();
      break;
    case "apply-update":
      applyUpdate();
      break;
    case "download-update":
      downloadUpdate();
      break;
    case "open-release":
      openExternal(ui.versionInfo?.releaseUrl || ui.versionInfo?.webUrl || "https://github.com/wangji330330-ops/113/releases");
      break;
    case "toggle-habit":
      toggleHabit(el.dataset.id, el);
      break;
    case "open-habit-modal":
      audio.play("click");
      openHabitModal();
      break;
    case "edit-habit":
      audio.play("click");
      openHabitModal(el.dataset.id);
      break;
    case "toggle-archive":
      toggleArchive(el.dataset.id);
      break;
    case "delete-habit":
      askDeleteHabit(el.dataset.id);
      break;
    case "open-reward-modal":
      audio.play("click");
      openRewardModal();
      break;
    case "edit-reward":
      audio.play("click");
      openRewardModal(el.dataset.id);
      break;
    case "delete-reward":
      askDeleteReward(el.dataset.id);
      break;
    case "claim-reward":
      claimReward(el.dataset.id);
      break;
    case "go-rewards":
      audio.play("nav");
      location.hash = "#/rewards";
      break;
    case "open-breathe":
      audio.play("click");
      openBreatheModal();
      break;
    case "start-breathe":
      startBreathe(el);
      break;
    case "finish-breathe":
      finishBreathe();
      break;
    case "edit-name":
      audio.play("click");
      openNameModal();
      break;
    case "export-data":
      exportData();
      break;
    case "import-data":
      audio.play("click");
      $("#import-file")?.click();
      break;
    case "reset-data":
      audio.play("click");
      askReset();
      break;
    case "cal-prev":
      changeMonth(-1);
      break;
    case "cal-next":
      changeMonth(1);
      break;
    case "step-condition":
      stepCondition(el);
      break;
    case "diary-tab":
      switchDiaryTab(el.dataset.tab);
      break;
    case "open-diary-chat":
      ui.diaryTab = "chat";
      ui.chatError = "";
      audio.play("nav");
      location.hash = "#/diary";
      if (ui.route === "diary") switchDiaryTab("chat");
      break;
    case "edit-diary-entry":
      audio.play("click");
      openDiaryEntryModal(el.dataset.date);
      break;
    case "open-chat-settings":
      audio.play("click");
      openChatSettings();
      break;
    case "open-chat-key-page":
      openExternal("https://platform.deepseek.com/api_keys");
      break;
    case "open-deepseek-web":
      openDeepSeekWeb();
      break;
    case "clear-chat-key":
      askClearChatKey();
      break;
    case "clear-chat":
      askClearChat();
      break;
    case "send-chat":
      sendChatFromInput();
      break;
    case "chat-prompt":
      sendChatTurn(el.dataset.text);
      break;
    case "confirm-yes":
      runConfirmedAction();
      break;
    default:
      break;
  }
}

function toggleSound(force) {
  const current = store.getState().settings.sound;
  const value = typeof force === "boolean" ? force : !current;
  store.setSetting("sound", value);
  audio.setEnabled(value);
  if (value) audio.play("click");
  syncSoundUI();
  syncSettingSwitch("sound", value);
}

function toggleSetting(key) {
  if (key === "sound") {
    toggleSound();
    return;
  }
  if (key === "motion") {
    const current = store.getState().settings.motion;
    const value = !current;
    store.setSetting("motion", value);
    document.documentElement.classList.toggle("no-motion", !value);
    syncSettingSwitch("motion", value);
    audio.play("click");
    toast(value ? "小屋的动画打开了。" : "小屋会安静一点。", { iconName: value ? "spark" : "moon" });
    return;
  }
}

function syncSoundUI() {
  const value = store.getState().settings.sound;
  const button = $(".sound-btn");
  if (button) {
    button.innerHTML = icon(value ? "sound" : "mute");
    button.setAttribute("aria-label", value ? "关闭音效" : "打开音效");
    button.setAttribute("aria-pressed", String(value));
  }
}

function syncSettingSwitch(key, value) {
  const row = $(`[role="switch"][data-key="${key}"]`);
  if (!row) return;
  row.setAttribute("aria-checked", String(value));
  row.querySelector(".switch")?.classList.toggle("is-on", value);
}

function chooseEnergy(energy) {
  if (!ENERGY[energy]) return;
  store.setEnergy(energy);
  $$(".energy-option").forEach((button) => {
    const active = button.dataset.energy === energy;
    button.classList.toggle("is-active", active);
    button.setAttribute("aria-pressed", String(active));
  });
  const note = $("#energy-note");
  if (note) note.textContent = ENERGY[energy].note;
  ui.scene?.setMood(energy);
  say(ENERGY[energy].reply, 4200);
  audio.play("click");
}

function pokeScene() {
  if (!ui.scene) return;
  ui.scene.poke();
  audio.play("click");
  say(pickLine(POKE_LINES), 3800);
  $("#scene-hint")?.classList.add("is-hidden");
}

function touchHomeHotspot(hotspotId) {
  const place = getHomePlace();
  const spot = place.hotspots.find((item) => item.id === hotspotId);
  if (!spot) return;
  ui.scene?.hit(spot);
  say(pickLine(spot.lines), 5200);
  audio.play("click");
  $("#scene-hint")?.classList.add("is-hidden");
}

function openPlace(id) {
  const place = PLACES.find((item) => item.id === id);
  if (!place) return;
  audio.play("nav");
  ui.activePlace = place.id;
  ui.placeSpeech = pickLine(place.charLines);
  ui.placeSpeechUntil = Date.now() + 7000;
  refreshAll({ keepScroll: false });
}

function leavePlace() {
  if (!ui.activePlace) return;
  audio.play("nav");
  ui.activePlace = null;
  ui.placeSpeech = "";
  ui.placeSpeechUntil = 0;
  refreshAll({ keepScroll: false, focus: '[data-action="open-place"]' });
}

function pokePlaceCharacter() {
  const place = getPlace(ui.activePlace);
  ui.placeScene?.poke();
  sayPlace(pickLine(place.charLines));
  audio.play("click");
  $(".place-frame .scene-hint")?.classList.add("is-hidden");
}

function touchPlaceHotspot(placeId, hotspotId) {
  const place = PLACES.find((item) => item.id === placeId);
  const spot = place?.hotspots.find((item) => item.id === hotspotId);
  if (!place || !spot) return;
  ui.placeScene?.hit(spot);
  sayPlace(pickLine(spot.lines));
  audio.play("click");
  $(".place-frame .scene-hint")?.classList.add("is-hidden");
}

function stayInPlace() {
  const place = getPlace(ui.activePlace);
  ui.placeScene?.poke();
  sayPlace(pickLine(place.stayLines));
  audio.play("breathe");
  $(".place-frame .scene-hint")?.classList.add("is-hidden");
}

function toggleHabit(id, el) {
  if (!id) return;
  const rect = el?.getBoundingClientRect();
  const result = store.toggleHabitDone(id);
  if (!result) {
    toast("这件小事已经收起来了，去「我的小事」里看看吧。", { iconName: "leaf" });
    return;
  }
  const overview = store.getTodayOverview();
  const line = result.completed
    ? overview.allDone
      ? pickLine(ALL_DONE_LINES)
      : pickLine(CHECK_LINES)
    : "取消啦，没关系。";
  say(line, 5200);
  if (result.completed) {
    audio.play("check");
    if (overview.allDone) {
      window.setTimeout(() => audio.play("reward"), 220);
      burstConfetti(18);
    }
  } else {
    audio.play("undo");
  }

  if (rect) {
    const x = clamp(rect.left + rect.width / 2, 32, window.innerWidth - 32);
    const y = clamp(rect.top + 22, 32, window.innerHeight - 32);
    floatPoints(x, y, result.completed ? `+${result.points} 微光` : `-${result.points} 微光`, result.completed ? "gold" : "muted");
  }

  refreshAll({
    celebrate: result.completed,
    keepScroll: true,
    focus: `[data-action="toggle-habit"][data-id="${id}"]`
  });
  notifyUnlocked(result.unlocked);
}

function toggleArchive(id) {
  const habit = store.getState().habits.find((item) => item.id === id);
  if (!habit) return;
  store.updateHabit(id, { active: !habit.active });
  audio.play("click");
  toast(habit.active ? "已经收起来了，想用时再放回来。" : "又回到今日清单里啦。", { iconName: "leaf" });
  refreshAll({ keepScroll: true });
}

function askDeleteHabit(id) {
  const habit = store.getState().habits.find((item) => item.id === id);
  if (!habit) return;
  closeModal({ instant: true });
  openConfirm({
    title: "删掉这件小事？",
    body: `「${esc(habit.name)}」会从清单里消失。过去的打卡记录会保留，但之后不能再补打。`,
    confirmLabel: "删掉",
    danger: true,
    onConfirm: () => {
      store.deleteHabit(id);
      refreshAll({ keepScroll: true });
      toast("已经删掉了。过去的记录还在。", { iconName: "leaf" });
    }
  });
}

function askDeleteReward(id) {
  const reward = store.getState().rewards.find((item) => item.id === id);
  if (!reward) return;
  closeModal({ instant: true });
  openConfirm({
    title: "删掉这份奖励？",
    body: `「${esc(reward.title)}」会从小屋里消失。已经攒下的记录不会改变。`,
    confirmLabel: "删掉",
    danger: true,
    onConfirm: () => {
      store.deleteReward(id);
      refreshAll({ keepScroll: true });
      toast("已经删掉了。下次再给自己设一个新的吧。", { iconName: "gift" });
    }
  });
}

function claimReward(id) {
  const reward = store.claimReward(id);
  if (!reward) return;
  audio.play("claim");
  burstConfetti(30);
  refreshAll({ keepScroll: true });
  openClaimModal(reward);
}

function changeMonth(delta) {
  const date = new Date(ui.calendar.year, ui.calendar.month - 1 + delta, 1, 12);
  const current = new Date();
  if (date.getFullYear() > current.getFullYear() || (date.getFullYear() === current.getFullYear() && date.getMonth() + 1 > current.getMonth() + 1)) {
    return;
  }
  ui.calendar = { year: date.getFullYear(), month: date.getMonth() + 1 };
  audio.play("nav");
  refreshAll({
    keepScroll: true,
    focus: delta < 0 ? '[data-action="cal-prev"]' : '[data-action="cal-next"]'
  });
}

/* ------------------------------------------------------------------ *
 * Note
 * ------------------------------------------------------------------ */

function markNoteSaved(text = "已保存") {
  $$("[data-save-state]").forEach((el) => {
    el.textContent = text;
  });
}

function onNoteInput(event) {
  if (!event.target.matches("[data-note]")) return;
  const value = event.target.value;
  $$("[data-note-count]").forEach((el) => {
    el.textContent = `${value.length} 字`;
  });
  markNoteSaved("正在写…");
  ui.noteDraft = value;
  if (ui.noteTimer) window.clearTimeout(ui.noteTimer);
  ui.noteTimer = window.setTimeout(() => {
    store.setNote(value);
    ui.noteTimer = null;
    ui.noteDraft = null;
    markNoteSaved("已保存");
  }, 380);
}

function onChatInput(event) {
  const input = event.target.closest?.("#chat-input");
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
}

/* ------------------------------------------------------------------ *
 * Diary & DeepSeek chat
 * ------------------------------------------------------------------ */

function diaryFullDate(key) {
  const date = new Date(`${key}T12:00:00`);
  const week = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${week}`;
}

function switchDiaryTab(tab) {
  const next = tab === "chat" ? "chat" : "journal";
  if (ui.diaryTab === next) {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    return;
  }
  ui.diaryTab = next;
  ui.chatError = "";
  audio.play("nav");
  refreshAll({ keepScroll: false });
}

function openDiaryEntryModal(key) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return;
  const note = store.getNoteForDate(key);
  const log = store.getLog(key);
  const bits = [];
  if (log?.done?.length) bits.push(`点亮 ${log.done.length} 件`);
  if (log?.rest) bits.push("来喘过气");
  if (log?.energy && ENERGY[log.energy]) bits.push(ENERGY[log.energy].label);
  openModal(`
    ${modalHead("这一页日记", "DIARY PAGE")}
    <p class="modal-sub">${diaryFullDate(key)}${bits.length ? ` · ${bits.join(" · ")}` : ""}</p>
    <form class="modal-form" data-form="diary-entry" data-date="${key}">
      <label class="field-label" for="diary-entry-note">写给这一天</label>
      <textarea id="diary-entry-note" class="diary-textarea" name="note" rows="10" placeholder="空一行，就是新的一段。写多少都可以。" data-autofocus>${esc(note)}</textarea>
      <p class="form-hint">这一页只会保存在这台设备上。清空内容再保存，就会移除这一页。</p>
      <p class="form-error" hidden></p>
      <div class="form-actions">
        <span></span>
        <div class="form-actions__right">
          <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">取消</button>
          <button class="pixel-btn pixel-btn--gold" type="submit">收好这一页</button>
        </div>
      </div>
    </form>
  `, { className: "modal--diary" });
}

function openChatSettings() {
  const settings = getChatSettings();
  const masked = maskKey(settings.apiKey);
  openModal(`
    ${modalHead("连接 DeepSeek", "CHAT SETTINGS")}
    <p class="modal-sub">小灯会用 DeepSeek V4.1 Flash 陪你说话。Key 只保存在这台设备里，不进入导出备份，也不会经过微光小屋的服务器。</p>
    <form class="modal-form" data-form="chat-settings">
      <label class="field-label" for="chat-key">DeepSeek API Key</label>
      <input id="chat-key" class="text-input" name="apiKey" type="password" autocomplete="off" spellcheck="false" placeholder="${masked ? `已保存 ${masked}，留空保留` : "sk-..."}" data-autofocus>
      <p class="form-hint">在 <a href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" data-action="open-chat-key-page">DeepSeek 开放平台</a> 创建。建议单独建一个只用于小屋的 Key。</p>
      <label class="field-label" for="chat-model">模型</label>
      <select id="chat-model" class="text-input select-input" name="model">
        <option value="deepseek-flash" ${settings.model === "deepseek-flash" ? "selected" : ""}>deepseek-flash · V4.1 Flash</option>
        <option value="deepseek-v4-pro" ${settings.model === "deepseek-v4-pro" ? "selected" : ""}>deepseek-v4-pro · 更慢更稳</option>
      </select>
      <details class="chat-advanced">
        <summary>高级：接口地址</summary>
        <label class="field-label" for="chat-base">Base URL</label>
        <input id="chat-base" class="text-input" name="baseUrl" type="url" value="${esc(settings.baseUrl)}" placeholder="https://api.deepseek.com" autocomplete="off" spellcheck="false">
        <p class="form-hint">默认直接连接 <code>api.deepseek.com</code>。如果你有自己搭的兼容代理，也可以填在这里。</p>
      </details>
      <p class="form-error" hidden></p>
      <div class="form-actions">
        <div>
          ${settings.apiKey ? `<button class="text-btn text-btn--danger" type="button" data-action="clear-chat-key">删除已保存的 Key</button>` : ""}
        </div>
        <div class="form-actions__right">
          <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">取消</button>
          <button class="pixel-btn pixel-btn--gold" type="submit">${icon("spark")} 保存连接</button>
        </div>
      </div>
    </form>
    <div class="chat-web-entry">
      <b>不想用 API？</b>
      <a class="text-btn" href="https://chat.deepseek.com/" target="_blank" rel="noopener" data-action="open-deepseek-web">打开 DeepSeek 网页版（免费）↗</a>
      <p>登录和对话在 DeepSeek 页面完成，不会自动写进小屋。</p>
    </div>
    <p class="chat-fine">聊天内容会发送给 DeepSeek。请不要在聊天里写密码、身份证号等敏感信息。</p>
  `, { className: "modal--chat-settings" });
}

function openDeepSeekWeb() {
  audio.play("nav");
  if (window.GlimmerAndroid && typeof window.GlimmerAndroid.openDeepSeekWeb === "function") {
    try {
      window.GlimmerAndroid.openDeepSeekWeb();
      return;
    } catch {
      // Fall through to the normal browser route.
    }
  }
  try {
    const opened = window.open("https://chat.deepseek.com/", "_blank");
    if (opened) {
      opened.opener = null;
    } else {
      toast("浏览器拦住了新标签。可以手动打开 chat.deepseek.com。", { iconName: "lantern" });
    }
  } catch {
    toast("没有打开网页版。可以手动访问 chat.deepseek.com。", { iconName: "lantern" });
  }
}

function askClearChatKey() {
  if (!hasChatKey()) return;
  openConfirm({
    title: "删除 API Key？",
    body: "删除后小灯会停止联网聊天。日记和聊天记录都会保留。",
    confirmLabel: "删除 Key",
    danger: true,
    onConfirm: () => {
      clearChatKey();
      ui.chatError = "";
      if (ui.route === "diary") refreshAll({ keepScroll: false });
      toast("API Key 已从这台设备删除。", { iconName: "lock" });
    }
  });
}

function askClearChat() {
  openConfirm({
    title: "清空聊天记录？",
    body: "只会删除和小灯的聊天，不会动日记本和打卡记录。",
    confirmLabel: "清空聊天",
    danger: true,
    onConfirm: () => {
      clearChatMessages();
      ui.chatError = "";
      refreshAll({ keepScroll: false });
      toast("聊天记录清空了。", { iconName: "trash" });
    }
  });
}

function chatContextSummary() {
  const state = store.getState();
  const stats = store.getStats();
  const overview = store.getTodayOverview();
  const energy = overview.log?.energy && ENERGY[overview.log.energy]
    ? ENERGY[overview.log.energy].label
    : "还没选";
  return [
    `今天是 ${store.dateKey()}`,
    `用户称呼：${state.profile.name || "还没留名字"}`,
    `今天完成了 ${overview.doneCount}/${overview.total} 件小事`,
    `能量状态：${energy}`,
    `历史最长连续：${stats.longestStreak || 0} 天`,
    `此刻在场景：${getHomePlace().name}`
  ].join("；") + "。";
}

async function sendChatTurn(rawText) {
  const text = String(rawText || "").trim().slice(0, 4000);
  if (!text || ui.chatSending) return;
  if (!hasChatKey()) {
    audio.play("click");
    toast("先填一个 DeepSeek API Key，才能联网聊天。", { iconName: "lock" });
    openChatSettings();
    return;
  }
  if (navigator.onLine === false) {
    ui.chatError = "现在没有联网。等有网了再和小灯说话吧。";
    ui.diaryTab = "chat";
    refreshAll({ keepScroll: true });
    return;
  }
  const settings = getChatSettings();
  appendChatMessage("user", text);
  ui.chatSending = true;
  ui.chatError = "";
  ui.diaryTab = "chat";
  audio.play("click");
  refreshAll({ keepScroll: true });
  try {
    const result = await sendChatMessage(getChatMessages(), settings, chatContextSummary());
    appendChatMessage("assistant", result.content);
  } catch (error) {
    ui.chatError = error instanceof ChatError ? error.message : "刚才没有接上话，再试一次吧。";
  } finally {
    ui.chatSending = false;
    if (ui.route === "diary" && ui.diaryTab === "chat") {
      refreshAll({ keepScroll: true });
    }
  }
}

function sendChatFromInput() {
  const input = $("#chat-input");
  const text = input?.value || "";
  if (!text.trim()) {
    input?.focus();
    return;
  }
  sendChatTurn(text);
}

/* ------------------------------------------------------------------ *
 * Modals
 * ------------------------------------------------------------------ */

function modalHead(title, kicker = "", { closable = true } = {}) {
  return `
    <div class="modal__head">
      <div>
        ${kicker ? `<p class="date-kicker">${esc(kicker)}</p>` : ""}
        <h2 id="modal-title">${esc(title)}</h2>
      </div>
      ${closable ? `<button class="icon-btn" type="button" data-action="close-modal" aria-label="关闭">${icon("close")}</button>` : ""}
    </div>
  `;
}

function openModal(html, { className = "", dismissible = true, autofocus = true } = {}) {
  const root = $("#modal-root");
  clearToasts();
  if (ui.modalTimer) {
    window.clearTimeout(ui.modalTimer);
    ui.modalTimer = null;
  }
  if (root.hidden) ui.lastFocus = document.activeElement;
  root.hidden = false;
  root.innerHTML = `
    <div class="modal-backdrop" data-action="modal-backdrop">
      <div class="modal ${className}" role="dialog" aria-modal="true" aria-labelledby="modal-title" tabindex="-1">
        ${html}
      </div>
    </div>
  `;
  document.body.classList.add("modal-open");
  ui.modalDismissible = dismissible;
  requestAnimationFrame(() => {
    $(".modal-backdrop", root)?.classList.add("is-open");
  });
  if (autofocus) {
    window.setTimeout(() => {
      const modal = $(".modal", root);
      const preferred = $("[data-autofocus]", root) || $("input:not([type=hidden]), textarea, button", root) || modal;
      try {
        preferred?.focus({ preventScroll: false });
      } catch {
        preferred?.focus();
      }
    }, 70);
  }
}

function closeModal({ instant = false } = {}) {
  const root = $("#modal-root");
  if (!root || root.hidden) return;
  if (ui.breatheTimer) {
    window.clearInterval(ui.breatheTimer);
    ui.breatheTimer = null;
  }
  ui.breatheCompleted = false;
  ui.confirmAction = null;
  ui.modalDismissible = true;
  document.body.classList.remove("modal-open");
  const backdrop = $(".modal-backdrop", root);
  if (backdrop) backdrop.classList.remove("is-open");
  const finish = () => {
    root.hidden = true;
    root.innerHTML = "";
    ui.modalTimer = null;
  };
  if (instant) {
    finish();
  } else {
    ui.modalTimer = window.setTimeout(finish, 160);
  }
  if (ui.lastFocus && document.contains(ui.lastFocus) && typeof ui.lastFocus.focus === "function") {
    try {
      ui.lastFocus.focus({ preventScroll: true });
    } catch {
      /* ignore */
    }
  }
  ui.lastFocus = null;
}

function openOnboarding() {
  const name = store.getState().profile.name;
  openModal(`
    <div class="onboarding">
      <div class="onboarding__sky" aria-hidden="true">
        <i></i><i></i><i></i><i></i><i></i><i></i><i></i><i></i>
      </div>
      <div class="onboarding__lantern" aria-hidden="true">${icon("lantern")}</div>
      <p class="date-kicker">WELCOME TO GLIMMER NOOK</p>
      <h2 id="modal-title">欢迎来到微光小屋</h2>
      <p class="onboarding__lead">这里不催你。做到一点点，就点亮一点点。</p>
      <p class="onboarding__body">没有目标也没关系。先记录今天有没有喝水、有没有站起来走一走。等有力气的时候，再给自己设一个想要的奖励。</p>
      <ul class="onboarding__points">
        <li>${icon("seed")}<span>不用连续，不用满分。出现就算数。</span></li>
        <li>${icon("spark")}<span>完成一件小事，就攒下一点微光。</span></li>
        <li>${icon("gift")}<span>攒够了，就领取你写给自己的奖励。</span></li>
      </ul>
      <form data-form="onboarding" class="onboarding__form">
        <label class="field-label" for="onboarding-name">怎么称呼你？<span>可以留空</span></label>
        <input id="onboarding-name" class="text-input" type="text" name="name" maxlength="20" value="${esc(name)}" placeholder="比如：阿岚" autocomplete="nickname">
        <button class="pixel-btn pixel-btn--gold pixel-btn--wide" type="submit" data-autofocus>推门进去</button>
      </form>
      <p class="onboarding__fine">已经给你留了三件小事，进去后随时可以改。<br>所有记录只保存在这台设备上。</p>
    </div>
  `, { className: "modal--onboarding", dismissible: false });
}

function openHabitModal(id = null) {
  const habit = id ? store.getState().habits.find((item) => item.id === id) : null;
  if (id && !habit) {
    toast("找不到这件小事了。", { iconName: "leaf" });
    return;
  }
  const value = habit || { name: "", icon: "spark", effort: 2 };
  const iconChoices = HABIT_ICONS.map((name) => `
    <label class="icon-choice" title="${esc(HABIT_ICON_LABELS[name] || name)}">
      <input type="radio" name="icon" value="${name}" ${value.icon === name ? "checked" : ""}>
      <span class="icon-choice__tile">${icon(name)}</span>
      <small>${esc(HABIT_ICON_LABELS[name] || name)}</small>
    </label>
  `).join("");
  const effortChoices = Object.entries(EFFORTS).map(([level, effort]) => `
    <label class="effort-choice">
      <input type="radio" name="effort" value="${level}" ${Number(value.effort) === Number(level) ? "checked" : ""}>
      <span class="effort-choice__copy">
        <b>${effort.label}</b>
        <small>${effort.hint}</small>
      </span>
      <em>+${effort.points}</em>
    </label>
  `).join("");

  openModal(`
    ${modalHead(habit ? "编辑这件小事" : "加一件小事", "LITTLE THING")}
    <form class="modal-form" data-form="habit" data-id="${habit ? esc(habit.id) : ""}">
      <div class="form-error" hidden></div>
      <label class="field-label" for="habit-name">它叫什么？</label>
      <input id="habit-name" class="text-input" type="text" name="name" maxlength="30" value="${esc(value.name)}" placeholder="比如：喝一杯水" required data-autofocus>
      <p class="field-hint">越具体越好。小到「现在就能做」，才算好目标。</p>

      <fieldset class="field-group">
        <legend class="field-label">选一个小图案</legend>
        <div class="icon-grid">${iconChoices}</div>
      </fieldset>

      <fieldset class="field-group">
        <legend class="field-label">它有多费力？</legend>
        <div class="effort-list">${effortChoices}</div>
      </fieldset>

      <div class="form-actions">
        ${habit ? `<button class="text-btn text-btn--danger" type="button" data-action="delete-habit" data-id="${esc(habit.id)}">删掉它</button>` : "<span></span>"}
        <div class="form-actions__right">
          <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">取消</button>
          <button class="pixel-btn pixel-btn--gold" type="submit">${habit ? "保存" : "放进小屋"}</button>
        </div>
      </div>
    </form>
  `, { className: "modal--form" });
}

function openRewardModal(id = null) {
  const reward = id ? store.getState().rewards.find((item) => item.id === id) : null;
  if (id && !reward) {
    toast("找不到这份奖励了。", { iconName: "gift" });
    return;
  }
  if (reward?.claimedAt) {
    toast("已经收下的奖励，就留在小屋的回忆里吧。", { iconName: "heart" });
    return;
  }
  const value = reward || {
    title: "",
    note: "",
    icon: "gift",
    condition: { type: "days", value: 3 }
  };
  const iconChoices = REWARD_ICONS.map((name) => `
    <label class="icon-choice" title="${esc(REWARD_ICON_LABELS[name] || name)}">
      <input type="radio" name="icon" value="${name}" ${value.icon === name ? "checked" : ""}>
      <span class="icon-choice__tile">${icon(name)}</span>
      <small>${esc(REWARD_ICON_LABELS[name] || name)}</small>
    </label>
  `).join("");
  const typeChoices = Object.entries(CONDITION_TYPES).map(([type, condition]) => `
    <label class="condition-choice">
      <input type="radio" name="conditionType" value="${type}" ${value.condition.type === type ? "checked" : ""} data-condition-radio>
      <span>
        <b>${condition.label}</b>
        <small>${condition.hint}</small>
      </span>
    </label>
  `).join("");
  const unit = conditionUnit(value.condition.type);

  openModal(`
    ${modalHead(reward ? "编辑这份奖励" : "设一个奖励", "SOMETHING TO LOOK FORWARD TO")}
    <form class="modal-form" data-form="reward" data-id="${reward ? esc(reward.id) : ""}" data-is-new="${reward ? "false" : "true"}">
      <div class="form-error" hidden></div>
      <label class="field-label" for="reward-title">想给自己什么？</label>
      <input id="reward-title" class="text-input" type="text" name="title" maxlength="40" value="${esc(value.title)}" placeholder="比如：一杯喜欢的奶茶" required data-autofocus>
      <label class="field-label" for="reward-note">留一句给自己的话 <span>可选</span></label>
      <textarea id="reward-note" class="text-input text-area" name="note" maxlength="120" rows="2" placeholder="达成以后，要怎么享受它？">${esc(value.note)}</textarea>

      <fieldset class="field-group">
        <legend class="field-label">选一个图案</legend>
        <div class="icon-grid icon-grid--reward">${iconChoices}</div>
      </fieldset>

      <fieldset class="field-group">
        <legend class="field-label">怎么算达成？</legend>
        <div class="condition-list">${typeChoices}</div>
      </fieldset>

      <div class="condition-value-row">
        <div>
          <span class="field-label">目标数字</span>
          <p class="field-hint" data-condition-hint>${esc(CONDITION_TYPES[value.condition.type].hint)}</p>
        </div>
        <div class="stepper">
          <button class="stepper__btn" type="button" data-action="step-condition" data-step="-1" aria-label="减少">−</button>
          <input id="reward-value" class="stepper__input" type="number" name="value" min="1" max="9999" step="1" value="${value.condition.value}" inputmode="numeric" required>
          <span class="stepper__unit" data-condition-unit>${unit}</span>
          <button class="stepper__btn" type="button" data-action="step-condition" data-step="1" aria-label="增加">＋</button>
        </div>
      </div>

      <div class="form-actions">
        ${reward ? `<button class="text-btn text-btn--danger" type="button" data-action="delete-reward" data-id="${esc(reward.id)}">删掉它</button>` : "<span></span>"}
        <div class="form-actions__right">
          <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">取消</button>
          <button class="pixel-btn pixel-btn--gold" type="submit">${reward ? "保存" : "收进小屋"}</button>
        </div>
      </div>
    </form>
  `, { className: "modal--form" });
}

function openNameModal() {
  openModal(`
    ${modalHead("怎么称呼你？", "YOUR NAME")}
    <form class="modal-form" data-form="name">
      <div class="form-error" hidden></div>
      <label class="field-label" for="profile-name">新称呼</label>
      <input id="profile-name" class="text-input" type="text" name="name" maxlength="20" value="${esc(store.getState().profile.name)}" placeholder="可以留空" data-autofocus>
      <p class="field-hint">只是一个称呼，随时可以改。</p>
      <div class="form-actions">
        <span></span>
        <div class="form-actions__right">
          <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">取消</button>
          <button class="pixel-btn pixel-btn--gold" type="submit">记住啦</button>
        </div>
      </div>
    </form>
  `, { className: "modal--form" });
}

const LOOK_TABS = [
  ["head", "头"],
  ["face", "面"],
  ["body", "身"],
  ["legs", "腿"],
  ["shoes", "鞋"]
];

function lookOptionsHtml(part, draft) {
  const options = LOOK_PARTS[part] || [];
  return options.map((option) => {
    const active = draft[part] === option.id;
    return `
      <button class="look-choice ${active ? "is-active" : ""}" type="button"
        data-action="look-choice" data-part="${part}" data-value="${option.id}"
        aria-pressed="${active}">
        <span class="look-choice__swatch" style="--swatch:${option.swatch}"></span>
        <span class="look-choice__copy"><b>${esc(option.name)}</b><small>${esc(option.desc)}</small></span>
        <span class="look-choice__check">${active ? icon("check") : ""}</span>
      </button>
    `;
  }).join("");
}

function lookTabsHtml(part) {
  return LOOK_TABS.map(([id, label]) => `
    <button class="look-tab ${id === part ? "is-active" : ""}" type="button"
      role="tab" aria-selected="${id === part}" data-action="look-tab" data-part="${id}">${label}</button>
  `).join("");
}

function paintLookPreview() {
  if (!ui.wardrobe) return;
  const canvas = $("#look-preview");
  if (canvas) paintPersonPreview(canvas, ui.wardrobe.draft);
}

function renderWardrobeSelection() {
  if (!ui.wardrobe) return;
  const tabs = $("#look-tabs");
  if (tabs) tabs.innerHTML = lookTabsHtml(ui.wardrobe.part);
  const options = $("#look-options");
  if (options) options.innerHTML = lookOptionsHtml(ui.wardrobe.part, ui.wardrobe.draft);
  paintLookPreview();
}

function openWardrobe() {
  const look = normalizeLook(store.getLook());
  ui.wardrobe = { draft: { ...look }, part: "head" };
  openModal(`
    ${modalHead("今天想穿什么？", "WARDROBE")}
    <div class="wardrobe">
      <div class="wardrobe__preview">
        <div class="wardrobe__preview-frame">
          <canvas id="look-preview" width="180" height="220" role="img" aria-label="当前搭配的预览"></canvas>
        </div>
        <p>这身会出现在小屋、今日小灯和所有场景里。</p>
      </div>
      <div class="wardrobe__panel">
        <div class="look-tabs" id="look-tabs" role="tablist">${lookTabsHtml("head")}</div>
        <div class="look-options" id="look-options">${lookOptionsHtml("head", ui.wardrobe.draft)}</div>
      </div>
    </div>
    <div class="wardrobe__foot">
      <button class="text-btn" type="button" data-action="look-random">${icon("spark")} 随机一身</button>
      <div class="form-actions__right">
        <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">先不换</button>
        <button class="pixel-btn pixel-btn--gold" type="button" data-action="save-look">就穿这身</button>
      </div>
    </div>
  `, { className: "modal--wardrobe", autofocus: false });
  requestAnimationFrame(() => paintLookPreview());
  window.setTimeout(() => $(".look-tab")?.focus({ preventScroll: true }), 90);
}

function selectLookTab(part) {
  if (!ui.wardrobe || !LOOK_PARTS[part]) return;
  ui.wardrobe.part = part;
  audio.play("click");
  renderWardrobeSelection();
}

function chooseLookOption(part, value) {
  if (!ui.wardrobe || !LOOK_PARTS[part]?.some((option) => option.id === value)) return;
  ui.wardrobe.draft[part] = value;
  audio.play("click");
  renderWardrobeSelection();
}

function randomizeLook() {
  if (!ui.wardrobe) return;
  ui.wardrobe.draft = randomLook();
  audio.play("open");
  renderWardrobeSelection();
}

function saveLook() {
  if (!ui.wardrobe) return;
  store.setLook(ui.wardrobe.draft);
  ui.wardrobe = null;
  closeModal();
  audio.play("check");
  refreshAll({ keepScroll: true });
  toast("这身很好看。", { iconName: "spark", tone: "gold", duration: 2600 });
}

function refreshNavOnly() {
  const stats = store.getStats();
  const nav = $("#bottom-nav");
  if (nav) {
    nav.innerHTML = renderNav({
      route: ui.route,
      claimableCount: stats.claimableCount,
      updateAvailable: ui.updateAvailable
    });
  }
}

function setUpdateStatus(text, isUpdate = false) {
  const el = $("#update-status");
  if (!el) return;
  el.textContent = text;
  el.classList.toggle("is-update", isUpdate);
}

async function runUpdateCheck(manual = true) {
  if (ui.updateChecking) return;
  ui.updateChecking = true;
  const button = $('[data-action="check-update"]');
  if (button) {
    button.disabled = true;
    button.classList.add("is-loading");
    button.innerHTML = `${icon("refresh")} 正在看看…`;
  }
  const result = await checkForUpdate();
  ui.updateChecking = false;
  if (button) {
    button.disabled = false;
    button.classList.remove("is-loading");
    button.innerHTML = `${icon("refresh")} 检查更新`;
  }
  if (result.info) {
    ui.versionInfo = result.info;
    ui.updateAvailable = result.state === "available";
    refreshNavOnly();
    if (result.state === "latest") setUpdateStatus(`已经是最新版 v${APP_VERSION}。`);
  }
  if (result.state === "available") {
    setUpdateStatus(`发现新版本 v${result.info.version}，可以更新。`, true);
    audio.play("open");
    openUpdateModal(result.info);
    return;
  }
  if (result.state === "latest") {
    setUpdateStatus(`已经是最新版 v${APP_VERSION}。`);
    if (manual) toast(`已经是最新版 v${APP_VERSION} 了。`, { iconName: "spark" });
    return;
  }
  setUpdateStatus(result.message || "没有连上网络，稍后再试试。");
  if (manual) toast(result.message || "没有连上网络，稍后再试试。", { iconName: "moon" });
}

async function maybeCheckUpdatesOnBoot() {
  if (ui.updateChecking) return;
  if (!store.getState().profile.onboarded) return;
  if (navigator.onLine === false) return;
  if (!shouldCheckOnBoot()) return;
  ui.updateChecking = true;
  const result = await checkForUpdate();
  ui.updateChecking = false;
  if (result.info) {
    ui.versionInfo = result.info;
    if (result.state === "latest") setUpdateStatus(`已经是最新版 v${APP_VERSION}。`);
  }
  if (result.state === "available") {
    ui.updateAvailable = true;
    refreshNavOnly();
    setUpdateStatus(`发现新版本 v${result.info.version}，可以更新。`, true);
    toast(`小屋有新版本 v${result.info.version}，去「小屋 → 版本与更新」看看。`, {
      iconName: "spark",
      tone: "gold",
      duration: 4800
    });
  }
}

function openUpdateModal(info) {
  const android = isAndroidShell();
  const notes = (info.notes || []).map((note) => `<li>${esc(note)}</li>`).join("");
  openModal(`
    ${modalHead(`发现新版本 v${info.version}`, "UPDATE AVAILABLE")}
    <div class="update-modal">
      <p class="update-modal__title">${esc(info.title || "小屋又有新东西了")}</p>
      <p class="update-modal__date">${esc(info.releasedAt || "")}</p>
      <ul class="update-notes">${notes || "<li>这次更新带来了一些小变化。</li>"}</ul>
      <p class="update-hint">${android
        ? "下载后直接覆盖安装，记录会保存在这台设备里。"
        : "更新会刷新页面，打卡记录不会丢失。"}</p>
      <div class="form-actions">
        <button class="text-btn" type="button" data-action="open-release">查看 Release ›</button>
        <div class="form-actions__right">
          <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">稍后</button>
          ${android
            ? `<button class="pixel-btn pixel-btn--gold" type="button" data-action="download-update">${icon("download")} 去下载 APK</button>`
            : `<button class="pixel-btn pixel-btn--gold" type="button" data-action="apply-update">${icon("refresh")} 更新并刷新</button>`}
        </div>
      </div>
    </div>
  `, { className: "modal--update" });
}

function applyUpdate() {
  const button = $('[data-action="apply-update"]');
  if (button) {
    button.disabled = true;
    button.innerHTML = `${icon("refresh")} 正在更新…`;
  }
  audio.play("check");
  applyWebUpdate();
}

function downloadUpdate() {
  const url = ui.versionInfo?.apkUrl || ui.versionInfo?.releaseUrl;
  if (!url) {
    toast("还没有找到下载地址，去 Release 页面看看吧。", { iconName: "moon" });
    return;
  }
  const opened = openExternal(url);
  toast(opened ? "正在打开下载页。安装时选择覆盖安装即可。" : "打开下载页失败，去 Release 页面看看吧。", {
    iconName: "download",
    duration: 3800
  });
}

function openChangelog() {
  const entries = CHANGELOG.map((entry) => ({ ...entry }));
  if (ui.versionInfo && compareVersions(ui.versionInfo.version, entries[0]?.version || "0.0.0") > 0) {
    entries.unshift({
      version: ui.versionInfo.version,
      date: ui.versionInfo.releasedAt || "",
      title: ui.versionInfo.title || "最新版本",
      items: ui.versionInfo.notes || []
    });
  }
  openModal(`
    ${modalHead("更新日志", "CHANGELOG")}
    <div class="changelog-list">
      ${entries.map((entry) => `
        <article class="changelog-entry ${entry.version === APP_VERSION ? "is-current" : ""}">
          <div class="changelog-head">
            <span class="changelog-version">v${esc(entry.version)}</span>
            <span class="changelog-date">${esc(entry.date || "")}</span>
            ${entry.version === APP_VERSION ? '<span class="changelog-current">当前</span>' : ""}
          </div>
          <h3>${esc(entry.title || "")}</h3>
          <ul>${(entry.items || []).map((item) => `<li>${esc(item)}</li>`).join("")}</ul>
        </article>
      `).join("")}
    </div>
    <p class="changelog-foot">当前版本 v${APP_VERSION} · 构建 ${APP_BUILD} · ${esc(platformLabel())}</p>
  `, { className: "modal--changelog" });
}

function openConfirm({ title, body, confirmLabel = "确定", danger = false, onConfirm }) {
  ui.confirmAction = onConfirm;
  openModal(`
    ${modalHead(title, danger ? "CAREFUL" : "PLEASE CONFIRM")}
    <p class="confirm-copy">${body}</p>
    <div class="form-actions">
      <span></span>
      <div class="form-actions__right">
        <button class="pixel-btn pixel-btn--ghost" type="button" data-action="close-modal">再想想</button>
        <button class="pixel-btn ${danger ? "pixel-btn--danger" : "pixel-btn--gold"}" type="button" data-action="confirm-yes" data-autofocus>${esc(confirmLabel)}</button>
      </div>
    </div>
  `, { className: "modal--confirm" });
}

function runConfirmedAction() {
  const action = ui.confirmAction;
  ui.confirmAction = null;
  closeModal({ instant: true });
  if (typeof action === "function") {
    try {
      action();
    } catch (error) {
      console.error(error);
      toast("这一步没有完成，再试一次吧。", { iconName: "leaf" });
    }
  }
}

function openClaimModal(reward) {
  openModal(`
    <div class="claim">
      <div class="claim__sparkles" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></div>
      <div class="claim__icon">${icon(reward.icon)}</div>
      <p class="date-kicker">REWARD UNLOCKED</p>
      <h2 id="modal-title">${esc(reward.title)}</h2>
      <p class="claim__note">${esc(reward.note || "这是你送给自己的。")}</p>
      <div class="claim__quote">去真实地享受它吧。<br>不用觉得不好意思。</div>
      <button class="pixel-btn pixel-btn--gold pixel-btn--wide" type="button" data-action="close-modal" data-autofocus>收下这份奖励</button>
    </div>
  `, { className: "modal--claim" });
}

function openBreatheModal() {
  openModal(`
    <div class="breathe-modal">
      <div class="modal__head">
        <div>
          <p class="date-kicker">TAKE A MOMENT</p>
          <h2 id="modal-title">把肩膀放下来</h2>
        </div>
        <button class="icon-btn" type="button" data-action="close-modal" aria-label="关闭">${icon("close")}</button>
      </div>
      <p class="breathe-modal__lead">跟着光圈，慢慢吸气，再慢慢呼气。走神了也没关系，回来就好。</p>
      <div class="breathe-stage">
        <span class="breathe-orb" data-breathe-orb></span>
        <span class="breathe-word" data-breathe-word>准备好了吗</span>
        <span class="breathe-count" data-breathe-count>24 秒</span>
      </div>
      <div class="breathe-actions">
        <button class="pixel-btn pixel-btn--gold pixel-btn--wide" type="button" data-action="start-breathe" data-autofocus data-breathe-hide>开始</button>
        <button class="text-btn" type="button" data-action="close-modal" data-breathe-hide>先不用</button>
        <button class="pixel-btn pixel-btn--gold pixel-btn--wide" type="button" data-action="finish-breathe" hidden>回到小屋</button>
      </div>
      <p class="breathe-modal__foot">如果眼睛累了，也可以只是坐着。<br>完成之后，今天会自动算作「来过」。</p>
    </div>
  `, { className: "modal--breathe" });
}

function startBreathe(button) {
  if (ui.breatheTimer) return;
  const modal = button.closest(".modal");
  if (!modal) return;
  const orb = $("[data-breathe-orb]", modal);
  const word = $("[data-breathe-word]", modal);
  const count = $("[data-breathe-count]", modal);
  const finishButton = $("[data-action='finish-breathe']", modal);
  $$("[data-breathe-hide]", modal).forEach((el) => el.setAttribute("hidden", ""));
  modal.classList.add("is-running");
  const total = 24;
  const cycle = 12;
  const started = performance.now();
  let lastPhase = "";
  const tick = () => {
    const elapsed = (performance.now() - started) / 1000;
    if (elapsed >= total) {
      completeBreathe(modal, orb, word, count, finishButton);
      return;
    }
    const position = elapsed % cycle;
    let phase = "吸气";
    let scale = 1;
    if (position < 4) {
      phase = "吸气";
      scale = 0.82 + (position / 4) * 0.58;
    } else if (position < 6) {
      phase = "停一停";
      scale = 1.4;
    } else {
      phase = "呼气";
      scale = 1.4 - ((position - 6) / 6) * 0.58;
    }
    if (word) word.textContent = phase;
    if (orb) orb.style.transform = `scale(${scale.toFixed(3)})`;
    if (count) count.textContent = `还剩 ${Math.max(0, Math.ceil(total - elapsed))} 秒`;
    if (phase !== lastPhase) {
      lastPhase = phase;
      audio.play("breathe");
    }
  };
  tick();
  ui.breatheTimer = window.setInterval(tick, 80);
}

function completeBreathe(modal, orb, word, count, finishButton) {
  if (ui.breatheTimer) {
    window.clearInterval(ui.breatheTimer);
    ui.breatheTimer = null;
  }
  const result = store.markRest();
  ui.breatheUnlocked = result.unlocked || [];
  ui.breatheCompleted = true;
  ui.modalDismissible = false;
  modal.classList.add("is-done");
  if (orb) orb.style.transform = "scale(1)";
  if (word) word.textContent = "慢慢睁开眼";
  if (count) count.textContent = "今天也算来过啦";
  const closeButton = $(".modal__head [data-action='close-modal']", modal);
  if (closeButton) closeButton.remove();
  if (finishButton) finishButton.removeAttribute("hidden");
  audio.play("check");
}

function finishBreathe() {
  const unlocked = ui.breatheUnlocked;
  ui.breatheUnlocked = [];
  ui.breatheCompleted = false;
  closeModal({ instant: true });
  say(pickLine(REST_LINES), 5200);
  audio.play("check");
  refreshAll({ celebrate: true, keepScroll: true });
  toast("今天也算来过啦。", { iconName: "leaf", duration: 3200 });
  notifyUnlocked(unlocked);
}

function askReset() {
  openConfirm({
    title: "重新开始？",
    body: "这台设备上的所有小事、打卡、奖励和记录都会被清空。这个动作不能撤销。如果只是想换个名字，不用走这一步。",
    confirmLabel: "全部清空",
    danger: true,
    onConfirm: () => {
      closeModal({ instant: true });
      store.resetAll();
      clearChatMessages();
      clearChatKey();
      ui.chatError = "";
      ui.chatSending = false;
      ui.diaryTab = "journal";
      ui.calendar = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
      ui.speech = "";
      ui.speechUntil = 0;
      ui.route = "today";
      history.replaceState(null, "", "#/today");
      renderShell();
      window.scrollTo({ top: 0, left: 0, behavior: "auto" });
      window.setTimeout(openOnboarding, 350);
    }
  });
}

function exportData() {
  try {
    const blob = new Blob([store.exportData()], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `微光小屋-备份-${store.dateKey()}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 1200);
    audio.play("open");
    toast("备份已经导出。换设备前记得收好它。", { iconName: "download" });
  } catch {
    toast("导出没有成功，再试一次吧。", { iconName: "leaf" });
  }
}

/* ------------------------------------------------------------------ *
 * Forms & import
 * ------------------------------------------------------------------ */

function showFormError(form, message) {
  const el = $(".form-error", form);
  if (!el) return;
  el.textContent = message;
  el.hidden = false;
}

async function onDocumentSubmit(event) {
  const form = event.target.closest("form[data-form]");
  if (!form) return;
  event.preventDefault();
  const type = form.dataset.form;
  if (type === "onboarding") {
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim().slice(0, 20);
    store.completeOnboarding(name);
    closeModal();
    say(name ? `${name}，欢迎回家。` : "欢迎回家。", 6000);
    audio.play("open");
    refreshAll({ celebrate: true, keepScroll: false });
    return;
  }

  if (type === "habit") {
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    const iconName = String(fd.get("icon") || "spark");
    const effort = Number(fd.get("effort"));
    if (!name) {
      showFormError(form, "先给它写个名字吧，哪怕只有两个字。");
      $("#habit-name", form)?.focus();
      return;
    }
    const payload = {
      name,
      icon: HABIT_ICONS.includes(iconName) ? iconName : "spark",
      effort: [1, 2, 3].includes(effort) ? effort : 2
    };
    const id = form.dataset.id;
    if (id) {
      store.updateHabit(id, payload);
      toast("改好啦。", { iconName: "pen" });
    } else {
      store.addHabit(payload);
      toast("已经放进今日清单里了。", { iconName: "seed" });
    }
    audio.play("check");
    closeModal();
    refreshAll({ keepScroll: true });
    return;
  }

  if (type === "reward") {
    const fd = new FormData(form);
    const title = String(fd.get("title") || "").trim();
    const note = String(fd.get("note") || "").trim();
    const iconName = String(fd.get("icon") || "gift");
    const conditionType = String(fd.get("conditionType") || "days");
    const conditionValue = Number(fd.get("value"));
    if (!title) {
      showFormError(form, "先写下想给自己的东西吧。");
      $("#reward-title", form)?.focus();
      return;
    }
    if (!CONDITION_TYPES[conditionType]) {
      showFormError(form, "选一种达成方式。");
      return;
    }
    if (!Number.isFinite(conditionValue) || conditionValue < 1 || conditionValue > 9999) {
      showFormError(form, "目标数字要在 1 到 9999 之间。");
      $("#reward-value", form)?.focus();
      return;
    }
    const payload = {
      title,
      note,
      icon: REWARD_ICONS.includes(iconName) ? iconName : "gift",
      condition: { type: conditionType, value: Math.round(conditionValue) }
    };
    const id = form.dataset.id;
    let unlocked = [];
    if (id) {
      const result = store.updateReward(id, payload);
      unlocked = result?.unlocked || [];
    } else {
      const result = store.addReward(payload);
      unlocked = result.unlocked || [];
    }
    if (unlocked.length) {
      toast(`「${payload.title}」已经达成，可以领取了。`, { iconName: "gift", tone: "gold", duration: 4200 });
    } else {
      toast(id ? "奖励改好啦。" : "已经收进小屋。慢慢来。", { iconName: "gift" });
    }
    audio.play("check");
    closeModal();
    refreshAll({ keepScroll: true });
    return;
  }

  if (type === "name") {
    const fd = new FormData(form);
    const name = String(fd.get("name") || "").trim();
    store.setProfileName(name);
    closeModal();
    refreshAll({ keepScroll: true });
    audio.play("click");
    toast("记住啦。", { iconName: "pen" });
    return;
  }

  if (type === "diary-entry") {
    const key = form.dataset.date;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(String(key))) return;
    const fd = new FormData(form);
    store.setNoteForDate(key, String(fd.get("note") || ""));
    closeModal();
    refreshAll({ keepScroll: true });
    audio.play("check");
    toast("这一页收好了。", { iconName: "book" });
    return;
  }

  if (type === "chat-settings") {
    const current = getChatSettings();
    const fd = new FormData(form);
    const writtenKey = String(fd.get("apiKey") || "").trim();
    const apiKey = writtenKey || current.apiKey;
    if (!apiKey) {
      showFormError(form, "先填一个 DeepSeek API Key 吧。");
      $("#chat-key", form)?.focus();
      return;
    }
    try {
      saveChatSettings({
        apiKey,
        model: String(fd.get("model") || "deepseek-flash"),
        baseUrl: String(fd.get("baseUrl") || "https://api.deepseek.com")
      });
    } catch (error) {
      showFormError(form, error instanceof ChatError ? error.message : "这个设置暂时存不下来。");
      return;
    }
    closeModal();
    ui.chatError = "";
    ui.diaryTab = "chat";
    refreshAll({ keepScroll: false });
    audio.play("open");
    toast("连上了。想说什么都可以。", { iconName: "spark", tone: "gold" });
  }
}

function stepCondition(button) {
  const form = button.closest("form");
  const input = $("#reward-value", form);
  if (!input) return;
  const step = Number(button.dataset.step) || 1;
  const next = clamp((Number(input.value) || 0) + step, 1, 9999);
  input.value = String(next);
  audio.play("click");
}

function onConditionChange(event) {
  if (!event.target.matches("[data-condition-radio]")) return;
  const form = event.target.closest("form");
  if (!form) return;
  const type = event.target.value;
  const condition = CONDITION_TYPES[type];
  if (!condition) return;
  const unit = $("[data-condition-unit]", form);
  const hint = $("[data-condition-hint]", form);
  if (unit) unit.textContent = condition.unit;
  if (hint) hint.textContent = condition.hint;
  if (form.dataset.isNew === "true") {
    const input = $("#reward-value", form);
    if (input) input.value = String(condition.default);
  }
  audio.play("click");
  updateConditionSummary(form);
}

function updateConditionSummary(form) {
  const value = Number($("#reward-value", form)?.value) || 1;
  const unit = $("[data-condition-unit]", form);
  if (unit) unit.textContent = conditionUnit(form.querySelector("[data-condition-radio]:checked")?.value || "days");
}

async function onFileChange(event) {
  if (event.target.id !== "import-file") return;
  const file = event.target.files?.[0];
  event.target.value = "";
  if (!file) return;
  if (file.size > 2 * 1024 * 1024) {
    toast("这个文件太大了，可能不是微光小屋的备份。", { iconName: "leaf" });
    return;
  }
  let text = "";
  try {
    text = await file.text();
    const parsed = JSON.parse(text);
    const payload = parsed.state || parsed;
    if (!payload || !Array.isArray(payload.habits) || !Array.isArray(payload.rewards) || typeof payload.logs !== "object") {
      throw new Error("invalid");
    }
  } catch {
    toast("这个文件不像是微光小屋的备份。", { iconName: "leaf" });
    return;
  }
  openConfirm({
    title: "导入这份备份？",
    body: "导入会覆盖这台设备上现在的小屋。建议先导出一次当前备份。",
    confirmLabel: "导入并覆盖",
    onConfirm: () => {
      try {
        store.importData(text);
        ui.calendar = { year: new Date().getFullYear(), month: new Date().getMonth() + 1 };
        ui.speech = "";
        ui.speechUntil = 0;
        refreshAll({ keepScroll: false });
        audio.play("open");
        toast("小屋已经搬回来啦。", { iconName: "upload" });
      } catch (error) {
        toast(error.message || "导入失败了，文件可能不完整。", { iconName: "leaf" });
      }
    }
  });
}

/* ------------------------------------------------------------------ *
 * Toast / confetti / tiny effects
 * ------------------------------------------------------------------ */

function clearToasts() {
  const root = $("#toast-root");
  if (root) root.innerHTML = "";
}

function toast(message, { iconName = "spark", tone = "", duration = 3000 } = {}) {
  const root = $("#toast-root");
  if (!root) return;
  while (root.children.length >= 3) root.firstElementChild.remove();
  const el = document.createElement("div");
  el.className = `toast ${tone ? `toast--${tone}` : ""}`;
  el.innerHTML = `${icon(iconName)}<span>${esc(message)}</span>`;
  root.appendChild(el);
  requestAnimationFrame(() => el.classList.add("is-in"));
  window.setTimeout(() => {
    el.classList.remove("is-in");
    window.setTimeout(() => el.remove(), 240);
  }, duration);
}

function notifyUnlocked(list) {
  if (!list || !list.length) return;
  const names = list.map((reward) => `「${reward.title}」`).join("、");
  window.setTimeout(() => {
    toast(`${names} 可以领取了。`, { iconName: "gift", tone: "gold", duration: 4600 });
  }, 420);
}

function burstConfetti(count = 28) {
  const root = $("#fx-root");
  if (!root) return;
  const colors = ["#f5c451", "#e8735a", "#f0d9b5", "#9fc79b", "#b7a4d8", "#8bb8d8"];
  const layer = document.createElement("div");
  layer.className = "confetti-layer";
  layer.innerHTML = Array.from({ length: count }, (_, index) => {
    const left = Math.random() * 100;
    const delay = Math.random() * 0.35;
    const duration = 1.1 + Math.random() * 0.8;
    const size = 4 + Math.floor(Math.random() * 6);
    const color = colors[index % colors.length];
    const drift = -40 + Math.random() * 80;
    return `<i style="left:${left}%;background:${color};width:${size}px;height:${size}px;animation-delay:${delay}s;animation-duration:${duration}s;--drift:${drift}px"></i>`;
  }).join("");
  root.appendChild(layer);
  window.setTimeout(() => layer.remove(), 2600);
}

function floatPoints(x, y, text, tone = "gold") {
  const root = $("#fx-root");
  if (!root) return;
  const el = document.createElement("span");
  el.className = `float-points float-points--${tone}`;
  el.textContent = text;
  el.style.left = `${x}px`;
  el.style.top = `${y}px`;
  root.appendChild(el);
  window.setTimeout(() => el.remove(), 1000);
}

/* ------------------------------------------------------------------ *
 * Global events
 * ------------------------------------------------------------------ */

function onKeyDown(event) {
  const chatInput = event.target.closest?.("#chat-input");
  if (chatInput && event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    sendChatFromInput();
    return;
  }
  const root = $("#modal-root");
  if (!root || root.hidden) return;
  if (event.key === "Escape" && ui.modalDismissible) {
    event.preventDefault();
    closeModal();
    return;
  }
  if (event.key !== "Tab") return;
  const modal = $(".modal", root);
  if (!modal) return;
  const focusables = $$(
    'a[href], button:not([disabled]):not([hidden]), input:not([disabled]):not([type="hidden"]), textarea:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    modal
  ).filter((el) => el.getClientRects().length > 0);
  if (!focusables.length) {
    event.preventDefault();
    modal.focus();
    return;
  }
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (event.shiftKey && (document.activeElement === first || document.activeElement === modal)) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function bindGlobalEvents() {
  document.addEventListener("click", onDocumentClick);
  document.addEventListener("submit", onDocumentSubmit);
  document.addEventListener("input", onNoteInput);
  document.addEventListener("input", onChatInput);
  document.addEventListener("change", onConditionChange);
  document.addEventListener("change", onFileChange);
  document.addEventListener("keydown", onKeyDown);
  document.addEventListener("pointerdown", () => audio.unlock(), { once: true });
  window.addEventListener("hashchange", () => {
    const route = parseRoute();
    if (route !== ui.route) transitionTo(route);
  });
  window.addEventListener("online", () => {
    maybeCheckUpdatesOnBoot();
  });
  document.addEventListener("visibilitychange", () => {
    if (!document.hidden) checkDayChange();
  });
  window.addEventListener("beforeunload", flushNote);
}

boot();
