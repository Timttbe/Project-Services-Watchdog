import {exec} from "child_process"
import cron from "node-cron"
import fs from "fs"

const serviceName = "vgc"
const delay_ms = 5000

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

cron.schedule("*/10 * * * * *", checkService)
cron.schedule("0 3 * * *", restartService)


