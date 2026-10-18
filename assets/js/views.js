import {
  APP_BUILD,
  APP_VERSION,
  CHANGELOG,
  CONDITION_TYPES,
  EFFORTS,
  ENERGY,
  HABIT_ICON_LABELS,
  HABIT_TIPS,
  REWARD_ICON_LABELS,
  TODAY_SUBS
} from "./data.js";
import { LOOK_PARTS } from "./character.js";
import { PLACES, PLACE_CATEGORIES } from "./place-data.js";
import { icon, iconTile } from "./icons.js";
import {
  conditionText,
  dateKicker,
  dateLabel,
  esc,
  greetingFor,
  monthTitle,
  pickDaily,
  shortDate,
  timeBucket
} from "./helpers.js";
import {
  getHabitCompletionCount,
  getMonthGrid,
  getNextReward,
  rewardProgress
} from "./store.js";

const NAV_ITEMS = [
  { route: "today", label: "今日", icon: "lantern" },
  { route: "habits", label: "小事", icon: "list" },
  { route: "diary", label: "日记", icon: "book" },
  { route: "rewards", label: "奖励", icon: "gift" },
  { route: "me", label: "小屋", icon: "user" }
];

export function renderAppBar({ state, stats }) {
  return `
    <a class="brand" href="#/today" data-nav aria-label="微光小屋首页">
      <span class="brand__mark">${icon("lantern")}</span>
      <span class="brand__text">
        <strong>微光小屋</strong>
        <small>GLIMMER NOOK</small>
      </span>
    </a>
    <div class="app-bar__right">
      <span class="top-points" title="积攒的微光">
        ${icon("spark")}
        <b>${stats.totalPoints}</b>
      </span>
      <button class="icon-btn sound-btn" type="button" data-action="toggle-sound" aria-label="${state.settings.sound ? "关闭音效" : "打开音效"}" aria-pressed="${state.settings.sound}">
        ${icon(state.settings.sound ? "sound" : "mute")}
      </button>
    </div>
  `;
}

export function renderNav({ route, claimableCount = 0, updateAvailable = false }) {
  const activeRoute = route === "places" ? "today" : route;
  return NAV_ITEMS.map((item) => {
    const active = item.route === activeRoute;
    const badge = item.route === "rewards" && claimableCount > 0
      ? `<span class="nav-badge" aria-label="${claimableCount} 份奖励可领取">${claimableCount}</span>`
      : "";
    const updateDot = item.route === "me" && updateAvailable
      ? `<span class="nav-update-dot" aria-label="有新版本可更新"></span>`
      : "";
    return `
      <a class="nav-item ${active ? "is-active" : ""}" href="#/${item.route}" data-nav ${active ? 'aria-current="page"' : ""}>
        <span class="nav-item__icon">${icon(item.icon)}${badge}${updateDot}</span>
        <span class="nav-item__label">${item.label}</span>
      </a>
    `;
  }).join("");
}

function todayChip(stats) {
  if (stats.currentStreak > 0) {
    return `<span class="chip">${icon("flame")}连续 ${stats.currentStreak} 天</span>`;
  }
  return `<span class="chip chip--soft">${icon("spark")}从今天开始</span>`;
}

function energyOptions(log) {
  return Object.entries(ENERGY).map(([key, item]) => {
    const active = log?.energy === key;
    return `
      <button class="energy-option ${active ? "is-active" : ""}" type="button" data-action="set-energy" data-energy="${key}" aria-pressed="${active}">
        <span class="energy-option__icon">${icon(item.icon)}</span>
        <span>${item.label}</span>
      </button>
    `;
  }).join("");
}

function renderTaskList(overview) {
  if (!overview.activeHabits.length) {
    return `
      <div class="empty-inline">
        ${icon("seed", "empty-inline__icon")}
        <div>
          <b>今天还没有安排小事</b>
          <p>从喝一杯水开始也可以。</p>
        </div>
        <button class="pixel-btn pixel-btn--small" type="button" data-action="open-habit-modal">加一件</button>
      </div>
    `;
  }
  return overview.activeHabits.map((habit) => {
    const done = overview.doneIds.has(habit.id);
    const effort = EFFORTS[habit.effort] || EFFORTS[2];
    return `
      <button class="task-row ${done ? "is-done" : ""}" type="button" data-action="toggle-habit" data-id="${esc(habit.id)}" aria-pressed="${done}" aria-label="${done ? "取消打卡" : "完成"}：${esc(habit.name)}">
        <span class="task-check">${done ? icon("check") : ""}</span>
        ${iconTile(habit.icon, "icon-tile--task")}
        <span class="task-copy">
          <b>${esc(habit.name)}</b>
          <small>${effort.label} · +${effort.points} 微光</small>
        </span>
        <span class="task-state">${done ? "已点亮" : `+${effort.points}`}</span>
      </button>
    `;
  }).join("");
}

function renderNextReward(next, hasRewards = false) {
  if (!next) {
    return `
      <div class="panel side-card next-reward">
        <div class="side-card__head">
          <span class="eyebrow">${icon(hasRewards ? "heart" : "gift")} ${hasRewards ? "奖励都收下了" : "下一份奖励"}</span>
        </div>
        <p class="muted-copy">${hasRewards ? "想再给自己点什么，随时可以写。期待本身也值得留着。" : "还没有给自己准备奖励。想要点什么，就写下来吧。"}</p>
        <button class="pixel-btn pixel-btn--ghost pixel-btn--small" type="button" data-action="open-reward-modal">${hasRewards ? "再设一个" : "设一个奖励"}</button>
      </div>
    `;
  }
  const { reward, progress, claimable } = next;
  return `
    <div class="panel side-card next-reward ${claimable ? "is-claimable" : ""}">
      <div class="side-card__head">
        <span class="eyebrow">${icon(claimable ? "spark" : "gift")} ${claimable ? "已经攒到了" : "下一份奖励"}</span>
        <button class="text-btn" type="button" data-action="go-rewards">全部奖励 ›</button>
      </div>
      <div class="next-reward__main">
        ${iconTile(reward.icon, "icon-tile--reward")}
        <div class="next-reward__copy">
          <b>${esc(reward.title)}</b>
          <small>${conditionText(reward.condition.type, reward.condition.value)}</small>
        </div>
        <span class="next-reward__count">${progress.current}/${progress.value}</span>
      </div>
      <div class="pixel-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${progress.value}" aria-valuenow="${progress.current}">
        <span style="width:${Math.round(progress.pct * 100)}%"></span>
      </div>
      <div class="next-reward__foot">
        <span>${claimable ? "等你收下它。" : `还差 ${progress.remaining} ${CONDITION_TYPES[reward.condition.type].unit}`}</span>
        <button class="pixel-btn pixel-btn--small ${claimable ? "pixel-btn--gold" : "pixel-btn--ghost"}" type="button" data-action="go-rewards">${claimable ? "去领取" : "看看"}</button>
      </div>
    </div>
  `;
}

