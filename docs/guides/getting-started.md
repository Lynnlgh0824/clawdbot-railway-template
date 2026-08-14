# OpenClaw Railway Template - 快速入门

> Version: 1.0 | Last Updated: 2026-06-01

---

## 这是什么？

一个一键部署模板，让你在 Railway 上快速运行 OpenClaw（Telegram/Discord AI 机器人网关），无需命令行操作。

**你将获得**:
- ✅ OpenClaw Gateway + Control UI
- ✅ Web 安装向导 (`/setup`)
- ✅ 持久化存储（Railway Volume）
- ✅ 数据导入导出（备份/迁移）

---

## 前置条件

- Railway 账号（[railway.app](https://railway.app)，免费层可用）
- Telegram Bot Token 或 Discord Bot Token（二选一）

---

## 5 分钟部署

### 第 1 步：获取 Bot Token

**Telegram**:
1. 在 Telegram 搜索 `@BotFather`
2. 发送 `/newbot`
3. 按提示设置名称和用户名
4. 复制获得的 Token（格式：`123456:ABCdef...`）

**Discord**:
1. 访问 [Discord Developer Portal](https://discord.com/developers/applications)
2. 点击 "New Application" → 输入名称
3. 左侧 "Bot" → "Add Bot"
4. 复制 Token
5. 开启 "Message Content Intent" 权限

### 第 2 步：部署到 Railway

1. 访问项目 GitHub 仓库
2. 点击 "Deploy on Railway" 或在 Railway 创建新项目
3. 选择 "Deploy from GitHub Repo"
4. 添加 Volume：Mount Path 设为 `/data`
5. 设置环境变量：
   - `SETUP_PASSWORD` = 你设定的安装密码
6. 启用 Public Networking
7. 点击 Deploy

### 第 3 步：运行安装向导

1. 部署完成后，访问 `https://your-app.up.railway.app/setup`
2. 输入你设置的 `SETUP_PASSWORD`
3. 粘贴 Bot Token
4. 点击 "Start Setup"
5. 等待安装完成（约 1-2 分钟）

### 第 4 步：开始使用

- 访问 `https://your-app.up.railway.app/` 打开 OpenClaw Control UI
- 在 Telegram/Discord 中向你的 Bot 发消息测试

---

## 环境变量参考

| 变量 | 必填 | 说明 |
|------|------|------|
| `SETUP_PASSWORD` | ✅ | 安装向导密码 |
| `OPENCLAW_STATE_DIR` | ❌ | 状态目录，默认 `/data/.openclaw` |
| `OPENCLAW_WORKSPACE_DIR` | ❌ | 工作区目录，默认 `/data/workspace` |
| `OPENCLAW_GATEWAY_TOKEN` | ❌ | Gateway API Token（自动生成） |

---

## 下一步

- [部署指南](deployment.md) — 详细部署配置
- [排错指南](troubleshooting.md) — 遇到问题看这里
