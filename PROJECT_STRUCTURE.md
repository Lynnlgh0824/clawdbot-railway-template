# PROJECT_STRUCTURE.md - 项目结构详解

> **项目**: OpenClaw Railway Template
> **版本**: v1.0.0
> **最后更新**: 2026-02-25
> **项目根目录**: `/Users/yuzhoudeshengyin/Documents/my_project/clawdbot-railway-template`

---

## 📁 目录结构

### 完整目录树

```
clawdbot-railway-template/
├── 📄 根目录文件
│   ├── Dockerfile                  # Docker 镜像定义 ⭐
│   ├── docker-compose.yml          # Docker Compose 配置（本地测试）
│   ├── railway.toml                # Railway 部署配置 ⭐
│   ├── package.json                # Node.js 依赖
│   ├── package-lock.json           # 依赖锁定文件
│   ├── LICENSE                     # MIT 开源协议
│   ├── README.md                   # 项目说明 ⭐
│   ├── STRUCTURE.md                # 结构说明
│   ├── PROJECT_RULES.md            # 项目规则 ⭐
│   ├── PROJECT_CONTEXT.md          # 项目上下文 ⭐
│   ├── PROJECT_STRUCTURE.md        # 项目结构 ⭐ (本文件)
│   └── CHANGELOG.md                # 变更日志 ⭐
│
├── 📁 src/                         # 源代码目录
│   ├── server.js                   # HTTP 服务器 ⭐
│   ├── claw-wrapper.js             # OpenClaw 包装器 ⭐
│   └── backup-manager.js           # 备份管理
│
├── 📁 scripts/                     # 脚本目录
│   ├── setup.sh                    # 设置脚本
│   ├── start-claw.sh               # 启动 OpenClaw
│   └── backup.sh                   # 备份脚本
│
├── 📁 public/                      # 静态资源
│   ├── index.html                  # 主页/设置向导
│   ├── css/                        # 样式文件
│   │   └── style.css
│   └── js/                         # 前端脚本
│       └── setup.js                # 设置向导逻辑
│
├── 📁 assets/                      # 资源文件
│   ├── railway-official-tweet.jpg  # Railway 官方推文截图
│   ├── railway-deploys.jpg         # 部署次数截图
│   └── railway-ceo-endorsement.jpg # CEO 认可截图
│
├── 📁 config/                      # 配置目录
│   ├── openclaw.example.json       # OpenClaw 配置示例
│   └── env.example                 # 环境变量示例
│
└── 📁 tests/                       # 测试目录
    ├── integration/                # 集成测试
    │   └── setup.test.js
    └── e2e/                        # 端到端测试
        └── deployment.test.js
```

---

## 📄 核心文件说明

### [Dockerfile](Dockerfile)
**用途**: 定义 Docker 镜像构建规则

```dockerfile
# 多阶段构建
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

ENV OPENCLAW_STATE_DIR=/data/.openclaw
ENV OPENCLAW_WORKSPACE_DIR=/data/workspace
ENV PORT=8080

EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=3s \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

CMD ["node", "src/server.js"]
```

**关键点**:
- 使用 Alpine 轻量级镜像
- 非 root 用户运行
- 健康检查端点
- 环境变量配置

---

### [railway.toml](railway.toml)
**用途**: Railway 部署配置

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

# OpenClaw 版本（Docker build arg）
[build.env]
OPENCLAW_GIT_REF = "v1.0.0"

[[services]]
name = "openclaw"

# 环境变量
[services.env]
PORT = "8080"
NODE_ENV = "production"

# Volume 持久化
[[services.volumes]]
name = "data"
mount_to = "/data"

# 公网访问
[[services.ports]]
port = 8080
type = "HTTP"
```

---

### [src/server.js](src/server.js)
**用途**: 包装 Web 服务器

```javascript
const http = require('http');
const { exec } = require('child_process');
const fs = require('fs').promises;

const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;
const CLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';

