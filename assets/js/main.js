/*
 * 入口：路由、渲染、事件。
 */

import {
  MOODS,
  allEntries,
  clearAll,
  dateKey,
  daysInMonth,
  exportMarkdown,
  exportObject,
  firstWeekday,
  getEntry,
  getSettings,
  hasEntry,
  importObject,
  parseKey,
  randomPastKey,
  removeLegacyData,
  searchEntries,
  setSetting,
  stats,
  todayKey,
  updateEntry
} from "./store.js";
import { pickPrompt } from "./prompts.js";
import {
  escapeAttr,
  escapeHtml,
  ico,
  renderCalendar,
  renderMe,
  renderNav,
  renderPreview,
  renderRandomLink,
  renderSearchBox,
  renderSearchResults,
  renderWrite
} from "./views.js";

const APP_VERSION = "1.0.2";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

const ui = {
  route: "write",
  key: todayKey(),
  calYear: new Date().getFullYear(),
  calMonth: new Date().getMonth() + 1,
  selectedKey: "",
  prompt: pickPrompt(),
  promptHidden: false,
  tagDraft: "",
  search: "",
  savedAt: "",
  saveTimer: null
};

/* ---------------------------------------------------------------- 工具 */

function toast(text, ms = 2200) {
  const root = $("#toast-root");
  if (!root) return;
  const el = document.createElement("div");
  el.className = "toast";
  el.textContent = text;
  root.appendChild(el);
  window.setTimeout(() => el.remove(), ms);
}

function openModal(html) {
  const root = $("#modal-root");
  if (!root) return;
  root.innerHTML = `<div class="modal" role="dialog" aria-modal="true">${html}</div>`;
  root.hidden = false;
  const focusable = root.querySelector("button");
  if (focusable) focusable.focus({ preventScroll: true });
}

function closeModal() {
  const root = $("#modal-root");
  if (!root) return;
  root.hidden = true;
  root.innerHTML = "";
}

function setNav(open) {
  document.body.classList.toggle("nav-open", open);
  const scrim = $("#scrim");
  if (scrim) scrim.hidden = !open;
  const btn = $("#menu-btn");
  if (btn) btn.setAttribute("aria-expanded", String(open));
}

function applyTheme(settings) {
  const html = document.documentElement;
  if (settings.theme === "auto") html.removeAttribute("data-theme");
  else html.setAttribute("data-theme", settings.theme);
  const scale = { s: 0.92, m: 1, l: 1.12 }[settings.font] || 1;
  html.style.setProperty("--fs", String(scale));
}

/* ---------------------------------------------------------------- 路由 */

const ROUTES = ["write", "calendar", "me"];

