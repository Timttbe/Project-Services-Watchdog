# Project Services Watchdog

A lightweight Windows service monitor written in TypeScript. Automatically checks if a target service is running and restarts it if needed — and performs a scheduled daily restart to keep things healthy.

---

## Features

- 🔍 **Health check every 10 seconds** — detects a stopped service and restarts it automatically
- 🔄 **Scheduled daily restart at 3:00 AM** — forces a clean restart regardless of service state
- 📝 **Persistent logging** — all events are appended to `watchdog.log` with timestamps
- ⚙️ **Simple configuration** — change the service name and delay in a couple of lines

---

## Requirements

- Windows (uses `sc query` and `net start/stop`)
- Node.js 18+
- Administrator privileges (required to start/stop services)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/your-username/service-watchdog.git
cd service-watchdog

# Install dependencies
npm install
```

---

## Configuration

Edit the constants and cron expressions at the top of `src/index.ts`:

```typescript
const serviceName = "service name"   // Name of the Windows service to monitor
const delay_ms = 5000       // Wait time (ms) between stop and start on forced restart
```

And the cron schedules near the bottom of the file:

```typescript
cron.schedule("*/10 * * * * *", checkService)  // Health check interval (default: every 10 seconds)
cron.schedule("0 3 * * *", restartService)      // Scheduled restart time (default: 3:00 AM daily)
```

Some useful cron examples:

| Expression | Meaning |
|---|---|
| `*/10 * * * * *` | Every 10 seconds |
| `*/30 * * * * *` | Every 30 seconds |
| `* * * * *` | Every minute |
| `0 3 * * *` | Every day at 3:00 AM |
| `0 6 * * *` | Every day at 6:00 AM |
| `0 3 * * 1` | Every Monday at 3:00 AM |

> **Tip:** Use [crontab.guru](https://crontab.guru) to generate and validate custom cron expressions.

---

## Usage

```bash
# Run directly with ts-node
npx ts-node src/index.ts

# Or build and run
npx tsc
node dist/index.js
```

> **Important:** Run the terminal as **Administrator**, otherwise the service commands will fail silently.

---

## How It Works

| Schedule | Action |
|---|---|
| Every 10 seconds | Queries service status via `sc query`. If `STOPPED`, starts it immediately. |
| Every day at 03:00 | Stops the service (if running), waits `delay_ms`, then starts it again. |

All events are logged to `watchdog.log` in the project root:

```
[2026-03-25T03:00:00.000Z] Watchdog started. Monitoring service every minute...
[2026-03-25T03:00:10.000Z] Service running normally
[2026-03-25T03:01:00.000Z] Service stopped detected. Restarting...
[2026-03-25T03:01:05.000Z] Service started successfully.
```

---

## Dependencies

| Package | Purpose |
|---|---|
| `node-cron` | Cron-based scheduling |
| `typescript` | Type safety |

---

## Author

Developed by **Davi Han Ko**  
Microcontrollers Course Project
