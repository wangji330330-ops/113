/*
 * 离线小灯：一个不联网、不调用模型的陪伴回复器。
 *
 * 它不会假装自己是 DeepSeek，也不会编造知识。它只做三件事：
 * 接住一句情绪、记得用户主动留下的小事、给一个很小的下一步。
 */

import {
  addMemory,
  getMemories,
  getState,
  getTodayOverview
} from "./store.js";

let lastMemoryId = "";
let lastReply = "";

function pick(list) {
  if (!list.length) return "";
  let value = list[Math.floor(Math.random() * list.length)];
  if (list.length > 1) {
    let guard = 0;
    while (value === lastReply && guard < 6) {
      value = list[Math.floor(Math.random() * list.length)];
      guard += 1;
    }
  }
  lastReply = value;
  return value;
}

function normalize(text) {
  return String(text || "").replace(/\s+/g, " ").trim();
}

function memoryKindFor(text) {
  if (/(不喜欢|讨厌|害怕|怕|不想|别让|受不了)/.test(text)) return "boundary";
  if (/(喜欢|爱|舒服|开心|想要|希望)/.test(text)) return "like";
  if (/(最近|今天|这几天|最近总是|正在|一直)/.test(text)) return "recent";
  return "care";
}

function extractMemory(text) {
  const value = normalize(text);
  const explicit = value.match(/(?:记住|记一下|别忘了|帮我记得)[：:，,\s]*(.+)/);
  let phrase = explicit?.[1] || "";
  if (!phrase && /^(?:我)?(?:喜欢|不喜欢|讨厌|害怕|怕|最近|总是|想要|在意)(?:[^。！？?]{2,60})$/.test(value)) {
    phrase = value;
  }
  if (!phrase) return null;
  phrase = phrase
    .replace(/^[“”"'‘’]+|[“”"'‘’]+$/g, "")
    .replace(/[。！？?!，,；;]+$/g, "")
    .trim();
  if (phrase.length < 2 || /[?？]$/.test(phrase) || /什么|吗|怎么|为什么/.test(phrase)) return null;
  if (/(记得|记住|你|小灯)/.test(phrase) && phrase.length < 5) return null;
  return { text: phrase.slice(0, 80), kind: memoryKindFor(phrase) };
}

function crisisReply() {
  return "我很在意你刚才说的。先不要一个人待着，好吗？如果可以，联系一个你信任的人，或者拨打心理援助热线 12356；如果现在有立刻伤害自己的危险，请拨打 120/110，并先远离能伤害自己的东西。你不用先解释清楚，先让自己安全。";
}

function isCrisis(text) {
  return /(自杀|不想活|活不下去|想死(?!你|笑)|结束生命|伤害自己|自残|割腕|跳楼|一了百了)/.test(text);
}

function chooseMemory(text, force = false) {
  const memories = getMemories();
  if (!memories.length) return null;
  let memory = null;
  if (force) {
    memory = memories.find((item) => item.kind === "like") || memories[0];
  } else {
    const matched = memories.find((item) => {
      const words = item.text.replace(/[，。！？、,.!?]/g, "");
      return words.length >= 2 && text.includes(words.slice(0, 2));
    });
    if (matched) memory = matched;
    else if (Math.random() < 0.28) memory = memories[Math.floor(Math.random() * memories.length)];
  }
  if (!memory) return null;
  if (memory.id === lastMemoryId && memories.length > 1) {
    memory = memories.find((item) => item.id !== lastMemoryId) || memory;
  }
  lastMemoryId = memory.id;
  return memory;
}

function memorySentence(memory) {
  if (!memory) return "";
  const text = memory.text;
  if (memory.kind === "like") {
    const liked = text.match(/^我(?:很|有点|挺)?喜欢(.+)$/);
    if (liked) return `我记得你喜欢${liked[1]}。`;
    const loved = text.match(/^我(?:很|有点|挺)?爱(.+)$/);
    if (loved) return `我记得你爱${loved[1]}。`;
  }
  if (memory.kind === "boundary") {
    const disliked = text.match(/^我不喜欢(.+)$/);
    if (disliked) return `我记得你不喜欢${disliked[1]}。`;
    const afraid = text.match(/^我(?:很|有点)?(?:害怕|怕)(.+)$/);
    if (afraid) return `我记得你怕${afraid[1]}。`;
  }
  if (memory.kind === "recent") {
    const recent = text.match(/^我最近(.+)$/);
    if (recent) return `我记得你最近${recent[1]}。`;
  }
  return `我记得你说过「${text}」。`;
}

function todayLine() {
  const overview = getTodayOverview();
  if (!overview || !overview.total) return "";
  if (overview.doneCount === 0) return "今天还没点亮什么，也没关系。";
  if (overview.allDone) return "今天的小事都亮了，可以去休息了。";
  return `今天已经点亮 ${overview.doneCount} 件了。`;
}

function withMemory(reply, text, force = false) {
  const memory = chooseMemory(text, force);
  const sentence = memorySentence(memory);
  return sentence ? `${reply}\n\n${sentence}` : reply;
}

export function localGreeting() {
  const state = getState();
  const name = state.profile.name ? `，${state.profile.name}` : "";
  return `我在${name}。不联网也可以说说话。\n\n不用组织语言，想到什么就说什么。`;
}

export function generateLocalReply(rawText) {
  const text = normalize(rawText);
  if (!text) return { content: "我在。慢慢说。" };

  if (isCrisis(text)) {
    return { content: crisisReply(), crisis: true };
  }

  const memory = extractMemory(text);
  if (memory) {
    const saved = addMemory(memory.text, memory.kind, "chat");
    if (!saved) {
      return { content: "这句话我好像没记下来，再说一次好吗？" };
    }
    if (saved.duplicate) {
      return { content: `这件事我已经记着了：「${saved.text}」。` };
    }
    return {
      content: `好，我记住了：「${saved.text}」。\n\n以后你提起，我会记得。`,
      savedMemory: saved
    };
  }

  if (/(记得|记住|上次|以前|我说过)/.test(text)) {
    const memories = getMemories();
    if (!memories.length) {
      return { content: "你还没跟我说过太多。可以从一句「我喜欢……」或「最近……」开始，我会记下来。" };
    }
    const chosen = chooseMemory(text, true);
    return { content: memorySentence(chosen) || "我记得一些，只是现在没找到那一件。" };
  }

  if (/(在吗|你好|嗨|hello|小灯)/i.test(text) && text.length < 16) {
    return { content: `我在。\n\n${todayLine()}`.trim() };
  }

  if (/(谢谢|谢啦|感谢)/.test(text)) {
    return { content: "不用谢。你愿意说出来，就已经很重要了。" };
  }

  if (/(陪我|抱抱|说说话|聊聊|坐一会儿)/.test(text)) {
    return { content: withMemory("好，我在这儿。我们不急着做什么，坐一会儿就好。", text) };
  }

  if (/(累|没力气|没动力|撑不住|疲惫|困|不想动|好累)/.test(text)) {
    return {
      content: withMemory(
        `听起来你已经撑了很久。${todayLine()}\n\n先不用把今天过好，靠一会儿也算。要不要先喝一口水？`,
        text
      )
    };
  }

  if (/(难过|想哭|委屈|孤独|没人|失落|难受|崩溃|空落落)/.test(text)) {
    return {
      content: withMemory(
        "那种没人接住的感觉，很难受。你不用马上好起来，我在这儿陪你坐一会儿。\n\n如果愿意，可以只告诉我现在最堵的那一点点。",
        text
      )
    };
  }

  if (/(焦虑|紧张|害怕|担心|睡不着|失眠|心慌|慌)/.test(text)) {
    return {
      content: withMemory(
        "心里一直提着，会很累。先把脚踩在地上，慢慢呼一口气。\n\n现在最吵的那件事，是什么？",
        text
      )
    };
  }

  if (/(烦|生气|讨厌|气死|火大)/.test(text)) {
    return {
      content: withMemory("被这样对待，生气很正常。你可以先骂两句，不用讲道理。\n\n我不评价，只听着。", text)
    };
  }

  if (/(开心|高兴|顺利|好耶|不错|舒服)/.test(text)) {
    return {
      content: withMemory("这一小点开心，值得被记住。\n\n今天发生了什么？", text)
    };
  }

  if (/(不知道|随便|都行|没想好)/.test(text)) {
    return { content: "不知道也没关系。可以先从「现在身体是什么感觉」开始，不用找到答案。" };
  }

  if (/[?？]$/.test(text)) {
    return {
      content: "这个问题我可能答不好。离线的小灯不懂太多，但我可以听你把它说完。\n\n你更希望我给一个建议，还是先陪你待着？"
    };
  }

  return {
    content: withMemory("我在听。你可以慢慢说，不用一次讲清楚。\n\n现在最想被听见的是哪一句？", text)
  };
}
