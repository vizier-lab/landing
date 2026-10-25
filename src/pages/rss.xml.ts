import rss from "@astrojs/rss";
import type { APIContext } from "astro";
import { getCollection } from "astro:content";

export async function GET(context: APIContext) {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const posts = (await getCollection("blog", ({ data }) => !data.draft)).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf(),
  );

  return rss({
    title: "Vizier Blog",
    description:
      "Product writing, release notes and technical essays from the Vizier project.",
    site: context.site ?? "https://www.vizier.rs",
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `${base}/blog/${post.id.replace(/\.md$/, "")}/`,
      categories: post.data.tags,
    })),
    customData: "<language>en</language>",
  });
}
