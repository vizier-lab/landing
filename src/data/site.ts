import type { IconName } from "@vizier/design";

export type NavItem = { label: string; href: string; external?: boolean };

export const nav: NavItem[] = [
  { label: "Docs", href: "/docs/" },
  { label: "Blog", href: "/blog/" },
  { label: "GitHub", href: "https://github.com/vizier-lab/vizier", external: true },
];

export type Pillar = {
  index: string;
  title: string;
  body: string;
  note: string;
};

export const pillars: Pillar[] = [
  {
    index: "01",
    title: "An agent with a self",
    body: "Every agent has a CORE.md identity, long-term memory in open markdown bundles, and a dream cycle that reflects on what happened and folds it back in. Revision history is kept for both.",
    note: "CORE.md · bundles · passages · dreams",
  },
  {
    index: "02",
    title: "One binary. No services.",
    body: "Vizier is a Rust binary with embedded SQLite, its own WebUI, and no config file requirement. Run it bare, in Docker, under systemd. Nothing else to install or operate.",
    note: "Rust · SQLite · config-less · Docker",
  },
  {
    index: "03",
    title: "A court, not a chatbot",
    body: "Many agents run at once, isolated from each other: their own provider, tools, MCP clients, shell, memory and channels. Each can hold its own presence on Discord, Telegram and the WebUI.",
    note: "Discord · Telegram · WebUI · REST/WS",
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
    title: "Code mode",
    body: "The model writes Python in an isolated sandbox and calls tools as functions, so a whole loop of work stays outside the context window.",
    meta: "execute_python",
  },
  {
    icon: "agent",
    title: "29 providers",
    body: "Ollama, OpenAI, Anthropic, Google, OpenRouter, GitHub Copilot, ChatGPT OAuth, and any OpenAI-compatible endpoint you bring.",
    meta: "models.dev + custom",
  },
  {
    icon: "mcp",
    title: "Integrations",
    body: "Discord and Telegram bots, Brave search, and per-agent MCP servers. Every integration belongs to exactly one agent.",
    meta: "channels · addons · MCP",
  },
  {
    icon: "calendar",
    title: "Scheduled work",
    body: "Cron and one-time tasks run unattended, record a task run, and report back what happened. The running row is the overlap lock.",
    meta: "tasks · task runs",
  },
  {
    icon: "layers",
    title: "Background jobs",
    body: "Delegate pieces of a job to other agents and sessions. They report back into the conversation that launched them, exactly once.",
    meta: "delegate · report",
  },
  {
    icon: "users",
    title: "One or many people",
    body: "JWT and API keys, roles with granular permissions, agent ownership and sharing. A solo self-hoster pays no complexity tax for a team.",
    meta: "roles · ownership",
  },
  {
    icon: "skills",
    title: "Skills",
    body: "Reusable SKILL.md packages with resources and scripts, global or per-agent, installable from a registry, git, or a local path.",
    meta: "SKILL.md",
  },
  {
    icon: "usage",
    title: "Usage and cost",
    body: "Every answered completion is recorded and priced against the catalogue. See what each agent, session and channel costs.",
    meta: "tokens · estimate",
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
