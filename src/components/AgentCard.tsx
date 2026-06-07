import { Markdown } from "./Markdown";

export type AgentStatus = "pending" | "running" | "done" | "error";

export interface AgentState {
  id: string;
  name: string;
  icon: string;
  category: string;
  status: AgentStatus;
  output: string;
  startedAt?: number;
  endedAt?: number;
}

const CATEGORY_TONE: Record<string, string> = {
  Intelligence: "text-signal",
  "Go-To-Market": "text-primary",
  Financial: "text-primary",
  Risk: "text-destructive",
};

export function AgentCard({ agent }: { agent: AgentState }) {
  const tone = CATEGORY_TONE[agent.category] ?? "text-muted-foreground";
  const duration =
    agent.startedAt && agent.endedAt
      ? `${((agent.endedAt - agent.startedAt) / 1000).toFixed(1)}s`
      : agent.startedAt
        ? `${((Date.now() - agent.startedAt) / 1000).toFixed(0)}s`
        : "—";

  return (
    <div
      className={`panel relative overflow-hidden transition-all duration-300 ${
        agent.status === "running" ? "shadow-glow-signal border-signal/40" : ""
      } ${agent.status === "done" ? "border-primary/30" : ""}`}
    >
      {/* Scanline when running */}
      {agent.status === "running" && (
        <div className="pointer-events-none absolute inset-0 scanline" />
      )}

      <header className="flex items-center justify-between gap-3 px-4 py-3 border-b border-border bg-surface-elevated/50">
        <div className="flex items-center gap-3 min-w-0">
          <span className={`text-lg font-display ${tone}`}>{agent.icon}</span>
          <div className="min-w-0">
            <div className="text-sm font-semibold text-foreground truncate">{agent.name}</div>
            <div className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground">
              {agent.category}
            </div>
          </div>
        </div>
        <StatusBadge status={agent.status} duration={duration} />
      </header>

      <div className="p-4 min-h-[120px] max-h-[420px] overflow-y-auto">
        {agent.status === "pending" && (
          <div className="text-xs font-mono text-muted-foreground">
            <span className="opacity-50">$</span> awaiting orchestrator...
          </div>
        )}
        {agent.status === "running" && !agent.output && (
          <div className="text-xs font-mono text-signal dot-pulse">
            initializing reasoning chain
          </div>
        )}
        {agent.output && (
          <div className="space-y-1.5 text-sm">
            <Markdown content={agent.output} />
            {agent.status === "running" && (
              <span className="inline-block w-1.5 h-3.5 bg-signal align-text-bottom animate-pulse" />
            )}
          </div>
        )}
        {agent.status === "error" && !agent.output && (
          <div className="text-xs text-destructive font-mono">agent failed</div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status, duration }: { status: AgentStatus; duration: string }) {
  if (status === "pending") {
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground">
        queued
      </span>
    );
  }
  if (status === "running") {
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-signal/40 text-signal dot-pulse">
        running · {duration}
      </span>
    );
  }
  if (status === "done") {
    return (
      <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-primary/40 text-primary">
        ✓ {duration}
      </span>
    );
  }
  return (
    <span className="text-[10px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-destructive/40 text-destructive">
      error
    </span>
  );
}