export function renderToday(ctx) {
  const { state, stats, overview, speech } = ctx;
  const homePlace = ctx.homePlace || PLACES[0];
  const bucket = timeBucket();
  const greeting = greetingFor(bucket, state.profile.name);
  const sub = pickDaily(TODAY_SUBS);
  const pct = overview.total ? Math.round((overview.doneCount / overview.total) * 100) : 0;
  const next = getNextReward();
  const energy = overview.log?.energy || null;
  const note = overview.log?.note || "";
  const allDoneCopy = overview.allDone
    ? "都点亮了。去喝口水，伸个懒腰，今天不用再证明什么。"
    : overview.doneCount > 0
      ? `已经亮起 ${overview.doneCount} 个，剩下的不着急。`
      : "从最小的一件开始。做不动的话，先喘口气也算数。";

  return `
    <section class="today-page">
      <header class="today-head">
        <div class="today-head__copy">
          <p class="date-kicker">${dateKicker()}</p>
          <h1>${greeting}</h1>
          <p class="today-sub">${sub}</p>
        </div>
        <div class="today-chips">
          ${todayChip(stats)}
          <span class="chip">${icon("spark")}${stats.totalPoints} 微光</span>
        </div>
      </header>

      <div class="today-grid">
          <section class="panel scene-card" aria-label="小灯今天所在的场景">
            <div class="scene-frame home-scene-frame">
              <canvas id="scene-canvas" class="scene-canvas" width="384" height="216" role="img" aria-label="${esc(homePlace.name)}的像素场景，小灯在这里"></canvas>
              <div class="scene-top">
                <span class="scene-pill">${icon("flame")}今日点亮 ${overview.doneCount}/${overview.total}</span>
                <span class="scene-pill">${icon(homePlace.icon)} ${esc(homePlace.name)}</span>
              </div>
              <button class="place-scene-hit" type="button" data-action="poke-scene" aria-label="和小灯说说话，或者点点场景里的东西"></button>
              ${sceneHotspotMarkup(homePlace, "home-hotspot")}
              <div class="scene-speech" id="scene-speech" aria-live="polite">${esc(speech)}</div>
              <span class="scene-hint" id="scene-hint">点小灯或场景里的东西</span>
            </div>
            <div class="scene-footer">
              <div class="energy">
                <div class="energy__head">
                  <span class="energy__label">今天感觉怎么样？</span>
                  <span class="energy__note" id="energy-note">${energy ? ENERGY[energy].note : "选一个，不会影响打卡和奖励。"}</span>
                </div>
                <div class="energy__options">${energyOptions(overview.log)}</div>
              </div>
              <div class="scene-caption-row">
                <p class="scene-caption">${dateLabel()} · 今天的场景：${esc(homePlace.name)}</p>
                <div class="scene-caption-actions">
                  <button class="text-btn scene-dress-btn" type="button" data-action="go-places">${icon("map")} 去走走</button>
                  <button class="text-btn scene-dress-btn" type="button" data-action="open-wardrobe">${icon("user")} 换个样子</button>
                </div>
              </div>
            </div>
          </section>

          <section class="panel progress-panel">
            <div class="progress-panel__top">
              <div>
                <span class="eyebrow">${icon("spark")} 今日微光</span>
                <strong>${overview.doneCount}<span> / ${overview.total || 0} 件</span></strong>
              </div>
              <span class="points-badge">+${overview.todayPoints}</span>
            </div>
            <div class="pixel-progress pixel-progress--tall" role="progressbar" aria-valuemin="0" aria-valuemax="${overview.total}" aria-valuenow="${overview.doneCount}">
              <span style="width:${pct}%"></span>
            </div>
            <p class="progress-copy">${allDoneCopy}</p>
          </section>

          <section class="panel breathe-card">
            <div class="breathe-card__icon">${icon("leaf")}</div>
            <div class="breathe-card__copy">
              <b>${overview.log?.rest ? "今天已经来坐过了" : "累了，就停一下"}</b>
              <p>不用完成任务。跟着呼吸待半分钟，今天也算来过。</p>
            </div>
            <button class="pixel-btn pixel-btn--ghost pixel-btn--small" type="button" data-action="open-breathe">${overview.log?.rest ? "再坐一会儿" : "喘口气 · 半分钟"}</button>
          </section>

          <section class="panel task-panel">
            <div class="section-head">
              <div>
                <span class="eyebrow">TODAY'S LITTLE THINGS</span>
                <h2>今天的小事</h2>
              </div>
              <button class="text-btn text-btn--plus" type="button" data-action="open-habit-modal">${icon("plus")} 加一件</button>
            </div>
            <div class="task-list">${renderTaskList(overview)}</div>
            <p class="task-footnote">同一天每件小事只算一次。点错了，再点一下就能取消。</p>
          </section>

          ${renderNextReward(next, state.rewards.length > 0)}

          <section class="panel note-panel">
            <div class="note-label-row">
              <label class="note-label" for="daily-note">给今天留一句话 <span>不限字数</span></label>
              <a class="text-btn" href="#/diary" data-nav>打开日记本 ›</a>
            </div>
            <textarea id="daily-note" class="note-input" data-note rows="3" placeholder="今天……&#10;&#10;空一行，就是新的一段。">${esc(note)}</textarea>
            <div class="note-foot">
              <span class="muted">空一行分段 · 只保存在这台设备上</span>
              <span data-note-count>${note.length} 字</span>
            </div>
          </section>
      </div>
    </section>
  `;
}

