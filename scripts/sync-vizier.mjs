#!/usr/bin/env node
/**
 * Sync `docs/src` from a vizier checkout into the Starlight docs collection.
 *
 * Docs are authored in the vizier repository, next to the code they describe.
 * The landing site is the published form of them: this script copies every
 * page, adds Starlight frontmatter, rewrites relative `.md` links to site
 * routes, and generates the sidebar from mdBook's SUMMARY.md.
 *
 * It deliberately leaves links that point at files outside the docs tree (the
 * memory format examples contain illustrative links such as `gryffindor.md`)
 * and links inside fenced or inline code untouched.
 */

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const docsDest = path.join(root, "src", "content", "docs", "docs");
const sidebarDest = path.join(root, "src", "generated", "docs-sidebar.mjs");

const EDIT_BASE = "https://github.com/vizier-lab/vizier/edit/master/docs/src/";

export function candidates(base = root) {
  return [
    process.env.VIZIER_SOURCE && path.resolve(process.env.VIZIER_SOURCE),
    path.resolve(base, ".."),
    path.resolve(base, "..", "vizier"),
  ].filter(Boolean);
}

export function findVizierSource(base = root) {
  for (const candidate of candidates(base)) {
    if (fs.existsSync(path.join(candidate, "docs", "src", "SUMMARY.md"))) {
      return candidate;
    }
  }
  return null;
}

/** Strip the mdBook numbering from a sidebar label. */
export function cleanLabel(label) {
  return label
    .replace(/^\s*#\s*/, "")
    .replace(/^\d+(?:\.\d+)*\.?\s+/, "")
    .trim();
}

/**
 * Parse mdBook's SUMMARY.md.
 *
 * Returns `{ intro, groups }`, where each group is `{ label, items }` and each
 * item is `{ label, source }`.
 */
export function parseSummary(text) {
  let intro = null;
  let group = null;
  const groups = [];

  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line || line === "# Summary") continue;

    const heading = /^#+\s+(.+)$/.exec(line);
    if (heading) {
      const label = cleanLabel(heading[1]);
      if (!label || label.toLowerCase() === "summary") continue;
      group = { label, items: [] };
      groups.push(group);
      continue;
    }

    const item = /^[-*]\s+\[([^\]]+)\]\(([^)]+)\)/.exec(line);
    if (item) {
      const label = cleanLabel(item[1]);
      const source = item[2].replace(/^\.\//, "");
      if (!group) {
        if (!intro) intro = { label, source };
        continue;
      }
      group.items.push({ label, source });
      continue;
    }

    const topLink = /^\[([^\]]+)\]\(([^)]+)\)/.exec(line);
    if (topLink) {
      const label = cleanLabel(topLink[1]);
      const source = topLink[2].replace(/^\.\//, "");
      if (!intro) intro = { label, source };
    }
  }

  return {
    intro,
    groups: groups.filter((entry) => entry.items.length > 0),
  };
}

/** The public route for a docs source path (relative to docs/src). */
export function routeFor(source) {
  const normalized = source.replace(/\\/g, "/").replace(/^\.?\//, "");
  if (normalized === "introduction.md") return "/docs/";
  const withoutExtension = normalized.replace(/\.md$/i, "");
  if (/(?:^|\/)index$/i.test(withoutExtension)) {
    const directory = withoutExtension.replace(/(?:^|\/)index$/i, "");
    return directory ? `/docs/${directory}/` : "/docs/";
  }
  return `/docs/${withoutExtension}/`;
}

/** Where a docs source page lands inside the Starlight collection. */
export function destinationFor(source) {
  if (source === "introduction.md") return "index.md";
  return source;
}

function splitInlineCode(line) {
  return line.split(/(`[^`]*`)/g);
}

/**
 * Rewrite relative `.md` links to site routes when the target exists.
 * `exists` is a Set of source paths relative to docs/src.
 */
export function rewriteLinks(body, source, exists) {
  let inFence = false;
  let fenceMarker = null;

  return body
    .split(/\r?\n/)
    .map((line) => {
      const fence = /^\s*(```+|~~~+)/.exec(line);
      if (fence) {
        const marker = fence[1][0];
        if (!inFence) {
          inFence = true;
          fenceMarker = marker;
        } else if (marker === fenceMarker) {
          inFence = false;
          fenceMarker = null;
        }
        return line;
      }
      if (inFence) return line;

      return splitInlineCode(line)
        .map((part, index) => {
          if (index % 2 === 1) return part; // inline code
          return part.replace(
            /(!?)\[([^\]]*)\]\(([^)\s]+)(\s+"[^"]*")?\)/g,
            (match, bang, label, target, title = "") => {
              if (/^(?:https?:|mailto:|tel:|#|\/)/i.test(target)) return match;

              const [rawPath, ...hashParts] = target.split("#");
              const hash = hashParts.length ? `#${hashParts.join("#")}` : "";
              if (!/\.md$/i.test(rawPath)) return match;

              const resolved = path.posix.normalize(
                path.posix.join(path.posix.dirname(source.replace(/\\/g, "/")), rawPath),
              );
              if (!exists.has(resolved)) return match;

              return `${bang}[${label}](${routeFor(resolved)}${hash}${title})`;
            },
          );
        })
        .join("");
    })
    .join("\n");
}

