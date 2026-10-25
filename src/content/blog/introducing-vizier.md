---
title: Introducing Vizier
description: A digital steward for Your Majesty — one self-hosted binary, many agents, and a memory that outlives the context window.
date: 2026-04-12
updated: 2026-10-25
author: Vizier Team
tags: [announcement, introduction]
---

> **A digital steward for Your Majesty.**\
> AI agents that remember who they are, and who you are. Hosted by you.

The name comes from the courts of Egypt and Persia: a vizier was the person a
ruler trusted to keep the machinery moving. Not a chatbot. A right hand.

Vizier is a self-hosted AI agent framework built around that idea. It is one
Rust binary with embedded SQLite, no external service to stand up, and a WebUI
included. It runs many agents at once, each with its own provider, tools,
memory, identity and channels.

## Four ideas

**An agent has a self.** Every agent has a `CORE.md` identity, long-term memory
in open markdown bundles, and a dream cycle that reflects on recent work and
folds what it learns back into memory and CORE. Revisions are kept for both.
The agent is not reset to a blank prompt every morning.

**One binary, no services.** Storage is embedded. The WebUI is embedded. The
scheduler, channels and command server run in the same process. Start it,
create the first user, add a provider key, and create an agent. There is no
YAML requirement and no database to operate.

**Many agents, many channels.** Each agent is isolated: its own provider,
tools, MCP clients, shell, memory and channel presence. Agents can consult and
delegate to each other. The same conversation can happen in the WebUI, over
Discord or Telegram, or through the REST and WebSocket API.

**Open and inspectable.** Memory is human-readable markdown on disk. Bundles
export and import as `.zip`. Tool calls, task runs, background jobs, dreams and
usage are visible rather than hidden in logs. The project is MIT licensed.

## What it is like to run

Vizier works in **code mode**: the model writes Python in an isolated sandbox
and calls tools as functions. A single script can search memory, inspect tasks,
fetch a page and return one result, so the context holds the answer rather than
every intermediate step.

Around that loop are the parts that make an agent useful for longer than a
single conversation: scheduled tasks and their run reports, background jobs that
report back, a dream cycle, checkpoints near the context limit, skills,
per-agent MCP servers, TTS/STT/image generation, and a usage view that estimates
cost per agent and channel.

## Start

```sh
curl -fsSL https://get.vizier.rs | sh
vizier run
```

Open [http://localhost:9999](http://localhost:9999), create the first user, add
a provider under **Settings → Providers**, and create an agent.

Docker and Cargo are equally supported:

```sh
docker run -p 9999:9999 -v vizier-data:/data \
  -e VIZIER_DATA_DIR=/data \
  -e VIZIER_JWT_SECRET=$(openssl rand -hex 32) \
  blinfoldking/vizier
```

```sh
cargo binstall vizier   # prebuilt
cargo install vizier    # from source
```

The [quick start](/docs/getting-started/quick-start/) goes further, and the
[configuration section](/docs/configuration/) covers providers, channels,
agents, memory, skills, MCP and observability.

Welcome to the court.
