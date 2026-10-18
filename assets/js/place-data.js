/*
 * 13 个可以待一会儿的地方。
 * 坐标是画布比例，给场景上的可点击小物件用。
 */

export const PLACE_CATEGORIES = {
  home: { label: "家里", note: "不用出门，也能换个角落坐坐。" },
  outdoor: { label: "外面", note: "不用真的抵达，也可以先看看。" }
};

export const PLACES = [
  {
    id: "living",
    name: "客厅",
    category: "home",
    icon: "sofa",
    tagline: "沙发、猫，还有一盏没关的灯。",
    quote: "回来就好。不用解释今天过得怎么样。",
    sceneLabel: "晚上 · 家里",
    char: { x: 190, groundY: 188, holdMug: true },
    ambient: { type: "dust", count: 8 },
    hotspots: [
      { id: "tv", label: "电视", x: 0.34, y: 0.34, w: 0.18, h: 0.2, effect: "stars", color: "#8bb8d8", lines: ["屏幕里在放一部很慢的纪录片。", "看不懂也没关系，听着声音就好。"] },
      { id: "lamp", label: "落地灯", x: 0.52, y: 0.38, w: 0.12, h: 0.24, effect: "sparkles", color: "#f5c451", lines: ["灯罩上落了一点灰。", "它还是每天准时亮起来。"] },
      { id: "cat", label: "团子", x: 0.67, y: 0.76, w: 0.14, h: 0.13, effect: "hearts", color: "#e8735a", lines: ["团子把尾巴搭在你的鞋上。", "它不问你今天完成了什么。"] },
      { id: "sofa", label: "沙发", x: 0.6, y: 0.6, w: 0.31, h: 0.16, effect: "hearts", color: "#f0d9b5", lines: ["沙发陷下去一个刚刚好的坑。", "你可以在这里坐很久，什么都不做。"] }
    ],
    charLines: ["在自己家，可以不用表现得很精神。", "先去倒杯水吧。", "客厅的灯，会替你亮着。"],
    stayLines: ["就这样坐一会儿。", "客厅会替你亮着灯。"]
  },
  {
    id: "bedroom",
    name: "房间",
    category: "home",
    icon: "bed",
    tagline: "被子、月亮，和一条小灯串。",
    quote: "房间是最不用逞强的地方。",
    sceneLabel: "夜里 · 房间",
    char: { x: 210, groundY: 188, holdMug: false },
    ambient: { type: "dust", count: 6 },
    hotspots: [
      { id: "bed", label: "床", x: 0.05, y: 0.66, w: 0.41, h: 0.26, effect: "hearts", color: "#b7a4d8", lines: ["被子还是早上掀开的样子。", "今晚早点钻进去，也算一件值得的事。"] },
      { id: "window", label: "窗外的月亮", x: 0.72, y: 0.13, w: 0.2, h: 0.28, effect: "stars", color: "#f4dfa8", lines: ["月亮停在窗框旁边。", "今天的天空没有要求你许愿。"] },
      { id: "fairy", label: "小灯串", x: 0.38, y: 0.11, w: 0.28, h: 0.12, effect: "sparkles", color: "#f5c451", lines: ["小灯串闪了一下。", "它不催你睡，只是陪着。"] },
      { id: "desk", label: "书桌", x: 0.76, y: 0.55, w: 0.2, h: 0.2, effect: "notes", color: "#b7a4d8", lines: ["桌上摊着没写完的东西。", "先放着吧，明天再当它的主人。"] }
    ],
    charLines: ["房间是最不用逞强的地方。", "可以把肩膀放下来。", "躺一会儿也没关系。"],
    stayLines: ["把灯调暗一点。", "今晚不用想太远。"]
  },
  {
    id: "kitchen",
    name: "厨房",
    category: "home",
    icon: "pot",
    tagline: "锅里咕嘟咕嘟，水快开了。",
    quote: "哪怕只是煮面，也是在好好喂自己。",
    sceneLabel: "傍晚 · 厨房",
    char: { x: 200, groundY: 188, holdMug: true },
    ambient: { type: "steam", count: 5 },
    hotspots: [
      { id: "pot", label: "小锅", x: 0.16, y: 0.55, w: 0.18, h: 0.13, effect: "steam", color: "#f0d9b5", lines: ["锅里咕嘟咕嘟。", "哪怕只是煮面，也是在好好喂自己。"] },
      { id: "fridge", label: "冰箱", x: 0.8, y: 0.35, w: 0.16, h: 0.4, effect: "sparkles", color: "#8bb8d8", lines: ["冰箱门上的便签翘起一角。", "里面还有一颗蛋，够做一顿早饭。"] },
      { id: "kettle", label: "水壶", x: 0.55, y: 0.58, w: 0.12, h: 0.1, effect: "steam", color: "#f5c451", lines: ["水壶开始冒气了。", "等水开的这一小会儿，不用做别的。"] },
      { id: "window", label: "窗", x: 0.42, y: 0.11, w: 0.24, h: 0.28, effect: "sparkles", color: "#e8a87c", lines: ["窗外有人在收衣服。", "日子就是这样，一件一件地过。"] }
    ],
    charLines: ["厨房里最适合从最小的事开始。", "比如洗一个杯子。", "水开之前，先站一会儿。"],
    stayLines: ["听水壶响。", "等面煮熟再想别的。"]
  },
  {
    id: "bathroom",
    name: "卫生间",
    category: "home",
    icon: "bath",
    tagline: "热水、泡泡，还有一只橡皮鸭。",
    quote: "洗脸刷牙也算照顾自己。",
    sceneLabel: "晚上 · 卫生间",
    char: { x: 168, groundY: 190, holdMug: false },
    ambient: { type: "bubbles", count: 12 },
    hotspots: [
      { id: "mirror", label: "镜子", x: 0.1, y: 0.18, w: 0.17, h: 0.29, effect: "sparkles", color: "#b7a4d8", lines: ["镜子里的人看起来有点累。", "但还是在认真地洗脸。"] },
      { id: "faucet", label: "水龙头", x: 0.28, y: 0.58, w: 0.1, h: 0.12, effect: "bubbles", color: "#8bb8d8", lines: ["水滴答、滴答。", "有些声音就是会让人慢下来。"] },
      { id: "tub", label: "浴缸", x: 0.62, y: 0.58, w: 0.31, h: 0.26, effect: "bubbles", color: "#f0d9b5", lines: ["浴缸边放着一只橡皮鸭。", "它已经等你很久了。"] },
      { id: "duck", label: "橡皮鸭", x: 0.67, y: 0.69, w: 0.08, h: 0.08, effect: "hearts", color: "#f5c451", lines: ["你捏了一下鸭子。", "它发出一声很傻的叫。"] }
    ],
    charLines: ["洗手、刷牙、洗脸，都算照顾自己。", "不用把今天做得漂亮。", "热水会冲掉一点点疲惫。"],
    stayLines: ["让水再流一会儿。", "把毛巾叠好，也是在整理心情。"]
  },
  {
    id: "school",
    name: "学校",
    category: "outdoor",
    icon: "school",
    tagline: "黑板、时钟，和窗外的树。",
    quote: "你只要及格地照顾自己就好。",
    sceneLabel: "下午 · 教室",
    char: { x: 154, groundY: 188, holdMug: false },
    ambient: { type: "chalk", count: 8 },
    hotspots: [
      { id: "board", label: "黑板", x: 0.1, y: 0.2, w: 0.44, h: 0.3, effect: "sparkles", color: "#9fc79b", lines: ["黑板上还留着今天的板书。", "有些答案不用现在就知道。"] },
      { id: "clock", label: "时钟", x: 0.69, y: 0.18, w: 0.11, h: 0.13, effect: "notes", color: "#f5c451", lines: ["秒针一格一格地走。", "下课铃还要很久，但你可以先喘口气。"] },
      { id: "window", label: "窗外", x: 0.73, y: 0.35, w: 0.19, h: 0.25, effect: "leaves", color: "#9fc79b", lines: ["窗外的树被风吹得沙沙响。", "世界不只在试卷里。"] },
      { id: "desk", label: "课桌", x: 0.12, y: 0.67, w: 0.24, h: 0.16, effect: "notes", color: "#d8c0a0", lines: ["课桌上刻着一句很小的话。", "「今天也要回家」。"] }
    ],
    charLines: ["学校是很多人的赛道，但不一定是你的。", "你只要及格地照顾自己就好。", "下课十分钟，可以什么都不做。"],
    stayLines: ["看一眼窗外的树。", "把笔放下三十秒。"]
  },
  {
    id: "library",
    name: "图书馆",
    category: "outdoor",
    icon: "book",
    tagline: "很高的书架，和一小块暖光。",
    quote: "在这里，发呆也是合法的。",
    sceneLabel: "晚上 · 图书馆",
    char: { x: 192, groundY: 190, holdMug: false },
    ambient: { type: "dust", count: 10 },
    hotspots: [
      { id: "shelf", label: "书架", x: 0.04, y: 0.2, w: 0.23, h: 0.44, effect: "sparkles", color: "#c8a88f", lines: ["书架高得看不到顶。", "你不需要读完所有书，才配坐在这里。"] },
      { id: "lamp", label: "台灯", x: 0.44, y: 0.54, w: 0.12, h: 0.15, effect: "sparkles", color: "#f5c451", lines: ["绿罩台灯把桌面照成一小块暖色。", "这一小块地方，今晚归你。"] },
      { id: "window", label: "彩窗", x: 0.43, y: 0.12, w: 0.19, h: 0.28, effect: "stars", color: "#b7a4d8", lines: ["彩绘玻璃把月光切成几块。", "安静也有声音。"] },
      { id: "cat", label: "图书馆的猫", x: 0.76, y: 0.7, w: 0.12, h: 0.12, effect: "hearts", color: "#d88b5d", lines: ["图书馆的猫从书后面探出头。", "它检查了一下，你没有被借走。"] }
    ],
    charLines: ["在这里，发呆也是合法的。", "翻两页，或者只闻闻纸的味道。", "把手机扣在桌上，听一会儿安静。"],
    stayLines: ["听翻页的声音。", "什么都不读，也可以。"]
  },
  {
    id: "cinema",
    name: "电影院",
    category: "outdoor",
    icon: "film",
    tagline: "黑暗里，没人看得见你的表情。",
    quote: "电影可以暂停，生活也可以。",
    sceneLabel: "晚上 · 电影院",
    char: { x: 194, groundY: 190, holdMug: false },
    ambient: { type: "projector", count: 9 },
    hotspots: [
      { id: "screen", label: "银幕", x: 0.17, y: 0.15, w: 0.62, h: 0.38, effect: "stars", color: "#f5c451", lines: ["银幕上刚好下起一场流星雨。", "你知道那是假的，但还是想许愿。"] },
      { id: "projector", label: "放映机", x: 0.79, y: 0.1, w: 0.14, h: 0.13, effect: "sparkles", color: "#8bb8d8", lines: ["光束从头顶穿过去。", "灰尘在光里慢慢飘。"] },
      { id: "popcorn", label: "爆米花", x: 0.62, y: 0.65, w: 0.11, h: 0.12, effect: "pop", color: "#f5c451", lines: ["爆米花桶见底了。", "最后几颗总是最好吃。"] },
      { id: "seat", label: "椅背", x: 0.38, y: 0.71, w: 0.28, h: 0.19, effect: "hearts", color: "#c26a72", lines: ["椅背软软地接住你。", "黑暗里没人看得见你的表情。"] }
    ],
    charLines: ["电影可以暂停，生活也可以。", "今天不急着知道结局。", "片尾字幕走完之前，先不走。"],
    stayLines: ["把音量调小一点。", "看一场不用记住名字的电影。"]
  },
  {
    id: "picnic",
    name: "郊游",
    category: "outdoor",
    icon: "flower",
    tagline: "草地、云，和一块野餐布。",
    quote: "在草地上坐一会儿，也算抵达。",
    sceneLabel: "午后 · 公园",
    char: { x: 205, groundY: 190, holdMug: false },
    ambient: { type: "leaves", count: 10 },
    hotspots: [
      { id: "tree", label: "大树", x: 0.05, y: 0.32, w: 0.18, h: 0.38, effect: "leaves", color: "#9fc79b", lines: ["树影落在野餐布上。", "风把叶子翻了个面。"] },
      { id: "basket", label: "野餐篮", x: 0.19, y: 0.71, w: 0.16, h: 0.13, effect: "hearts", color: "#c8a88f", lines: ["篮子里还有半个三明治。", "你把它包好，留给晚一点饿的自己。"] },
      { id: "butterfly", label: "白蝴蝶", x: 0.67, y: 0.53, w: 0.1, h: 0.1, effect: "sparkles", color: "#f6e9cf", lines: ["一只白蝴蝶停在你的膝盖边。", "它只停了一小会儿，也很够了。"] },
      { id: "cloud", label: "云", x: 0.66, y: 0.09, w: 0.2, h: 0.13, effect: "sparkles", color: "#f6e9cf", lines: ["云走得比想象中快。", "没有哪一朵需要一直保持形状。"] }
    ],
    charLines: ["郊游不需要目的地。", "在草地上坐一会儿，也算抵达。", "听风吹过草的声音。"],
    stayLines: ["把鞋脱掉，踩一踩草。", "看云，不用想它像什么。"]
  },
  {
    id: "market",
    name: "超市",
    category: "outdoor",
    icon: "cart",
    tagline: "五颜六色的货架，和一辆不听话的购物车。",
    quote: "日常本身，就能把人接住一点。",
    sceneLabel: "傍晚 · 超市",
    char: { x: 178, groundY: 188, holdMug: false },
    ambient: { type: "none", count: 0 },
    hotspots: [
      { id: "shelf", label: "货架", x: 0.07, y: 0.36, w: 0.22, h: 0.38, effect: "sparkles", color: "#e8a87c", lines: ["货架上排着五颜六色的瓶子。", "你不需要全带回家。"] },
      { id: "cart", label: "购物车", x: 0.62, y: 0.68, w: 0.19, h: 0.15, effect: "hearts", color: "#b7a4d8", lines: ["购物车往左偏，轮子有点不听话。", "你干脆跟着它慢慢走。"] },
      { id: "freezer", label: "冷柜", x: 0.79, y: 0.36, w: 0.17, h: 0.35, effect: "sparkles", color: "#8bb8d8", lines: ["冷柜的门上起了一层雾。", "你画了一个笑脸，又擦掉。"] },
      { id: "sign", label: "收银台", x: 0.41, y: 0.12, w: 0.18, h: 0.12, effect: "notes", color: "#f5c451", lines: ["收银台前排着不长的队。", "买完这袋东西，就回家。"] }
    ],
    charLines: ["超市是很日常的地方。", "日常本身，就能把人接住一点。", "在零食区多站一会儿。"],
    stayLines: ["慢慢挑一盒喜欢的酸奶。", "听收银台的滴滴声。"]
  },
  {
    id: "court",
    name: "球场",
    category: "outdoor",
    icon: "ball",
    tagline: "晚霞、篮筐，和一个弹回来的球。",
    quote: "身体动一动，脑子会轻一点。",
    sceneLabel: "傍晚 · 球场",
    char: { x: 200, groundY: 188, holdMug: false },
    ambient: { type: "dust", count: 7 },
    hotspots: [
      { id: "hoop", label: "篮筐", x: 0.71, y: 0.2, w: 0.19, h: 0.22, effect: "pop", color: "#e8735a", lines: ["篮球在篮筐上转了一圈，进去了。", "你听见网兜刷的一声。"] },
      { id: "ball", label: "篮球", x: 0.75, y: 0.67, w: 0.08, h: 0.09, effect: "pop", color: "#e8a87c", lines: ["球弹回来，刚好落在你脚边。", "不用投进，捡起来再扔一次就好。"] },
      { id: "bench", label: "长椅", x: 0.08, y: 0.61, w: 0.23, h: 0.16, effect: "hearts", color: "#c8a88f", lines: ["长椅上放着一瓶没喝完的水。", "跑不动的时候，坐着看别人打也很好。"] },
      { id: "sky", label: "晚霞", x: 0.4, y: 0.05, w: 0.2, h: 0.18, effect: "stars", color: "#f2a68c", lines: ["晚霞把球场染成橘色。", "今天的比分不重要。"] }
    ],
    charLines: ["球场允许你流汗，也允许你坐着。", "身体动一动，脑子会轻一点。", "运两下球，或者只看。"],
    stayLines: ["投一个球，不进也没关系。", "坐在长椅上看晚霞。" ]
  },
  {
    id: "river",
    name: "江边",
    category: "outdoor",
    icon: "water",
    tagline: "风把江面吹出一层一层的皱纹。",
    quote: "不用想明白，先吹吹风。",
    sceneLabel: "黄昏 · 江边",
    char: { x: 180, groundY: 190, holdMug: false },
    ambient: { type: "birds", count: 5 },
    hotspots: [
      { id: "water", label: "江面", x: 0.45, y: 0.53, w: 0.42, h: 0.25, effect: "ripples", color: "#8bb8d8", lines: ["江面被风推出一层一层的皱纹。", "浪声一会儿近，一会儿远。"] },
      { id: "boat", label: "小船", x: 0.52, y: 0.5, w: 0.16, h: 0.1, effect: "sparkles", color: "#f5c451", lines: ["一艘小船慢慢经过。", "它不赶时间，你也不用。"] },
      { id: "bridge", label: "桥", x: 0.08, y: 0.31, w: 0.52, h: 0.16, effect: "stars", color: "#f5c451", lines: ["桥上的灯一盏一盏亮起来。", "回家的路就在那边。"] },
      { id: "reeds", label: "芦苇", x: 0.07, y: 0.62, w: 0.15, h: 0.2, effect: "leaves", color: "#9fc79b", lines: ["芦苇晃了晃，又站直。", "被风吹弯，不等于倒下。"] }
    ],
    charLines: ["江边很适合把心事放远一点。", "不用想明白，先吹吹风。", "听三分钟水声。"],
    stayLines: ["把手机收起来，听水。", "看船走到看不见为止。"]
  },
  {
    id: "mountain",
    name: "爬山",
    category: "outdoor",
    icon: "mountain",
    tagline: "雾、松树，和还很远的山顶。",
    quote: "走两步，喘口气，都是路的一部分。",
    sceneLabel: "清晨 · 山上",
    char: { x: 180, groundY: 190, holdMug: false },
    ambient: { type: "mist", count: 5 },
    hotspots: [
      { id: "peak", label: "山顶", x: 0.5, y: 0.14, w: 0.14, h: 0.15, effect: "sparkles", color: "#f6e9cf", lines: ["山顶还在很远的雾里。", "今天不一定要登顶。"] },
      { id: "tree", label: "松树", x: 0.1, y: 0.42, w: 0.18, h: 0.3, effect: "leaves", color: "#6f8f86", lines: ["松树被风吹得往一边斜。", "它在这里站了很多年，也没急着去哪里。"] },
      { id: "birds", label: "鸟", x: 0.64, y: 0.24, w: 0.15, h: 0.1, effect: "sparkles", color: "#f6e9cf", lines: ["几只鸟从山谷里飞起来。", "它们没有固定的路线。"] },
      { id: "sun", label: "太阳", x: 0.78, y: 0.08, w: 0.13, h: 0.13, effect: "stars", color: "#f5c451", lines: ["太阳从云后露出一点边。", "光是一点一点来的。"] }
    ],
    charLines: ["爬山的意义不只在山顶。", "走两步，喘口气，都是路的一部分。", "坐在石头上，看雾慢慢散。"],
    stayLines: ["喝一口水，再走。", "看一会儿远处的云。"]
  },
  {
    id: "drive",
    name: "兜风",
    category: "outdoor",
    icon: "car",
    tagline: "没有目的地，路灯一盏一盏往后退。",
    quote: "想停就停，想绕远就绕远。",
    sceneLabel: "夜里 · 路上",
    char: { x: 194, groundY: 190, holdMug: false },
    ambient: { type: "speed", count: 9 },
    hotspots: [
      { id: "wheel", label: "方向盘", x: 0.43, y: 0.77, w: 0.15, h: 0.11, effect: "hearts", color: "#c8a88f", lines: ["方向盘在手里微微发烫。", "前面的路很长，但今晚不用赶。"] },
      { id: "radio", label: "电台", x: 0.57, y: 0.66, w: 0.12, h: 0.08, effect: "notes", color: "#b7a4d8", lines: ["电台换到一首老歌。", "窗外的东西都变成了流动的光。"] },
      { id: "window", label: "窗外", x: 0.09, y: 0.24, w: 0.3, h: 0.34, effect: "sparkles", color: "#f5c451", lines: ["路灯一盏一盏往后退。", "你突然想起一个很久没见的人。"] },
      { id: "stars", label: "星星", x: 0.68, y: 0.07, w: 0.2, h: 0.15, effect: "stars", color: "#f6e9cf", lines: ["天窗外面有很多星星。", "你不需要记住它们的名字。"] }
    ],
    charLines: ["兜风就是没有目的地地走一段。", "想停就停，想绕远就绕远。", "让风再吹一会儿。"],
    stayLines: ["把车窗降下来。", "让这首歌放完。"]
  }
];

export function getPlace(id) {
  return PLACES.find((place) => place.id === id) || PLACES[0];
}
