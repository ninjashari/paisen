/**
 * Screenshot script — captures each public page in dark mode at 1280×800.
 * Requires puppeteer-core + Chrome installed locally.
 * Run: node scripts/take-screenshots.js
 */
const puppeteer = require("puppeteer-core")
const path = require("path")
const fs = require("fs")

const CHROME =
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe"
const BASE = "http://localhost:3000"
const OUT = path.resolve(__dirname, "../screens")

const PAGES = [
  { url: "/", file: "home.jpg", waitFor: "h1", delay: 1200 },
  { url: "/login", file: "login.jpg", waitFor: "form", delay: 800 },
  { url: "/register", file: "register.jpg", waitFor: "form", delay: 800 },
  { url: "/authorise", file: "authorise.jpg", waitFor: "form", delay: 800 },
]

async function shot(page, url, file, waitFor, delay) {
  await page.goto(BASE + url, { waitUntil: "networkidle2", timeout: 15000 })
  if (waitFor) await page.waitForSelector(waitFor, { timeout: 8000 }).catch(() => {})
  if (delay) await new Promise((r) => setTimeout(r, delay))
  const out = path.join(OUT, file)
  await page.screenshot({ path: out, type: "jpeg", quality: 90 })
  console.log("  saved:", out)
}

;(async () => {
  fs.mkdirSync(OUT, { recursive: true })

  const browser = await puppeteer.launch({
    executablePath: CHROME,
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  })

  const page = await browser.newPage()
  await page.setViewport({ width: 1280, height: 800 })

  // Force dark mode via prefers-color-scheme — app also respects system preference
  await page.emulateMediaFeatures([
    { name: "prefers-color-scheme", value: "dark" },
  ])

  for (const { url, file, waitFor, delay } of PAGES) {
    process.stdout.write(`  ${url} → ${file} ... `)
    try {
      await shot(page, url, file, waitFor, delay)
    } catch (err) {
      console.log("FAILED:", err.message)
    }
  }

  await browser.close()
  console.log("Done.")
})()