function habitCard(habit) {
  const effort = EFFORTS[habit.effort] || EFFORTS[2];
  const count = getHabitCompletionCount(habit.id);
  return `
    <article class="panel habit-card ${habit.active ? "" : "is-archived"}">
      <div class="habit-card__top">
        ${iconTile(habit.icon, "icon-tile--habit")}
        <div class="habit-card__copy">
          <h3>${esc(habit.name)}</h3>
          <p>${effort.label} · 每天一次 · +${effort.points} 微光</p>
        </div>
        <button class="icon-btn" type="button" data-action="edit-habit" data-id="${esc(habit.id)}" aria-label="编辑 ${esc(habit.name)}">${icon("pen")}</button>
      </div>
      <div class="habit-card__meta">
        <span>累计完成 <b>${count}</b> 天</span>
        <span>${habit.active ? "正在今日清单里" : "已经收起来"}</span>
      </div>
      <div class="habit-card__foot">
        <button class="text-btn" type="button" data-action="toggle-archive" data-id="${esc(habit.id)}">${habit.active ? "先收起来" : "重新启用"}</button>
      </div>
    </article>
  `;
}

export function renderHabits({ state }) {
  const active = state.habits.filter((habit) => habit.active);
  const archived = state.habits.filter((habit) => !habit.active);
  const tip = pickDaily(HABIT_TIPS);
  return `
    <section class="sub-page habits-page">
      <header class="page-head">
        <div>
          <p class="date-kicker">YOUR LITTLE THINGS</p>
          <h1>我的小事</h1>
          <p class="page-sub">目标不用大。小到几乎不可能失败，才算好目标。</p>
        </div>
        <button class="pixel-btn pixel-btn--gold" type="button" data-action="open-habit-modal">${icon("plus")} 加一件小事</button>
      </header>

      ${active.length ? `
        <div class="habit-grid">${active.map(habitCard).join("")}</div>
      ` : `
        <div class="panel empty-state">
          <span class="empty-state__icon">${icon("seed")}</span>
          <h2>先放一件小事进来吧</h2>
          <p>「喝一杯水」「站起来伸个懒腰」「今天吃一顿饭」都可以。</p>
          <button class="pixel-btn pixel-btn--gold" type="button" data-action="open-habit-modal">${icon("plus")} 写下第一件小事</button>
        </div>
      `}

      ${archived.length ? `
        <section class="archived-block">
          <div class="section-head section-head--plain">
            <div>
              <span class="eyebrow">RESTING</span>
              <h2>先收起来的（${archived.length}）</h2>
            </div>
          </div>
          <div class="habit-grid">${archived.map(habitCard).join("")}</div>
        </section>
      ` : ""}

      <aside class="tip-card">
        <span class="tip-card__icon">${icon("spark")}</span>
        <div>
          <b>今天的小提示</b>
          <p>${tip}</p>
        </div>
      </aside>

      <footer class="page-quote">${icon("lantern")}<span>小屋今天也开着。你随时可以回来。</span></footer>
    </section>
  `;
}

function rewardCard(reward, stats) {
  const progress = rewardProgress(reward, stats);
  const claimed = Boolean(reward.claimedAt);
  const claimable = Boolean(reward.unlockedAt) && !claimed;
  const condition = CONDITION_TYPES[reward.condition.type];
  let stateLabel = "正在积攒";
  if (claimed) stateLabel = "已经收到";
  else if (claimable) stateLabel = "可以领取";
  return `
    <article class="panel reward-card ${claimed ? "is-claimed" : ""} ${claimable ? "is-claimable" : ""}">
      <div class="reward-card__top">
        ${iconTile(reward.icon, "icon-tile--reward")}
        <div class="reward-card__copy">
          <div class="reward-card__titleline">
            <h3>${esc(reward.title)}</h3>
            <span class="reward-state">${stateLabel}</span>
          </div>
          ${reward.note ? `<p>${esc(reward.note)}</p>` : `<p>${esc(condition.hint)}</p>`}
        </div>
      </div>
      <div class="reward-card__condition">
        <span>${condition.label} ${reward.condition.value} ${condition.unit}</span>
        <span>${progress.current} / ${progress.value}</span>
      </div>
      <div class="pixel-progress" role="progressbar" aria-valuemin="0" aria-valuemax="${progress.value}" aria-valuenow="${progress.current}">
        <span style="width:${Math.round(progress.pct * 100)}%"></span>
      </div>
      <div class="reward-card__foot">
        <span class="muted">
          ${claimed
            ? `收下于 ${shortDate(reward.claimedAt)}`
            : claimable
              ? "达成了。去真实地享受它吧。"
              : `还差 ${progress.remaining} ${condition.unit}`}
        </span>
        <div class="reward-card__actions">
          ${!claimed ? `<button class="text-btn" type="button" data-action="edit-reward" data-id="${esc(reward.id)}">${icon("pen")} 编辑</button>` : ""}
          ${claimable ? `<button class="pixel-btn pixel-btn--gold pixel-btn--small" type="button" data-action="claim-reward" data-id="${esc(reward.id)}">${icon("gift")} 领取</button>` : ""}
        </div>
      </div>
    </article>
  `;
}

