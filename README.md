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
git clone https://github.com/Timttbe/Project-Services-Watchdog.git
cd service-watchdog

# Install dependencies
npm install
```

---

## Configuration

All settings are managed via a `config.json` file in the project root — no need to edit the source code.
 
Create a `config.json` based on the example below:
 
```json
{
    "service_name": "your_service_name", // Name of the Windows service to monitor
    "delay_ms": number, // Wait time (ms) between stop and start on forced restart, exemple 5000 (5 seconds)
    "check_interval_seconds": number, // Health check interval, exemple 10 (10 seconds)
    "restart_hour": number // Scheduled restart time, exemple 3 ( 3:00 AM daily)
}
```
 
| Field | Type | Description |
|---|---|---|
| `service_name` | string | Exact name of the Windows service to monitor |
| `delay_ms` | number | Wait time (ms) between stop and start on a forced restart |
| `check_interval_seconds` | number | How often to check service health (minimum: 5) |
| `restart_hour` | number | Hour of the daily scheduled restart, 0–23 (e.g. `3` = 3:00 AM) |
 
The app validates all fields on startup and throws a clear error if something is missing or invalid.
 
> **Tip:** Add `config.json` to your `.gitignore` and commit a `config.example.json` instead, so each environment keeps its own settings without leaking data to the repository.

---

## Usage

```bash
# Run directly with ts-node
npx ts-node watchdog.ts

# Or build and run
npx tsc
node watchdog.js
```

> **Important:** Run the terminal as **Administrator**, otherwise the service commands will fail silently.

---

## How It Works

| Schedule | Action |
|---|---|
| Every `check_interval_seconds` seconds | Queries service status via `sc query`. If `STOPPED`, starts it immediately. |
| Every day at `restart_hour`:00 | Stops the service (if running), waits `delay_ms`, then starts it again. |

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
