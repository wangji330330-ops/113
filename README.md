# 微光小屋 · Glimmer Nook

> 一个不催你的像素风打卡小屋。做到一点点，就点亮一点点。

微光小屋是一个偏「照顾自己」而不是「管理自己」的打卡应用。没有排行榜，没有连续中断惩罚，也不要求每天都很有动力。完成一件小事、来喘口气、写一句今天的心情，都算数。

- 网页版：<https://wangji330330-ops.github.io/113/>
- Android：可下载仓库中的调试 APK，也可以按下方说明本地打包。仓库另附了一份可选的 GitHub Actions 构建模板。

## 现在有什么

- **今日打卡**：三件预置小事，可自由增删改；点一下完成任务，点错再点一下即可取消。
- **能量签到**：快没电 / 还行 / 有点光。只影响小灯的表情和对话，不影响奖励。
- **喘口气**：半分钟呼吸引导。完成即算「今天来过」，会推进「出现天数」类奖励。
- **自定义小事**：名称、像素图标、难度（+1 / +2 / +3 微光）。
- **自定义奖励**：奖励内容自己写，达成条件支持累计出现天数、完成任务次数、积攒微光、最长连续天数。
- **成长与回顾**：微光等级、出现天数、完成次数、连续记录、月历足迹。
- **像素演出**：小灯呼吸/眨眼/被摸头/打卡跳跃，小猫呼吸，台灯闪烁，点灯与彩纸；页面切换有像素擦除动画。
- **音效**：WebAudio 实时合成的 8-bit 小声音，可关闭。
- **本地优先**：全部数据保存在浏览器 `localStorage`，不登录、不上传。支持导出 / 导入 JSON 备份。
- **PWA / 离线**：可添加到主屏幕，Service Worker 缓存应用与像素字体。
- **Android 壳**：原生 WebView + `WebViewAssetLoader`，完全离线运行；GitHub Actions 自动构建 APK。

## 本地预览

```bash
npm start
```

打开 <http://127.0.0.1:4173/>。

不需要安装依赖。`npm start` 启动的是一个零依赖的静态文件服务器。

## 部署网页版

仓库根目录本身就是可部署的静态站点，没有构建步骤。

- GitHub Pages：Settings → Pages → Deploy from a branch → `main` / `/ (root)`。
- 也可以直接上传到任意静态托管（Vercel、Netlify、Cloudflare Pages 等）。
- 所有路径都是相对的，因此放在 `/113/` 这样的子路径下也能正常工作。

## 打包 Android APK

### 自动构建（可选）

仓库提供了 `.github/workflows` 工作流模板：[scripts/android-build-workflow.yml](scripts/android-build-workflow.yml)。把它复制到 `.github/workflows/android.yml` 并推送后，GitHub Actions 会自动构建调试 APK，并在 Actions 页面提供 `glimmer-nook-debug-apk` 工件。

### 本地构建

需要 JDK 17、Android SDK 35。用 Android Studio 打开 `android/` 目录，先同步网页资源：

```powershell
pwsh scripts/sync-android.ps1
```

然后 Run / Build APK。也可以命令行：

```bash
cd android
gradle assembleDebug
```

APK 输出在 `android/app/build/outputs/apk/debug/app-debug.apk`。

> 这是调试签名的 APK，适合自己安装使用，不适合直接上架应用商店。

## 项目结构

```text
index.html                  应用外壳
manifest.webmanifest        PWA 清单
sw.js                       离线缓存
assets/
  css/style.css             全部界面与动画样式
  js/app.js                 应用启动、路由、弹窗、交互
  js/views.js               四个页面的 HTML 模板
  js/store.js               本地数据、统计、奖励解锁
  js/scene.js               Canvas 像素客厅与小灯/小猫动画
  js/icons.js               12×12 像素图标集
  js/audio.js               WebAudio 音效合成
  js/data.js                预设内容、文案、等级
  fonts/fusion-pixel/       缝合像素字体（OFL-1.1）
  icons/                    应用图标
android/                    Android WebView 工程
scripts/                    本地服务器、图标生成、资源同步
```

## 数据说明

- 存储键：`glimmer-nook:v1`
- 每个自然日每个习惯只记一次；取消打卡会同步修正统计。
- 「出现天数」= 完成过至少一件小事，或完成过一次呼吸练习的日期数。
- 「最长连续」按历史最长计算，断掉也不会抹掉已经解锁的奖励。
- 换设备前建议在「小屋 → 导出备份」保存 JSON。

## 一句题外话

如果你最近真的很累，别一个人扛。找一个信任的人说说，或联系专业的心理支持。你不需要先变得有用，才值得被帮助。

## 字体

[Fusion Pixel Font / 缝合像素字体](https://github.com/TakWolf/fusion-pixel-font)，SIL Open Font License 1.1。许可证见 `assets/fonts/fusion-pixel/LICENSE-OFL.txt`。
