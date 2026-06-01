# PROJECT_RULES.md - 项目规则和约定

> **项目**: OpenClaw Railway Template
> **版本**: v1.0.0
> **最后更新**: 2026-02-25
> **状态**: ✅ 活跃维护中

---

## 📖 概述

本文档定义了 **OpenClaw Railway Template** 项目的开发规范、代码标准和协作约定，确保 OpenClaw Gateway 在 Railway 平台上一键部署的稳定性和可维护性。

---

## 🔧 代码规范

### 1. Shell 脚本规范

#### 文件编码
- **字符编码**: UTF-8
- **缩进方式**: 2 空格
- **行尾符**: LF (Unix 风格)

```bash
#!/bin/bash
# ✅ 正确示例
set -euo pipefail

CLAW_DIR="${CLAW_STATE_DIR:-/data/.openclaw}"
CONFIG_FILE="${CLAW_DIR}/config.json"

function setup_claw() {
    echo "Setting up OpenClaw..."
    mkdir -p "${CLAW_DIR}"
    # 配置逻辑
}

# ❌ 错误示例
# 缺少 shebang
# 没有错误处理
CLAW_DIR=/data/.openclaw  # 应使用变量引用
```

#### 函数定义规范
```bash
# ✅ 正确示例
function validate_setup() {
    local token="${1}"

    if [[ -z "${token}" ]]; then
        echo "Error: Token is required" >&2
        return 1
    fi

    return 0
}

# ❌ 错误示例
validate_setup() {  # 缺少 function 关键字
    token=$1  # 缺少 local 声明
    if [ -z $token ]; then  # 变量未引用
        echo "Error"  # 缺少重定向到 stderr
        return 1
    fi
}
```

---

### 2. Docker 规范

#### Dockerfile 最佳实践
```dockerfile
# ✅ 正确示例
FROM node:20-alpine AS builder

# 设置工作目录
WORKDIR /app

# 安装依赖
COPY package*.json ./
RUN npm ci --only=production

# 复制源代码
COPY . .

# 非root用户运行
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# 健康检查
HEALTHCHECK --interval=30s --timeout=3s \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 8080
CMD ["node", "server.js"]

# ❌ 错误示例
FROM node:20  # 应使用 alpine 镜像
WORKDIR /app
COPY . .  # 应分层复制
RUN npm install  # 应使用 npm ci
USER root  # 不应使用 root 用户
```

---

### 3. JavaScript/Node.js 规范

#### 代码风格
```javascript
// ✅ 正确示例
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs').promises;

const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;

async function startOpenClaw(config) {
    try {
        await execOpenClawCommand('onboard', [
            '--non-interactive',
            `--telegram-token=${config.telegramToken}`,
            `--discord-token=${config.discordToken}`
        ]);
        return true;
    } catch (error) {
        console.error('Failed to start OpenClaw:', error);
        return false;
    }
}

// ❌ 错误示例
const port = process.env.port  // 应使用大写变量名
const SETUP_PASSWORD = process.env.SETUP_PASSWORD
function startOpenClaw(config) {  // 缺少 async
    execOpenClawCommand('onboard', [  // 缺少 await
        '--non-interactive',
        '--token=' + config.token  // 应使用模板字符串
    ])
}
```

#### 错误处理规范
```javascript
// ✅ 正确示例
async function safeExecute(command, args) {
    try {
        const result = await execCommand(command, args);
        return { success: true, data: result };
    } catch (error) {
        console.error(`Command failed: ${command}`, error);
        return {
            success: false,
            error: error.message,
            code: error.code
        };
    }
}

// 使用示例
const result = await safeExecute('openclaw', ['status']);
if (!result.success) {
    console.error('Operation failed:', result.error);
    // 处理错误
}
```

---

## 🔄 Git 工作流

### 1. 分支策略

```
main (主分支)
 ├── protected
 ├── 只接受 Pull Request
 ├── 自动触发 Railway 部署

feature/* (功能分支)
 ├── feature/setup-wizard
 ├── feature/export-backup
 └── 从 main 分出，完成后合并回 main

fix/* (修复分支)
 ├── fix/websocket-handling
 ├── fix/volume-persistence
 └── 用于紧急修复
```

### 2. Commit 规范

#### Commit Message 格式
```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Type 类型
| 类型 | 说明 | 示例 |
|------|------|------|
| `feat` | 新功能 | `feat(wizard): 添加设置向导进度保存` |
| `fix` | Bug 修复 | `fix: 修复 WebSocket 连接断开问题` |
| `docs` | 文档更新 | `docs(readme): 更新 Railway 部署说明` |
| `style` | 代码格式 | `style(dockerfile): 优化 Dockerfile 结构` |
| `refactor` | 重构 | `refactor(server): 重构 HTTP 服务逻辑` |
| `perf` | 性能优化 | `perf: 优化容器启动时间` |
| `test` | 测试相关 | `test: 添加容器集成测试` |
| `chore` | 构建/工具 | `chore(deps): 更新 OpenClaw 版本` |

#### Commit 示例
```bash
# ✅ 正确示例
git commit -m "feat(backup): 添加配置导出功能

- 添加 /export 端点
- 生成 JSON 格式备份
- 包含所有配置和凭证
- 支持导入恢复

Closes #123"

