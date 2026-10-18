# 微光小屋 · Glimmer Nook

> 一个不催你的像素风打卡小屋。做到一点点，就点亮一点点。

微光小屋是一个偏「照顾自己」而不是「管理自己」的打卡应用。没有排行榜，没有连续中断惩罚，也不要求每天都很有动力。完成一件小事、来喘口气、写一页日记，或者和小灯说两句话，都算数。

![微光小屋桌面版预览](docs/preview-desktop.png)

<p align="center">
  <img src="docs/preview-diary.png" alt="日记本预览" width="49%">
  <img src="docs/preview-chat.png" alt="和小灯聊天预览" width="49%">
</p>

<p align="center">
  <img src="docs/preview-mobile.png" alt="微光小屋手机版预览" width="280">
</p>

- 网页版：<https://wangji330330-ops.github.io/113/>
- Android：[下载调试 APK v0.3.0](https://github.com/wangji330330-ops/113/releases/download/v0.3.0/glimmer-nook-v0.3.0-debug.apk)
- [GitHub Release v0.3.0](https://github.com/wangji330330-ops/113/releases/tag/v0.3.0)
- [更新日志](CHANGELOG.md)

## 现在有什么

- **今日页会随机换场景**：每次打开或刷新，13 个场景随机落在首页。可以直接在首页点场景里的小物件，也可以点小灯说话；不用先去另一个页面。
- **13 个可停留场景**：
  - 家里：客厅、房间、厨房、卫生间
  - 外面：学校、图书馆、电影院、郊游、超市、球场、江边、爬山、兜风
- **日记本**：按日期归档每天的文字。「给今天留一句话」不再限制字数，空一行自动分段；旧日记可以单独打开编辑。日记只保存在本机。
- **和小灯聊聊**：可选接入 DeepSeek V4.1 Flash。需要你自己的 DeepSeek API Key，直接在设备上请求官方接口，不经过第三方代理。没有 Key 时，其他功能完全不受影响。
- **人物换装**：头、面、身、腿、鞋分开搭配，多种选择；在「小屋 → 人物形象」或今日页的「换个样子」进入。
- **今日打卡**：三件预置小事，可自由增删改；点一下完成任务，点错再点一下即可取消。
- **能量签到**：快没电 / 还行 / 有点光。只影响小灯的表情和对话，不影响奖励。
- **喘口气**：半分钟呼吸引导。完成即算「今天来过」，会推进「出现天数」类奖励。
- **自定义小事和奖励**：名称、图标、难度、达成条件都由自己定。
- **成长与回顾**：微光等级、出现天数、完成次数、最长连续、月历足迹。
- **版本与更新**：设置内检查更新、查看更新日志；网页版在线更新，Android 跳转到新版 APK。
- **像素演出与音效**：小灯呼吸、眨眼、被摸头、打卡跳跃，场景待机动画，WebAudio 8-bit 音效。
- **本地优先**：打卡、日记、人物搭配和设置保存在浏览器 `localStorage`，不登录、不上传；支持导出 / 导入备份。
- **PWA / 离线**：可添加到主屏幕，Service Worker 缓存应用与像素字体；除了联网聊天，其余功能可离线使用。

底部导航现在有五个位置：**今日 / 小事 / 日记 / 奖励 / 小屋**。原来的场景页还在，从今日页的「去走走」或小屋设置进入。

## 联网聊天怎么用

1. 在 [DeepSeek 开放平台](https://platform.deepseek.com/api_keys) 创建一个 API Key。
2. 打开「日记 → 和小灯聊聊 → 连接 DeepSeek」，粘贴 Key，保存。
3. 回到聊天，直接说话。默认模型是 `deepseek-flash`（DeepSeek V4.1 Flash 的 API 模型名）。

说明：

- 请求从你的设备直接发往 `https://api.deepseek.com`，不经过微光小屋自己的服务器。DeepSeek API 支持浏览器跨域请求。
- Key 以明文保存在当前设备的 `localStorage` 中，**不会进入导出备份**；聊天记录也只保存在本机。请不要在公用设备上保存 Key。
- 聊天内容会发送给 DeepSeek，并按 DeepSeek 的 API 计费；需要账户里有余额。
- 不要把密码、身份证号、住址等敏感信息发进聊天。
- 没有联网或没有 Key 时，小灯不会假装回答；日记本、场景、打卡、奖励都可以照常离线使用。

## 更新机制

- 网页版、PWA：设置里的「版本与更新」会读取 `version.json`。有新版时点「更新并刷新」，会先更新 Service Worker，再重新载入新资源；打卡数据存在本地，不会丢。
- Android APK：检查到新版后会打开 APK 下载页。下载后直接覆盖安装，WebView 的本地数据会保留。
- 启动时会在联网状态下静默检查一次（每 12 小时最多一次），有新版会在「小屋」标签上显示一个小红点。
- 版本清单在 [`version.json`](version.json)，完整历史在 [`CHANGELOG.md`](CHANGELOG.md)。

## 本地预览

```bash
npm start
```

打开 <http://127.0.0.1:4173/>。不需要安装依赖，`npm start` 启动的是一个零依赖的静态文件服务器。

## 部署网页版

仓库根目录本身就是可部署的静态站点，没有构建步骤。

- GitHub Pages：Settings → Pages → Deploy from a branch → `main` / `/ (root)`。
- 也可以直接上传到任意静态托管（Vercel、Netlify、Cloudflare Pages 等）。
- 所有路径都是相对的，因此放在 `/113/` 这样的子路径下也能正常工作。

## 下载 Android APK

- Release 下载：[glimmer-nook-v0.3.0-debug.apk](https://github.com/wangji330330-ops/113/releases/download/v0.3.0/glimmer-nook-v0.3.0-debug.apk)（约 2.2 MB）
- 仓库镜像：[download/glimmer-nook-v0.3.0-debug.apk](download/glimmer-nook-v0.3.0-debug.apk)
- 校验：[SHA256](download/glimmer-nook-v0.3.0-debug.apk.sha256)
- 支持 Android 7.0（API 24）及以上，版本 0.3.0（versionCode 3）。

安装步骤：

1. 在手机浏览器打开上面的 APK 链接下载。
2. 如果系统提示「不允许安装未知来源应用」，在浏览器/文件管理器的设置里允许本次安装。
3. 这是**调试签名**版本，适合自用测试，不建议上架应用商店。

> 覆盖安装需要新旧 APK 使用同一个签名。当前文件由本机的调试密钥签名；后续继续在本机构建的版本可以直接覆盖。如果换机器或改用 GitHub Actions 构建，请先导出备份、卸载旧版再安装，或者配置统一的 release 签名。

## 打包 Android APK

### 自动构建（可选）

仓库提供了工作流模板：[scripts/android-build-workflow.yml](scripts/android-build-workflow.yml)。把它复制到 `.github/workflows/android.yml`，并确保推送凭据具有 `workflow` 权限后，GitHub Actions 会自动构建调试 APK。

### 本地构建

需要 JDK 17、Android SDK 35。用 Android Studio 打开 `android/` 目录，先同步网页资源：

```powershell
powershell -ExecutionPolicy Bypass -File scripts/sync-android.ps1
```

然后 Run / Build APK。也可以命令行：

```bash
cd android
gradle assembleDebug
```

APK 输出在 `android/app/build/outputs/apk/debug/app-debug.apk`。

如果 Windows 项目路径包含中文，请把 `android/` 复制到纯英文路径再构建（AGP 会检查路径）。

> 这是调试签名的 APK，适合自己安装使用，不适合直接上架应用商店。

## 项目结构

```text
index.html                  应用外壳
version.json                版本清单（检查更新用）
manifest.webmanifest        PWA 清单
sw.js                       离线缓存与更新
CHANGELOG.md                人类可读的更新日志
assets/
  css/style.css             全部界面与动画样式
  js/app.js                 应用启动、路由、弹窗、交互
  js/views.js               五个导航页面的 HTML 模板
  js/store.js               本地数据、统计、奖励、日记
  js/character.js           人物部件、搭配与绘制
  js/scene.js               人物头像绘制与旧客厅场景（保留）
  js/place-data.js          13 个场景的文案与可点击物件
  js/places.js              场景绘制、粒子与场景控制器
  js/chat.js                DeepSeek 直连、历史与系统提示
  js/updater.js             版本检查、Service Worker 更新、外部跳转
  js/icons.js               12×12 像素图标集
  js/audio.js               WebAudio 音效合成
  js/data.js                预设内容、文案、等级、更新历史
  js/helpers.js             日期、转义、格式化小工具
  fonts/fusion-pixel/       缝合像素字体（OFL-1.1）
  icons/                    应用图标
android/                    Android WebView 工程（含更新跳转桥）
scripts/                    本地服务器、图标生成、资源同步、构建模板
docs/                       README 预览图
download/                   APK 与校验文件
```

## 数据说明

- 存储键：`glimmer-nook:v1`（打卡、日记、人物搭配）
- 聊天设置：`glimmer-nook:deepseek`（只在本机；含 API Key）
- 聊天记录：`glimmer-nook:chat`（只在本机；最多保留最近 80 条）
- 每个自然日每个习惯只记一次；取消打卡会同步修正统计。
- 「出现天数」= 完成过至少一件小事，或完成过一次呼吸练习的日期数；只写日记不算打卡，但会出现在日记本里。
- 「最长连续」按历史最长计算，断掉也不会抹掉已经解锁的奖励。
- 日记不限字数（底层为安全起见限制单篇 20 万字符），旧日记可以单独编辑。
- 换设备前建议在「小屋 → 导出备份」保存 JSON。备份包含打卡、日记和人物搭配，不包含 API Key 和聊天记录。

## 发布新版本（备忘）

1. 更新 `assets/js/data.js` 里的 `APP_VERSION`、`APP_BUILD` 和 `CHANGELOG`。
2. 同步更新 `package.json`、`android/app/build.gradle.kts` 的 `versionCode` / `versionName`、`sw.js` 的 `CACHE`、`version.json`。
3. 重新构建 APK，替换 `download/` 里的文件和 SHA256；把 `version.json` 的 `apkUrl` / `releaseUrl` 指向新的 Release。
4. 创建新的 tag / Release 并上传 APK，推送后等 GitHub Pages 构建完成。

## 一句题外话

如果你最近真的很累，别一个人扛。找一个信任的人说说，或联系专业的心理支持。你不需要先变得有用，才值得被帮助。

## 字体

[Fusion Pixel Font / 缝合像素字体](https://github.com/TakWolf/fusion-pixel-font)，SIL Open Font License 1.1。许可证见 `assets/fonts/fusion-pixel/LICENSE-OFL.txt`。
