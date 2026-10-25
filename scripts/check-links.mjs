#!/usr/bin/env node
/**
 * Check the built site's internal links. External links are deliberately not
 * fetched: the docs sync is the thing this is meant to catch.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dist = path.join(root, "dist");
const base = (process.env.BASE_PATH ?? "/").replace(/^\/|\/$/g, "");

if (!fs.existsSync(dist)) {
  console.error("dist/ does not exist; run `npm run build` first.");
  process.exit(1);
}

function walk(dir) {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...walk(full));
    else files.push(full);
  }
  return files;
}

function stripBase(filePath) {
  let pathname = filePath;
  if (base) {
    if (pathname === `/${base}` || pathname === `/${base}/`) return "/";
    if (pathname.startsWith(`/${base}/`)) pathname = pathname.slice(base.length + 1);
  }
  return pathname;
}

function exists(pathname) {
  const clean = stripBase(pathname);
  const decoded = decodeURIComponent(clean);
  const target = path.join(dist, decoded);

  if (decoded.endsWith("/")) {
    return fs.existsSync(path.join(target, "index.html"));
  }

  if (fs.existsSync(target) && fs.statSync(target).isFile()) return true;
  if (fs.existsSync(`${target}.html`)) return true;
  if (fs.existsSync(path.join(target, "index.html"))) return true;
  return false;
}

const files = walk(dist);
const htmlFiles = files.filter((file) => file.endsWith(".html"));
const broken = [];

for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const relative = path.relative(dist, file);

  for (const match of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const raw = match[1];
    if (!raw || raw.startsWith("#")) continue;
    if (/^(?:https?:|mailto:|tel:|javascript:|data:|\/\/)/i.test(raw)) continue;

    const withoutQuery = raw.split("#")[0].split("?")[0];
    if (!withoutQuery) continue;
    if (!withoutQuery.startsWith("/")) continue;

    if (base && withoutQuery !== `/${base}` && !withoutQuery.startsWith(`/${base}/`)) {
      broken.push({ page: relative, href: raw, reason: "missing base path" });
      continue;
    }

    if (!exists(withoutQuery)) {
      broken.push({ page: relative, href: raw, reason: "target missing" });
    }
  }
}

if (broken.length > 0) {
  console.error(`Found ${broken.length} broken internal link(s):`);
  for (const { page, href, reason } of broken) {
    console.error(`  ${page} -> ${href} (${reason})`);
  }
  process.exit(1);
}

console.log(`Checked ${htmlFiles.length} HTML files; no broken internal links.`);
