import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState } from "react";
import { AgentCard, type AgentState } from "@/components/AgentCard";
import { OrchestratorPanel } from "@/components/OrchestratorPanel";
import { Ticker } from "@/components/Ticker";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Atlas — Agentic Startup Mentor" },
      {
        name: "description",
        content:
          "Atlas dispatches a fleet of specialist AI agents to pressure-test your startup idea — market, competitors, unit economics, funding, regulation — and returns a VC-grade brief in under 90 seconds.",
      },
      { property: "og:title", content: "Atlas — Agentic Startup Mentor" },
      {
        property: "og:description",
        content: "VC-grade startup analysis from a fleet of AI agents, live.",
      },
    ],
  }),
  component: Home,
});

const EXAMPLES = [
  "A marketplace where retired Indian engineers tutor US high-school CS students async at $9/hr",
  "AI co-pilot for solo lawyers that drafts contracts in regional Indian languages",
  "Vertical SaaS for halal-meat butcher shops in EU: inventory + compliance + delivery",
];

type Phase = "idle" | "analyzing" | "done";

function Home() {
  const [idea, setIdea] = useState("");
  const [phase, setPhase] = useState<Phase>("idle");
  const [agents, setAgents] = useState<AgentState[]>([]);
  const [orch, setOrch] = useState<{ status: "idle" | "running" | "done"; output: string }>({
    status: "idle",
    output: "",
  });
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const resultRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleAnalyze = async (input: string) => {
    const trimmed = input.trim();
    if (trimmed.length < 8) {
      setError("Tell me a bit more about your idea (at least a sentence).");
      return;
    }
    setError(null);
    setPhase("analyzing");
    setAgents([]);
    setOrch({ status: "idle", output: "" });

    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const resp = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ idea: trimmed }),
        signal: controller.signal,
      });
      if (!resp.ok || !resp.body) {
        const t = await resp.text().catch(() => "");
        throw new Error(t || `Request failed (${resp.status})`);
      }

      const reader = resp.body.getReader();
      const decoder = new TextDecoder();
      let buf = "";

      const handleEvent = (event: string, data: any) => {
        if (event === "init") {
          setAgents(
            data.agents.map((a: any) => ({
              id: a.id,
              name: a.name,
              icon: a.icon,
              category: a.category,
              status: "pending" as const,
              output: "",
            })),
          );
        } else if (event === "agent_start") {
          setAgents((prev) =>
            prev.map((a) =>
              a.id === data.id ? { ...a, status: "running", startedAt: Date.now() } : a,
            ),
          );
        } else if (event === "agent_delta") {
          setAgents((prev) =>
            prev.map((a) => (a.id === data.id ? { ...a, output: a.output + data.delta } : a)),
          );
        } else if (event === "agent_done") {
          setAgents((prev) =>
            prev.map((a) =>
              a.id === data.id ? { ...a, status: "done", endedAt: Date.now() } : a,
            ),
          );
        } else if (event === "agent_error") {
          setAgents((prev) =>
            prev.map((a) => (a.id === data.id ? { ...a, status: "error" } : a)),
          );
        } else if (event === "orchestrator_start") {
          setOrch({ status: "running", output: "" });
        } else if (event === "orchestrator_delta") {
          setOrch((o) => ({ ...o, output: o.output + data.delta }));
        } else if (event === "orchestrator_done") {
          setOrch((o) => ({ ...o, status: "done" }));
        } else if (event === "done") {
          setPhase("done");
        } else if (event === "fatal") {
          setError(data.error || "Something went wrong");
          setPhase("done");
        }
      };

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buf += decoder.decode(value, { stream: true });

        // SSE events are separated by blank lines
        let sep: number;
        while ((sep = buf.indexOf("\n\n")) !== -1) {
          const chunk = buf.slice(0, sep);
          buf = buf.slice(sep + 2);
          let evt = "message";
          const dataLines: string[] = [];
          for (const ln of chunk.split("\n")) {
            if (ln.startsWith("event: ")) evt = ln.slice(7).trim();
            else if (ln.startsWith("data: ")) dataLines.push(ln.slice(6));
          }
          if (!dataLines.length) continue;
          try {
            handleEvent(evt, JSON.parse(dataLines.join("\n")));
          } catch {
            /* ignore parse error */
          }
        }
      }
      setPhase("done");
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? "Network error");
        setPhase("done");
      }
    }
  };

  const reset = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setAgents([]);
    setOrch({ status: "idle", output: "" });
    setError(null);
    setIdea("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen flex flex-col">
      <TopBar />
      <Ticker />

      <main className="flex-1">
        <Hero
          idea={idea}
          setIdea={setIdea}
          onAnalyze={() => handleAnalyze(idea)}
          onExample={(ex) => {
            setIdea(ex);
            handleAnalyze(ex);
          }}
          disabled={phase === "analyzing"}
          error={error}
          examples={EXAMPLES}
        />

        <div ref={resultRef} />

        {phase !== "idle" && (
          <section className="max-w-7xl mx-auto px-5 lg:px-8 py-10 space-y-8">
            <AnalysisHeader idea={idea} phase={phase} onReset={reset} agents={agents} />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agents.map((a) => (
                <AgentCard key={a.id} agent={a} />
              ))}
            </div>

            <OrchestratorPanel status={orch.status} output={orch.output} />
          </section>
        )}

        {phase === "idle" && <FeatureGrid />}
      </main>

      <Footer />
    </div>
  );
}

