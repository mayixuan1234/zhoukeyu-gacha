# 抽抽乐记录器

> 个人项目 | v6.1 | 1000+ 用户 | 已上线

面向粉丝社群活动场景的**在线盲盒抽卡记录管理工具**。支持三种录入方式（Excel 导入 / OCR 识别 / 手动输入），提供全维度数据统计和可视化。

## 在线访问

🔗 [https://zhoukeyu-gacha.pages.dev/](https://zhoukeyu-gacha.pages.dev/)

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

## 项目结构

```
docs/工作/
├── index.html              # 主程序（v6.1，244KB 单文件 SPA）
├── gacha-sync-extension/   # Chrome 浏览器扩展
├── functions/              # Cloudflare Worker 函数
├── index - 副本 (*).html   # v1-v6 历史版本归档
└── README.md
```

## 关键设计决策

- **为什么纯前端**：用户数据存储在浏览器 localStorage，零服务器成本、零运维
- **为什么 OCR 用 Worker 代理**：Tesseract.js 在前端暴露 API Key 不安全，Worker 层做鉴权转发
- **为什么不做账号系统**：粉丝社群场景下用户不愿意注册，localStorage 够用

## 迭代历程

| 版本 | 时间 | 核心变化 |
|------|------|----------|
| v1-v4 | 2024 | 基础录入 + 图鉴展示 |
| v5 | 2025.01 | OCR 识别 + Excel 导入 |
| v6 | 2025.03 | 排行榜 + 公告系统 + 移动端适配 |
| v6.1 | 2025.06 | Bug 修复 + 微信兼容 |