export function renderRewards({ state, stats }) {
  const claimable = state.rewards.filter((reward) => reward.unlockedAt && !reward.claimedAt);
  const locked = state.rewards
    .filter((reward) => !reward.unlockedAt && !reward.claimedAt)
    .map((reward) => ({ reward, progress: rewardProgress(reward, stats) }))
    .sort((a, b) => b.progress.pct - a.progress.pct)
    .map((item) => item.reward);
  const claimed = state.rewards.filter((reward) => reward.claimedAt);

  return `
    <section class="sub-page rewards-page">
      <header class="page-head">
        <div>
          <p class="date-kicker">THINGS WORTH WAITING FOR</p>
          <h1>给自己的奖励</h1>
          <p class="page-sub">不是完成任务后的工资，是你愿意好好对待自己的证据。</p>
        </div>
        <button class="pixel-btn pixel-btn--gold" type="button" data-action="open-reward-modal">${icon("plus")} 设一个奖励</button>
      </header>

      ${state.rewards.length ? `
        <div class="reward-summary">
          <span>${icon("gift")} 已经收到 <b>${claimed.length}</b> 份</span>
          <span>${claimable.length ? `${claimable.length} 份正在发光` : "慢慢攒，不着急"}</span>
        </div>
      ` : ""}

      ${claimable.length ? `
        <section class="reward-section">
          <div class="section-head section-head--plain">
            <div>
              <span class="eyebrow">READY TO OPEN</span>
              <h2>可以领取了</h2>
            </div>
          </div>
          <div class="reward-grid">${claimable.map((reward) => rewardCard(reward, stats)).join("")}</div>
        </section>
      ` : ""}

      ${locked.length ? `
        <section class="reward-section">
          <div class="section-head section-head--plain">
            <div>
              <span class="eyebrow">SAVING UP</span>
              <h2>正在积攒</h2>
            </div>
          </div>
          <div class="reward-grid">${locked.map((reward) => rewardCard(reward, stats)).join("")}</div>
        </section>
      ` : ""}

      ${claimed.length ? `
        <section class="reward-section">
          <div class="section-head section-head--plain">
            <div>
              <span class="eyebrow">ALREADY YOURS</span>
              <h2>已经收到</h2>
            </div>
          </div>
          <div class="reward-grid reward-grid--claimed">${claimed.map((reward) => rewardCard(reward, stats)).join("")}</div>
        </section>
      ` : ""}

      ${!state.rewards.length ? `
        <div class="panel empty-state">
          <span class="empty-state__icon">${icon("gift")}</span>
          <h2>还没有给自己的奖励</h2>
          <p>一杯奶茶、一集喜欢的剧、买一本想看的书，都可以。写下来，让期待有个形状。</p>
          <button class="pixel-btn pixel-btn--gold" type="button" data-action="open-reward-modal">${icon("plus")} 写第一份奖励</button>
        </div>
      ` : ""}

      <aside class="tip-card">
        <span class="tip-card__icon">${icon("heart")}</span>
        <div>
          <b>领取以后，记得真的去享受它</b>
          <p>不用觉得「这点小事也值得奖励」。你愿意继续出现，本身就很值得。</p>
        </div>
      </aside>

      <footer class="page-quote">${icon("lantern")}<span>小屋今天也开着。你随时可以回来。</span></footer>
    </section>
  `;
}

function calendarCells(cells) {
  return cells.map((cell) => {
    if (!cell) return `<span class="calendar-cell is-empty" aria-hidden="true"></span>`;
    const level = cell.taskCount >= 3 ? 3 : cell.taskCount === 2 ? 2 : cell.taskCount === 1 ? 1 : 0;
    const classes = [
      "calendar-cell",
      cell.shown ? "is-shown" : "",
      level ? `level-${level}` : "",
      cell.rest && !cell.taskCount ? "is-rest" : "",
      cell.isToday ? "is-today" : "",
      cell.isFuture ? "is-future" : ""
    ].filter(Boolean).join(" ");
    const label = cell.shown
      ? `${cell.key}，完成 ${cell.taskCount} 件${cell.rest ? "，来喘过气" : ""}`
      : `${cell.key}，没有记录`;
    return `
      <span class="${classes}" aria-label="${label}" title="${label}">
        <span class="calendar-day">${cell.day}</span>
        ${cell.shown ? `<i class="calendar-dot"></i>` : ""}
      </span>
    `;
  }).join("");
}

function sceneHotspotMarkup(place, action) {
  return place.hotspots.map((spot) => `
    <button
      class="place-hotspot"
      type="button"
      style="left:${(spot.x * 100).toFixed(2)}%;top:${(spot.y * 100).toFixed(2)}%;width:${(spot.w * 100).toFixed(2)}%;height:${(spot.h * 100).toFixed(2)}%"
      data-action="${action}"
      data-place="${esc(place.id)}"
      data-hotspot="${esc(spot.id)}"
      data-label="${esc(spot.label)}"
      aria-label="看看${esc(spot.label)}">
      <span class="place-hotspot__dot">${icon("spark")}</span>
    </button>
  `).join("");
}

function placeCard(place) {
  const category = PLACE_CATEGORIES[place.category];
  return `
    <button class="place-card" type="button" data-action="open-place" data-place="${esc(place.id)}" aria-label="去${esc(place.name)}待一会儿">
      <span class="place-card__scene">
        <canvas class="place-card__canvas" data-place-preview="${esc(place.id)}" width="384" height="216" aria-hidden="true"></canvas>
        <span class="place-card__badge">${icon(place.icon)} ${esc(category?.label || "")}</span>
        <span class="place-card__enter">进去看看 ›</span>
      </span>
      <span class="place-card__copy">
        <b>${esc(place.name)}</b>
        <small>${esc(place.tagline)}</small>
      </span>
    </button>
  `;
}

function placeSection(categoryId, places) {
  const category = PLACE_CATEGORIES[categoryId];
  return `
    <section class="place-section">
      <div class="section-head section-head--plain">
        <div>
          <span class="eyebrow">${categoryId === "home" ? "AT HOME" : "OUT THERE"}</span>
          <h2>${esc(category.label)}</h2>
        </div>
        <span class="place-section__note">${esc(category.note)} · ${places.length} 个地方</span>
      </div>
      <div class="place-grid">${places.map(placeCard).join("")}</div>
    </section>
  `;
}

