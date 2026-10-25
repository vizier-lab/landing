#!/usr/bin/env node
/**
 * The landing site reuses the design system straight out of the vizier
 * checkout, so there is exactly one `design/` pin in the project. The landing
 * repo is developed inside `vizier/landing` (or beside a `vizier` checkout),
 * and the deploy workflow checks vizier out at `.vizier-source`.
 *
 * This script creates `./design` as a relative symlink to
 * `<vizier>/design`, which is what `package.json` consumes as
 * `"@vizier/design": "file:./design"`.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const linkPath = path.join(root, "design");

function candidates() {
  const found = [];
  if (process.env.VIZIER_SOURCE) found.push(path.resolve(process.env.VIZIER_SOURCE));
  // landing/ inside the vizier checkout
  found.push(path.resolve(root, ".."));
  // landing/ and vizier/ as siblings
  found.push(path.resolve(root, "..", "vizier"));
  return found;
}

function findVizier() {
  for (const candidate of candidates()) {
    if (fs.existsSync(path.join(candidate, "docs", "src", "SUMMARY.md"))) {
      return candidate;
    }
  }
  return null;
}

const vizier = findVizier();
if (!vizier) {
  console.error(
    [
      "Could not find a vizier checkout.",
      "",
      "The landing site builds from the vizier repository (for docs and the design",
      "system). Run it from inside a vizier checkout, or point at one explicitly:",
      "",
      "    VIZIER_SOURCE=/path/to/vizier node scripts/link-design.mjs",
      "",
      "then install again.",
    ].join("\n"),
  );
  process.exit(1);
}

const designDir = path.join(vizier, "design");
if (!fs.existsSync(path.join(designDir, "package.json"))) {
  console.error(
    `Found vizier at ${vizier}, but ${designDir} is missing.\n` +
      "Run `git -C " +
      vizier +
      " submodule update --init design` (or `just install`).",
  );
  process.exit(1);
}

// A real design package (for example a design git submodule) is left alone.
// An empty `design/` can be left behind by npm while resolving the file
// dependency; remove that so the symlink can be created.
if (fs.existsSync(linkPath) && !fs.lstatSync(linkPath).isSymbolicLink()) {
  if (fs.existsSync(path.join(linkPath, "package.json"))) {
    console.log("design/ is a real package; leaving it as it is.");
    process.exit(0);
  }
  fs.rmSync(linkPath, { recursive: true, force: true });
}

const target = path.relative(root, designDir);
try {
  if (fs.existsSync(linkPath)) fs.unlinkSync(linkPath);
  fs.symlinkSync(target, linkPath, "dir");
  console.log(`design/ -> ${target}`);
} catch (error) {
  console.error(`Could not link ${linkPath} to ${designDir}: ${error.message}`);
  process.exit(1);
}