export function titleFromBody(body, fallback) {
  const heading = /^#\s+(.+)$/m.exec(body);
  return heading ? cleanLabel(heading[1]) : fallback;
}

/**
 * mdBook carries GitHub alert markers through as plain text. Starlight does
 * not render them as asides for Markdown pages, so turn them into a labelled
 * blockquote that reads correctly in the docs.
 */
export function convertAlerts(body) {
  const labels = {
    WARNING: "Warning.",
    CAUTION: "Caution.",
    NOTE: "Note.",
    TIP: "Tip.",
    IMPORTANT: "Important.",
  };
  return body.replace(/^>\s*\[!(WARNING|CAUTION|NOTE|TIP|IMPORTANT)\]\s*$/gm, (_, kind) => {
    return `> **${labels[kind]}**`;
  });
}

/**
 * Starlight renders the page title itself, so the source H1 is removed from
 * the body. The H1 is still used for the title above.
 */
export function stripLeadingH1(body) {
  const lines = body.split(/\r?\n/);
  const firstContent = lines.findIndex((line) => line.trim() !== "");
  if (firstContent !== -1 && /^#\s+/.test(lines[firstContent])) {
    lines.splice(firstContent, 1);
    while (lines.length > 0 && lines[0].trim() === "") lines.shift();
    return lines.join("\n");
  }
  return body;
}

function yamlString(value) {
  return JSON.stringify(value);
}

function frontmatter({ title, source }) {
  return [
    "---",
    `title: ${yamlString(title)}`,
    `editUrl: ${yamlString(`${EDIT_BASE}${source}`)}`,
    "---",
    "",
  ].join("\n");
}

function walk(dir, prefix = "") {
  const files = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...walk(path.join(dir, entry.name), rel));
    else if (entry.isFile() && entry.name.endsWith(".md")) files.push(rel);
  }
  return files;
}

export function buildSidebar(summary) {
  const items = [
    { label: "Home", link: "/" },
    { label: "Blog", link: "/blog/" },
  ];

  if (summary.intro) {
    items.push({ label: summary.intro.label, link: routeFor(summary.intro.source) });
  }

  for (const group of summary.groups) {
    items.push({
      label: group.label,
      items: group.items.map((item) => ({
        label: item.label,
        link: routeFor(item.source),
      })),
    });
  }

  return items;
}

export function sync({ source = findVizierSource() } = {}) {
  if (!source) {
    throw new Error(
      "No vizier checkout found. Set VIZIER_SOURCE or run the landing site from inside vizier.",
    );
  }

  const docsSource = path.join(source, "docs", "src");
  const summaryPath = path.join(docsSource, "SUMMARY.md");
  const summaryText = fs.readFileSync(summaryPath, "utf8");
  const summary = parseSummary(summaryText);
  const files = walk(docsSource).filter((file) => file !== "SUMMARY.md");
  const exists = new Set(files);

  for (const group of summary.groups) {
    for (const item of group.items) {
      if (!exists.has(item.source)) {
        throw new Error(`SUMMARY.md points at a missing page: ${item.source}`);
      }
    }
  }
  if (summary.intro && !exists.has(summary.intro.source)) {
    throw new Error(`SUMMARY.md points at a missing introduction: ${summary.intro.source}`);
  }

  fs.rmSync(docsDest, { recursive: true, force: true });
  fs.mkdirSync(docsDest, { recursive: true });

  let written = 0;
  for (const sourcePath of files) {
    const body = fs.readFileSync(path.join(docsSource, sourcePath), "utf8");
    const destination = path.join(docsDest, destinationFor(sourcePath));
    fs.mkdirSync(path.dirname(destination), { recursive: true });

    const title = titleFromBody(
      body,
      summary.intro?.source === sourcePath ? summary.intro.label : path.basename(sourcePath, ".md"),
    );
    const rewritten = rewriteLinks(convertAlerts(body), sourcePath, exists);
    const withoutTitle = stripLeadingH1(rewritten);
    fs.writeFileSync(destination, `${frontmatter({ title, source: sourcePath })}${withoutTitle}\n`);
    written += 1;
  }

  const sidebar = buildSidebar(summary);
  fs.mkdirSync(path.dirname(sidebarDest), { recursive: true });
  fs.writeFileSync(
    sidebarDest,
    [
      "/** Generated by scripts/sync-vizier.mjs from vizier/docs/src/SUMMARY.md. */",
      `export const sidebar = ${JSON.stringify(sidebar, null, 2)};`,
      "",
    ].join("\n"),
  );

  console.log(`Synced ${written} docs pages from ${docsSource}`);
  console.log(`Wrote ${sidebarDest}`);
  return { source, written, sidebar };
}

function isMain() {
  const entry = process.argv[1];
  return entry && pathToFileURL(path.resolve(entry)).href === import.meta.url;
}

if (isMain()) {
  try {
    sync();
  } catch (error) {
    console.error(`docs sync failed: ${error.message}`);
    process.exit(1);
  }
}