function renderPlaceScene(place, speech) {
  const category = PLACE_CATEGORIES[place.category];
  const hotspots = sceneHotspotMarkup(place, "place-hotspot");
  return `
    <section class="sub-page place-view">
      <header class="place-view__head">
        <button class="icon-btn" type="button" data-action="leave-place" aria-label="回到场景列表">${icon("left")}</button>
        <div class="place-view__title">
          <p class="date-kicker">${esc(category?.label || "")} / ${esc(place.sceneLabel)}</p>
          <h1>${esc(place.name)}</h1>
          <p class="page-sub">${esc(place.tagline)}</p>
        </div>
        <span class="chip">${icon(place.icon)} ${esc(place.name)}</span>
      </header>

      <section class="panel place-stage">
        <div class="place-frame">
          <canvas id="place-canvas" class="scene-canvas" width="384" height="216" role="img" aria-label="${esc(place.name)}的像素场景，小灯在这里"></canvas>
          <div class="scene-top">
            <span class="scene-pill">${icon(place.icon)} ${esc(place.name)}</span>
            <span class="scene-pill scene-pill--level">${esc(place.sceneLabel)}</span>
          </div>
          <button class="place-scene-hit" type="button" data-action="place-character" aria-label="和小灯说说话，或者点点场景里的东西"></button>
          ${hotspots}
          <div class="scene-speech place-speech" id="place-speech" aria-live="polite">${esc(speech)}</div>
          <span class="scene-hint">点小灯或场景里的东西</span>
        </div>
        <div class="place-stage__foot">
          <p class="place-quote">“${esc(place.quote)}”</p>
          <p class="place-subhint">${place.hotspots.map((spot) => spot.label).join(" · ")}</p>
          <div class="place-actions">
            <button class="pixel-btn pixel-btn--gold pixel-btn--small" type="button" data-action="place-stay">${icon("heart")} 待一会儿</button>
            <button class="pixel-btn pixel-btn--ghost pixel-btn--small" type="button" data-action="leave-place">${icon("map")} 换个地方</button>
            <button class="text-btn" type="button" data-action="go-today">回今日 ›</button>
          </div>
        </div>
      </section>

      <footer class="page-quote">${icon("lantern")}<span>这里不用打卡。想走的时候，随时可以走。</span></footer>
    </section>
  `;
}

export function renderPlaces({ state, activePlace = null, speech = "" }) {
  const place = activePlace ? PLACES.find((item) => item.id === activePlace) : null;
  if (place) return renderPlaceScene(place, speech);
  const home = PLACES.filter((item) => item.category === "home");
  const outdoor = PLACES.filter((item) => item.category === "outdoor");
  return `
    <section class="sub-page places-page">
      <header class="page-head">
        <div>
          <p class="date-kicker">GO SOMEWHERE, GENTLY</p>
          <h1>去走走</h1>
          <p class="page-sub">不用真的出门，也不用打卡。去某个地方坐一会儿，点点东西，听小灯说两句话。</p>
        </div>
        <span class="chip">${icon("map")} ${PLACES.length} 个地方</span>
      </header>

      <aside class="places-welcome">
        <span class="places-welcome__icon">${icon("door")}</span>
        <div>
          <b>选一个地方，待一会儿吧。</b>
          <p>每个场景里都有几样可以点击的东西。没有任务，也没有正确路线。</p>
        </div>
      </aside>

      ${placeSection("home", home)}
      ${placeSection("outdoor", outdoor)}

      <footer class="page-quote">${icon("lantern")}<span>不管去哪里，回来的时候，小屋都亮着。</span></footer>
    </section>
  `;
}

function diaryDate(key) {
  const date = new Date(`${key}T12:00:00`);
  const week = ["日", "一", "二", "三", "四", "五", "六"][date.getDay()];
  return `${date.getFullYear()} 年 ${date.getMonth() + 1} 月 ${date.getDate()} 日 · 周${week}`;
}

function diaryMonth(key) {
  const [year, month] = key.split("-");
  return `${year} 年 ${Number(month)} 月`;
}

function noteParagraphs(note) {
  return String(note || "")
    .split(/\n\s*\n/)
    .map((part) => part.replace(/^\n+|\n+$/g, ""))
    .filter((part) => part.trim());
}

function diaryContext(entry) {
  const bits = [];
  if (entry.doneCount) bits.push(`点亮 ${entry.doneCount} 件`);
  if (entry.rest) bits.push("来喘过气");
  if (entry.energy && ENERGY[entry.energy]) bits.push(ENERGY[entry.energy].label);
  if (!bits.length) bits.push("来过");
  return bits.join(" · ");
}

