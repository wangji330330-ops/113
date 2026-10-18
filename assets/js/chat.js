/*
 * 小灯聊天 · DeepSeek V4.1 Flash
 *
 * 直接通过 DeepSeek 的 OpenAI 兼容接口联网。API Key 只保存在本机
 * localStorage 里，不进入微光小屋的导出备份，也不经过任何第三方代理。
 * DeepSeek API 支持浏览器跨域（CORS）。
 */

const SETTINGS_KEY = "glimmer-nook:deepseek";
const MESSAGES_KEY = "glimmer-nook:chat";
const MAX_MESSAGES = 80;

export const DEEPSEEK_DEFAULTS = {
  apiKey: "",
  model: "deepseek-flash",
  baseUrl: "https://api.deepseek.com"
};

export class ChatError extends Error {
  constructor(message, code = "chat_error") {
    super(message);
    this.name = "ChatError";
    this.code = code;
  }
}

function readJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function writeJson(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function getChatSettings() {
  const raw = readJson(SETTINGS_KEY, {});
  return {
    ...DEEPSEEK_DEFAULTS,
    ...(raw && typeof raw === "object" ? raw : {}),
    apiKey: String(raw?.apiKey || ""),
    model: String(raw?.model || DEEPSEEK_DEFAULTS.model),
    baseUrl: String(raw?.baseUrl || DEEPSEEK_DEFAULTS.baseUrl)
  };
}

export function saveChatSettings(patch = {}) {
  const current = getChatSettings();
  const next = {
    ...current,
    ...patch
  };
  next.apiKey = String(next.apiKey || "").trim();
  next.model = String(next.model || DEEPSEEK_DEFAULTS.model).trim() || DEEPSEEK_DEFAULTS.model;
  next.baseUrl = String(next.baseUrl || DEEPSEEK_DEFAULTS.baseUrl).trim().replace(/\/+$/, "");
  if (!/^https?:\/\//i.test(next.baseUrl)) {
    throw new ChatError("接口地址需要以 http:// 或 https:// 开头。", "bad_endpoint");
  }
  if (!writeJson(SETTINGS_KEY, next)) {
    throw new ChatError("浏览器暂时不让我保存设置。", "storage");
  }
  return next;
}

export function hasChatKey() {
  return Boolean(getChatSettings().apiKey);
}

export function maskKey(key) {
  const value = String(key || "");
  if (!value) return "";
  if (value.length <= 8) return "••••••";
  return `${value.slice(0, 3)}••••${value.slice(-4)}`;
}

export function clearChatKey() {
  const settings = getChatSettings();
  saveChatSettings({ ...settings, apiKey: "" });
}

function cleanMessage(raw) {
  if (!raw || typeof raw !== "object") return null;
  const role = raw.role === "assistant" ? "assistant" : raw.role === "user" ? "user" : null;
  const content = String(raw.content || "").trim().slice(0, 12000);
  if (!role || !content) return null;
  return {
    id: String(raw.id || `${role}-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`),
    role,
    content,
    at: raw.at || new Date().toISOString()
  };
}

export function getChatMessages() {
  const raw = readJson(MESSAGES_KEY, []);
  if (!Array.isArray(raw)) return [];
  return raw.map(cleanMessage).filter(Boolean).slice(-MAX_MESSAGES);
}

export function saveChatMessages(messages) {
  const list = Array.isArray(messages) ? messages.map(cleanMessage).filter(Boolean).slice(-MAX_MESSAGES) : [];
  writeJson(MESSAGES_KEY, list);
  return list;
}

export function appendChatMessage(role, content) {
  const message = cleanMessage({
    role,
    content,
    at: new Date().toISOString()
  });
  if (!message) return getChatMessages();
  return saveChatMessages([...getChatMessages(), message]);
}

export function clearChatMessages() {
  try {
    localStorage.removeItem(MESSAGES_KEY);
  } catch {
    /* ignore */
  }
}

export function buildSystemPrompt(contextText = "") {
  return [
    "你是「微光小屋」里的小灯：一个像素小人，也是用户身边温柔的陪伴者。你住在有猫、台灯、江边和许多小场景的小屋里。",
    "说话方式：温柔、具体、简短，通常 2 到 4 句。先接住对方此刻的感受，再给一个非常小、可选择的建议。不要一次问很多问题。",
    "不要使用说教、命令、打分或“你应该/你必须/加油就会好”的语气。允许用户没有动力、什么都不做、休息、难过。不要强行把话题拉回打卡。",
    "你可以自然提到小屋、团子、窗外的天气这些虚构意象，但不要编造现实世界里的事实，也不要假装知道用户没告诉你的事。",
    "你不是心理治疗师或医生，不要诊断。若用户提到自伤、自杀、伤害他人或严重危机：认真表达关心，建议立刻联系信任的人、当地急救或心理援助热线（中国大陆可拨 12356），并鼓励远离可能伤害自己的物品；不要只回一句“会好起来的”。",
    "如果用户只是闲聊、问知识或写代码，也可以正常帮助，保持简洁和温度。",
    contextText ? `当前小屋状态（仅供你自然参考，不要逐条复述）：${contextText}` : ""
  ].filter(Boolean).join("\n\n");
}

function friendlyHttpError(status, detail) {
  if (status === 401) return "API Key 不对，或者已经失效了。去设置里换一个吧。";
  if (status === 402) return "DeepSeek 账户余额不足，暂时没法继续聊。";
  if (status === 429) return "请求有点快，等一小会儿再试。";
  if (status === 400) return detail ? `这次请求没有被接受：${detail}` : "这次请求没有被接受，换个说法试试。";
  if (status >= 500) return "DeepSeek 那边暂时有点忙，等一下再试。";
  return detail ? `没有聊起来：${detail}` : "没有聊起来，稍后再试。";
}

export async function sendChatMessage(userMessages, settings, contextText = "") {
  if (navigator.onLine === false) {
    throw new ChatError("现在没有联网。等有网了再和小灯说话吧。", "offline");
  }
  if (!settings.apiKey) {
    throw new ChatError("还没有填 DeepSeek API Key。", "no_key");
  }
  const history = (Array.isArray(userMessages) ? userMessages : [])
    .filter((message) => message && (message.role === "user" || message.role === "assistant"))
    .slice(-18)
    .map((message) => ({ role: message.role, content: message.content }));
  const endpoint = /\/chat\/completions$/.test(settings.baseUrl)
    ? settings.baseUrl
    : `${settings.baseUrl.replace(/\/+$/, "")}/chat/completions`;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 75000);
  let response;
  try {
    response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${settings.apiKey}`
      },
      body: JSON.stringify({
        model: settings.model || "deepseek-flash",
        messages: [
          { role: "system", content: buildSystemPrompt(contextText) },
          ...history
        ],
        max_tokens: 900,
        temperature: 0.8,
        stream: false,
        thinking: { type: "disabled" }
      }),
      signal: controller.signal
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new ChatError("等得有点久，DeepSeek 没有及时回话。再试一次吧。", "timeout");
    }
    throw new ChatError("没有连上 DeepSeek。检查一下网络，或者稍后再试。", "network");
  } finally {
    window.clearTimeout(timer);
  }

  let data = null;
  try {
    data = await response.json();
  } catch {
    data = null;
  }
  if (!response.ok) {
    const detail = data?.error?.message || data?.message || "";
    throw new ChatError(friendlyHttpError(response.status, detail), `http_${response.status}`);
  }
  const content = data?.choices?.[0]?.message?.content;
  if (!content || !String(content).trim()) {
    throw new ChatError("小灯这次没接上话，再试一次吧。", "empty");
  }
  return {
    content: String(content).trim(),
    usage: data.usage || null
  };
}
