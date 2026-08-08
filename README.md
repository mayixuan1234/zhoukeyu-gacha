# 抽抽乐记录器

> 个人项目 | v6.1 | 1000+ 用户 | 已上线

面向粉丝社群活动场景的**在线盲盒抽卡记录管理工具**。支持三种录入方式（Excel 导入 / OCR 识别 / 手动输入），提供全维度数据统计和可视化。

## 在线访问

🔗 [https://zhoukeyu-gacha.pages.dev/](https://zhoukeyu-gacha.pages.dev/)

## 📱 Android APK

网页版打包为真·安卓 App，全屏无浏览器痕迹，桌面图标蓝黄色渐变。

### 下载安装

1. 在网站首页右上角点击“下载app手机应用”,进入下载页面。
2. 点击页面的按钮“下载apk到本机”
3. 点击安装，安卓会提示「不允许安装未知来源应用」→ **设置 → 打开「允许来自此来源」→ 返回继续**

| 项目 | 详情 |
|------|------|
| 包名 | `com.myx.gacha` |
| 版本 | 1.2 |
| 签名 | v1 + v2 + v3 三重 |
| 权限 | 仅 INTERNET（联网） |

### 从网页版迁移数据

APK 和浏览器是独立的存储空间。迁移步骤：

1. 手机浏览器打开网页版 → **备份/导出** → 下载 JSON
2. 打开 APK → **导入** → 选刚下载的 JSON
3. 完成。之后只用 APK，网页版留作备份入口

### 更新 APK

新 APK 传手机**直接覆盖安装，数据不丢**。构建命令：

```bash
cd gacha-apk && bash build.sh
```

> ⚠️ 签名证书 `focus.keystore`（密码 `focus2026`）**不能删**——证书丢了就得先卸载才能装，数据全没。建议备份到网盘。

### 离线 vs 联网

| 功能 | 离线 | 联网 |
|------|------|------|
| 抽卡记录增删改查 | ✅ | ✅ |
| 统计图表（Chart.js 已打包） | ✅ | ✅ |
| 数据导出 / 导入 / 备份 | ✅ | ✅ |
| 商品图、参考图鉴等外链图片 | ❌ 裂图 | ✅ |
| OCR 识别（tesseract.js 按需拉取） | ❌ | ✅ |
| 云端总抽数同步 | ❌ | ✅ |

### 技术要点

- `aapt2 + d8 + apksigner` 命令行工具链直接构建，不依赖 Android Studio，产物 ~190KB
- WebView 使用虚拟域名 `https://focus.local/` 确保 localStorage 不受 ROM 清理策略影响
- 站外链接交给系统浏览器，App 内不裸奔
- APK 构建工程单独维护：[gacha-apk](https://github.com/mayixuan1234/zhoukeyu-gacha/tree/main)

## 功能模块

### 数据录入（三种方式）
- **Excel 导入**：批量导入粉丝抽卡数据
- **OCR 识别**：上传截图自动识别卡牌信息（调 Cloudflare Worker 代理，避免 API Key 泄露）
- **手动录入**：表单逐条输入，支持非标准格式清洗（如 "R44、SR8、R25"）

### 数据展示
- **卡片图鉴**：全部卡牌陈列，含概率和拥有状态
- **抽卡统计**：个人总抽数、持有率、花费统计
- **排行榜**：用户间抽卡数量和收集率排名
- **全站数据**：111,801 总抽数 | ¥737,886 总销售额

### 运营功能
- **公告系统**：管理员发布活动公告
- **更新日志**：版本迭代记录用户可见
- **数据同步**：Chrome 扩展辅助数据抓取（`gacha-sync-extension/`）

### 兼容性
- 微信内置浏览器适配（去除非标 API）
- 移动端响应式布局
- PWA 离线支持

## 技术栈

| 层级 | 技术 |
|------|------|
| 前端 | 原生 HTML/CSS/JS（单文件 SPA） |
| OCR | Tesseract.js + Cloudflare Worker 代理 |
| 存储 | localStorage（客户端持久化） |
| 部署 | Cloudflare Pages |
| 扩展 | Chrome Extension（数据同步辅助） |
| Android | WebView + aapt2/d8/apksigner 工具链 |

## 项目结构

```
/
├── index.html                          # 主程序（v6.1，244KB 单文件 SPA）
├── ZhouKeYuGachaRecorder.apk           # Android 安装包
├── functions/api/                      # Cloudflare Worker（OCR 代理）
├── gacha-sync-extension/               # Chrome 浏览器扩展
├── apk-installer.html                  # APK 安装引导页
├── 抽卡记录器.html                     # 1.0 版本归档
└── README.md
```

> APK 构建工程在独立目录维护，详见 `gacha-apk/`。

## 关键设计决策

- **为什么纯前端**：用户数据存储在浏览器 localStorage，零服务器成本、零运维
- **为什么 OCR 用 Worker 代理**：Tesseract.js 在前端暴露 API Key 不安全，Worker 层做鉴权转发
- **为什么不做账号系统**：粉丝社群场景下用户不愿意注册，localStorage 够用
- **为什么做 APK**：网页版用户有安装需求，WebView 壳体积小、零权限，无需上架应用商店

## 迭代历程

| 版本 | 时间 | 核心变化 |
|------|------|----------|
| v1-v4 | 2026.7.13 | 基础录入 + 图鉴展示 |
| v5 | 2026.7.14 | OCR 识别 + Excel 导入 |
| v6 | 2026.7.15 | 排行榜 + 公告系统 + 移动端适配 |
| v6.1 | 2026.7.16 | Bug 修复 + 微信兼容 |
| v6.1 APK v1.2 | 2026.8.6 | 碎卡兑换 + 公告同步 + APK 覆盖升级 |