function TopBar() {
  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-background/70 border-b border-border">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-md bg-grad-amber flex items-center justify-center text-background font-display font-bold text-sm shadow-glow-primary">
            ⌬
          </div>
          <div className="flex items-baseline gap-2">
            <span className="font-display font-bold tracking-tight text-foreground">ATLAS</span>
            <span className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground">
              v0.1 · agentic
            </span>
          </div>
        </div>
        <nav className="hidden md:flex items-center gap-7 text-xs font-mono uppercase tracking-wider text-muted-foreground">
          <a href="#agents" className="hover:text-foreground transition">Agents</a>
          <a href="#how" className="hover:text-foreground transition">How it works</a>
          <a href="#pricing" className="hover:text-foreground transition">Pricing</a>
        </nav>
        <div className="hidden md:flex items-center gap-2 text-[11px] font-mono">
          <span className="dot-pulse text-signal">live · 24 agents online</span>
        </div>
      </div>
    </header>
  );
}

function Hero({
  idea,
  setIdea,
  onAnalyze,
  onExample,
  disabled,
  error,
  examples,
}: {
  idea: string;
  setIdea: (v: string) => void;
  onAnalyze: () => void;
  onExample: (ex: string) => void;
  disabled: boolean;
  error: string | null;
  examples: string[];
}) {
  return (
    <section className="relative pt-12 lg:pt-20 pb-12">
      <div className="max-w-5xl mx-auto px-5 lg:px-8">
        <div className="text-center space-y-5">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-surface text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span className="w-1.5 h-1.5 rounded-full bg-signal shadow-glow-signal" />
            Orchestrator · 8 specialist agents · live
          </div>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-balance leading-[1.05]">
            Pressure-test your startup{" "}
            <span className="text-grad-amber">like a VC partner</span>{" "}
            would — in 90 seconds.
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto text-pretty">
            Atlas dispatches a fleet of specialist agents — market, competitors, unit economics,
            funding, regulation — and returns a brutally honest, VC-grade brief. Watch them think live.
          </p>
        </div>

        <div className="mt-10 panel-elevated p-3 shadow-panel">
          <div className="flex items-center gap-2 px-3 py-2 border-b border-border">
            <span className="w-2.5 h-2.5 rounded-full bg-destructive/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-warning/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-signal/70" />
            <span className="ml-2 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              atlas://terminal — new analysis
            </span>
          </div>

          <div className="p-2">
            <div className="flex items-start gap-2 px-2 pt-2">
              <span className="font-mono text-primary text-sm pt-2.5">▶</span>
              <textarea
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) onAnalyze();
                }}
                placeholder="Describe your startup idea in 1-3 sentences. The more specific, the sharper the analysis."
                rows={3}
                disabled={disabled}
                className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground text-base leading-relaxed py-2 disabled:opacity-50"
              />
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 pt-3 pb-1 border-t border-border mt-2">
              <div className="text-[11px] font-mono text-muted-foreground">
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px]">⌘</kbd>{" "}
                <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px]">↵</kbd>{" "}
                to run · 8 agents will deploy in parallel
              </div>
              <button
                onClick={onAnalyze}
                disabled={disabled}
                className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-grad-amber text-primary-foreground font-semibold text-sm tracking-tight shadow-glow-primary hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {disabled ? "Agents working..." : "Deploy agent fleet"}
                <span className="font-mono group-hover:translate-x-0.5 transition-transform">→</span>
              </button>
            </div>
          </div>
        </div>

        {error && (
          <div className="mt-4 text-sm text-destructive font-mono text-center">{error}</div>
        )}

        <div className="mt-6">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground text-center mb-2">
            Try one of these
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            {examples.map((ex) => (
              <button
                key={ex}
                onClick={() => onExample(ex)}
                disabled={disabled}
                className="text-xs px-3 py-1.5 rounded-full border border-border bg-surface/60 text-muted-foreground hover:text-foreground hover:border-primary/50 transition disabled:opacity-40"
              >
                {ex.length > 70 ? ex.slice(0, 68) + "…" : ex}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function AnalysisHeader({
  idea,
  phase,
  onReset,
  agents,
}: {
  idea: string;
  phase: Phase;
  onReset: () => void;
  agents: AgentState[];
}) {
  const done = agents.filter((a) => a.status === "done").length;
  const total = agents.length || 8;
  const running = agents.filter((a) => a.status === "running").length;

  return (
    <div className="panel p-5 flex flex-col gap-4">
      <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-mono uppercase tracking-[0.22em] text-muted-foreground mb-1">
            Analyzing
          </div>
          <p className="text-base sm:text-lg text-foreground font-medium leading-snug">
            "{idea}"
          </p>
        </div>
        <button
          onClick={onReset}
          className="self-start text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-border hover:border-primary/50 hover:text-primary transition text-muted-foreground whitespace-nowrap"
        >
          {phase === "done" ? "↺ new analysis" : "⨯ cancel"}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-4 text-[11px] font-mono">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground uppercase tracking-wider">progress</span>
          <span className="text-foreground font-semibold">
            {done}/{total}
          </span>
        </div>
        <div className="flex-1 min-w-[120px] h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-grad-amber transition-all duration-500"
            style={{ width: `${total ? (done / total) * 100 : 0}%` }}
          />
        </div>
        <div className="flex items-center gap-4 text-muted-foreground">
          {running > 0 && <span className="text-signal dot-pulse">{running} running</span>}
          <span>{done} complete</span>
        </div>
      </div>
    </div>
  );
}

function FeatureGrid() {
  const features = [
    { title: "Market Analysis", desc: "TAM / SAM / SOM + CAGR with real benchmarks.", icon: "◈", tone: "text-signal" },
    { title: "Competitor Research", desc: "4-6 real rivals mapped to your white space.", icon: "⬡", tone: "text-signal" },
    { title: "Customer Persona", desc: "3 ICPs with pains, JTBD and reach channels.", icon: "◎", tone: "text-primary" },
    { title: "Unit Economics", desc: "CAC, LTV, churn, gross margin, payback.", icon: "$", tone: "text-primary" },
    { title: "Funding Strategy", desc: "Right stage, check size, and 5 investor archetypes.", icon: "⇡", tone: "text-primary" },
    { title: "SWOT & Feasibility", desc: "Honest score out of 10 with rationale.", icon: "△", tone: "text-signal" },
    { title: "Regulatory", desc: "GDPR, HIPAA, SEBI, FDA — only the relevant ones.", icon: "§", tone: "text-destructive" },
    { title: "Benchmark Companies", desc: "Real startups who tried this — what happened.", icon: "≡", tone: "text-signal" },
  ];

  const flow = [
    { n: "01", t: "You drop the idea", d: "1-3 sentences is enough. The orchestrator parses intent and dispatches agents." },
    { n: "02", t: "8 agents run in parallel", d: "Each specialist streams its reasoning live. You watch the thinking, not just the output." },
    { n: "03", t: "Orchestrator synthesizes", d: "Cross-references all reports into an executive brief: verdict, score, next 90 days." },
    { n: "04", t: "You ship faster", d: "Export, share with co-founders, or pivot — with the killer question already answered." },
  ];

  return (
    <>
      <section id="agents" className="max-w-7xl mx-auto px-5 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-2">
              The fleet
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
              8 specialist agents. <span className="text-grad-amber">One verdict.</span>
            </h2>
          </div>
          <div className="text-sm text-muted-foreground font-mono max-w-sm">
            Each agent has its own system prompt, reasoning style, and tools. The Orchestrator stitches their outputs into a single brief.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="panel p-4 hover:border-primary/40 hover:-translate-y-0.5 transition-all group"
            >
              <div className={`text-2xl font-display ${f.tone} mb-3`}>{f.icon}</div>
              <div className="text-sm font-semibold text-foreground mb-1">{f.title}</div>
              <div className="text-xs text-muted-foreground leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-7xl mx-auto px-5 lg:px-8 pb-20">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-2">
          Protocol
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-10">
          How the agent fleet works.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flow.map((s) => (
            <div key={s.n} className="panel p-5 relative overflow-hidden">
              <div className="absolute top-2 right-3 font-display text-5xl font-bold text-border select-none">
                {s.n}
              </div>
              <div className="text-sm font-semibold text-foreground mb-2 relative">{s.t}</div>
              <div className="text-xs text-muted-foreground leading-relaxed relative">{s.d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="pricing" className="max-w-7xl mx-auto px-5 lg:px-8 pb-24">
        <div className="text-center mb-10">
          <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-2">
            Pricing
          </div>
          <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight">
            Built for founders, not feature lists.
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { tier: "Explorer", price: "Free", tag: "3 analyses / mo", features: ["8 core agents", "Live streaming", "Markdown export"] },
            { tier: "Founder", price: "$29", per: "/mo", tag: "Unlimited", features: ["All 24 agents", "Follow-up Q&A", "PDF export", "Saved history"], featured: true },
            { tier: "Accelerator", price: "$199", per: "/mo", tag: "Teams + cohorts", features: ["Everything in Founder", "Team workspaces", "API access", "White-label brief"] },
          ].map((p: any) => (
            <div
              key={p.tier}
              className={`panel p-6 flex flex-col ${
                p.featured ? "border-primary/50 shadow-glow-primary relative" : ""
              }`}
            >
              {p.featured && (
                <div className="absolute -top-2.5 left-5 text-[10px] font-mono uppercase tracking-[0.22em] bg-grad-amber text-primary-foreground px-2 py-0.5 rounded">
                  most picked
                </div>
              )}
              <div className="text-sm font-mono uppercase tracking-wider text-muted-foreground mb-2">
                {p.tier}
              </div>
              <div className="flex items-baseline gap-1 mb-1">
                <span className="font-display text-4xl font-bold text-foreground">{p.price}</span>
                {p.per && <span className="text-sm text-muted-foreground font-mono">{p.per}</span>}
              </div>
              <div className="text-xs text-muted-foreground mb-5">{p.tag}</div>
              <ul className="space-y-2 mb-6 text-sm">
                {p.features.map((f: string) => (
                  <li key={f} className="flex items-start gap-2 text-foreground/85">
                    <span className="text-primary mt-0.5">▸</span> {f}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-auto w-full py-2.5 rounded-md text-sm font-semibold transition ${
                  p.featured
                    ? "bg-grad-amber text-primary-foreground hover:scale-[1.02]"
                    : "border border-border hover:border-primary/50 text-foreground"
                }`}
              >
                {p.tier === "Explorer" ? "Start free" : "Get started"}
              </button>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-border bg-surface/40 mt-auto">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
        <div className="flex items-center gap-2">
          <span className="text-grad-amber">⌬</span>
          <span>Atlas · agentic startup intelligence</span>
        </div>
        <div className="flex items-center gap-5">
          <span>powered by lovable ai</span>
          <span className="dot-pulse text-signal">all systems operational</span>
        </div>
      </div>
    </footer>
  );
}