function renderJournal(entries, todayNote, todayKey) {
  const past = entries.filter((entry) => entry.date !== todayKey);
  const groups = [];
  for (const entry of past) {
    const month = entry.date.slice(0, 7);
    let group = groups[groups.length - 1];
    if (!group || group.month !== month) {
      group = { month, entries: [] };
      groups.push(group);
    }
    group.entries.push(entry);
  }
  return `
    <section class="panel diary-editor-card">
      <div class="diary-editor-head">
        <div>
          <span class="eyebrow">TODAY'S PAGE</span>
          <h2>${dateLabel()}</h2>
        </div>
        <span class="diary-save-state" data-save-state>已保存在本机</span>
      </div>
      <textarea class="diary-textarea" data-note rows="7" placeholder="今天想写点什么……&#10;&#10;空一行，就是新的一段。写多少都可以。">${esc(todayNote)}</textarea>
      <div class="diary-editor-foot">
        <span>空一行会自动分段 · 不限字数</span>
        <span data-note-count>${todayNote.length} 字</span>
      </div>
    </section>

    ${groups.length ? groups.map((group) => `
      <section class="diary-month">
        <div class="diary-month-head">
          <span class="eyebrow">OLD PAGES</span>
          <h2>${diaryMonth(group.month + "-01")}</h2>
        </div>
        <div class="diary-entry-list">
          ${group.entries.map((entry) => `
            <article class="panel diary-entry">
              <div class="diary-entry-head">
                <div>
                  <b>${diaryDate(entry.date)}</b>
                  <small>${diaryContext(entry)}</small>
                </div>
                <button class="icon-btn" type="button" data-action="edit-diary-entry" data-date="${entry.date}" aria-label="编辑这一天的日记">${icon("pen")}</button>
              </div>
              <div class="diary-entry-body">
                ${noteParagraphs(entry.note).map((paragraph) => `<p>${esc(paragraph)}</p>`).join("")}
              </div>
            </article>
          `).join("")}
        </div>
      </section>
    `).join("") : `
      <div class="panel empty-state diary-empty">
        <span class="empty-state__icon">${icon("book")}</span>
        <h2>还没有更早的日记</h2>
        <p>今天写下的，过几天就会变成一本。不用写得完整。</p>
      </div>
    `}
  `;
}

function chatTime(iso) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function renderChatBubble(message) {
  const isUser = message.role === "user";
  const paragraphs = String(message.content || "").split(/\n/).map((line) => line.trim());
  return `
    <div class="chat-message ${isUser ? "is-user" : "is-assistant"}">
      ${isUser ? "" : `<span class="chat-avatar">${icon("lantern")}</span>`}
      <div class="chat-bubble">
        <div class="chat-bubble__text">${paragraphs.map((line) => line ? `<p>${esc(line)}</p>` : "<br>").join("")}</div>
        <time>${chatTime(message.at)}</time>
      </div>
      ${isUser ? `<span class="chat-avatar chat-avatar--user">${icon("user")}</span>` : ""}
    </div>
  `;
}

function renderChat({ chatMessages, chatSettings, chatConfigured, chatSending, chatError }) {
  if (!chatConfigured) {
    return `
      <section class="panel chat-setup">
        <div class="chat-setup__mark">${icon("lantern")}</div>
        <p class="date-kicker">DEEPSEEK V4.1 FLASH</p>
        <h2>和小灯聊聊天</h2>
        <p class="chat-setup__lead">小屋可以联网了。填一个你自己的 DeepSeek API Key，就能和小灯说话。</p>
        <div class="chat-setup__notes">
          <p>${icon("lock")} Key 只保存在这台设备里，不进入导出备份。</p>
          <p>${icon("spark")} 请求从你的设备直接发往 <code>api.deepseek.com</code>，不经过微光小屋的服务器。</p>
          <p>${icon("heart")} 聊天会发送给 DeepSeek；请不要在里面写密码、身份证号等敏感信息。</p>
        </div>
        <a class="text-btn" href="https://platform.deepseek.com/api_keys" target="_blank" rel="noopener" data-action="open-chat-key-page">去 DeepSeek 创建 API Key ↗</a>
        <button class="pixel-btn pixel-btn--gold pixel-btn--wide" type="button" data-action="open-chat-settings">${icon("spark")} 连接 DeepSeek</button>
        <a class="pixel-btn pixel-btn--ghost pixel-btn--wide chat-web-btn" href="https://chat.deepseek.com/" target="_blank" rel="noopener" data-action="open-deepseek-web">${icon("right")} 打开 DeepSeek 网页版（免费）</a>
        <p class="chat-fine">网页版会在新标签或应用内浏览器打开；登录和对话由 DeepSeek 页面完成，不会自动写进小屋。</p>
        <p class="chat-fine">没有 Key 也没关系。日记本和所有场景都可以离线使用。</p>
      </section>
    `;
  }

  const messages = Array.isArray(chatMessages) ? chatMessages : [];
  const intro = messages.length === 0;
  return `
    <section class="panel chat-shell">
      <div class="chat-head">
        <span class="chat-head__avatar">${icon("lantern")}</span>
        <div class="chat-head__copy">
          <b>小灯</b>
          <small>${esc(chatSettings.model || "deepseek-flash")} · 联网陪伴</small>
        </div>
        <div class="chat-head__actions">
          <button class="icon-btn" type="button" data-action="open-chat-settings" aria-label="聊天与 API Key 设置">${icon("gear")}</button>
          <button class="icon-btn" type="button" data-action="clear-chat" aria-label="清空聊天记录">${icon("trash")}</button>
        </div>
      </div>
      <div class="chat-scroll" id="chat-scroll">
        ${intro ? `
          <div class="chat-greeting">
            <span class="chat-avatar">${icon("lantern")}</span>
            <div class="chat-bubble">
              <div class="chat-bubble__text"><p>我在。今天想说什么都可以，不用组织语言。</p><p>如果不知道从哪里开始，可以先说一句「有点累」。</p></div>
            </div>
          </div>
        ` : ""}
        ${messages.map(renderChatBubble).join("")}
        ${chatSending ? `
          <div class="chat-message is-assistant">
            <span class="chat-avatar">${icon("lantern")}</span>
            <div class="chat-bubble chat-typing"><i></i><i></i><i></i></div>
          </div>
        ` : ""}
        ${chatError ? `<div class="chat-error">${icon("moon")}<span>${esc(chatError)}</span></div>` : ""}
      </div>
      ${intro ? `
        <div class="chat-prompts">
          <button type="button" data-action="chat-prompt" data-text="今天有点累。">今天有点累</button>
          <button type="button" data-action="chat-prompt" data-text="陪我发会儿呆吧。">陪我发会儿呆</button>
          <button type="button" data-action="chat-prompt" data-text="帮我把今天变小一点。">把今天变小一点</button>
        </div>
      ` : ""}
      <div class="chat-composer">
        <textarea id="chat-input" rows="2" maxlength="4000" placeholder="想说什么都可以……"></textarea>
        <button class="pixel-btn pixel-btn--gold" type="button" data-action="send-chat" ${chatSending ? "disabled" : ""}>${icon("right")} 发送</button>
      </div>
      <p class="chat-foot">Enter 发送 · Shift + Enter 换行 · 聊天记录只保存在本机</p>
      <p class="chat-safety">小灯不是专业心理咨询师。如果情况紧急，请联系信任的人，或拨打心理援助热线 12356。</p>
    </section>
  `;
}

