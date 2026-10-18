export const APP_VERSION = "0.2.0";
export const APP_BUILD = 2;
export const APP_RELEASED_AT = "2026-10-18";
export const STORE_KEY = "glimmer-nook:v1";

export const CHANGELOG = [
  {
    version: "0.2.0",
    date: "2026-10-18",
    title: "小灯会换衣服，也会出门了",
    items: [
      "人物形象可以自由搭配：头、面、身、腿、鞋，能组合出很多套。",
      "新增 13 个可停留场景：客厅、房间、厨房、卫生间、学校、图书馆、电影院、郊游、超市、球场、江边、爬山、兜风。",
      "点击场景里的不同物件，会触发小灯的不同对话和小动画。",
      "设置里加入版本检查、更新日志和更新入口；网页版可在线更新，Android 会跳转到新版 APK。",
      "人物重新绘制，呼吸、眨眼、挥手和开心时的动作更自然。"
    ]
  },
  {
    version: "0.1.0",
    date: "2026-10-18",
    title: "微光小屋开张",
    items: [
      "今日打卡、自定义小事与奖励。",
      "能量签到、半分钟呼吸练习、每日一句话。",
      "像素小屋、小灯和猫的待机、点击、打卡动画。",
      "统计、月历足迹、本地备份与离线 PWA。"
    ]
  }
];

export const EFFORTS = {
  1: { label: "轻轻的", short: "轻", points: 1, dots: 1, hint: "几乎不费力，比如喝口水" },
  2: { label: "刚刚好", short: "刚", points: 2, dots: 2, hint: "需要一点动作，但做得动" },
  3: { label: "有点用力", short: "用", points: 3, dots: 3, hint: "今天状态不错，可以试试" }
};

export const HABIT_ICONS = [
  "water", "walk", "book", "moon", "bowl", "leaf",
  "music", "heart", "pill", "pen", "sun", "spark"
];

export const REWARD_ICONS = [
  "gift", "drink", "sweet", "game", "star", "book",
  "music", "flower", "heart", "moon", "sun", "spark"
];

export const HABIT_ICON_LABELS = {
  water: "喝水", walk: "走路", book: "读书", moon: "早睡",
  bowl: "吃饭", leaf: "呼吸", music: "听歌", heart: "照顾自己",
  pill: "吃药", pen: "写写", sun: "晒太阳", spark: "发会儿呆"
};

export const REWARD_ICON_LABELS = {
  gift: "礼物", drink: "喝点", sweet: "甜点", game: "玩会儿",
  star: "星星", book: "买书", music: "音乐", flower: "花",
  heart: "心意", moon: "休息", sun: "出门", spark: "惊喜"
};

export const CONDITION_TYPES = {
  days: {
    label: "累计出现",
    unit: "天",
    hint: "完成任意小事，或来喘口气，都算出现。",
    default: 3
  },
  tasks: {
    label: "完成任务",
    unit: "次",
    hint: "每完成一件小事算一次，不要求连续。",
    default: 10
  },
  points: {
    label: "积攒微光",
    unit: "微光",
    hint: "不同难度的小事，会亮起不同数量的微光。",
    default: 30
  },
  streak: {
    label: "最长连续",
    unit: "天",
    hint: "按历史上最长的连续出现天数计算，断掉也不会抹去。",
    default: 3
  }
};

export const ENERGY = {
  low: {
    label: "快没电了",
    icon: "battery",
    reply: "那就把今天调成省电模式。",
    note: "今天只做一件最小的事，或者什么都不做，都行。"
  },
  ok: {
    label: "还行",
    icon: "cloud",
    reply: "平平的，也是一种状态。",
    note: "不用很起劲，顺手做一件就好。"
  },
  good: {
    label: "有点光",
    icon: "sun",
    reply: "那今天可以多走一小步。",
    note: "趁着有光，挑一件你想做的小事吧。"
  }
};

