# OpenClaw Railway Template - 设计系统总览

> **版本**: v1.0
> **更新时间**: 2026-02-27
> **适用于**: OpenClaw Railway 一键部署模板

---

## 📖 设计系统定义

### 什么是设计系统

设计系统由**设计原则**、**设计语言**和**组件库**构成，在设计原则的指导下使用设计语言和组件库创建体验一致的用户界面。

```
设计系统
├── 设计原则 - 指导方向
├── 设计语言 - 视觉元素
│   ├── 色彩系统（开发者友好）
│   ├── 文字系统
│   ├── 间距系统
│   └── 状态系统
└── 组件库 - 可复用元素
    ├── 表单组件
    ├── 状态指示器
    └── 配置向导
```

---

## 🎯 设计原则

### 1. 开发者优先 (Developer First)

界面面向开发者，应使用熟悉的开发工具设计语言。

**应用示例：**
- 终端风格的配色
- 代码字体
- 清晰的技术文档展示
- API 友好的界面

### 2. 简洁高效 (Simple & Efficient)

部署向导应快速完成，减少用户操作步骤。

**应用示例：**
- 表单自动聚焦
- 智能默认值
- 一键操作
- 实时验证

### 3. 状态清晰 (Clear Status)

系统状态必须一目了然。

**应用示例：**
- 颜色编码状态（绿色/黄色/红色）
- 进度条显示
- 日志实时输出
- 错误信息明确

### 4. 安全可靠 (Secure & Reliable)

保护用户配置和凭证。

**应用示例：**
- 密码保护设置向导
- 敏感信息隐藏
- 备份/导出功能
- 明确的安全提示

---

## 🧬 设计元素

### 1. 色彩系统

详见：[COLOR-GUIDELINES.md](COLOR-GUIDELINES.md)

**开发者友好配色：**

- **主色调**: `#059669` (绿色) - 成功/正常运行
- **警告色**: `#D97706` (琥珀色) - 警告/注意
- **错误色**: `#DC2626` (红色) - 错误/失败
- **信息色**: `#2563EB` (蓝色) - 信息/提示
- **背景色**: `#111827` (深灰) - 终端风格
- **文字色**: `#F9FAFB` (浅灰) - 高可读性
- **代码色**: `#10B981` (终端绿) - 代码/命令

### 2. 文字系统

详见：[TYPOGRAPHY.md](TYPOGRAPHY.md)

**开发者优化：**

- **等宽字体**: 'Fira Code', 'Monaco', 'Consolas' (代码)
- **无衬线字体**: system-ui (界面文字)
- **字号**:
  - 标题: 18px - 20px
  - 正文: 14px - 16px
  - 代码: 13px - 14px
- **行高**: 1.5 - 1.6
- **字重**: 400 (Regular), 500 (Medium), 600 (Semibold)

### 3. 间距系统

基于 **8点网格**：

| 名称 | 数值 | 用途 |
|------|------|------|
| **xs** | 4px | 小间距 |
| **sm** | 8px | 表单元素间距 |
| **md** | 16px | 卡片内边距 |
| **lg** | 24px | 区块间距 |
| **xl** | 32px | 页面边距 |

### 4. 圆角系统

| 元素 | 圆角 | CSS |
|------|------|-----|
| **按钮** | 6px | `border-radius: 6px` |
| **输入框** | 6px | `border-radius: 6px` |
| **卡片** | 8px | `border-radius: 8px` |
| **代码块** | 4px | `border-radius: 4px` |

---

## 🧩 组件库

详见：[COMPONENT-LIBRARY.md](COMPONENT-LIBRARY.md)

### 核心组件

#### 1. 状态指示器 (Status Indicator)

```html
<div class="status-indicator status-running">
  <span class="status-dot"></span>
  <span class="status-text">Running</span>
</div>

<div class="status-indicator status-stopped">
  <span class="status-dot"></span>
  <span class="status-text">Stopped</span>
</div>

<div class="status-indicator status-error">
  <span class="status-dot"></span>
  <span class="status-text">Error</span>
</div>
```

#### 2. 进度条 (Progress Bar)

```html
<div class="progress-bar">
  <div class="progress-fill" style="width: 60%"></div>
  <span class="progress-text">60%</span>
</div>
```

#### 3. 日志终端 (Log Terminal)

```html
<div class="log-terminal">
  <div class="log-entry log-info">
    <span class="log-time">[10:30:45]</span>
    <span class="log-message">Starting setup wizard...</span>
  </div>
  <div class="log-entry log-success">
    <span class="log-time">[10:30:46]</span>
    <span class="log-message">Configuration saved successfully</span>
  </div>
  <div class="log-entry log-error">
    <span class="log-time">[10:30:47]</span>
    <span class="log-message">Error: Invalid API key</span>
  </div>
</div>
```

#### 4. 配置表单 (Config Form)

```html
<form class="config-form">
  <div class="form-group">
    <label>Setup Password</label>
    <input type="password" placeholder="Enter password..." />
    <span class="form-hint">Required for accessing /setup</span>
  </div>

  <div class="form-group">
    <label>OpenClaw State Directory</label>
    <input type="text" value="/data/.openclaw" />
    <span class="form-hint">Path on the Railway volume</span>
  </div>

  <div class="form-actions">
    <button class="btn-primary">Save Configuration</button>
    <button class="btn-secondary">Cancel</button>
  </div>
</form>
```

#### 5. 代码块 (Code Block)

```html
<div class="code-block">
  <div class="code-header">
    <span class="code-language">bash</span>
    <button class="code-copy">Copy</button>
  </div>
  <pre><code>openclaw onboard --non-interactive --token YOUR_TOKEN</code></pre>
</div>
```

