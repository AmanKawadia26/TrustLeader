/**
 * Load a URL with Figma hash params (Playwright). Set CAPTURE_ID, PATHNAME (default /), BASE (default http://127.0.0.1:5173).
 */
import { chromium } from "playwright";

const captureId = process.env.CAPTURE_ID;
if (!captureId) {
  console.error("Set CAPTURE_ID");
  process.exit(1);
}

const base = (process.env.BASE || "http://127.0.0.1:5173").replace(/\/$/, "");
const pathname = process.env.PATHNAME || "/";
const pathNorm = pathname.startsWith("/") ? pathname : `/${pathname}`;

const endpoint = `https://mcp.figma.com/mcp/capture/${captureId}/submit`;
const hash = [
  `figmacapture=${captureId}`,
  `figmaendpoint=${encodeURIComponent(endpoint)}`,
  `figmadelay=${process.env.FIGMA_DELAY || "4000"}`,
].join("&");

const url = `${base}${pathNorm}#${hash}`;

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
page.on("pageerror", (e) => console.error("[pageerror]", e.message));
await page.goto(url, { waitUntil: "networkidle", timeout: 180000 });
await page.waitForTimeout(Number(process.env.WAIT_MS || "12000"));
await browser.close();
console.log("Captured:", url);
