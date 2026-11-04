/*
 * 页面模板。只负责拼 HTML，不碰数据。
 */

import { MOODS, dayOfYear, relativeLabel, weekday } from "./store.js";

const ICONS = {
  pen: '<path d="M4 20l4.2-1 9.6-9.6a2 2 0 0 0 0-2.8l-.4-.4a2 2 0 0 0-2.8 0L5 15.8z"/><path d="M13.5 6.5l4 4"/>',
  calendar: '<rect x="3.5" y="5" width="17" height="15.5" rx="3"/><path d="M8 3.5v3M16 3.5v3M3.5 10h17"/>',
  user: '<circle cx="12" cy="8.5" r="3.6"/><path d="M4.8 20c.7-3.6 3.6-5.6 7.2-5.6s6.5 2 7.2 5.6"/>',
  left: '<path d="M14.5 5.5L8 12l6.5 6.5"/>',
  right: '<path d="M9.5 5.5L16 12l-6.5 6.5"/>',
  download: '<path d="M12 4v11"/><path d="M7.5 11L12 15.5 16.5 11"/><path d="M4.5 19.5h15"/>',
  upload: '<path d="M12 20V9"/><path d="M7.5 13L12 8.5 16.5 13"/><path d="M4.5 4.5h15"/>',
  trash: '<path d="M4.5 7h15"/><path d="M9.5 7V4.8h5V7"/><path d="M6.5 7l.9 12.2h9.2L17.5 7"/>',
  close: '<path d="M6 6l12 12M18 6L6 18"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2.8v2M12 19.2v2M2.8 12h2M19.2 12h2M5.5 5.5l1.4 1.4M17.1 17.1l1.4 1.4M18.5 5.5l-1.4 1.4M6.9 17.1l-1.4 1.4"/>',
  moon: '<path d="M20 14.4A8.4 8.4 0 0 1 9.6 4a8.4 8.4 0 1 0 10.4 10.4z"/>',
  spark: '<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/>',
  check: '<path d="M5 12.5l4.5 4.5L19 7"/>'
};

export function ico(name, cls = "") {
  const path = ICONS[name] || ICONS.spark;
  return `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${path}</svg>`;
}

const MOOD_FACES = {
  low: '<circle cx="12" cy="12" r="8.6"/><path d="M8.8 15.4c.9-1.1 2-1.6 3.2-1.6s2.3.5 3.2 1.6"/><path d="M9.2 9.6h.01M14.8 9.6h.01"/>',
  meh: '<circle cx="12" cy="12" r="8.6"/><path d="M8.6 12.4h6.8"/><path d="M9.2 9.4h.01M14.8 9.4h.01"/>',
  ok: '<circle cx="12" cy="12" r="8.6"/><path d="M8.4 11.6a3.6 3.6 0 0 1 3.6-2.6 3.6 3.6 0 0 1 3.6 2.6z"/><path d="M12 14.6v1.2"/>',
  good: '<circle cx="12" cy="12" r="8.6"/><path d="M8.4 13.5c.9 1.4 2.1 2.1 3.6 2.1s2.7-.7 3.6-2.1"/><path d="M9.2 9.6h.01M14.8 9.6h.01"/>',
  great: '<circle cx="12" cy="12" r="8.6"/><path d="M8 13.2c1 2 2.4 3 4 3s3-1 4-3"/>'
};

export function moodFace(id, cls = "") {
  const face = MOOD_FACES[id] || MOOD_FACES.meh;
  return `<svg${cls ? ` class="${cls}"` : ""} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${face}</svg>`;
}

export function renderNav(route) {
  const items = [
    { id: "write", label: "写", icon: "pen" },
    { id: "calendar", label: "日历", icon: "calendar" },
    { id: "me", label: "我", icon: "user" }
  ];
  return items
    .map((item) => {
      const active = route === item.id;
      return `<a class="nav-item${active ? " is-active" : ""}" href="#/${item.id}" data-nav${active ? ' aria-current="page"' : ""}>${ico(item.icon)}<span>${item.label}</span></a>`;
    })
    .join("");
}

