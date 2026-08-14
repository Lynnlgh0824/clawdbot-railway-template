# OpenClaw Railway Template - 排错指南

> Version: 1.0 | Last Updated: 2026-06-01

---

## 部署问题

### 部署失败：Build Error

**排查**:
1. Railway Dashboard → Deployments → 查看构建日志
2. 常见原因：
   - Dockerfile 语法错误
   - 依赖下载超时（Railway 网络问题）

**解决**:
```bash
# 本地测试构建
docker build -t openclaw-template .
# 如果本地成功，Railway 失败，重试部署
```

### 部署成功但无法访问

**排查**:
1. 检查是否启用了 Public Networking
2. 检查端口配置（Railway 默认使用 `$PORT` 环境变量）
3. 查看 Deploy Logs 是否有启动错误

**解决**:
- Railway → Settings → Networking → 确认 Public Networking 已开启
- 确认服务正常监听 `$PORT`

---

## 安装向导问题

### `/setup` 返回 404

**原因**: 服务未正常启动或路由配置错误

**排查**:
1. Railway → Deployments → 查看运行日志
2. 确认容器正常运行

### 安装向导密码错误

**检查**: 环境变量 `SETUP_PASSWORD` 是否与输入一致

**注意**: 密码区分大小写

### 安装向导卡住不动

**排查**:
1. 查看 Railway 运行日志
2. 检查 Bot Token 是否正确
3. 检查网络是否可达 Telegram/Discord API

**常见原因**:
- Bot Token 格式错误
- Token 已过期或被撤销
- Railway 网络无法访问外部 API

---

## Bot 连接问题

### Telegram Bot 无响应

**排查步骤**:
1. 确认 Bot Token 正确：在 BotFather 中验证
2. 确认 Bot 未被禁用：向 @BotFather 发送 `/mybots` 检查
3. 查看 Railway 日志是否有错误
4. 测试 API 连通性：
   ```bash
   curl https://api.telegram.org/bot<TOKEN>/getMe
   ```

**常见原因**:
- Token 中有多余空格
- Bot 被 Telegram 限制（频繁错误请求）
- Webhook 设置冲突

### Discord Bot 无响应

**排查步骤**:
1. 确认 Bot Token 正确
2. 确认已开启 "Message Content Intent"
3. 确认 Bot 已邀请到服务器且有权限
4. 检查 Bot 权限：Read Messages、Send Messages、Read Message History

**邀请链接生成**:
Discord Developer Portal → OAuth2 → URL Generator → 选择 `bot` scope + 所需权限

---

## 数据问题

### Volume 数据丢失

**原因**: Volume 未正确挂载

**检查**: Railway → Settings → Volume → 确认 Mount Path 为 `/data`

**预防**: 定期导出备份

### 备份导入失败

**排查**:
1. 确认 JSON 文件格式正确
2. 检查文件大小（Railway 有请求体大小限制）
3. 查看 Railway 日志

---

## 性能问题

### 响应缓慢

**排查**:
1. Railway → Metrics → 查看 CPU/内存使用
2. 免费层有资源限制

**解决**:
- 升级 Railway 计划
- 减少 Bot 处理的消息量

### 频繁重启

**排查**: Railway → Deployments → 查看重启原因

**常见原因**:
- 内存溢出（OOM）
- 未捕获的异常
- 健康检查失败

---

## 常用调试命令

```bash
# 查看 Railway 日志
railway logs

# 进入容器调试
railway shell

# 检查环境变量
railway variables

# 重启服务
railway up --detach
```

---

## 获取帮助

- GitHub Issues: 提交 bug 报告
- OpenClaw 官方文档: [openclaw.ai](https://openclaw.ai)
- Railway 文档: [docs.railway.app](https://docs.railway.app)