export function renderDiary({
  state,
  entries = [],
  todayNote = "",
  todayKey = "",
  tab = "journal",
  chatMessages = [],
  chatSettings = null,
  chatConfigured = false,
  chatSending = false,
  chatError = ""
}) {
  return `
    <section class="sub-page diary-page">
      <header class="page-head diary-head">
        <div>
          <p class="date-kicker">YOUR QUIET PAGES</p>
          <h1>日记本</h1>
          <p class="page-sub">写多少都可以。空一行，就是新的一段。这里不统计字数，也不催你更新。</p>
        </div>
        <span class="chip">${icon("book")} ${entries.length} 篇</span>
      </header>

      <div class="diary-tabs" role="tablist" aria-label="日记与聊天">
        <button class="diary-tab ${tab === "journal" ? "is-active" : ""}" type="button" role="tab" aria-selected="${tab === "journal"}" data-action="diary-tab" data-tab="journal">${icon("book")} 日记本</button>
        <button class="diary-tab ${tab === "chat" ? "is-active" : ""}" type="button" role="tab" aria-selected="${tab === "chat"}" data-action="diary-tab" data-tab="chat">${icon("lantern")} 和小灯聊聊 <span>联网</span></button>
      </div>

      ${tab === "chat" ? renderChat({ chatMessages, chatSettings, chatConfigured, chatSending, chatError }) : renderJournal(entries, todayNote, todayKey)}

      <footer class="page-quote">${icon("lantern")}<span>说不出来的时候，写下来也可以。写不出来，也没关系。</span></footer>
    </section>
  `;
}