export function renderWrite({ key, entry, isToday, prompt, echo, showPrompt, savedAt, tagDraft }) {
  const date = new Date(`${key}T00:00:00`);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const year = date.getFullYear();
  const rel = relativeLabel(key);
  const chars = entry.text.replace(/\s/g, "").length;

  const moods = MOODS.map(
    (m) =>
      `<button class="mood${entry.mood === m.id ? " is-active" : ""}" type="button" data-mood="${m.id}" aria-pressed="${entry.mood === m.id}">${moodFace(m.id)}<span>${m.label}</span></button>`
  ).join("");

  const tags = entry.tags
    .map(
      (t) =>
        `<span class="tag">${escapeHtml(t)}<button type="button" data-remove-tag="${escapeAttr(t)}" aria-label="删掉标签">×</button></span>`
    )
    .join("");

  return `
    <article class="write">
      <p class="kicker">
        <span>${year}年${month}月${day}日</span>
        <span class="dot">·</span>
        <span>${weekday(key)}</span>
        <span class="dot">·</span>
        <span>第 ${dayOfYear(key)} 天</span>
        ${rel ? `<span class="dot">·</span><span>${rel}</span>` : ""}
      </p>
      <h2 class="date-title">${month}月${day}日</h2>
      <p class="date-sub">${isToday ? "今天想写点什么？写一句也算。" : "补写这一天。写多少都可以。"}</p>

      <div class="mood-row" role="group" aria-label="这天的心情">${moods}</div>

      ${
        showPrompt
          ? `<section class="prompt-card">
               <p class="prompt-label">不知道写什么</p>
               <p id="prompt-text">${escapeHtml(prompt)}</p>
               <div class="prompt-actions">
                 <button class="link-btn" type="button" data-action="next-prompt">换一句</button>
                 <button class="link-btn" type="button" data-action="dismiss-prompt">先不写</button>
               </div>
             </section>`
          : ""
      }

      <div class="editor-wrap">
        <textarea id="editor" class="editor" spellcheck="false" placeholder="今天……">${escapeHtml(entry.text)}</textarea>
      </div>
      <div class="rule"></div>
      <div class="write-foot">
        <span id="char-count">${chars} 字</span>
        <span class="saved" id="saved-state">${savedAt ? `已保存 · ${escapeHtml(savedAt)}` : ""}</span>
      </div>

      <div class="tag-row">
        ${tags}
        <input class="tag-input" id="tag-input" type="text" maxlength="12" placeholder="＋ 标签" aria-label="添加标签" value="${escapeAttr(tagDraft || "")}">
      </div>

      ${
        echo
          ? `<section class="echo">
               <div class="echo__head">${ico("spark")}<span>${echo.label}</span></div>
               <p class="echo__text">${escapeHtml(echo.text)}</p>
               <button class="link-btn" type="button" data-action="open-echo" data-key="${echo.key}">读那一天 ›</button>
             </section>`
          : ""
      }
    </article>
  `;
}

export function renderCalendar({ year, month, cells, todayKey, selectedKey }) {
  const week = ["日", "一", "二", "三", "四", "五", "六"].map((w) => `<span>${w}</span>`).join("");
  const grid = cells
    .map((cell) => {
      if (!cell) return '<span class="cal-cell is-blank" aria-hidden="true"></span>';
      const classes = ["cal-cell"];
      if (cell.level) classes.push(`lv${cell.level}`);
      if (cell.key === todayKey) classes.push("is-today");
      if (cell.key === selectedKey) classes.push("is-selected");
      return `<button class="${classes.join(" ")}" type="button" data-day="${cell.key}" aria-label="${cell.key}${cell.level ? "，有记录" : ""}">
        <span>${cell.day}</span>
        ${cell.level ? '<i class="bar"></i>' : ""}
      </button>`;
    })
    .join("");

  return `
    <section class="calendar">
      <div class="cal-head">
        <div>
          <h2 class="cal-title">${year}年${month}月</h2>
          <p class="cal-sub">点一天，回到那一天。</p>
        </div>
        <div class="cal-nav">
          <button type="button" data-action="prev-month" aria-label="上个月">${ico("left")}</button>
          <button type="button" data-action="next-month" aria-label="下个月">${ico("right")}</button>
        </div>
      </div>
      <div class="cal-week">${week}</div>
      <div class="cal-grid">${grid}</div>
      <p class="cal-legend">
        <span>写得越多，下面这条越深</span>
        <i></i><i class="lv1"></i><i class="lv2"></i><i class="lv3"></i>
      </p>
      <div class="cal-preview" id="cal-preview"></div>
    </section>
  `;
}

export function renderPreview(entry, key) {
  if (!entry) {
    return `<p class="cal-preview__text" style="color:var(--muted)">这一天还没有字。点进去写一点。</p>`;
  }
  const mood = MOODS.find((m) => m.id === entry.mood);
  return `
    <p class="cal-preview__date">${key} ${weekday(key)}${mood ? ` · ${mood.label}` : ""}</p>
    <p class="cal-preview__text">${escapeHtml(entry.text || "（这天只标了心情）")}</p>
  `;
}