function parseHash() {
  const raw = String(location.hash || "").replace(/^#\/?/, "");
  const [head, arg] = raw.split("/");
  if (head === "write" && arg && /^\d{4}-\d{2}-\d{2}$/.test(arg)) {
    ui.route = "write";
    ui.key = arg;
    return;
  }
  ui.route = ROUTES.includes(head) ? head : "write";
  if (head !== "write" || !arg) {
    if (ui.route === "write" && arg !== ui.key) {
      /* keep current key */
    }
  }
}

function go(path) {
  flushSave();
  if (location.hash === `#/${path}`) render();
  else location.hash = `#/${path}`;
}

/* ---------------------------------------------------------------- 渲染 */

function render() {
  const settings = getSettings();
  applyTheme(settings);

  $("#nav").innerHTML = renderNav(ui.route);
  $("#topbar-title").textContent = { write: "写", calendar: "日历", me: "我" }[ui.route];
  $("#rail-foot").innerHTML = `${stats().days} 天 · ${stats().chars.toLocaleString("zh-CN")} 字<br>只存在这台设备上`;
  document.title = { write: "日记", calendar: "日历 · 日记", me: "我 · 日记" }[ui.route];

  const page = $("#page");
  if (ui.route === "write") page.innerHTML = viewWrite();
  else if (ui.route === "calendar") page.innerHTML = viewCalendar();
  else page.innerHTML = renderMe({ stats: stats(), settings, version: APP_VERSION });

  bind();
  setNav(false);
}

function viewWrite() {
  const entry = getEntry(ui.key);
  const isEmpty = !entry.text.trim() && !entry.mood && !entry.tags.length;
  return renderWrite({
    key: ui.key,
    entry,
    isToday: ui.key === todayKey(),
    prompt: ui.prompt,
    echo: findEcho(ui.key),
    showPrompt: isEmpty && !ui.promptHidden,
    savedAt: ui.savedAt,
    tagDraft: ui.tagDraft
  });
}

function viewCalendar() {
  const cells = buildCells(ui.calYear, ui.calMonth);
  const total = allEntries().length;
  return (
    renderCalendar({
      year: ui.calYear,
      month: ui.calMonth,
      cells,
      todayKey: todayKey(),
      selectedKey: ui.selectedKey
    }) +
    renderSearchBox() +
    renderRandomLink(total > 2)
  );
}

function buildCells(year, month) {
  const lead = firstWeekday(year, month);
  const total = daysInMonth(year, month);
  const cells = [];
  for (let i = 0; i < lead; i += 1) cells.push(null);
  for (let day = 1; day <= total; day += 1) {
    const key = `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
    const entry = getEntry(key);
    const len = entry.text.replace(/\s/g, "").length;
    let level = 0;
    if (hasEntry(key)) level = len > 220 ? 3 : len > 60 ? 2 : 1;
    cells.push({ day, key, level });
  }
  return cells;
}

function findEcho(key) {
  const [y, m, d] = key.split("-");
  const prevKey = `${Number(y) - 1}-${m}-${d}`;
  const entry = getEntry(prevKey);
  if (!entry.text.trim()) return null;
  return {
    key: prevKey,
    label: `去年今天 · ${Number(y) - 1}年${Number(m)}月${Number(d)}日`,
    text: entry.text.trim().slice(0, 180)
  };
}

/* ---------------------------------------------------------------- 事件 */

function bind() {
  if (ui.route === "write") bindWrite();
  else if (ui.route === "calendar") bindCalendar();
  else bindMe();
}

function bindWrite() {
  const editor = $("#editor");
  if (!editor) return;
  autoSize(editor, true);
  editor.addEventListener("input", () => {
    autoSize(editor);
    const chars = editor.value.replace(/\s/g, "").length;
    const count = $("#char-count");
    if (count) count.textContent = `${chars} 字`;
    const stateEl = $("#saved-state");
    if (stateEl) {
      stateEl.textContent = "正在写…";
      stateEl.classList.add("is-saving");
    }
    window.clearTimeout(ui.saveTimer);
    ui.saveTimer = window.setTimeout(() => {
      const ok = commitText(editor.value);
      markSaved(ok);
    }, 550);
  });
  editor.addEventListener("blur", () => {
    flushSave();
  });

  $$("[data-mood]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.mood;
      const current = getEntry(ui.key).mood;
      const next = current === id ? "" : id;
      updateEntry(ui.key, { mood: next });
      $$("[data-mood]").forEach((b) => {
        const on = b.dataset.mood === next;
        b.classList.toggle("is-active", on);
        b.setAttribute("aria-pressed", String(on));
      });
      markSaved(true);
    });
  });

  const tagInput = $("#tag-input");
  if (tagInput) {
    tagInput.addEventListener("keydown", (event) => {
      if (event.key !== "Enter") return;
      event.preventDefault();
      const value = tagInput.value.trim().replace(/^#/, "");
      if (!value) return;
      const entry = getEntry(ui.key);
      if (entry.tags.includes(value)) {
        tagInput.value = "";
        return;
      }
      updateEntry(ui.key, { tags: [...entry.tags, value].slice(0, 12) });
      ui.tagDraft = "";
      render();
      const next = $("#tag-input");
      if (next) next.focus();
    });
    tagInput.addEventListener("input", () => {
      ui.tagDraft = tagInput.value;
    });
  }

  $$("[data-remove-tag]").forEach((btn) => {
    btn.addEventListener("click", () => {
      const tag = btn.dataset.removeTag;
      const entry = getEntry(ui.key);
      updateEntry(ui.key, { tags: entry.tags.filter((t) => t !== tag) });
      render();
    });
  });

  const promptActions = $$("[data-action]");
  promptActions.forEach((btn) => {
    if (btn.dataset.action === "next-prompt") {
      btn.addEventListener("click", () => {
        ui.prompt = pickPrompt();
        const el = $("#prompt-text");
        if (el) el.textContent = ui.prompt;
      });
    }
    if (btn.dataset.action === "dismiss-prompt") {
      btn.addEventListener("click", () => {
        ui.promptHidden = true;
        const card = $(".prompt-card");
        if (card) card.remove();
      });
    }
    if (btn.dataset.action === "open-echo") {
      btn.addEventListener("click", () => go(`write/${btn.dataset.key}`));
    }
  });
}

function bindCalendar() {
  $$("[data-day]").forEach((btn) => {
    btn.addEventListener("click", () => {
      ui.selectedKey = btn.dataset.day;
      $$("[data-day]").forEach((b) => b.classList.toggle("is-selected", b.dataset.day === ui.selectedKey));
      const preview = $("#cal-preview");
      if (preview) {
        preview.innerHTML = `${renderPreview(hasEntry(ui.selectedKey) ? getEntry(ui.selectedKey) : null, ui.selectedKey)}
          <div style="margin-top:14px"><button class="btn btn--small btn--primary" type="button" id="go-day">写这一天</button></div>`;
        const goDay = $("#go-day");
        if (goDay) goDay.addEventListener("click", () => go(`write/${ui.selectedKey}`));
      }
    });
  });

  const prev = $('[data-action="prev-month"]');
  const next = $('[data-action="next-month"]');
  if (prev) {
    prev.addEventListener("click", () => {
      ui.calMonth -= 1;
      if (ui.calMonth < 1) {
        ui.calMonth = 12;
        ui.calYear -= 1;
      }
      render();
    });
  }
  if (next) {
    next.addEventListener("click", () => {
      ui.calMonth += 1;
      if (ui.calMonth > 12) {
        ui.calMonth = 1;
        ui.calYear += 1;
      }
      render();
    });
  }

  const preview = $("#cal-preview");
  if (preview) preview.innerHTML = `<p class="cal-preview__text" style="color:var(--muted)">点一天，看看那天写了什么。</p>`;

  const input = $("#search-input");
  const results = $("#search-results");
  if (input && results) {
    let timer = null;
    input.value = ui.search;
    const paint = () => {
      const query = input.value;
      ui.search = query;
      results.innerHTML = renderSearchResults(searchEntries(query), query);
      $$(".search-hit", results).forEach((hit) => {
        hit.addEventListener("click", () => go(`write/${hit.dataset.key}`));
      });
    };
    paint();
    input.addEventListener("input", () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(paint, 160);
    });
  }

  const random = $('[data-action="random-page"]');
  if (random) {
    random.addEventListener("click", () => {
      const key = randomPastKey(ui.key);
      if (key) go(`write/${key}`);
    });
  }
}

function bindMe() {
  $$("[data-theme-opt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSetting("theme", btn.dataset.themeOpt);
      render();
    });
  });
  $$("[data-font-opt]").forEach((btn) => {
    btn.addEventListener("click", () => {
      setSetting("font", btn.dataset.fontOpt);
      render();
    });
  });

  const handlers = {
    "export-json": () => downloadFile(`日记备份-${todayKey()}.json`, JSON.stringify(exportObject(), null, 2), "application/json"),
    "export-md": () => downloadFile(`日记-${todayKey()}.md`, exportMarkdown(), "text/markdown"),
    import: () => pickFile(),
    "clear-all": () => confirmClear()
  };
  Object.entries(handlers).forEach(([action, fn]) => {
    const btn = $(`[data-action="${action}"]`);
    if (btn) btn.addEventListener("click", fn);
  });
}

/* ---------------------------------------------------------------- 保存 */

function autoSize(el, reset = false) {
  if (reset) el.style.height = "auto";
  const target = Math.max(el.scrollHeight, 240);
  if (target > el.clientHeight + 2) el.style.height = `${target}px`;
}

function commitText(text) {
  const ok = updateEntry(ui.key, { text });
  const entry = getEntry(ui.key);
  const isEmpty = !entry.text.trim() && !entry.mood && !entry.tags.length;
  const card = $(".prompt-card");
  if (!isEmpty && card) card.remove();
  return ok !== undefined;
}

function markSaved(ok) {
  const now = new Date();
  ui.savedAt = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
  const el = $("#saved-state");
  if (el) {
    el.textContent = ok ? `已保存 · ${ui.savedAt}` : "存在这台设备上失败";
    el.classList.remove("is-saving");
  }
  const foot = $("#rail-foot");
  if (foot) {
    const s = stats();
    foot.innerHTML = `${s.days} 天 · ${s.chars.toLocaleString("zh-CN")} 字<br>只存在这台设备上`;
  }
}

function flushSave() {
  window.clearTimeout(ui.saveTimer);
  const editor = $("#editor");
  if (editor && ui.route === "write") {
    const value = editor.value;
    if (value !== getEntry(ui.key).text) {
      updateEntry(ui.key, { text: value });
      markSaved(true);
    }
  }
}

/* ---------------------------------------------------------------- 导入导出 */

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type: `${type};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 3000);
  toast("已经导出。");
}

function pickFile() {
  const input = document.createElement("input");
  input.type = "file";
  input.accept = "application/json,.json";
  input.style.cssText = "position:fixed;left:-9999px;width:1px;height:1px;opacity:0";
  document.body.appendChild(input);
  input.addEventListener("change", () => {
    const file = input.files && input.files[0];
    input.remove();
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const added = importObject(JSON.parse(String(reader.result || "{}")));
        render();
        toast(`导入了 ${added} 天。`);
      } catch (err) {
        toast(err?.message || "这份文件读不了。");
      }
    };
    reader.readAsText(file);
  }, { once: true });
  input.click();
}

