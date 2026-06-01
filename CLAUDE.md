# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

---

## Project Identity

**Project Name:** OpenClaw Railway Template

This is an **independent project**.

Claude must **NEVER** reference files, code, or context from other projects.

Claude must **ONLY** operate within this directory (`/Users/yuzhoudeshengyin/Documents/my_project/clawdbot-railway-template/`).

---

## Architecture Rules

Claude MUST **NOT**:
- Modify folder structure without permission
- Rename files without permission
- Move files without permission
- Delete files without permission

Claude MUST:
- Preserve existing structure
- Follow established patterns
- Extend code without breaking structure

---

## Memory Scope

Claude memory is **LIMITED** to this project directory.

Do **NOT** assume context from:
- Other folders in `/Users/yuzhoudeshengyin/Documents/my_project/`
- Other repositories
- Other projects

---

## Coding Rules

Before coding, Claude must:
1. Read `README.md`
2. Read architecture
3. Follow existing patterns

---

## Workflow Rules

⚠️ **CRITICAL**: Every task MUST follow this workflow:

### Step 1: Understand (Required)
- Rephrase the requirement in your own words
- Identify constraints and boundaries
- Check related docs (memory/, docs/)
- **Output**: "我理解您的需求是..." (confirm understanding)

### Step 2: Design (Required)
- Analyze possible solutions
- Identify risks and dependencies
- Create execution plan
- **Output**: Show complete plan with rationale

### Step 3: Confirm (Required)
- Present the plan to user
- Explain why this approach
- List potential risks
- **WAIT**: Do NOT execute until user approves

### Step 4: Execute (After Approval)
- Follow the approved plan
- Verify each step
- Update relevant docs

### ⛔ Forbidden
- ❌ Execute without showing plan
- ❌ Assume understanding
- ❌ Skip risk assessment

### ✅ Required
- ✅ Rephrase requirements
- ✅ Show complete plan
- ✅ Wait for approval
- ✅ Consider long-term impact

**See**: `docs/WORKFLOW.md` for detailed guide

---

## Safety Rule

If unsure, Claude must **ASK** instead of modifying.

---

## Git Rule

Claude must **NEVER**:
- Expose secrets
- Commit `.env`
- Commit private keys

---

## Project Overview

OpenClaw Railway Template is a one-click deployment template that packages OpenClaw Gateway for Railway with a friendly web-based setup wizard. Users can deploy and configure OpenClaw without running any commands.

## Tech Stack

- **Runtime**: Node.js 20 (Alpine Linux)
- **Packaging**: Docker (multi-stage build)
- **Platform**: Railway (one-click deployment)
- **Process**: HTTP wrapper server + OpenClaw Gateway
- **Authentication**: Bearer token protected setup wizard

## Project Structure

```
clawdbot-railway-template/
├── src/
│   ├── server.js               # HTTP wrapper server ⭐
│   ├── claw-wrapper.js         # OpenClaw command wrapper
│   └── backup-manager.js       # Backup/restore functionality
├── public/
│   ├── index.html              # Setup wizard UI
│   ├── css/
│   │   └── style.css
│   └── js/
│       └── setup.js            # Setup wizard logic
├── scripts/
│   ├── setup.sh                # Setup scripts
│   ├── start-claw.sh           # OpenClaw startup
│   └── backup.sh               # Backup scripts
├── Dockerfile                  # Docker image definition ⭐
├── docker-compose.yml          # Local testing
├── railway.toml                # Railway deployment config ⭐
├── package.json                # Dependencies
├── LICENSE                     # MIT
└── assets/                     # Screenshots and images
```

## Core Architecture

### HTTP Wrapper Server

The wrapper server provides:

1. **Setup Wizard** (`/setup`) - Password-protected configuration interface
2. **Reverse Proxy** - Forwards requests to OpenClaw Gateway
3. **Backup API** - Export/import configuration
4. **Health Check** - Container health monitoring

```javascript
// Port configuration
const PORT = process.env.PORT || 8080;
const SETUP_PASSWORD = process.env.SETUP_PASSWORD;

// Routes:
// GET  /health          - Health check endpoint
// GET  /setup           - Setup wizard (password protected)
// POST /setup           - Process configuration
// GET  /*               - Reverse proxy to OpenClaw
```

### OpenClaw Integration

**Environment Variables:**
```bash
OPENCLAW_STATE_DIR=/data/.openclaw      # OpenClaw state directory
OPENCLAW_WORKSPACE_DIR=/data/workspace   # OpenClaw workspace
OPENCLAW_GATEWAY_TOKEN=auto-generated    # Gateway token
```

**Setup Process:**
1. User visits `/setup` with password
2. Enters Telegram Bot Token
3. Enters Discord Bot Token
4. Wrapper runs `openclaw onboard --non-interactive`
5. Configuration written to `/data/.openclaw/`
6. OpenClaw Gateway starts
7. User redirected to `/`

### Data Persistence

**Railway Volume:**
- Mount point: `/data`
- Contains:
  - `/data/.openclaw/` - OpenClaw state, config, credentials
  - `/data/workspace/` - OpenClaw workspace
- Survives container restarts and redeploys

## Development Workflow

### Local Testing with Docker:

```bash
# 1. Build image
docker build -t openclaw-railway-template .

# 2. Run container
docker run --rm -p 8080:8080 \
    -e PORT=8080 \
    -e SETUP_PASSWORD=test123 \
    -e OPENCLAW_STATE_DIR=/data/.openclaw \
    -e OPENCLAW_WORKSPACE_DIR=/data/workspace \
    -v $(pwd)/test-data:/data \
    openclaw-railway-template

# 3. Test endpoints
curl http://localhost:8080/health
curl -H "Authorization: Bearer test123" http://localhost:8080/setup
```

