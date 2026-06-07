import { Markdown } from "./Markdown";

export function OrchestratorPanel({
  status,
  output,
}: {
  status: "idle" | "running" | "done";
  output: string;
}) {
  if (status === "idle") return null;

  return (
    <div className="panel relative overflow-hidden border-primary/40 shadow-glow-primary">
      <div className="absolute inset-x-0 top-0 h-px bg-grad-amber" />
      <header className="flex items-center justify-between px-5 py-3 border-b border-border bg-surface-elevated/70">
        <div className="flex items-center gap-3">
          <span className="text-2xl font-display text-grad-amber">⌬</span>
          <div>
            <div className="text-xs font-mono uppercase tracking-[0.22em] text-primary">
              Orchestrator · Executive Brief
            </div>
            <div className="text-base font-semibold text-foreground">
              Synthesis from all specialist agents
            </div>
          </div>
        </div>
        <span
          className={`text-[10px] font-mono uppercase tracking-wider px-2 py-1 rounded border ${
            status === "running"
              ? "border-signal/40 text-signal dot-pulse"
              : "border-primary/40 text-primary"
          }`}
        >
          {status === "running" ? "synthesizing" : "complete"}
        </span>
      </header>
      <div className="p-6 max-h-[640px] overflow-y-auto">
        {!output && status === "running" && (
          <div className="text-sm font-mono text-signal dot-pulse">
            cross-referencing 8 specialist reports...
          </div>
        )}
        <div className="space-y-2">
          <Markdown content={output} />
          {status === "running" && (
            <span className="inline-block w-2 h-4 bg-primary align-text-bottom animate-pulse" />
          )}
        </div>
      </div>
    </div>
  );
}