export function renderMe({ stats, settings, version }) {
  const themeSeg = ["auto", "light", "dark"]
    .map(
      (id) =>
        `<button type="button" data-theme-opt="${id}" class="${settings.theme === id ? "is-active" : ""}">${{ auto: "跟随系统", light: "浅色", dark: "深色" }[id]}</button>`
    )
    .join("");
  const fontSeg = ["s", "m", "l"]
    .map(
      (id) => `<button type="button" data-font-opt="${id}" class="${settings.font === id ? "is-active" : ""}">${{ s: "小", m: "中", l: "大" }[id]}</button>`
    )
    .join("");

  return `
    <section class="me">
      <div class="section">
        <p class="section__title">写到现在</p>
        <div class="stats">
          <div class="stat"><b>${stats.days}</b><span>写过的天数</span></div>
          <div class="stat"><b>${stats.chars.toLocaleString("zh-CN")}</b><span>总字数</span></div>
          <div class="stat"><b>${stats.streak}</b><span>连续天数</span></div>
        </div>
        <p class="cal-sub" style="margin-top:12px">这个月写了 ${stats.monthCount} 天。数字只是记录，不是成绩单。</p>
      </div>

      <div class="section">
        <p class="section__title">显示</p>
        <div class="rows">
          <div class="row" style="cursor:default">
            <span class="row__copy"><b>主题</b><small>默认跟随系统</small></span>
            <span class="row__end"><span class="seg">${themeSeg}</span></span>
          </div>
          <div class="row" style="cursor:default">
            <span class="row__copy"><b>字号</b><small>正文与标题一起变</small></span>
            <span class="row__end"><span class="seg">${fontSeg}</span></span>
          </div>
        </div>
      </div>

      <div class="section">
        <p class="section__title">数据</p>
        <div class="rows">
          <button class="row" type="button" data-action="export-json">
            <span class="row__copy"><b>导出备份</b><small>一个 JSON 文件，能再导回来</small></span>
            <span class="row__end">${ico("download")}</span>
          </button>
          <button class="row" type="button" data-action="export-md">
            <span class="row__copy"><b>导出 Markdown</b><small>按日期排好，能放进别的笔记软件</small></span>
            <span class="row__end">${ico("download")}</span>
          </button>
          <button class="row" type="button" data-action="import">
            <span class="row__copy"><b>导入备份</b><small>同一天取字数多的那份</small></span>
            <span class="row__end">${ico("upload")}</span>
          </button>
          <button class="row" type="button" data-action="clear-all">
            <span class="row__copy"><b>清空全部</b><small>删掉这台设备上的所有记录</small></span>
            <span class="row__end">${ico("trash")}</span>
          </button>
        </div>
      </div>

      <p class="about">
        <strong>日记 ${version}</strong><br>
        所有内容只保存在这台设备的浏览器里，不上传、不需要登录，也没有人能看到。<br>
        换设备或换浏览器之前，记得先导出一份备份。
      </p>
    </section>
  `;
}

export function escapeHtml(text) {
  return String(text).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

export function escapeAttr(text) {
  return escapeHtml(text).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* ---------------------------------------------------------------- 搜索 */

export function renderSearchBox() {
  return `
    <section class="search">
      <label class="search__label" for="search-input">找一段话</label>
      <input class="search__input" id="search-input" type="search" placeholder="输入一句话、一个词，或者一个标签" autocomplete="off">
      <div class="search__results" id="search-results"></div>
    </section>
  `;
}

export function renderSearchResults(list, query) {
  if (!query.trim()) return "";
  if (!list.length) {
    return `<p class="search__empty">没有找到「${escapeHtml(query)}」。换个词试试。</p>`;
  }
  return list
    .map((entry) => {
      const mood = MOODS.find((m) => m.id === entry.mood);
      const snippet = buildSnippet(entry.text, query);
      return `<button class="search-hit" type="button" data-key="${entry.key}">
        <span class="search-hit__date">${entry.key}${mood ? ` · ${mood.label}` : ""}</span>
        <span class="search-hit__text">${snippet}</span>
      </button>`;
    })
    .join("");
}

function buildSnippet(text, query) {
  const clean = text.replace(/\s+/g, " ").trim();
  if (!clean) return "（这天只标了心情）";
  const index = clean.toLowerCase().indexOf(query.trim().toLowerCase());
  if (index < 0) return escapeHtml(clean.slice(0, 90));
  const start = Math.max(0, index - 24);
  const slice = clean.slice(start, start + 96);
  return `${start > 0 ? "…" : ""}${escapeHtml(slice)}${start + 96 < clean.length ? "…" : ""}`;
}

export function renderRandomLink(hasEntries) {
  if (!hasEntries) return "";
  return `<p class="search__foot"><button class="link-btn" type="button" data-action="random-page">想不起来写什么？随便翻一页 ›</button></p>`;
}
