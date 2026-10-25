import { visit } from "unist-util-visit";

/**
 * Prefix root-relative links in Markdown with Astro's configured base path.
 *
 * The site is deployed both at `/` (www.vizier.rs) and at `/landing/` while it
 * is being reviewed on the default GitHub Pages URL. Starlight prefixes its own
 * links and the site's Astro components use `url()`, but links written in
 * synced Markdown and blog posts stay root-relative (`/docs/...`), so this
 * plugin adds the base once at render time.
 */
export function rehypeBaseLinks({ base = "/" } = {}) {
  const prefix = base === "/" ? "" : `/${base.replace(/^\/|\/$/g, "")}`;

  return (tree) => {
    if (!prefix) return;

    visit(tree, "element", (node) => {
      if (node.tagName !== "a" && node.tagName !== "img") return;
      const attribute = node.tagName === "a" ? "href" : "src";
      const value = node.properties?.[attribute];
      if (typeof value !== "string") return;
      if (!value.startsWith("/") || value.startsWith("//")) return;
      if (value === prefix || value.startsWith(`${prefix}/`)) return;
      node.properties[attribute] = `${prefix}${value}`;
    });
  };
}
