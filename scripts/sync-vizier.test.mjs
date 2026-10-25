import assert from "node:assert/strict";
import test from "node:test";

import {
  buildSidebar,
  cleanLabel,
  convertAlerts,
  parseSummary,
  rewriteLinks,
  routeFor,
  stripLeadingH1,
  titleFromBody,
} from "./sync-vizier.mjs";

const summary = `# Summary

[Introduction](./introduction.md)

# 1. Getting Started

- [1.1 Installation](./getting-started/installation.md)
- [1.2 Quick Start](./getting-started/quick-start.md)

# 2. Configuration

- [2.1 Overview](./configuration/index.md)
- [2.2 Memory](./configuration/memory.md)
`;

test("cleanLabel removes mdBook numbering", () => {
  assert.equal(cleanLabel("1.2 Quick Start"), "Quick Start");
  assert.equal(cleanLabel("# 2. Configuration"), "Configuration");
  assert.equal(cleanLabel("Introduction"), "Introduction");
});

test("parseSummary finds the intro and groups", () => {
  const parsed = parseSummary(summary);
  assert.deepEqual(parsed.intro, { label: "Introduction", source: "introduction.md" });
  assert.equal(parsed.groups.length, 2);
  assert.equal(parsed.groups[0].label, "Getting Started");
  assert.deepEqual(parsed.groups[0].items[0], {
    label: "Installation",
    source: "getting-started/installation.md",
  });
});

test("routeFor maps introduction and index pages to directory routes", () => {
  assert.equal(routeFor("introduction.md"), "/docs/");
  assert.equal(routeFor("configuration/index.md"), "/docs/configuration/");
  assert.equal(routeFor("configuration/memory.md"), "/docs/configuration/memory/");
});

test("rewriteLinks rewrites existing relative markdown links only", () => {
  const exists = new Set([
    "introduction.md",
    "configuration/memory.md",
    "configuration/index.md",
    "api-integration/rest-api.md",
  ]);
  const body = [
    "See [Memory](./memory.md#layout) and [the API](../api-integration/rest-api.md).",
    "An example: [Gryffindor](gryffindor.md) stays as written.",
    "```",
    "[not a link](./memory.md)",
    "```",
    "Inline `[not a link](./memory.md)` stays.",
  ].join("\n");

  const rewritten = rewriteLinks(body, "configuration/agents.md", exists);
  assert.match(rewritten, /\[Memory\]\(\/docs\/configuration\/memory\/#layout\)/);
  assert.match(rewritten, /\[the API\]\(\/docs\/api-integration\/rest-api\/\)/);
  assert.match(rewritten, /\[Gryffindor\]\(gryffindor\.md\)/);
  assert.match(rewritten, /```\n\[not a link\]\(\.\/memory\.md\)\n```/);
  assert.match(rewritten, /`\[not a link\]\(\.\/memory\.md\)`/);
});

test("stripLeadingH1 removes only the first heading", () => {
  const body = "# 2.11 Memory\n\nBody\n\n## Layout\n";
  assert.equal(stripLeadingH1(body), "Body\n\n## Layout\n");
  assert.equal(stripLeadingH1("No heading\n"), "No heading\n");
});

test("titleFromBody uses a cleaned H1", () => {
  assert.equal(titleFromBody("# 2.7 Agent Configuration\n\nBody", "fallback"), "Agent Configuration");
  assert.equal(titleFromBody("Body", "fallback"), "fallback");
});

test("convertAlerts labels GitHub alert markers", () => {
  const body = "> [!WARNING]\n> **Disclaimer:** moving fast.\n";
  assert.equal(convertAlerts(body), "> **Warning.**\n> **Disclaimer:** moving fast.\n");
  assert.equal(convertAlerts("> [!NOTE]\n> hello"), "> **Note.**\n> hello");
});

test("buildSidebar places Home, Blog and the intro before the groups", () => {
  const sidebar = buildSidebar(parseSummary(summary));
  assert.deepEqual(sidebar.slice(0, 3), [
    { label: "Home", link: "/" },
    { label: "Blog", link: "/blog/" },
    { label: "Introduction", link: "/docs/" },
  ]);
  assert.equal(sidebar[3].label, "Getting Started");
  assert.equal(sidebar[3].items.length, 2);
});