---

## 📋 状态系统

### 服务状态

| 状态 | 颜色 | 指示器样式 | 用途 |
|------|------|------------|------|
| **Running** | 绿色 | 绿色圆点 | 服务正常运行 |
| **Stopped** | 灰色 | 灰色圆点 | 服务已停止 |
| **Starting** | 蓝色 | 蓝色脉冲圆点 | 服务启动中 |
| **Error** | 红色 | 红色圆点 | 服务异常 |

### 日志级别

| 级别 | 颜色 | 图标 | 用途 |
|------|------|------|------|
| **INFO** | 蓝色 | ℹ️ | 一般信息 |
| **SUCCESS** | 绿色 | ✓ | 成功操作 |
| **WARNING** | 黄色 | ⚠️ | 警告信息 |
| **ERROR** | 红色 | ✗ | 错误信息 |

---

## 📐 布局规范

详见：[LAYOUT.md](LAYOUT.md)

### Setup Wizard 布局

```
┌─────────────────────────────────────┐
│  OpenClaw Setup Wizard               │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                       │
│  Step 1 of 3: Configuration           │
│  ●━━━━○━━━━○━━━━                     │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ Setup Password                  │ │
│  │ [________________________]      │ │
│  │ Required for /setup access      │ │
│  └─────────────────────────────────┘ │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │ State Directory                  │ │
│  │ [/data/.openclaw           ]     │ │
│  │ Persistent storage location     │ │
│  └─────────────────────────────────┘ │
│                                       │
│  [← Previous]  [Next →]              │
│                                       │
└─────────────────────────────────────┘
```

### Dashboard 布局

```
┌─────────────────────────────────────┐
│  OpenClaw Gateway                    │
│  Status: ● Running  Uptime: 2h 15m   │
├─────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐            │
│  │Stats    │  │Logs     │            │
│  │         │  │         │            │
│  │Requests:│  │[10:30]  │            │
│  │  1,234  │  │Started...│          │
│  │         │  │[10:31]  │            │
│  │Errors:  │  │Ready    │          │
│  │  0      │  │         │            │
│  └─────────┘  └─────────┘            │
│                                       │
│  ┌─────────────────────────────────┐ │
│  │Recent Requests                   │ │
│  │ ...                              │ │
│  └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

## 🔐 安全设计

### 密码保护

```css
.setup-wizard {
  /* 密码保护整个向导界面 */
}

.password-form {
  /* 密码输入表单 */
}

.password-input {
  /* 密码输入框 */
  -webkit-text-security: disc;
}
```

### 敏感信息隐藏

```html
<!-- API Key 部分隐藏 -->
<div class="sensitive-info">
  <code>sk-****************************</code>
  <button>👁 Show</button>
</div>
```

### 备份/导出

```html
<div class="backup-section">
  <h3>💾 Backup & Export</h3>
  <button class="btn-primary">Export Backup</button>
  <button class="btn-secondary">Import Backup</button>
</div>
```

---

## 🎨 视觉规范

### 终端风格

```css
.terminal {
  background: #111827;
  color: #F9FAFB;
  font-family: 'Fira Code', monospace;
  border-radius: 8px;
  padding: 16px;
  box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.5);
}

.log-entry {
  font-size: 13px;
  line-height: 1.6;
  margin-bottom: 4px;
}

.log-time {
  color: #6B7280;
  margin-right: 8px;
}

.log-message {
  color: #F9FAFB;
}
```

### 状态指示器

```css
.status-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-running .status-dot {
  background: #10B981;
  box-shadow: 0 0 8px #10B981;
}

.status-error .status-dot {
  background: #EF4444;
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}
```

---

## 📝 文案规范

### 原则

1. **技术准确** - 使用正确的技术术语
2. **简洁明了** - 开发者偏好简短说明
3. **行动导向** - 使用动词引导操作

### 示例

| 场景 | 文案 |
|------|------|
| 保存按钮 | "Save Configuration" |
| 下一步 | "Next →" |
| 上一步 | "← Previous" |
| 完成 | "Complete Setup" |
| 成功提示 | "✓ Configuration saved successfully" |
| 错误提示 | "✗ Failed to save: Invalid API key" |

---

## 🎯 设计规范使用流程

### 开发者

1. **终端风格** - 保持开发者熟悉的界面风格
2. **状态清晰** - 颜色编码系统状态
3. **快速操作** - 减少表单填写步骤
4. **实时反馈** - 日志和状态实时更新

### 设计师

1. **开发者友好** - 使用熟悉的视觉语言
2. **信息密集** - 充分利用空间展示信息
3. **层次清晰** - 通过颜色和间距区分内容
4. **功能优先** - 界面服务于功能

---

## 📚 相关文档

- [色彩规范](COLOR-GUIDELINES.md)
- [排版规范](TYPOGRAPHY.md)
- [布局规范](LAYOUT.md)
- [组件库文档](COMPONENT-LIBRARY.md)
- [响应式规范](RESPONSIVE.md)

---

## 🔧 技术栈

- **框架**: 原生 HTML/CSS/JavaScript
- **部署**: Railway
- **反向代理**: 内置 wrapper 服务器
- **存储**: Railway Volume

---

## 🔄 版本历史

| 版本 | 日期 | 更新内容 |
|------|------|---------|
| v1.0 | 2026-02-27 | 初始版本，建立设计系统框架 |
| | | 开发者友好的终端风格 |
| | | 状态和日志系统 |
| | | Setup Wizard 规范 |

---

**维护者**: OpenClaw Railway Template 团队
**反馈**: 如有问题或建议，请提交 Issue 或 PR