# ❌ 错误示例
git commit -m "update"      # 太模糊
git commit -m "fix bug"     # 缺少具体内容
```

---

## 📁 文件命名规范

### 1. Shell 脚本
```
格式: <功能描述>.sh

✅ 正确示例:
- setup.sh                    (设置脚本)
- start-claw.sh               (启动服务)
- backup-config.sh            (备份配置)

❌ 错误示例:
- Setup.sh                    (不应使用大写)
- setup_shell.sh              (不应使用下划线)
```

### 2. JavaScript 文件
```
格式: <功能描述>.js

✅ 正确示例:
- server.js                   (HTTP 服务器)
- claw-wrapper.js             (OpenClaw 包装器)
- backup-manager.js           (备份管理)

❌ 错误示例:
- Server.js                   (不应使用大写)
- server_main.js              (不应使用下划线)
```

### 3. 配置文件
```
✅ 正确示例:
- railway.toml                (Railway 配置)
- Dockerfile                  (Docker 配置)
- docker-compose.yml          (Docker Compose)

❌ 错误示例:
- Railway.toml                (不应使用大写)
- dockerFile                  (应使用标准命名)
```

---

## 🔒 安全规范

### 1. 凭证管理
```javascript
// ❌ 绝不这样做
const TELEGRAM_TOKEN = "123456:ABC-DEF";  // 硬编码凭证

// ✅ 正确做法
const TELEGRAM_TOKEN = process.env.TELEGRAM_TOKEN || '';
if (!TELEGRAM_TOKEN) {
    throw new Error('TELEGRAM_TOKEN environment variable is required');
}
```

### 2. 密码保护
```javascript
// ✅ 设置向导密码保护
function authenticateSetup(req, res, next) {
    const authHeader = req.headers.authorization;
    const expectedPassword = process.env.SETUP_PASSWORD;

    if (!authHeader || authHeader !== `Bearer ${expectedPassword}`) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    next();
}

// 应用到 /setup 路由
app.use('/setup', authenticateSetup);
```

### 3. 数据持久化安全
```bash
# ✅ 使用 Railway Volume
# 在 railway.toml 中配置
[[volumes]]
name = "data"
mount_to = "/data"

# 确保敏感数据写入 Volume
CLAW_STATE_DIR=/data/.openclaw
CLAW_WORKSPACE_DIR=/data/workspace
```

---

## 🐳 Docker 规范

### 1. 镜像构建
```dockerfile
# ✅ 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
USER nodejs
EXPOSE 8080
CMD ["node", "server.js"]
```

### 2. 健康检查
```dockerfile
# ✅ 健康检查端点
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

# 对应的 HTTP 端点
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'healthy', uptime: process.uptime() });
});
```

---

## 🧪 测试规范

### 1. 容器测试
```bash
# ✅ 本地测试脚本
#!/bin/bash
set -euo pipefail

# 构建镜像
docker build -t openclaw-railway-template .

# 运行容器
docker run --rm -p 8080:8080 \
    -e PORT=8080 \
    -e SETUP_PASSWORD=test123 \
    -e OPENCLAW_STATE_DIR=/data/.openclaw \
    -v $(pwd)/test-data:/data \
    openclaw-railway-template

# 等待启动
sleep 5

# 测试端点
curl -f http://localhost:8080/health || exit 1
echo "✅ Health check passed"

# 测试设置向导
curl -f http://localhost:8080/setup || exit 1
echo "✅ Setup page accessible"

echo "✅ All tests passed"
```

---

## 📊 Railway 配置规范

### railway.toml 配置
```toml
# ✅ 正确配置
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

[[services]]
name = "openclaw"

# 环境变量
[services.env]
PORT = "8080"
NODE_ENV = "production"

# Volume 配置
[[services.volumes]]
name = "data"
mount_to = "/data"

# 公网访问
[[services.ports]]
port = 8080
type = "HTTP"
```

### 环境变量配置
```bash
# ✅ 必需的环境变量
SETUP_PASSWORD=your-secure-password
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_DIR=/data/workspace
PORT=8080
NODE_ENV=production

# ✅ 可选的环境变量
OPENCLAW_GATEWAY_TOKEN=pre-generated-token
TELEGRAM_TOKEN=your-telegram-bot-token
DISCORD_TOKEN=your-discord-bot-token
```

---

## 📝 文档维护

### 文档更新要求
| 文档 | 更新频率 | 负责人 |
|------|----------|--------|
| README.md | 每次发布 | 项目维护者 |
| CHANGELOG.md | 每次 Commit | 开发者 |
| PROJECT_RULES.md | 按需更新 | 团队共识 |
| DEPLOYMENT.md | 部署流程变更时 | DevOps |

---

## 🚀 部署规范

### 1. 版本管理
```bash
# ✅ 使用语义化版本
git tag -a v1.0.0 -m "Release v1.0.0"
git push origin v1.0.0

# 在 Railway 中指定版本
OPENCLAW_GIT_REF=v1.0.0
```

### 2. 回滚策略
```bash
# ✅ 保留最近的备份
BACKUP_DIR="/data/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
tar -czf "${BACKUP_DIR}/config_${TIMESTAMP}.tar.gz" /data/.openclaw

# 保留最近 7 天的备份
find "${BACKUP_DIR}" -name "config_*.tar.gz" -mtime +7 -delete
```

---

**文档版本**: v1.0.0
**维护者**: OpenClaw Railway Team
**最后审核**: 2026-02-25