### Deployment to Railway:

```bash
# 1. Push to GitHub
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/clawdbot-railway-template.git
git push -u origin main

# 2. In Railway:
# - Create new template from GitHub repo
# - Add Volume mounted at /data
# - Set SETUP_PASSWORD environment variable
# - Deploy
```

## Key Configuration Files

### railway.toml

```toml
[build]
builder = "DOCKERFILE"
dockerfilePath = "Dockerfile"

# OpenClaw version pin
[build.env]
OPENCLAW_GIT_REF = "v1.0.0"

[[services]]
name = "openclaw"

# Environment variables
[services.env]
PORT = "8080"
NODE_ENV = "production"

# Volume for persistence
[[services.volumes]]
name = "data"
mount_to = "/data"

# Public networking
[[services.ports]]
port = 8080
type = "HTTP"
```

### Dockerfile Highlights

```dockerfile
# Multi-stage build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .

# Final stage
FROM node:20-alpine
WORKDIR /app
COPY --from=builder /app ./

# Non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001
USER nodejs

# Health check
HEALTHCHECK --interval=30s --timeout=3s \
    CMD node -e "require('http').get('http://localhost:8080/health', (r) => process.exit(r.statusCode === 200 ? 0 : 1))"

EXPOSE 8080
CMD ["node", "src/server.js"]
```

## Bot Token Acquisition

### Telegram Bot Token:

1. Open Telegram and message **@BotFather**
2. Send `/newbot`
3. Follow prompts to create bot
4. Copy the token (format: `123456789:ABC...`)

### Discord Bot Token:

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Create New Application
3. Go to Bot tab → Add Bot
4. Copy Bot Token
5. Generate OAuth2 URL for bot invite
6. Invite bot to your server

## Backup & Restore

### Export Backup:

```bash
# Via API
curl -H "Authorization: Bearer YOUR_PASSWORD" \
     http://your-app.up.railway.app/api/backup/export \
     -o backup.json

# Includes:
# - OpenClaw configuration
# - Bot tokens
# - Conversation memory
```

### Import Backup:

```bash
# Via API
curl -X POST \
     -H "Authorization: Bearer YOUR_PASSWORD" \
     -F "file=@backup.json" \
     http://your-app.up.railway.app/api/backup/import
```

## API Endpoints

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/health` | GET | None | Health check |
| `/setup` | GET | Password | Setup wizard UI |
| `/setup` | POST | Password | Process configuration |
| `/` | GET/WS | None | OpenClaw Gateway (proxied) |
| `/openclaw` | GET/WS | None | OpenClaw UI (proxied) |
| `/api/backup/export` | GET | Password | Export configuration |
| `/api/backup/import` | POST | Password | Import configuration |

## Important Notes

### Security Rules:
- ⚠️ **NEVER** hardcode credentials in code
- ⚠️ **ALWAYS** use environment variables for sensitive data
- ⚠️ **KEEP** SETUP_PASSWORD secret
- ⚠️ **USE** HTTPS in production (automatic on Railway)

### Development Rules:
- 🚫 **DO NOT** move/rename files without explicit instruction
- 🚫 **DO NOT** modify Railway Volume mount point (`/data`)
- 🚫 **DO NOT** change PORT from environment variable
- ✅ **DO** test locally before deploying
- ✅ **DO** use non-root user in Docker
- ✅ **DO** implement health checks

## Troubleshooting

### Container won't start?

1. Check logs: `railway logs`
2. Verify environment variables are set
3. Ensure Volume is properly mounted
4. Test locally with Docker first

### Setup wizard inaccessible?

1. Verify SETUP_PASSWORD environment variable
2. Check Authorization header format: `Bearer PASSWORD`
3. Ensure container is healthy: `/health` endpoint

### Data lost after restart?

1. Check if Volume is properly configured in railway.toml
2. Verify data is written to `/data` directory
3. Check Volume size limits (Railway free tier: 1GB)

### OpenClaw not starting?

1. Check logs for error messages
2. Verify bot tokens are valid
3. Ensure `/data/.openclaw` directory exists
4. Try manual `openclaw onboard` in container shell

## Official Recognition

- ✅ Recommended by [OpenClaw official docs](https://docs.openclaw.ai/railway)
- ✅ [Railway official tweet](https://x.com/railway/status/2015534958925013438)
- ✅ Endorsed by [Railway CEO](https://x.com/justjake/status/2015536083514405182)
- ✅ **1800+ deployments** on Railway

## Documentation Files

- `README.md` - Quick start and deployment guide
- `PROJECT_RULES.md` - Development rules and conventions
- `PROJECT_CONTEXT.md` - Project background and architecture
- `PROJECT_STRUCTURE.md` - Detailed project structure
- `CHANGELOG.md` - Version history and changes

## Getting Started

1. **Clone or use this template**
2. **Push to your GitHub**
3. **Create Railway Template** with Volume mounted at `/data`
4. **Set SETUP_PASSWORD** environment variable
5. **Deploy**
6. **Visit `/setup` to configure**
7. **Start using OpenClaw!**

---

**Last Updated**: 2026-02-25
**Maintainer**: Vignesh N (@vignesh07)
**Official Template**: https://railway.com/deploy/clawdbot-railway-template
