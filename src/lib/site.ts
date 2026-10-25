/** The site base path, without a trailing slash (`""` or `/landing`). */
export const basePath = import.meta.env.BASE_URL.replace(/\/$/, "");

/** Prefix a root-relative site path with the configured base path. */
export function url(path: string): string {
  if (/^(?:[a-z]+:)?\/\//i.test(path) || path.startsWith("#")) return path;
  const clean = path.startsWith("/") ? path : `/${path}`;
  return `${basePath}${clean}`;
}

/** The production version, set by the deploy workflow from the release tag. */
export const version = process.env.VIZIER_VERSION || "latest";

export const versionLabel = version === "latest" ? version : `v${version.replace(/^v/, "")}`;

export const repoUrl = "https://github.com/vizier-lab/vizier";
export const releasesUrl = `${repoUrl}/releases`;
export const issuesUrl = `${repoUrl}/issues`;
export const docsUrl = url("/docs/");
export const blogUrl = url("/blog/");
export const installCommand = "curl -fsSL https://get.vizier.rs | sh";