// HTTP 服务器
const server = http.createServer(async (req, res) => {
    if (req.url === '/health') {
        // 健康检查
        res.statusCode = 200;
        res.json({ status: 'healthy' });
    } else if (req.url.startsWith('/setup')) {
        // 密码保护的设置向导
        if (!authenticate(req)) {
            res.statusCode = 401;
            return res.end('Unauthorized');
        }
        // 处理设置请求
    } else {
        // 反向代理到 OpenClaw
        proxyToOpenClaw(req, res);
    }
});

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
```

---

### [src/claw-wrapper.js](src/claw-wrapper.js)
**用途**: OpenClaw 包装器

```javascript
const { exec } = require('child_process');
const fs = require('fs').promises;

const CLAW_STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';

async function runOpenClawCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const cmd = `openclaw ${command} ${args.join(' ')}`;
        exec(cmd, { cwd: CLAW_STATE_DIR }, (error, stdout, stderr) => {
            if (error) {
                reject(new Error(stderr || error.message));
            } else {
                resolve(stdout);
            }
        });
    });
}

async function onboardOpenClaw(config) {
    const args = [
        '--non-interactive',
        `--telegram-token=${config.telegramToken}`,
        `--discord-token=${config.discordToken}`
    ];

    await runOpenClawCommand('onboard', args);
}

async function startOpenClaw() {
    return runOpenClawCommand('start');
}

module.exports = {
    runOpenClawCommand,
    onboardOpenClaw,
    startOpenClaw
};
```

---

## 🏗️ 模块架构

### 服务架构

```
┌─────────────────────────────────────────┐
│          Railway Platform               │
├─────────────────────────────────────────┤
│  • Docker 容器托管                      │
│  • Volume 持久化存储                    │
│  • 自动 HTTPS                           │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│         包装 Web 服务器                 │
├─────────────────────────────────────────┤
│  • HTTP 服务器 (server.js)              │
│  • 路由处理                             │
│  • 密码验证                             │
│  • 反向代理                             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│       OpenClaw 包装器                   │
├─────────────────────────────────────────┤
│  • 命令执行 (claw-wrapper.js)           │
│  • 配置管理                             │
│  • 进程管理                             │
└─────────────────┬───────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────┐
│        OpenClaw Gateway                 │
├─────────────────────────────────────────┤
│  • / 和 /openclaw 路由                  │
│  • Telegram Bot                         │
│  • Discord Bot                          │
│  • 对话记忆                             │
└─────────────────────────────────────────┘
```

---

### 数据流架构

```
用户请求
    │
    ▼