export const LEVELS = [
  { at: 0, name: "微光种子", note: "先发芽，不着急。" },
  { at: 12, name: "小灯芯", note: "有一点点亮起来了。" },
  { at: 30, name: "萤火虫", note: "你也在发自己的光。" },
  { at: 60, name: "暖灯", note: "能照亮身边一小圈了。" },
  { at: 100, name: "守夜人", note: "稳稳地亮着，就很好。" },
  { at: 160, name: "小灯塔", note: "也允许自己被照亮。" },
  { at: 250, name: "一小片星河", note: "光已经装不下了。" }
];

export const GREETINGS = {
  dawn: ["天快亮了", "这么早呀"],
  morning: ["早上好", "早呀"],
  noon: ["中午好", "吃过了吗"],
  afternoon: ["下午好", "慢慢来"],
  evening: ["晚上好", "今天辛苦了"],
  night: ["夜深了", "还没睡呀"]
};

export const TODAY_SUBS = [
  "不用把今天过得很满，亮一点点就够了。",
  "今天也只需要，做一件小小的、对自己好的事。",
  "没有动力也没关系。先从最小的那一步开始。",
  "你已经撑到这里了，先给自己倒杯水吧。",
  "不追赶谁，按自己的速度来。",
  "如果今天很累，出现一下就算赢。"
];

export const IDLE_LINES = [
  "今天也不用很厉害。",
  "你已经在这里了，这就很好。",
  "我在这儿，不催你。",
  "慢一点，也算在往前走。",
  "累的话，就靠一会儿。",
  "小屋的灯，一直给你留着。"
];

export const POKE_LINES = [
  "嘿，我在呢。",
  "摸摸头。",
  "今天想先做哪件小事？",
  "不用急，先坐一会儿。",
  "要不要试着点亮一个？",
  "你来了，小屋就亮了一点。"
];

export const CHECK_LINES = [
  "亮了一点点！",
  "记下啦。",
  "今天又多了一点光。",
  "好，就这样，一点一点。"
];

export const ALL_DONE_LINES = [
  "今天的你，已经足够好了。",
  "灯都亮起来了，去休息吧。",
  "完成得刚刚好，不多不少。"
];

export const LOW_ENERGY_LINES = [
  "没电也没关系，我陪你坐会儿。",
  "今天可以只做一件，或者不做。",
  "省电模式也照样是小屋的主人。"
];

export const REST_LINES = [
  "呼——舒服一点了吗？",
  "休息也算数。",
  "你愿意停下来，也很好。"
];

export const HABIT_TIPS = [
  "目标越小，越容易开始。把「运动一小时」改成「穿上鞋走两分钟」。",
  "不用等状态好了才开始。先做三十秒，状态会跟上来。",
  "同一天里，同一个习惯只算一次。别急着补作业。",
  "断掉一天不代表前功尽弃。回来就好。",
  "一件真正想做的事，比五件应该做的事更有用。"
];

export const STARTER_HABITS = [
  { name: "喝一杯水", icon: "water", effort: 1 },
  { name: "站起来走 5 分钟", icon: "walk", effort: 2 },
  { name: "睡前放下手机 10 分钟", icon: "moon", effort: 2 }
];

export const STARTER_REWARDS = [
  {
    title: "一杯喜欢的饮料",
    note: "出现 3 天，就请自己喝点好喝的。",
    icon: "drink",
    condition: { type: "days", value: 3 }
  },
  {
    title: "一个小心愿",
    note: "累计完成 20 次打卡后，给自己买个小东西。",
    icon: "gift",
    condition: { type: "tasks", value: 20 }
  }
];

export function levelFor(points) {
  let index = 0;
  for (let i = 0; i < LEVELS.length; i += 1) {
    if (points >= LEVELS[i].at) index = i;
  }
  const current = LEVELS[index];
  const next = LEVELS[index + 1] || null;
  const span = next ? next.at - current.at : 0;
  const progress = next
    ? Math.min(1, Math.max(0, (points - current.at) / span))
    : 1;
  return {
    index,
    current,
    next,
    progress,
    toNext: next ? Math.max(0, next.at - points) : 0
  };
}
