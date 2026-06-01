# OpenClaw Railway Template - 代码规范

> **版本**: v1.0
> **更新时间**: 2026-02-27
> **适用于**: OpenClaw Railway 一键部署模板

---

## 📖 规范概述

本规范参考 [Hango 代码规范](https://hango-io.github.io/developer-guide/code/coding-guide/)，结合 Node.js 后端和 Railway 部署项目实际情况制定。

---

## 🎯 核心原则

### 1. 安全第一

保护用户凭证和配置，避免安全漏洞。

### 2. 部署自动化

提供一键部署体验，减少用户手动配置。

### 3. 日志完善

清晰的日志输出，方便问题排查。

### 4. 错误处理

完善的错误处理和用户友好的错误提示。

---

## 📝 命名规范

### 变量和函数

```javascript
// ✅ 推荐：小驼峰，语义明确
const setupPassword = '';
const isSetupComplete = false;
function validateConfig(config) { }
function saveConfig(data) { }

// ❌ 避免：无意义命名
const pwd = '';
const flag = false;
function handle() { }
```

**命名建议：**
- **配置项**: 描述性命名 `setupPassword`, `stateDirectory`
- **状态变量**: is/has 开头 `isConfigured`, `hasToken`
- **验证函数**: validate/check 开头 `validateToken`, `checkConfig`
- **HTTP 处理**: use/handle 开头（Express 中间件）

### 常量

```javascript
// ✅ 推荐：全大写下划线
const DEFAULT_STATE_DIR = '/data/.openclaw';
const SETUP_PASSWORD_MIN_LENGTH = 8;
const MAX_CONFIG_SIZE = 1024 * 1024; // 1MB

// ❌ 避免
const stateDir = '/data/.openclaw';
const minLen = 8;
```

### 环境变量

```javascript
// ✅ 推荐：大写，下划线分隔
process.env.SETUP_PASSWORD;
process.env.OPENCLAW_STATE_DIR;
process.env.PORT;

// 使用时解构重命名
const {
  SETUP_PASSWORD: setupPassword,
  OPENCLAW_STATE_DIR: stateDir,
  PORT: port = 3000
} = process.env;
```

---

## 🧩 函数规范

### 1. 拒绝超大函数

**规则**: 函数不超过 50 行

```javascript
// ❌ 避免：超大函数
async function handleSetup(req, res) {
  // 100+ 行代码...
}

// ✅ 推荐：拆分为小函数
async function handleSetup(req, res) {
  const { step, data } = req.body;

  try {
    switch (step) {
      case 'validate':
        await validateSetupData(data);
        break;
      case 'save':
        await saveConfig(data);
        break;
      case 'complete':
        await completeSetup(data);
        break;
    }
    res.json({ code: 'Success', message: '操作成功' });
  } catch (error) {
    handleError(res, error);
  }
}

async function validateSetupData(data) { }
async function saveConfig(data) { }
async function completeSetup(data) { }
function handleError(res, error) { }
```

### 2. 控制圈复杂度

**规则**: 圈复杂度不超过 15

```javascript
// ❌ 避免：高圈复杂度
function validateConfig(config) {
  if (config.password) {
    if (config.password.length < 8) {
      if (config.password.includes(' ')) {
        // 更多嵌套...
      }
    }
  }
}

// ✅ 推荐：提前返回
function validateConfig(config) {
  if (!config) return { valid: false, error: '配置为空' };
  if (!config.password) return { valid: false, error: '缺少密码' };
  if (config.password.length < 8) return { valid: false, error: '密码过短' };
  return { valid: true };
}
```

### 3. 减少函数入参

**规则**: 参数不超过 5 个

```javascript
// ❌ 避免：参数过多
function createConfig(password, stateDir, token, orgId, projectId) { }

// ✅ 推荐：使用对象参数
function createConfig({ password, stateDir, token, orgId, projectId }) { }

// 调用更清晰
createConfig({
  password: 'secure123',
  stateDir: '/data/.openclaw',
  token: 'ocl_...',
  orgId: 'org_...',
  projectId: 'proj_...'
});
```

---

## 🔐 安全规范

### 密码处理

```javascript
// ✅ 推荐：使用 bcrypt 加密
import bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

async function hashPassword(password) {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

async function verifyPassword(password, hash) {
  return await bcrypt.compare(password, hash);
}

// 使用
const hashedPassword = await hashPassword(setupPassword);
const isValid = await verifyPassword(inputPassword, hashedPassword);
```

### 敏感信息隐藏

```javascript
// ✅ 推荐：部分显示敏感信息
function maskToken(token) {
  if (!token || token.length < 10) return '***';
  return `${token.slice(0, 4)}${'*'.repeat(8)}${token.slice(-4)}`;
}

// 输出: ocl_************3a7b
console.log('Token:', maskToken(token));
```

### 输入验证

```javascript
// ✅ 推荐：验证所有用户输入
import { z } from 'zod';

const configSchema = z.object({
  setupPassword: z.string().min(8, '密码至少8位'),
  stateDirectory: z.string().min(1, '状态目录不能为空'),
  token: z.string().startsWith('ocl_', '无效的 token 格式')
});

function validateConfigInput(data) {
  const result = configSchema.safeParse(data);
  if (!result.success) {
    const errors = result.error.errors.map(e => ({
      field: e.path[0],
      message: e.message
    }));
    throw { code: 'ValidationError', errors };
  }
  return result.data;
}
```

---

## 🌐 Express 路由规范

### 路由组织

```javascript
// ✅ 推荐：按功能模块组织路由
// routes/setup.js
import express from 'express';
const router = express.Router();

router.post('/validate', validateSetup);
router.post('/save', saveSetup);
router.post('/complete', completeSetup);
router.get('/status', getSetupStatus);

export default router;

// routes/index.js
import setupRouter from './setup.js';
import configRouter from './config.js';
import proxyRouter from './proxy.js';

const router = express.Router();
router.use('/setup', setupRouter);
router.use('/config', configRouter);
router.use('/', proxyRouter);

export default router;
```

### 中间件模式

```javascript
// ✅ 推荐：使用中间件处理通用逻辑
// middleware/auth.js
export function requireSetupPassword(req, res, next) {
  const password = req.headers['x-setup-password'];
  if (!password) {
    return res.status(401).json({
      code: 'Unauthorized',
      message: '需要设置密码'
    });
  }

  // 验证密码
  if (!verifyPassword(password, storedHash)) {
    return res.status(403).json({
      code: 'Forbidden',
      message: '密码错误'
    });
  }

  next();
}

// 使用
import { requireSetupPassword } from './middleware/auth.js';

router.post('/config/save', requireSetupPassword, saveConfig);
```

### 错误处理

```javascript
// ✅ 推荐：统一错误处理
export function asyncHandler(fn) {
  return (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

// 使用
router.post('/save', asyncHandler(async (req, res) => {
  const config = await saveConfig(req.body);
  res.json({ code: 'Success', data: config });
}));

// 全局错误处理
app.use((err, req, res, next) => {
  console.error('Error:', err);

  res.status(err.status || 500).json({
    code: err.code || 'InternalError',
    message: err.message || '服务器内部错误',
    errors: err.errors
  });
});
```

---

## 📡 HTTP 代理规范

```javascript
// ✅ 推荐：使用 http-proxy-middleware
import { createProxyMiddleware } from 'http-proxy-middleware';

export function createOpenClawProxy(target) {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    pathRewrite: {
      '^/api': '' // 移除 /api 前缀
    },
    onError: (err, req, res) => {
      console.error('Proxy error:', err.message);
      res.status(502).json({
        code: 'BadGateway',
        message: 'OpenClaw 服务不可用'
      });
    },
    onProxyReq: (proxyReq, req, res) => {
      // 记录请求
      console.log(`[Proxy] ${req.method} ${req.url} -> ${target}${req.url}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      // 记录响应
      console.log(`[Proxy] ${proxyRes.statusCode} ${req.url}`);
    }
  });
}
```

---

## 💾 配置管理规范

### 配置文件结构

```javascript
// ✅ 推荐：使用 YAML 或 JSON
// config/openclaw.yaml
stateDirectory: /data/.openclaw
token: ocl_xxxxx
organization:
  id: org_xxxxx