export function renderMe({ state, stats, calendar, versionInfo = null, updateAvailable = false, platform = "网页版" }) {
  const grid = getMonthGrid(calendar.year, calendar.month);
  const monthShown = grid.filter((cell) => cell && cell.shown).length;
  const level = stats.level;
  const now = new Date();
  const isCurrentMonth = calendar.year === now.getFullYear() && calendar.month === now.getMonth() + 1;
  const name = state.profile.name || "小旅人";
  const nextLevelText = level.next
    ? `再攒 ${level.toNext} 微光，变成「${level.next.name}」。`
    : "你已经是一小片星河了。";
  const look = state.profile.look || {};
  const lookText = ["head", "face", "body", "legs", "shoes"]
    .map((part) => LOOK_PARTS[part]?.find((item) => item.id === look[part])?.name)
    .filter(Boolean)
    .join(" · ");
  const latest = CHANGELOG[0];
  const versionStatus = updateAvailable && versionInfo
    ? `发现新版本 v${versionInfo.version}，可以更新。`
    : versionInfo
      ? "已经是最新版本。"
      : "联网后可以检查小屋的新版本。";

  return `
    <section class="sub-page me-page">
      <header class="page-head page-head--profile">
        <div>
          <p class="date-kicker">YOUR LITTLE NOOK</p>
          <h1>我的小屋</h1>
          <p class="page-sub">这里没有排名，也没有别人。只有你和一点点累积起来的光。</p>
        </div>
      </header>

      <div class="me-grid">
        <section class="panel profile-card">
          <button class="portrait-frame portrait-frame--button" type="button" data-action="open-wardrobe" aria-label="打开衣柜，换一身搭配">
            <canvas id="portrait-canvas" class="portrait-canvas" width="96" height="96" role="img" aria-label="小灯的像素头像"></canvas>
            <span class="portrait-status"></span>
            <span class="portrait-edit">换装</span>
          </button>
          <div class="profile-card__copy">
            <span class="eyebrow">THE KEEPER OF THIS NOOK</span>
            <div class="profile-name-row">
              <h2>${esc(name)}</h2>
              <button class="icon-btn" type="button" data-action="edit-name" aria-label="修改称呼">${icon("pen")}</button>
            </div>
            <p>${stats.totalDays ? `你已经在小屋出现过 ${stats.totalDays} 天。` : "今天，是你第一次推开小屋的门。"}</p>
            <p class="look-summary" title="当前搭配">${icon("user")} ${esc(lookText || "默认搭配")}</p>
            <div class="level-line">
              <span>${icon("spark")} ${level.current.name}</span>
              <span>${stats.totalPoints} 微光</span>
            </div>
            <div class="pixel-progress" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.round(level.progress * 100)}">
              <span style="width:${Math.round(level.progress * 100)}%"></span>
            </div>
            <p class="level-note">${level.current.note} ${nextLevelText}</p>
          </div>
        </section>

        <section class="panel stats-card">
          <span class="eyebrow">LITTLE NUMBERS</span>
          <div class="stat-grid">
            <div class="stat"><strong>${stats.totalDays}</strong><span>出现天数</span></div>
            <div class="stat"><strong>${stats.totalTasks}</strong><span>完成次数</span></div>
            <div class="stat"><strong>${stats.currentStreak}</strong><span>当前连续</span></div>
            <div class="stat"><strong>${stats.longestStreak}</strong><span>最长连续</span></div>
          </div>
          <p class="stat-note">数字只是记录，不是成绩单。它们不会因为你休息就消失。</p>
        </section>
      </div>

      <section class="panel calendar-card">
        <div class="calendar-head">
          <div>
            <span class="eyebrow">FOOTPRINTS</span>
            <h2>${monthTitle(calendar.year, calendar.month)}</h2>
          </div>
          <div class="calendar-nav">
            <button class="icon-btn" type="button" data-action="cal-prev" aria-label="上个月">${icon("left")}</button>
            <button class="icon-btn" type="button" data-action="cal-next" aria-label="下个月" ${isCurrentMonth ? "disabled" : ""}>${icon("right")}</button>
          </div>
        </div>
        <div class="weekday-row" aria-hidden="true">
          <span>一</span><span>二</span><span>三</span><span>四</span><span>五</span><span>六</span><span>日</span>
        </div>
        <div class="calendar-grid">${calendarCells(grid)}</div>
        <div class="calendar-legend">
          <span><i class="legend-dot level-1"></i> 1 件</span>
          <span><i class="legend-dot level-2"></i> 2 件</span>
          <span><i class="legend-dot level-3"></i> 3 件以上</span>
          <span><i class="legend-dot is-rest"></i> 来喘口气</span>
          <span class="calendar-month-sum">这个月出现了 <b>${monthShown}</b> 天</span>
        </div>
      </section>

      <section class="panel update-card">
        <div class="update-card__head">
          <div>
            <span class="eyebrow">VERSION & UPDATE</span>
            <h2>版本与更新</h2>
          </div>
          <span class="version-badge">v${APP_VERSION}</span>
        </div>
        <div class="version-line">
          <span>${icon("lantern")} 微光小屋</span>
          <span>${esc(platform)} · 构建 ${APP_BUILD}</span>
        </div>
        <p class="update-status ${updateAvailable ? "is-update" : ""}" id="update-status">${versionStatus}</p>
        <p class="update-latest"><b>v${latest.version}</b> ${esc(latest.title)}</p>
        <div class="update-actions">
          <button class="pixel-btn pixel-btn--ghost pixel-btn--small" type="button" data-action="check-update">${icon("refresh")} 检查更新</button>
          <button class="text-btn" type="button" data-action="open-changelog">${icon("list")} 更新日志</button>
        </div>
      </section>

      <div class="me-columns">
        <section class="panel settings-card">
          <span class="eyebrow">SETTINGS</span>
          <h2>小屋设置</h2>
          <div class="setting-list">
            <button class="setting-row" type="button" role="switch" aria-checked="${state.settings.sound}" data-action="toggle-setting" data-key="sound">
              <span class="setting-row__icon">${icon("sound")}</span>
              <span class="setting-row__copy"><b>音效</b><small>按钮和打卡时的小声音</small></span>
              <span class="switch ${state.settings.sound ? "is-on" : ""}" aria-hidden="true"><i></i></span>
            </button>
            <button class="setting-row" type="button" role="switch" aria-checked="${state.settings.motion}" data-action="toggle-setting" data-key="motion">
              <span class="setting-row__icon">${icon("spark")}</span>
              <span class="setting-row__copy"><b>小屋动画</b><small>关闭后，小灯会安静地待着</small></span>
              <span class="switch ${state.settings.motion ? "is-on" : ""}" aria-hidden="true"><i></i></span>
            </button>
            <button class="setting-row" type="button" data-action="open-wardrobe">
              <span class="setting-row__icon">${icon("user")}</span>
              <span class="setting-row__copy"><b>人物形象</b><small>头 / 面 / 身 / 腿 / 鞋，自由搭配</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </button>
            <button class="setting-row" type="button" data-action="go-places">
              <span class="setting-row__icon">${icon("map")}</span>
              <span class="setting-row__copy"><b>去走走</b><small>13 个可停留场景，点东西听小灯说话</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </button>
            <button class="setting-row" type="button" data-action="open-diary-chat">
              <span class="setting-row__icon">${icon("lantern")}</span>
              <span class="setting-row__copy"><b>和小灯聊天</b><small>DeepSeek V4.1 Flash · 需要自己的 API Key</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </button>
            <a class="setting-row" href="https://chat.deepseek.com/" target="_blank" rel="noopener" data-action="open-deepseek-web">
              <span class="setting-row__icon">${icon("book")}</span>
              <span class="setting-row__copy"><b>DeepSeek 网页版</b><small>免费登录使用；对话不会自动存进小屋</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </a>
            <button class="setting-row" type="button" data-action="export-data">
              <span class="setting-row__icon">${icon("download")}</span>
              <span class="setting-row__copy"><b>导出备份</b><small>把全部记录存成一个文件</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </button>
            <button class="setting-row" type="button" data-action="import-data">
              <span class="setting-row__icon">${icon("upload")}</span>
              <span class="setting-row__copy"><b>导入备份</b><small>从另一台设备搬回小屋</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </button>
            <button class="setting-row setting-row--danger" type="button" data-action="reset-data">
              <span class="setting-row__icon">${icon("trash")}</span>
              <span class="setting-row__copy"><b>重新开始</b><small>清空这台设备上的全部记录</small></span>
              <span class="setting-arrow">${icon("right")}</span>
            </button>
          </div>
          <input id="import-file" type="file" accept="application/json,.json" hidden>
        </section>

        <section class="panel about-card">
          <span class="eyebrow">ABOUT THIS NOOK</span>
          <h2>关于微光小屋</h2>
          <p>一个不催你的打卡小屋。记录出现过的一点点，给想对自己好的心情留个位置。</p>
          <p class="about-small">打卡、日记和设置只保存在这台设备的浏览器里。不上传，不排名，不需要登录。换设备前记得导出备份。</p>
          <p class="about-small">联网聊天是可选的：需要你自己的 DeepSeek API Key，聊天内容会直接发送给 DeepSeek；Key 和聊天记录不进备份。</p>
          <div class="about-kind">
            ${icon("heart")}
            <p>如果最近真的很累，别一个人扛。找一个信任的人说说，或联系专业的心理支持。你不需要先变得有用，才值得被帮助。</p>
          </div>
          <p class="about-version">GLIMMER NOOK v${APP_VERSION} · 像素字体：Fusion Pixel Font (OFL)</p>
        </section>
      </div>

      <footer class="page-quote">${icon("lantern")}<span>小屋今天也开着。你随时可以回来。</span></footer>
    </section>
  `;
}