function confirmClear() {
  openModal(`
    <h2>清空全部记录？</h2>
    <p>这台设备上写过的所有内容都会被删掉，删了找不回来。如果还想留着，先导出一份备份。</p>
    <div class="modal__actions">
      <button class="btn btn--ghost" type="button" data-modal="cancel">再想想</button>
      <button class="btn btn--danger" type="button" data-modal="ok">清空</button>
    </div>
  `);
  const ok = $('[data-modal="ok"]');
  const cancel = $('[data-modal="cancel"]');
  if (cancel) cancel.addEventListener("click", closeModal);
  if (ok) {
    ok.addEventListener("click", () => {
      clearAll();
      closeModal();
      ui.key = todayKey();
      ui.savedAt = "";
      render();
      toast("清空了。重新开始。");
    });
  }
}

/* ---------------------------------------------------------------- 启动 */

function bindShell() {
  const menu = $("#menu-btn");
  if (menu) menu.addEventListener("click", () => setNav(!document.body.classList.contains("nav-open")));
  const scrim = $("#scrim");
  if (scrim) scrim.addEventListener("click", () => setNav(false));
  const modalRoot = $("#modal-root");
  if (modalRoot) {
    modalRoot.addEventListener("click", (event) => {
      if (event.target === modalRoot) closeModal();
    });
  }
  document.addEventListener("click", (event) => {
    const nav = event.target.closest?.("[data-nav]");
    if (nav) setNav(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;
    if (!$("#modal-root")?.hidden) {
      closeModal();
      return;
    }
    setNav(false);
  });
  window.addEventListener("hashchange", () => {
    parseHash();
    render();
    const page = $("#page");
    if (page) page.scrollTop = 0;
    window.scrollTo({ top: 0 });
  });
  window.addEventListener("beforeunload", flushSave);
}

function boot() {
  removeLegacyData();
  parseHash();
  bindShell();
  render();
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(() => {});
    });
  }
}

boot();