project:
  id: proj_xxxxx

// 加载配置
import yaml from 'js-yaml';
import fs from 'fs/promises';

async function loadConfig(path) {
  const content = await fs.readFile(path, 'utf8');
  return yaml.load(content);
}
```

### 环境变量

```javascript
// ✅ 推荐：使用 dotenv
import dotenv from 'dotenv';
dotenv.config();

// 解构并设置默认值
const {
  SETUP_PASSWORD = '',
  OPENCLAW_STATE_DIR = '/data/.openclaw',
  OPENCLAW_HOST = 'localhost',
  OPENCLAW_PORT = '8080',
  PORT = '3000'
} = process.env;

// 验证必需的环境变量
if (!SETUP_PASSWORD) {
  console.warn('警告: SETUP_PASSWORD 未设置，/setup 路由将不启用');
}
```

---

## 📝 日志规范

### 日志级别

```javascript
// ✅ 推荐：使用 pino 或 winston
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  }
});

// 使用
logger.info('Setup completed successfully');
logger.warn('Configuration file not found, using defaults');
logger.error('Failed to connect to OpenClaw', err);
```

### 日志格式

```javascript
// ✅ 推荐：结构化日志
logger.info({
  event: 'setup_completed',
  duration: '2.3s',
  stateDirectory: '/data/.openclaw'
});