包装 Web 服务器
    │
    ├─→ /health → 健康检查
    ├─→ /setup → 密码验证 → 设置向导
    │              │
    │              ├─→ GET → 显示表单
    │              └─→ POST → 处理配置
    │                       │
    │                       ▼
    │                 runOpenClawCommand()
    │                       │
    │                       ▼
    │                 写入 /data/.openclaw
    │
    └─→ /* → 反向代理
            │
            ▼
    OpenClaw Gateway
            │
            ▼
    处理 Bot 请求
```

---

## 🔄 数据流向

### 设置流程

```
用户访问 /setup
    │
    ▼
密码验证
    │
    ▼
显示配置表单
    │
    ▼
用户提交:
  - Telegram Token
  - Discord Token
    │
    ▼
验证 Token
    │
    ▼
运行: openclaw onboard --non-interactive
    │
    ├─→ 写入 /data/.openclaw/config.json
    ├─→ 写入 /data/.openclaw/credentials.json
    └─→ 初始化对话记忆
    │
    ▼
启动 OpenClaw
    │
    ▼
重定向到 /
```

---

### 代理流程

```
HTTP 请求 → /
    │
    ▼
检查 OpenClaw 是否运行
    │
    ├─→ 未运行 → 启动 OpenClaw
    │
    └─→ 运行中 → 继续
            │
            ▼
    转发到 http://localhost:3000
            │
            ▼
    OpenClaw 处理请求
            │
            ▼
    返回响应
            │
            ▼
    发送给用户
```

---

## 📊 文件大小参考

| 类型 | 大小范围 | 说明 |
|------|----------|------|
| JavaScript 文件 | ~5-15 KB | Node.js 脚本 |
| HTML 文件 | ~10-30 KB | 前端页面 |
| Docker 镜像 | ~100-200 MB | Alpine + Node.js |
| 配置文件 | ~1-5 KB | TOML/JSON |

---

## 🎯 扩展指南

### 添加新的 Bot 平台

#### 1. 更新配置表单
```html
<!-- public/index.html -->
<form id="setup-form">
    <input name="telegramToken" placeholder="Telegram Bot Token">
    <input name="discordToken" placeholder="Discord Bot Token">
    <!-- 添加新平台 -->
    <input name="slackToken" placeholder="Slack Bot Token">
</form>
```

#### 2. 更新 onboard 命令
```javascript
// src/claw-wrapper.js
async function onboardOpenClaw(config) {
    const args = [
        '--non-interactive',
        `--telegram-token=${config.telegramToken}`,
        `--discord-token=${config.discordToken}`,
        // 添加新平台
        `--slack-token=${config.slackToken}`
    ];

    await runOpenClawCommand('onboard', args);
}
```

---

### 添加配置验证

#### Token 格式验证
```javascript
function validateTelegramToken(token) {
    // Telegram Token 格式: 123456:ABC-DEF
    const regex = /^\d+:[A-Za-z0-9_-]+$/;
    return regex.test(token);
}

function validateDiscordToken(token) {
    // Discord Token 格式: base64 string
    const regex = /^[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+\.[A-Za-z0-9+/=]+$/;
    return regex.test(token);
}
```

---

## 🚀 部署结构

### Railway 部署

```bash
# 1. 在 GitHub 创建仓库
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/clawdbot-railway-template.git
git push -u origin main

# 2. 在 Railway 创建 Template
# - 访问 https://railway.com/new/template
# - 选择 GitHub 仓库
# - 添加 Volume (挂载到 /data)
# - 设置环境变量:
#   - SETUP_PASSWORD (必需)
#   - OPENCLAW_STATE_DIR=/data/.openclaw
#   - OPENCLAW_WORKSPACE_DIR=/data/workspace

# 3. 发布 Template
# - 设置模板名称和描述
# - 选择公开/私有
# - 发布
```

---

### 本地测试

```bash
# 1. 构建镜像
docker build -t openclaw-railway-template .

# 2. 运行容器
docker run --rm -p 8080:8080 \
    -e PORT=8080 \
    -e SETUP_PASSWORD=test123 \
    -e OPENCLAW_STATE_DIR=/data/.openclaw \
    -v $(pwd)/test-data:/data \
    openclaw-railway-template

# 3. 测试端点
curl http://localhost:8080/health
# 预期输出: {"status":"healthy"}

# 4. 测试设置向导
curl -H "Authorization: Bearer test123" http://localhost:8080/setup
```

---

## 🧪 测试结构

### 集成测试

```javascript
// tests/integration/setup.test.js
const request = require('supertest');

describe('Setup Integration Tests', () => {
    test('should protect /setup without password', async () => {
        const response = await request(app).get('/setup');
        expect(response.status).toBe(401);
    });

    test('should allow /setup with correct password', async () => {
        const response = await request(app)
            .get('/setup')
            .set('Authorization', 'Bearer test123');
        expect(response.status).toBe(200);
    });

    test('should onboard OpenClaw with valid tokens', async () => {
        const response = await request(app)
            .post('/setup')
            .set('Authorization', 'Bearer test123')
            .send({
                telegramToken: '123456:TEST',
                discordToken: 'TEST.TOKEN.TEST'
            });
        expect(response.status).toBe(200);
    });
});
```

---

## 📝 环境变量

### 必需变量

```bash
SETUP_PASSWORD=your-secure-password  # 设置向导密码
PORT=8080                            # HTTP 端口
NODE_ENV=production                  # 运行环境
```

### 推荐变量

```bash
OPENCLAW_STATE_DIR=/data/.openclaw     # OpenClaw 状态目录
OPENCLAW_WORKSPACE_DIR=/data/workspace  # OpenClaw 工作目录
OPENCLAW_GATEWAY_TOKEN=pre-generated    # 预生成的 Gateway Token
```

---

**文档版本**: v1.0.0
**最后更新**: 2026-02-25
**维护者**: Vignesh N (@vignesh07)
