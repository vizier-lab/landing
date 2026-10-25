---
title: Memory that outlives the context window
description: How CORE.md, memory bundles, passages and the dream cycle keep an agent coherent after the conversation is long gone.
date: 2026-10-25
author: Vizier Team
tags: [memory, architecture]
---

Most agent frameworks treat memory as a longer prompt. Vizier treats it as a
place: a folder of markdown documents that an agent can read, write, link and
export. The context window is a desk, not a house.

## CORE.md is the agent's self

Every agent has a `CORE.md` stored with its configuration, not on a random
filesystem path. It is the agent's durable description of itself: role, voice,
boundaries, the things it has decided matter. A new session loads CORE before
anything else.

CORE has revision history. When the agent changes it through `write_core`, the
previous version is recorded with who changed it and why. You can inspect the
diff instead of wondering what the agent rewrote at 3 a.m.

## Bundles are the long-term memory

Long-term memory is grouped into **bundles** per agent:

```text
<workspace>/agents/<agent_id>/memory/
  default/
    index.md          # generated table of concepts
    log.md            # generated change log
    charter.md
    lineage.md
```

Each concept is a markdown file with YAML frontmatter and a body. Links between
concepts are ordinary Markdown links (`[lineage](lineage.md)`) or cross-bundle
references (`[[court/charter]]`). Vizier parses those into a link graph, keeps
broken edges visible, and fixes them when the target appears. You can open the
same files in an editor, put them in git, or export the whole bundle as a
`.zip`.

## Retrieval works on passages

Search does not match whole documents. A document is split into
structure-aware **passages**, and the embedding index points at those. A query
returns the passages that answer it, with their document and line span. The
model gets a small, relevant piece of the bundle instead of a whole file that
happens to contain the word it wanted.

SQLite holds a derived index so listing, graph queries and search do not need to
read every document on every turn. The markdown remains the source of truth; the
index can be rebuilt.

## The dream cycle folds it back

Scheduled reflection is the part that makes the folder grow rather than
accumulate. On its interval, an agent reviews recent sessions and task runs,
extracts what is worth keeping, and writes it into memory or CORE. The journal
is kept. You can read what it thought was important, and correct it.

This is also how reactions reach memory: a reaction is surfaced in the agent's
context as a digest, and the dream cycle is the route by which it can become a
lasting note.

## Checkpoints keep the desk clear

When a conversation approaches the model's context limit, Vizier compacts what
matters into a handover and starts a fresh context from it. `/checkpoint` does
the same on demand. The full session history is still there; the working set is
just smaller.

## The point

An agent that remembers is not one with a bigger prompt. It is one with a place
to put things, a way to find them again, and a habit of deciding what matters.
That is what CORE, bundles, passages, dreams and revisions are for.

Read [Memory](/docs/configuration/memory/) for the storage model and the tools,
or [Agent Configuration](/docs/configuration/agents/) for how CORE and the dream
cycle are configured.