logger.error({
  event: 'config_save_failed',
  error: err.message,
  stack: err.stack
});

// ❌ 避免：字符串拼接
logger.info('Setup completed in 2.3s with directory /data/.openclaw');
```

---

## 🔄 API 响应规范

### 统一响应格式

```javascript
// ✅ 推荐：统一的响应格式
// 成功响应
res.json({
  code: 'Success',
  message: '操作成功',
  data: { /* 响应数据 */ }
});

// 分页响应
res.json({
  code: 'Success',
  message: '获取成功',
  data: {
    total: 100,
    items: [ /* 数据列表 */ ]
  }
});

// 错误响应
res.status(400).json({
  code: 'ValidationError',
  message: '参数验证失败',
  errors: [
    { field: 'password', message: '密码至少8位' }
  ]
});
```

### HTTP 状态码

| 状态码 | 场景 | code 值 |
|--------|------|---------|
| **200** | 成功 | Success |
| **400** | 参数错误 | ValidationError |
| **401** | 未认证 | Unauthorized |
| **403** | 无权限 | Forbidden |
| **404** | 资源不存在 | NotFound |
| **500** | 服务器错误 | InternalError |
| **502** | 上游服务错误 | BadGateway |

---

## 📐 代码格式

### 基本规则

| 规则 | 示例 |
|------|------|
| **每行 ≤ 120 字符** | 超出时换行 |
| **保留字与括号加空格** | `if (condition)` |
| **括号内无空格** | `func(a, b)` |
| **使用单引号** | `const name = 'John';` |
| **使用 const/let** | 不使用 `var` |

### async/await

```javascript
// ✅ 推荐：使用 async/await
async function saveConfig(config) {
  const data = await validateConfig(config);
  await fs.writeFile(CONFIG_PATH, JSON.stringify(data));
  return data;
}

// ❌ 避免：回调地狱
function saveConfig(config, callback) {
  validateConfig(config, (err, data) => {
    if (err) return callback(err);
    fs.writeFile(CONFIG_PATH, JSON.stringify(data), (err) => {
      if (err) return callback(err);
      callback(null, data);
    });
  });
}
```

---

## 🧪 测试建议

```javascript
// ✅ 推荐：使用 vitest 或 jest
import { describe, it, expect, vi } from 'vitest';

import { validateConfigInput } from './config.js';

describe('validateConfigInput', () => {
  it('should validate correct config', () => {
    const config = {
      setupPassword: 'secure123',
      stateDirectory: '/data/.openclaw',
      token: 'ocl_test123'
    };
    expect(() => validateConfigInput(config)).not.toThrow();
  });

  it('should reject short password', () => {
    const config = {
      setupPassword: 'short',
      stateDirectory: '/data/.openclaw',
      token: 'ocl_test123'
    };
    expect(() => validateConfigInput(config)).toThrow();
  });
});
```

---

## 📋 代码审查清单

提交代码前，请确认：

- [ ] 函数不超过 50 行
- [ ] 圈复杂度不超过 15
- [ ] 函数参数不超过 5 个
- [ ] 密码使用 bcrypt 加密
- [ ] 敏感信息不完整显示
- [ ] 所有用户输入都有验证
- [ ] 异步操作使用 async/await
- [ ] 错误被正确处理和记录
- [ ] API 响应格式统一
- [ ] 日志使用结构化格式

---

## 🔄 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2026-02-27 | 初始版本 |
| | | 参考 Hango 代码规范 |
| | | Node.js + Express 最佳实践 |
| | | Railway 部署规范 |

---

## 🚀 Railway 部署规范

### railway.json

```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/api/health"
  }
}
```

### Volume 挂载

```javascript
// ✅ 推荐：使用 Railway Volume
const STATE_DIR = process.env.OPENCLAW_STATE_DIR || '/data/.openclaw';

// 确保目录存在
import fs from 'fs/promises';
await fs.mkdir(STATE_DIR, { recursive: true });
```

---

**维护者**: OpenClaw Railway Template 团队
**反馈**: 如有问题或建议，请提交 Issue 或 PR
