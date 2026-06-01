# 决策记录

> **项目**: OpenClaw Railway Template
> **目的**: 记录重要技术决策及其原因

---

## 决策 001: HTTP Wrapper 架构

**日期**: 项目初始化
**状态**: ✅ 已实施

**背景**:
需要将 OpenClaw Gateway 部署到 Railway，但 OpenClaw 是 CLI 工具。

**决策**:
使用 HTTP Wrapper Server 包装 OpenClaw。

**原因**:
- **简单性**: 无需修改 OpenClaw
- **灵活性**: 可以添加自定义功能
- **标准化**: 符合 Railway 部署模式

**影响**:
- src/server.js 是核心组件
- 提供 Web 设置界面
- 反向代理到 OpenClaw

**替代方案**:
- 修改 OpenClaw (破坏性)
- 直接运行 CLI (不符合 Railway 模式)

---

## 决策 002: Railway Volume 持久化

**日期**: 项目初始化
**状态**: ✅ 已实施

**背景**:
OpenClaw 配置和状态需要在容器重启后保留。

**决策**:
使用 Railway Volume 挂载到 `/data`。

**原因**:
- **持久性**: 数据在重启和重新部署后保留
- **简单性**: 无需外部数据库
- **成本**: Railway 免费层提供 1GB

**影响**:
- 所有配置存储在 `/data/.openclaw/`
- 工作区在 `/data/workspace/`
- 需要在 railway.toml 配置 Volume

**替代方案**:
- 外部数据库 (过度设计)
- 临时存储 (数据丢失)

---

## 决策 003: Web 设置向导

**日期**: 项目初始化
**状态**: ✅ 已实施

**背景**:
用户需要配置 Telegram 和 Discord Bot Token。

**决策**:
提供 Web 设置界面而非命令行。

**原因**:
- **用户体验**: 无需 SSH 或命令行
- **易用性**: 符合 Railway 一键部署理念
- **可视化**: 提供友好的配置界面

**影响**:
- /setup 路由 (密码保护)
- 前端表单 (public/index.html)
- 自动运行 openclaw onboard

**替代方案**:
- 命令行配置 (不符合目标)
- 环境变量 (不灵活)

---

## 决策 004: Docker 多阶段构建

**日期**: 项目初始化
**状态**: ✅ 已实施

**背景**:
需要最小化 Docker 镜像大小。

**决策**:
使用多阶段构建分离依赖和运行时。

**原因**:
- **镜像大小**: 减小最终镜像
- **安全性**: 不包含开发工具
- **最佳实践**: 符合 Docker 最佳实践

**影响**:
- builder 阶段安装依赖
- 最终阶段只复制必要文件
- 使用非根用户运行

**替代方案**:
- 单阶段构建 (镜像大)
- 不使用 Docker (不符合 Railway)

---

## 决策 005: Bearer Token 认证

**日期**: 项目初始化
**状态**: ✅ 已实施

**背景**:
设置向导需要保护，防止未授权访问。

**决策**:
使用 Bearer Token (Authorization header)。

**原因**:
- **简单性**: 易于实现和使用
- **标准化**: HTTP 标准认证方式
- **灵活性**: 易于集成

**影响**:
- SETUP_PASSWORD 环境变量
- /setup 路由需要认证
- API 端点需要认证

**替代方案**:
- Basic Auth (较少见)
- OAuth (过度设计)
- 无认证 (不安全)

---

## 🔗 相关文档

- [CLAUDE.md](../CLAUDE.md) - 开发指南
- [PROJECT_CONTEXT.md](../PROJECT_CONTEXT.md) - 项目上下文
- [railway.toml](../railway.toml) - Railway 配置
