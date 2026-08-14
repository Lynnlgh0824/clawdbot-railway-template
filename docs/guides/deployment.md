# OpenClaw Railway Template - 部署指南

> Version: 1.0 | Last Updated: 2026-06-01

---

## 部署方式

### 方式一：Railway Template（推荐）

最简单的方式，一键部署。

1. Fork 或直接使用模板仓库
2. Railway Dashboard → New Project → Deploy from GitHub Repo
3. 配置（见下方）

### 方式二：Docker 本地测试

```bash
docker build -t openclaw-template .
docker run -p 3000:3000 \
  -e SETUP_PASSWORD=test123 \
  -v openclaw-data:/data \
  openclaw-template
```

访问 `http://localhost:3000/setup`

---

## Railway 配置详解

### Volume 配置

| 设置 | 值 |
|------|-----|
| Mount Path | `/data` |
| Size | 1GB（免费层） |

Volume 用于持久化 OpenClaw 状态数据，重启不丢失。

### 环境变量

| 变量 | 必填 | 默认值 | 说明 |
|------|------|--------|------|
| `SETUP_PASSWORD` | ✅ | - | 安装向导访问密码 |
| `OPENCLAW_STATE_DIR` | ❌ | `/data/.openclaw` | OpenClaw 状态存储目录 |
| `OPENCLAW_WORKSPACE_DIR` | ❌ | `/data/workspace` | OpenClaw 工作区目录 |
| `OPENCLAW_GATEWAY_TOKEN` | ❌ | 自动生成 | Gateway API 认证 Token |
| `PORT` | ❌ | `3000` | 服务端口（Railway 自动设置） |

### Public Networking

1. Railway 服务 → Settings → Networking
2. 启用 "Public Networking"
3. 生成域名或绑定自定义域名

---

## 部署后验证

### 1. 健康检查

```bash
curl https://your-app.up.railway.app/
```

应返回 OpenClaw Gateway 响应。

### 2. 安装向导

访问 `https://your-app.up.railway.app/setup`，应看到密码输入框。

### 3. Bot 测试

在 Telegram/Discord 中向 Bot 发送任意消息，应收到回复。

---

## 自定义域名

1. Railway 服务 → Settings → Networking → Custom Domain
2. 输入你的域名
3. 在 DNS 提供商添加 CNAME 记录指向 Railway 提供的地址
4. 等待 SSL 证书自动签发（约 1-2 分钟）

---

## 数据备份与迁移

### 导出备份

访问 `https://your-app.up.railway.app/setup` → "Export Backup"

下载 JSON 文件包含所有 OpenClaw 状态。

### 导入备份

在新实例的 `/setup` 页面 → "Import Backup" → 上传 JSON 文件。

### 迁移流程

1. 旧实例导出备份
2. 新实例部署
3. 新实例导入备份
4. 验证 Bot 正常工作
5. 更新 DNS 指向新实例

---

## CI/CD

项目包含 GitHub Actions 自动构建 Docker 镜像：

```yaml
# .github/workflows/docker-build.yml
# 推送到 main 分支时自动构建
```

---

## 安全建议

- `SETUP_PASSWORD` 使用强密码
- 安装完成后可考虑修改密码
- 定期导出备份
- 不要将 `.env` 文件提交到 Git
