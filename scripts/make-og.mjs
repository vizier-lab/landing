#!/usr/bin/env node
/**
 * Generate public/og.png from the same type and tokens as the site.
 *
 * Playwright is a dev dependency and the browser itself is installed with
 * `npx playwright install chromium`. This is a one-off asset script; the site
 * build never depends on a browser.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

function font(name, file) {
  const data = fs
    .readFileSync(path.join(root, "node_modules", "@fontsource-variable", name, "files", file))
    .toString("base64");
  return `@font-face { font-family: "${name.split("-").map((p) => p[0].toUpperCase() + p.slice(1)).join(" ")}"; src: url(data:font/woff2;base64,${data}) format("woff2"); font-weight: 100 900; font-style: normal; }`;
}

const schibsted = font("schibsted-grotesk", "schibsted-grotesk-latin-wght-normal.woff2");
const jetbrains = font("jetbrains-mono", "jetbrains-mono-latin-wght-normal.woff2");
const mark = fs.readFileSync(path.join(root, "src", "assets", "mark.svg"), "utf8");

const html = `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<style>
${schibsted}
${jetbrains}
* { box-sizing: border-box; }
html, body { margin: 0; width: 1200px; height: 630px; }
body {
  background: #0b0b0c;
  color: #ededef;
  font-family: "Schibsted Grotesk", ui-sans-serif, sans-serif;
  overflow: hidden;
}
.page {
  position: relative;
  width: 1200px;
  height: 630px;
  padding: 64px 72px 52px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-image: radial-gradient(#26262b 1px, transparent 1px);
  background-size: 24px 24px;
}
.top { display: flex; align-items: center; justify-content: space-between; }
.brand { display: flex; align-items: center; gap: 16px; font-size: 34px; font-weight: 700; }
.brand img { width: 58px; height: 58px; border-radius: 13px; }
.brand .word { display: inline-flex; line-height: 1.23; }
.brand .i { position: relative; display: inline-block; }
.brand .i-dot { position: absolute; top: 0.254em; left: 50%; width: 0.155em; height: 0.155em; transform: translateX(-50%); border-radius: 9999px; background: #ededef; }
.mono { font-family: "JetBrains Mono", monospace; font-size: 15px; letter-spacing: 0.08em; text-transform: uppercase; color: #8b8b96; }
h1 { margin: 0; font-size: 94px; line-height: 0.94; letter-spacing: -0.055em; font-weight: 600; max-width: 900px; }
h1 em { font-style: normal; color: #10b981; }
.sub { margin: 22px 0 0; max-width: 760px; font-size: 25px; line-height: 1.45; color: #a0a0aa; }
.bottom { display: flex; align-items: flex-end; justify-content: space-between; border-top: 1px solid #242428; padding-top: 18px; }
.foot { font-family: "JetBrains Mono", monospace; font-size: 14px; letter-spacing: 0.05em; color: #8b8b96; text-transform: uppercase; }
.pills { display: flex; gap: 8px; }
.pill { border: 1px solid #303036; border-radius: 999px; padding: 6px 12px; font-family: "JetBrains Mono", monospace; font-size: 12px; color: #a0a0aa; text-transform: uppercase; letter-spacing: 0.05em; }
</style>
</head>
<body>
  <div class="page">
    <div class="top">
      <div class="brand"><img src="data:image/svg+xml;base64,${Buffer.from(mark).toString("base64")}" alt="" /><span class="word">v<span class="i">ı<span class="i-dot"></span></span>z<span class="i">ı<span class="i-dot"></span></span>er</span></div>
      <div class="mono">self-hosted · MIT</div>
    </div>
    <div>
      <h1>A digital steward<br />for <em>Your Majesty.</em></h1>
      <p class="sub">AI agents that remember who they are, and who you are. Hosted by you.</p>
    </div>
    <div class="bottom">
      <div class="foot">www.vizier.rs</div>
      <div class="pills">
        <span class="pill">single binary</span>
        <span class="pill">many agents</span>
        <span class="pill">every channel</span>
      </div>
    </div>
  </div>
</body>
</html>`;

const { chromium } = await import("playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
await page.setContent(html, { waitUntil: "load" });
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(root, "public", "og.png") });
await browser.close();
console.log("Wrote public/og.png");
