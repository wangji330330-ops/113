/*
 * 版本检查与更新。
 * 网页版：version.json + Service Worker，刷新后拿到新资源。
 * Android：跳转到新版 APK，覆盖安装保留 WebView 本地数据。
 */
import { APP_BUILD, APP_VERSION } from "./data.js";

const REMOTE_VERSION_URL = "https://wangji330330-ops.github.io/113/version.json";
const RAW_VERSION_URL = "https://raw.githubusercontent.com/wangji330330-ops/113/main/version.json";
const CHECK_KEY = "glimmer-nook:last-update-check";
const CHECK_INTERVAL = 12 * 60 * 60 * 1000;

export function isAndroidShell() {
  return Boolean(window.GlimmerAndroid) || location.hostname === "appassets.androidplatform.net";
}

export function compareVersions(a, b) {
  const left = String(a || "0").replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const right = String(b || "0").replace(/^v/i, "").split(".").map((part) => Number.parseInt(part, 10) || 0);
  const length = Math.max(left.length, right.length, 3);
  for (let i = 0; i < length; i += 1) {
    const l = left[i] || 0;
    const r = right[i] || 0;
    if (l > r) return 1;
    if (l < r) return -1;
  }
  return 0;
}

function cleanVersionInfo(raw) {
  if (!raw || typeof raw !== "object") return null;
  const version = String(raw.version || "").replace(/^v/i, "");
  if (!/^\d+\.\d+\.\d+$/.test(version)) return null;
  return {
    version,
    build: Number(raw.build) || 0,
    releasedAt: String(raw.releasedAt || ""),
    title: String(raw.title || "").slice(0, 60),
    notes: Array.isArray(raw.notes) ? raw.notes.map((item) => String(item).slice(0, 160)).slice(0, 8) : [],
    webUrl: String(raw.webUrl || ""),
    apkUrl: String(raw.apkUrl || ""),
    releaseUrl: String(raw.releaseUrl || "")
  };
}

async function fetchJson(url) {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), 9000);
  try {
    const response = await fetch(url, { cache: "no-store", signal: controller.signal });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return JSON.parse(await response.text());
  } finally {
    window.clearTimeout(timer);
  }
}

async function fetchVersionInfo() {
  const urls = isAndroidShell()
    ? [REMOTE_VERSION_URL, RAW_VERSION_URL]
    : [new URL("./version.json", document.baseURI).href, REMOTE_VERSION_URL];
  let lastError = null;
  for (const url of urls) {
    try {
      const info = cleanVersionInfo(await fetchJson(url));
      if (info) return info;
      lastError = new Error("版本文件格式不正确");
    } catch (error) {
      lastError = error;
    }
  }
  throw lastError || new Error("暂时无法获取版本信息");
}

export async function checkForUpdate() {
  if (navigator.onLine === false) {
    return { state: "offline", message: "现在没有联网。小屋会等你回来。" };
  }
  try {
    const info = await fetchVersionInfo();
    markChecked();
    if (compareVersions(info.version, APP_VERSION) > 0) {
      return { state: "available", info };
    }
    return { state: "latest", info };
  } catch {
    return { state: "offline", message: "没有连上网络，稍后再试试。" };
  }
}

export function markChecked() {
  try {
    localStorage.setItem(CHECK_KEY, String(Date.now()));
  } catch {
    /* ignore */
  }
}

export function shouldCheckOnBoot() {
  try {
    const last = Number(localStorage.getItem(CHECK_KEY) || 0);
    return Date.now() - last > CHECK_INTERVAL;
  } catch {
    return true;
  }
}

export function currentVersionLabel() {
  return `v${APP_VERSION}${APP_BUILD ? ` (${APP_BUILD})` : ""}`;
}

export function platformLabel() {
  if (isAndroidShell()) return "Android 壳";
  if (window.matchMedia && window.matchMedia("(display-mode: standalone)").matches) return "已安装 PWA";
  return "网页版";
}

export function openExternal(url) {
  if (!url) return false;
  try {
    if (window.GlimmerAndroid && typeof window.GlimmerAndroid.openExternal === "function") {
      window.GlimmerAndroid.openExternal(url);
      return true;
    }
    const opened = window.open(url, "_blank", "noopener,noreferrer");
    if (!opened) {
      location.href = url;
    }
    return true;
  } catch {
    return false;
  }
}

export async function applyWebUpdate() {
  if (!("serviceWorker" in navigator)) {
    location.reload();
    return;
  }
  try {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration) {
      await registration.update();
      const worker = registration.waiting || registration.installing;
      if (worker && worker.state !== "activated") {
        await new Promise((resolve) => {
          const timer = window.setTimeout(resolve, 2600);
          worker.addEventListener("statechange", () => {
            if (worker.state === "activated") {
              window.clearTimeout(timer);
              resolve();
            }
          });
        });
      }
    }
  } catch {
    /* Reload anyway; navigation is network-first. */
  }
  location.reload();
}
