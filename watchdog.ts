import {exec} from "child_process"
import cron from "node-cron"
import fs from "fs"

interface Config {
    service_name: string
    delay_ms: number
    check_interval_seconds: number
    restart_hour: number
}

function loadConfig(): Config {
    if (!fs.existsSync("config.json")){
        throw new Error("config.json  not found. Please create it before running the watchdog.")
    }

    const config: Config = JSON.parse(fs.readFileSync("config.json", "utf-8"))

    if (!config.service_name) throw new Error("Config: Missing 'service_name' field.")
    if (config.delay_ms < 0) throw new Error("Config: 'delay_ms' must be a positive number.")
    if (config.check_interval_seconds < 5) throw new Error("Config: 'check_interval_seconds' must be at least 5 seconds.")
    if (config.restart_hour < 0 || config.restart_hour > 23) throw new Error("Config: 'restart_hour' must be between 0 and 23.")

    return config
}

const config = loadConfig()
const serviceName = config.service_name
const delay_ms = config.delay_ms
const check_interval_seconds = config.check_interval_seconds
const restart_hour = config.restart_hour

function log (message: string) {
    const timestamp = new Date().toISOString()
    fs.appendFileSync("watchdog.log", `[${timestamp}] ${message}\n`)
}

function runCommand(command: string): Promise<string> {
    return new Promise((resolve, reject) => {
        exec(command, (err, stdout) => {
            if (err) reject(err)
            else resolve(stdout)
        })
    })
}

async function checkService() {
    try {
        const status = await runCommand(`sc query "${serviceName}"`)

        if (status.includes("STOPPED")) {
            log("Service stopped detected. Restarting...")
            await restartService()
        } else {
            log("Service running normally")
            await restartService()
        }

    } catch (err) {
        log("Error checking service")
    }
}

async function restartService() {
    log(`Restarting service "${serviceName}"...`) 
    console.log(`[${new Date().toISOString()}] Restarting service "${serviceName}"...`) 

    try {
        const status = await runCommand(`sc query "${serviceName}"`)

        if (status.includes("STOPPED")) {
            log("Service is currently stopped. Starting it...")
            console.log("Service is currently stopped. Starting it...")
            await runCommand(`net start "${serviceName}"`)

            log("Service was stopped. Started successfully.")
            console.log("Service was stopped. Started successfully.")
            return
        }
        else{
            log("Service is currently running. Stopping it...")
            console.log("Service is currently running. Stopping it...")

            await runCommand(`net stop "${serviceName}"`)
            log("Service stopped successfully. Waiting before starting...")
            console.log("Service stopped successfully. Waiting before starting...")

            await new Promise((res) => setTimeout(res, delay_ms))

            await runCommand(`net start "${serviceName}"`)
            log("Service started successfully.")
            console.log("Service started successfully.")
        }

    } catch (err) {
        log("Error restarting service:")
        console.error("Error restarting service:", err)
    }
}

log("Watchdog started. Monitoring service every minute...")
console.log("Watchdog started. Monitoring service every minute...")

cron.schedule(`*/${check_interval_seconds} * * * * *`, checkService)
cron.schedule(`0 ${restart_hour} * * *`, restartService)


