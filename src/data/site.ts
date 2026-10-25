import type { IconName } from "@vizier/design";

export type NavItem = { label: string; href: string; external?: boolean };

export const nav: NavItem[] = [
  { label: "Docs", href: "/docs/" },
  { label: "Blog", href: "/blog/" },
];

export type Pillar = {
  title: string;
  body: string;
  note: string;
};

export const pillars: Pillar[] = [
  {
    title: "It keeps what was decided.",
    body: "Close the tab, come back in a month, and the reason for a choice is still there. Identity and memory are written down on your own disk, so a correction sticks the first time instead of being relearned in every conversation.",
    note: "identity · memory · revisions",
  },
  {
    title: "It does the upkeep.",
    body: "The recurring work runs without you: a ledger review, a reminder before a renewal, a nightly pass that folds the day into memory. Every run leaves a report, and a failure is shown as a failure, not lost in a log.",
    note: "tasks · nightly reflection · reports",
  },
  {
    title: "It runs on your keys.",
    body: "One binary with its database inside. There is no queue, no account service and no vendor between you and the model. The whole court fits on a small server, and the bill is yours to see — line by line.",
    note: "one binary · SQLite · Docker",
  },
];

export type Feature = {
  icon: IconName;
  title: string;
  body: string;
  meta: string;
};

export const features: Feature[] = [
  {
    icon: "square-terminal",
    title: "Many tools, one small conversation",
    body: "The agent writes a short program to call the tools it needs — search, files, another agent — checks the result, then answers. Long work happens in visible steps instead of filling the context, and the same job runs the same way next time.",
    meta: "scripts · tool calls · data first",
  },
  {
    icon: "mcp",
    title: "Where people already talk",
    body: "Discord and Telegram are first-class, not webhooks bolted on. Every integration belongs to exactly one agent, so a token or a tool cannot reach sideways into another agent's conversations.",
    meta: "channels · addons · MCP",
  },
  {
    icon: "calendar",
    title: "Recurring work, accounted for",
    body: "Scheduled and one-off tasks run without you and write down what happened. The agent can schedule its own follow-ups, and each run keeps the answer it produced, so a quiet week is evidence rather than a guess.",
    meta: "tasks · task runs",
  },
  {
    icon: "users",
    title: "One person, or a household",
    body: "Start alone and invite people later. Roles, ownership and scoped access decide who can see or change which agent, and stay out of the way until there is more than one of you.",
    meta: "roles · ownership · API keys",
  },
];

export type StartMethod = {
  id: string;
  label: string;
  title: string;
  command: string;
  note: string;
};

export const startMethods: StartMethod[] = [
  {
    id: "script",
    label: "Install script",
    title: "Linux and macOS",
    command: "curl -fsSL https://get.vizier.rs | sh",
    note: "Then open http://localhost:9999, create the first user, add a provider key, and create an agent.",
  },
  {
    id: "docker",
    label: "Docker",
    title: "A single container",
    command:
      "docker run -p 9999:9999 -v vizier-data:/data \\\n  -e VIZIER_DATA_DIR=/data \\\n  -e VIZIER_JWT_SECRET=$(openssl rand -hex 32) \\\n  blinfoldking/vizier",
    note: "Images are published to Docker Hub and ghcr.io. A sample docker-compose.yaml ships with the repository.",
  },
  {
    id: "cargo",
    label: "Cargo",
    title: "From crates.io",
    command: "cargo binstall vizier\n# or: cargo install vizier",
    note: "Prebuilt binaries are available through cargo-binstall. Building from source needs the Rust toolchain.",
  },
];
