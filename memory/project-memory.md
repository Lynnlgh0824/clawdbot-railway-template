# 项目总体记忆

> **项目名称**: OpenClaw Railway Template
> **最后更新**: 2026-02-25
> **维护者**: Vignesh N (@vignesh07)

---

## 📋 项目概述

OpenClaw Railway Template 是一个一键部署模板，将 OpenClaw Gateway 打包用于 Railway，并提供友好的 Web 设置向导。用户无需运行任何命令即可部署和配置 OpenClaw。

### 核心功能
- **一键部署**: Railway 模板部署
- **Web 设置向导**: 可视化配置界面
- **反向代理**: 代理请求到 OpenClaw Gateway
- **备份恢复**: 导出/导入配置功能

### 技术栈
- **运行时**: Node.js 20 (Alpine Linux)
- **打包**: Docker (多阶段构建)
- **平台**: Railway (一键部署)
- **认证**: Bearer Token 保护

---

## 🎯 项目目标

1. 简化 OpenClaw 部署流程
2. 提供 Web 配置界面
3. 实现零命令行部署
4. 支持配置备份恢复

---

## 🏗️ 架构设计

### HTTP Wrapper Server

```javascript
// 核心路由
GET  /health          # 健康检查
GET  /setup           # 设置向导（密码保护）
POST /setup           # 处理配置
GET  /*               # 反向代理到 OpenClaw
```

### 数据持久化

**Railway Volume**:
- 挂载点: `/data`
- 内容:
  - `/data/.openclaw/` - OpenClaw 状态、配置、凭证
  - `/data/workspace/` - OpenClaw 工作区
- 特性: 容器重启和重新部署后保留

### 环境变量

```bash
OPENCLAW_STATE_DIR=/data/.openclaw
OPENCLAW_WORKSPACE_DIR=/data/workspace
OPENCLAW_GATEWAY_TOKEN=auto-generated
```

---

## 💡 关键特性

### Web 设置流程
1. 访问 `/setup` (密码保护)
2. 输入 Telegram Bot Token
3. 输入 Discord Bot Token
4. 运行 `openclaw onboard --non-interactive`
5. 配置写入 `/data/.openclaw/`
6. OpenClaw Gateway 启动
7. 重定向到 `/`

### 备份 API
- **导出**: `GET /api/backup/export` (密码保护)
- **导入**: `POST /api/backup/import` (密码保护)

---

## 📊 当前状态

- **版本**: v1.0.0
- **部署**: 1800+ Railway 部署
- **认证**: ✅ 官方推荐
- **状态**: 生产就绪

---

## 🏆 官方认可

- ✅ [OpenClaw 官方文档](https://docs.openclaw.ai/railway) 推荐
- ✅ [Railway 官方推文](https://x.com/railway/status/2015534958925013438)
- ✅ [Railway CEO 认可](https://x.com/justjake/status/2015536083514405182)

---

## 🔗 相关资源

- **官方模板**: https://railway.com/deploy/clawdbot-railway-template
- **文档**: [docs/](../docs/)
- **源码**: [src/](../src/)
- **配置**: [railway.toml](../railway.toml)
