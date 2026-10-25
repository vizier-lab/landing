import { Badge, Card, Eyebrow, Icon, Sigil } from "@vizier/design";

type Agent = {
  id: string;
  name: string;
  role: string;
  state: "live" | "idle";
};

const agents: Agent[] = [
  { id: "seneschal", name: "Seneschal", role: "operations", state: "live" },
  { id: "archivist", name: "Archivist", role: "memory", state: "idle" },
  { id: "herald", name: "Herald", role: "channels", state: "idle" },
];

/**
 * An illustrative court view built from the real design components. It is a
 * working sketch of the WebUI's vocabulary, not a screenshot, and is labelled
 * as such beside the board.
 */
export default function CourtBoard() {
  return (
    <Card
      aria-label="Illustrative court view"
      className="w-full gap-0! overflow-hidden border-border-strong! p-0! shadow-[0_30px_90px_-42px_rgba(0,0,0,0.55)]"
    >
      <div className="flex items-center justify-between gap-12 border-b border-border px-16 py-12">
        <Eyebrow>THE COURT</Eyebrow>
        <div className="flex items-center gap-8">
          <span className="inline-flex items-center gap-6 type-mono-xs text-muted">
            <span className="pulse-dot" />3 agents
          </span>
          <Badge tone="live">live</Badge>
        </div>
      </div>

      <div className="court-board__grid">
        <div className="border-r border-border p-14">
          <Eyebrow>ROSTER</Eyebrow>
          <div className="mt-10 flex flex-col gap-8">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="flex items-center gap-10 rounded-lg border border-border bg-ground px-10 py-9"
              >
                <Sigil agentId={agent.id} size="md" live={agent.state === "live"} label={agent.name} />
                <div className="min-w-0 flex-1">
                  <div className="type-body-strong text-fg">{agent.name}</div>
                  <div className="type-mono-xs text-faint">{agent.role}</div>
                </div>
                <span
                  className={
                    agent.state === "live"
                      ? "type-mono-xs text-live-text"
                      : "type-mono-xs text-faint"
                  }
                >
                  {agent.state}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-14 flex items-center gap-8 border-t border-border pt-12">
            <Icon name="channels" size={14} className="text-faint" />
            <div className="flex flex-wrap gap-5">
              <Badge>discord</Badge>
              <Badge>telegram</Badge>
              <Badge>webui</Badge>
            </div>
          </div>
        </div>

        <div className="p-14">
          <Eyebrow>MEMORY</Eyebrow>
          <div className="mt-10 rounded-lg border border-border bg-ground p-10">
            <div className="type-mono-sm text-faint">bundles/court/</div>
            <div className="mt-8 flex flex-col gap-6 type-code">
              <span className="text-soft">charter.md</span>
              <span className="text-soft">lineage.md</span>
              <span className="flex items-center gap-6 text-soft">
                decisions.md
                <span className="live-dot" />
              </span>
              <span className="text-faint">dreams/2026-10-25.md</span>
            </div>
            <div className="mt-10 border-t border-border pt-8 type-mono-xs text-faint">
              [charter] → [lineage] → [decisions]
            </div>
          </div>

          <div className="mt-14">
            <Eyebrow>NEXT RITUAL</Eyebrow>
            <div className="mt-8 flex items-start gap-8">
              <Icon name="calendar" size={14} className="mt-1 text-faint" />
              <div>
                <div className="type-small-medium text-fg">Dream cycle</div>
                <div className="type-mono-xs text-faint">03:00 · reflect, then fold back</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="flex items-center justify-between gap-12 px-16 py-12">
          <Eyebrow>LIVE TURN · #ledger</Eyebrow>
          <Badge tone="neutral">code mode</Badge>
        </div>
        <pre className="overflow-x-auto border-t border-border bg-surface px-16 py-14 type-code-block text-soft">
          <code>
            <span className="text-faint">notes = </span>
            <span className="text-live-text">memory_search</span>
            <span className="text-faint">(</span>
            <span className="text-soft">"quarterly ledger"</span>
            <span className="text-faint">)</span>
            {"\n"}
            <span className="text-faint">open = </span>
            <span className="text-live-text">list_tasks</span>
            <span className="text-faint">(filter=</span>
            <span className="text-soft">"open"</span>
            <span className="text-faint">)</span>
            {"\n"}
            <span className="text-faint">return </span>
            <span className="text-rank-text">summarise</span>
            <span className="text-faint">(notes, open)</span>
          </code>
        </pre>
        <div className="flex flex-wrap items-center justify-between gap-10 border-t border-border px-16 py-10">
          <span className="inline-flex items-center gap-6 type-mono-xs text-muted">
            <span className="live-dot" />
            memory_search → 4 passages
          </span>
          <span className="type-mono-xs text-faint">1.8s · no context held</span>
        </div>
      </div>
    </Card>
  );
}
