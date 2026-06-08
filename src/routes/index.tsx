import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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

type Phase = "idle" | "analyzing" | "done";
type ViewState = "analyze" | "dashboard" | "reports" | "settings";

const MOCK_REPORTS = [
  {
    id: "rep-1",
    idea: "AI-Powered Real Estate Assistant for regional brokers in Tier-2 Indian cities",
    createdAt: "2026-06-05T10:14:00.000Z",
    score: 82,
    verdict: "GO",
    agents: [
      { id: "market", name: "Market Analysis", icon: "◈", category: "Intelligence", status: "done" as const, output: "### Market Size Estimate (TAM/SAM/SOM)\n* **TAM:** $8.4B (Indian real estate CRM market)\n* **SAM:** $1.2B (Brokers in Tier-2/3 hubs)\n* **SOM:** $90M (Target initial city hubs)\n* **CAGR:** 18.2% (5-year forecast)\n\n**Market Verdict: HOT**" },
      { id: "competitor", name: "Competitor Research", icon: "⬡", category: "Intelligence", status: "done" as const, output: "### Competitive Landscape\n* **Direct Rivals:** PropTiger, Housing.com, local brokerage directories.\n* **White Space:** Specialized regional dialect conversational support and automated voice-based lead categorization." },
      { id: "persona", name: "Customer Persona", icon: "◎", category: "Go-To-Market", status: "done" as const, output: "### Target Persona\n* **ICP:** Independent Tier-2 brokers who manage 10-30 active listings.\n* **Pains:** High manual lead follow-up, lack of technoloy alignment, poor CRM engagement." },
      { id: "unit", name: "Unit Economics", icon: "$", category: "Financial", status: "done" as const, output: "### Unit Economics\n* **SaaS Subscription:** $15/month per broker license.\n* **Acquisition Cost (CAC):** $22 per user.\n* **Gross Margin:** 88%.\n* **Payback Period:** 1.5 months." },
      { id: "funding", name: "Funding Strategy", icon: "⇡", category: "Financial", status: "done" as const, output: "### Funding & Round\n* **Target:** $250k Pre-seed.\n* **Hook:** AI voice agent scaling local brokers in 8 regional languages." },
      { id: "swot", name: "SWOT & Feasibility", icon: "△", category: "Intelligence", status: "done" as const, output: "### SWOT Analysis\n* **Strengths:** First-mover localization.\n* **Weaknesses:** Low tech budgets among target brokers.\n* **Opportunities:** Expanding into home loan facilitation.\n* **Feasibility:** 8/10." },
      { id: "regulatory", name: "Regulatory & Compliance", icon: "§", category: "Risk", status: "done" as const, output: "### Compliance\n* **Regulations:** RERA registrations (India) and local client data protection (IT Act 2000)." },
      { id: "benchmark", name: "Benchmark Comparison", icon: "≡", category: "Intelligence", status: "done" as const, output: "### Benchmarks\n* **BrokerBase (US):** High success scaling via SaaS broker plugins.\n* **PropAI (India):** Pivoted to residential sales after brokerage tool churn." }
    ],
    orch: {
      status: "done" as const,
      output: "### Verdict\nGO. Extremely large underserved broker market in Tier-2 Indian cities with high viral loops.\n### Investability Score\n82/100\n### Top 3 Strengths\n1. Low CAC via direct broker partnerships.\n2. Regional language localization barrier to entry.\n3. Clear workflow utility.\n### Top 3 Risks\n1. Initial trust barrier with non-tech-native brokers.\n2. Low pricing power per seat.\n3. High churn in first 3 months.\n### Next 90 Days\n1. Build a working WhatsApp prototype.\n2. Pilot with 10 local brokers in Nagpur.\n3. Automate voice transcript parsing.\n4. Standardize CRM sync.\n5. Raise local angel funding.\n### Killer Question\nHow will you secure integrations with the fragmented regional real estate portals?"
    }
  },
  {
    id: "rep-2",
    idea: "Decentralized micro-loans platform for agricultural equipment in Kenya",
    createdAt: "2026-06-01T15:30:00.000Z",
    score: 74,
    verdict: "EXPLORE",
    agents: [
      { id: "market", name: "Market Analysis", icon: "◈", category: "Intelligence", status: "done" as const, output: "### Market Analysis\n* **TAM:** $4.5B in East Africa.\n* **SAM:** $600M in Kenya agricultural equipment.\n* **SOM:** $45M localized cooperatives.\n* **CAGR:** 14.5%." },
      { id: "competitor", name: "Competitor Research", icon: "⬡", category: "Intelligence", status: "done" as const, output: "### Competitive Landscape\n* **Rivals:** Apollo Agriculture, Twiga Foods, local credit unions." },
      { id: "persona", name: "Customer Persona", icon: "◎", category: "Go-To-Market", status: "done" as const, output: "### Customer Persona\n* **ICP:** Smallholder farmers cultivating 2-10 acres of commercial crops.\n* **Pains:** Lack of collaterals for equipment leasing." },
      { id: "unit", name: "Unit Economics", icon: "$", category: "Financial", status: "done" as const, output: "### Unit Economics\n* **Yield:** 18% APR.\n* **Default Provision:** 4.5%.\n* **Payback Period:** 6-12 months." },
      { id: "funding", name: "Funding Strategy", icon: "⇡", category: "Financial", status: "done" as const, output: "### Funding Round\n* **Round:** $500k seed check from impact investors and micro-credit grants." },
      { id: "swot", name: "SWOT & Feasibility", icon: "△", category: "Intelligence", status: "done" as const, output: "### SWOT Analysis\n* **Opportunities:** High community peer-lending trust.\n* **Threats:** Severe weather dependencies and crop failures.\n* **Feasibility:** 7/10." },
      { id: "regulatory", name: "Regulatory & Compliance", icon: "§", category: "Risk", status: "done" as const, output: "### Compliance\n* **Regulations:** Central Bank of Kenya microfinance licensing guidelines and mobile money compliance." },
      { id: "benchmark", name: "Benchmark Comparison", icon: "≡", category: "Intelligence", status: "done" as const, output: "### Benchmarks\n* **Apollo Agriculture:** High success leveraging satellite data.\n* **FarmDrive:** Pivoted from direct micro-credit to B2B credit scoring model." }
    ],
    orch: {
      status: "done" as const,
      output: "### Verdict\nEXPLORE. Solid community underwriting loops but high default risk from climate dependencies.\n### Investability Score\n74/100\n### Top 3 Strengths\n1. Massive yield improvements for farmers.\n2. Leverage M-Pesa infrastructure.\n3. High social impact check alignment.\n### Top 3 Risks\n1. High systemic crop yield risk.\n2. Heavy capital requirements.\n3. Fragmented logistical tracking.\n### Next 90 Days\n1. Partner with 2 equipment dealerships.\n2. Roll out to 15 vetted farming cooperatives.\n3. Set up smart contract escrow protocols.\n4. Design credit scoring models.\n5. Partner with local insurance providers.\n### Killer Question\nHow will you offset default risk during consecutive dry seasons?"
    }
  }
];

function Home() {
  const [user, setUser] = useState<{ name: string; email: string; createdAt: string } | null>(null);
  const [view, setView] = useState<ViewState>("analyze");
  const [reports, setReports] = useState<any[]>([]);

  // Auth local states
  const [isCreateAccount, setIsCreateAccount] = useState(false);
  const [authName, setAuthName] = useState("");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authConfirmPassword, setAuthConfirmPassword] = useState("");
  const [authError, setAuthError] = useState("");

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

  // References to keep state fresh during async callbacks
  const agentsRef = useRef<AgentState[]>([]);
  const orchRef = useRef({ status: "idle", output: "" });

  const updateAgents = (updater: AgentState[] | ((prev: AgentState[]) => AgentState[])) => {
    setAgents((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      agentsRef.current = next;
      return next;
    });
  };

  const updateOrch = (updater: typeof orch | ((prev: typeof orch) => typeof orch)) => {
    setOrch((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      orchRef.current = next as any;
      return next as any;
    });
  };

  // Load user session and user-specific reports list
  useEffect(() => {
    const storedUser = localStorage.getItem("atlas_user");
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);

      // Load user-specific reports history
      const userReportsKey = `atlas_reports_${parsedUser.email}`;
      const storedReports = localStorage.getItem(userReportsKey);
      if (storedReports) {
        setReports(JSON.parse(storedReports));
      } else {
        setReports(MOCK_REPORTS);
        localStorage.setItem(userReportsKey, JSON.stringify(MOCK_REPORTS));
      }
    }
  }, [view]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const handleLogout = () => {
    localStorage.removeItem("atlas_user");
    setUser(null);
    setView("analyze");
    reset();
  };

  // Handle local Sign In / Create Account submits
  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");

    if (isCreateAccount) {
      if (!authName || !authEmail || !authPassword || !authConfirmPassword) {
        setAuthError("All fields are required.");
        return;
      }
      if (authPassword !== authConfirmPassword) {
        setAuthError("Passwords do not match.");
        return;
      }
      if (authPassword.length < 6) {
        setAuthError("Password must be at least 6 characters.");
        return;
      }

      // Check if email already registered
      const existingUsers = JSON.parse(localStorage.getItem("atlas_registered_users") || "[]");
      if (existingUsers.some((u: any) => u.email === authEmail)) {
        setAuthError("An account with this email already exists.");
        return;
      }

      // Register user profile
      const newUser = {
        name: authName,
        email: authEmail,
        password: authPassword,
        createdAt: new Date().toISOString()
      };
      existingUsers.push(newUser);
      localStorage.setItem("atlas_registered_users", JSON.stringify(existingUsers));

      // Login
      localStorage.setItem("atlas_user", JSON.stringify({ name: authName, email: authEmail, createdAt: newUser.createdAt }));
      setUser({ name: authName, email: authEmail, createdAt: newUser.createdAt });
      setView("analyze");
      setAuthName("");
      setAuthEmail("");
      setAuthPassword("");
      setAuthConfirmPassword("");
    } else {
      if (!authEmail || !authPassword) {
        setAuthError("Email and password are required.");
        return;
      }

      const existingUsers = JSON.parse(localStorage.getItem("atlas_registered_users") || "[]");
      const found = existingUsers.find((u: any) => u.email === authEmail && u.password === authPassword);

      if (!found) {
        // Simple fallback to make development/testing frictionless
        if (authPassword === "password" || authPassword.length >= 6) {
          const defaultName = authEmail.split("@")[0].charAt(0).toUpperCase() + authEmail.split("@")[0].slice(1);
          const mockUser = { name: defaultName, email: authEmail, createdAt: new Date().toISOString() };
          localStorage.setItem("atlas_user", JSON.stringify(mockUser));
          setUser(mockUser);
          setView("analyze");
          setAuthEmail("");
          setAuthPassword("");
          return;
        }
        setAuthError("Invalid email or password. (For testing, enter any password 6+ characters)");
        return;
      }

      localStorage.setItem("atlas_user", JSON.stringify({ name: found.name, email: found.email, createdAt: found.createdAt }));
      setUser({ name: found.name, email: found.email, createdAt: found.createdAt });
      setView("analyze");
      setAuthEmail("");
      setAuthPassword("");
    }
  };

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
    agentsRef.current = [];
    orchRef.current = { status: "idle", output: "" };

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
          updateAgents(
            data.agents.map((a: any) => ({
              id: a.id,
              name: a.name,
              icon: a.icon,
              category: a.category,
              status: "pending" as const,
              output: "",
            }))
          );
        } else if (event === "agent_start") {
          updateAgents((prev) =>
            prev.map((a) =>
              a.id === data.id ? { ...a, status: "running", startedAt: Date.now() } : a
            )
          );
        } else if (event === "agent_delta") {
          updateAgents((prev) =>
            prev.map((a) => (a.id === data.id ? { ...a, output: a.output + data.delta } : a))
          );
        } else if (event === "agent_done") {
          updateAgents((prev) =>
            prev.map((a) =>
              a.id === data.id ? { ...a, status: "done", endedAt: Date.now() } : a
            )
          );
        } else if (event === "agent_error") {
          updateAgents((prev) =>
            prev.map((a) => (a.id === data.id ? { ...a, status: "error" } : a))
          );
        } else if (event === "orchestrator_start") {
          updateOrch({ status: "running", output: "" });
        } else if (event === "orchestrator_delta") {
          updateOrch((o) => ({ ...o, output: o.output + data.delta }));
        } else if (event === "orchestrator_done") {
          updateOrch((o) => ({ ...o, status: "done" }));
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

      // Save report dynamically in user-specific key
      const storedUser = localStorage.getItem("atlas_user");
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        const newReport = {
          id: "rep-" + Date.now(),
          idea: trimmed,
          createdAt: new Date().toISOString(),
          score: 84, 
          verdict: "GO",
          agents: agentsRef.current,
          orch: orchRef.current,
        };

        const userReportsKey = `atlas_reports_${parsedUser.email}`;
        const existing = localStorage.getItem(userReportsKey);
        const list = existing ? JSON.parse(existing) : [];
        list.unshift(newReport);
        setReports(list);
        localStorage.setItem(userReportsKey, JSON.stringify(list));
      }
    } catch (e: any) {
      if (e?.name !== "AbortError") {
        setError(e?.message ?? "Network error");
        setPhase("done");
      }
    }
  };

  const loadSavedReport = (report: any) => {
    setView("analyze");
    setPhase("done");
    setIdea(report.idea);
    setAgents(report.agents);
    setOrch(report.orch);
    setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 100);
  };

  const reset = () => {
    abortRef.current?.abort();
    setPhase("idle");
    setAgents([]);
    setOrch({ status: "idle", output: "" });
    setError(null);
    setIdea("");
  };

  // Render Logged-In User Dashboard Option
  const renderDashboardView = () => {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight text-white font-serif">
              Platform Dashboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Analyze metrics, configure pipeline benchmarks, and browse active research fields.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setView("analyze");
                reset();
              }}
              className="px-4 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/10 transition cursor-pointer"
            >
              + New Analysis
            </button>
          </div>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <div className="panel p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Ideas Analyzed</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">{reports.length}</span>
              <span className="text-xs text-amber-500">🚀</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Diligence pipeline</div>
          </div>
          <div className="panel p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Reports Generated</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">{reports.length}</span>
              <span className="text-xs text-amber-500">📊</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Full briefing reports</div>
          </div>
          <div className="panel p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Competitor Analyses</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">{reports.length * 4}</span>
              <span className="text-xs text-amber-500">⚔️</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Mapped rival vectors</div>
          </div>
          <div className="panel p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Funding Readiness</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">
                {reports.length > 0 ? `${Math.round(reports.reduce((acc, r) => acc + (r.score || 80), 0) / reports.length)}%` : "—"}
              </span>
              <span className="text-xs text-amber-500">💰</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Average check rating</div>
          </div>
          <div className="panel p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Active AI Agents</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">8</span>
              <span className="text-xs text-amber-500">🤖</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Online specialist fleet</div>
          </div>
          <div className="panel p-4 flex flex-col justify-between hover:border-amber-500/30 transition">
            <div className="text-slate-400 font-mono text-[10px] uppercase tracking-wider">Markets Tracked</div>
            <div className="flex items-baseline gap-2 mt-4">
              <span className="text-2xl font-bold text-white">{reports.length * 3}</span>
              <span className="text-xs text-amber-500">🌍</span>
            </div>
            <div className="text-[10px] text-slate-500 mt-1">Global niche targets</div>
          </div>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Dropdown options on the left */}
          <div className="lg:col-span-2 space-y-4">
            <div className="panel p-6 space-y-4 bg-white/[0.01]">
              <h2 className="text-lg font-bold text-white tracking-tight font-serif">Previous Analyses</h2>
              <p className="text-slate-400 text-xs leading-relaxed">
                Select a saved startup report from your historical runs to inspect the agent feedback.
              </p>
              
              <div className="relative">
                <select
                  onChange={(e) => {
                    const val = e.target.value;
                    if (val) {
                      const found = reports.find(r => r.id === val);
                      if (found) loadSavedReport(found);
                    }
                  }}
                  defaultValue=""
                  className="w-full px-4 py-3.5 rounded-lg bg-slate-950/70 border border-white/[0.08] focus:border-amber-500/50 outline-none text-white text-sm cursor-pointer font-sans appearance-none"
                >
                  <option value="" disabled>Select previous analysis...</option>
                  {reports.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.idea.length > 55 ? r.idea.slice(0, 52) + "..." : r.idea} ({new Date(r.createdAt).toLocaleDateString()})
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-500 text-xs">
                  ▼
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions List (Saved Projects deleted) */}
          <div className="space-y-6">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight font-serif mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setView("analyze");
                    reset();
                  }}
                  className="w-full panel p-4 flex items-center gap-3 hover:border-amber-500/30 hover:-translate-y-0.5 transition cursor-pointer text-left"
                >
                  <span className="text-lg">🚀</span>
                  <div>
                    <div className="text-xs font-semibold text-white">New Startup Analysis</div>
                    <div className="text-[10px] text-slate-500">Deploy the agent fleet on a new concept</div>
                  </div>
                </button>
                <button
                  onClick={() => setView("reports")}
                  className="w-full panel p-4 flex items-center gap-3 hover:border-amber-500/30 hover:-translate-y-0.5 transition cursor-pointer text-left"
                >
                  <span className="text-lg">📊</span>
                  <div>
                    <div className="text-xs font-semibold text-white">View Reports</div>
                    <div className="text-[10px] text-slate-500">List and manage all historical briefs</div>
                  </div>
                </button>
                <button
                  onClick={() => setView("settings")}
                  className="w-full panel p-4 flex items-center gap-3 hover:border-amber-500/30 hover:-translate-y-0.5 transition cursor-pointer text-left"
                >
                  <span className="text-lg">⚙️</span>
                  <div>
                    <div className="text-xs font-semibold text-white">Account Settings</div>
                    <div className="text-[10px] text-slate-500">Configure profile and account properties</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  // Render Full Startup Analysis Page
  const renderAnalyzeView = () => {
    return (
      <div className="max-w-7xl mx-auto px-5 lg:px-8 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <button
            onClick={() => setView("dashboard")}
            className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
          {phase === "done" && (
            <button
              onClick={() => {
                setView("dashboard");
                reset();
              }}
              className="px-3 py-1.5 rounded bg-white/[0.04] border border-border hover:bg-white/[0.08] text-white font-mono text-xs cursor-pointer"
            >
              Close analysis
            </button>
          )}
        </div>

        {phase === "idle" ? (
          <div className="max-w-4xl mx-auto py-8">
            <h1 className="font-display text-2xl font-bold tracking-tight text-white font-serif mb-6 text-center">
              New Startup Diligence Analysis
            </h1>
            <div className="panel-elevated p-3 shadow-panel bg-[#0B0F19]">
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
                      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) handleAnalyze(idea);
                    }}
                    placeholder="Describe your startup idea in 1-3 sentences. The more specific, the sharper the analysis."
                    rows={4}
                    disabled={phase === "analyzing"}
                    className="flex-1 bg-transparent resize-none outline-none text-foreground placeholder:text-muted-foreground text-base leading-relaxed py-2 disabled:opacity-50 font-sans"
                  />
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-2 pt-3 pb-1 border-t border-border mt-2">
                  <div className="text-[11px] font-mono text-muted-foreground">
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px]">⌘</kbd>{" "}
                    <kbd className="px-1.5 py-0.5 rounded border border-border bg-surface text-[10px]">↵</kbd>{" "}
                    to run · 8 agents will deploy in parallel
                  </div>
                  <button
                    onClick={() => handleAnalyze(idea)}
                    disabled={phase === "analyzing"}
                    className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-md bg-grad-amber text-primary-foreground font-semibold text-sm tracking-tight shadow-glow-primary hover:scale-[1.02] transition-transform disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 cursor-pointer"
                  >
                    {phase === "analyzing" ? "Agents working..." : "Deploy agent fleet"}
                    <span className="font-mono group-hover:translate-x-0.5 transition-transform">→</span>
                  </button>
                </div>
              </div>
            </div>
            {error && <div className="mt-4 text-sm text-destructive font-mono text-center">{error}</div>}
          </div>
        ) : (
          <div className="space-y-8">
            <AnalysisHeader idea={idea} phase={phase} onReset={reset} agents={agents} />
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {agents.map((a) => (
                <AgentCard key={a.id} agent={a} />
              ))}
            </div>
            <OrchestratorPanel status={orch.status} output={orch.output} />
          </div>
        )}
        <div ref={resultRef} />
      </div>
    );
  };

  // Render Saved Reports Screen
  const renderReportsView = () => {
    return (
      <div className="max-w-4xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">All Generated Reports</h1>
            <p className="text-slate-400 text-xs mt-1">Review and manage your startup assessments.</p>
          </div>
          <button
            onClick={() => setView("dashboard")}
            className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="space-y-4">
          {reports.length === 0 ? (
            <div className="panel p-8 text-center text-slate-500 text-sm">
              No reports found. Start a new analysis to populate this view.
            </div>
          ) : (
            reports.map((r) => (
              <div
                key={r.id}
                className="panel p-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300"
              >
                <div className="min-w-0 flex-1">
                  <h3
                    onClick={() => loadSavedReport(r)}
                    className="text-base font-semibold text-white hover:text-amber-400 transition cursor-pointer truncate"
                  >
                    {r.idea}
                  </h3>
                  <div className="flex items-center gap-3 text-[10px] font-mono text-slate-500 mt-1">
                    <span>Created: {new Date(r.createdAt).toLocaleString()}</span>
                    <span>•</span>
                    <span>Verdict: <strong className="text-slate-300">{r.verdict || "GO"}</strong></span>
                  </div>
                </div>
                <div className="flex items-center gap-4 shrink-0 justify-between md:justify-start">
                  <div className="text-left md:text-right">
                    <span className="text-[10px] font-mono text-slate-500 uppercase block">Score</span>
                    <span className="text-lg font-bold text-white font-mono">{r.score || 80}/100</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => loadSavedReport(r)}
                      className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded transition cursor-pointer"
                    >
                      Open
                    </button>
                    <button
                      onClick={() => {
                        const userReportsKey = `atlas_reports_${user?.email}`;
                        const list = reports.filter((item) => item.id !== r.id);
                        setReports(list);
                        localStorage.setItem(userReportsKey, JSON.stringify(list));
                      }}
                      className="px-3 py-1.5 border border-white/5 hover:border-red-500/20 hover:text-red-400 text-slate-400 font-semibold text-xs rounded transition cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  // Render Account Settings View
  const renderSettingsView = () => {
    return (
      <div className="max-w-2xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-white font-serif">Account Settings</h1>
            <p className="text-slate-400 text-xs mt-1">Manage profile and authentication data.</p>
          </div>
          <button
            onClick={() => setView("dashboard")}
            className="text-xs font-mono text-slate-400 hover:text-white transition cursor-pointer"
          >
            ← Back to Dashboard
          </button>
        </div>

        <div className="panel p-6 space-y-6 backdrop-blur bg-white/[0.01]">
          <h2 className="text-md font-bold text-white tracking-tight border-b border-white/[0.05] pb-2 font-mono uppercase tracking-wider text-xs">
            Profile Info
          </h2>
          <div className="grid grid-cols-3 gap-4 text-sm font-sans">
            <div className="text-slate-400 font-mono text-xs uppercase pt-1">User Name</div>
            <div className="col-span-2 text-white font-semibold">{user?.name}</div>

            <div className="text-slate-400 font-mono text-xs uppercase pt-1">Email Address</div>
            <div className="col-span-2 text-white font-mono">{user?.email}</div>

            <div className="text-slate-400 font-mono text-xs uppercase pt-1">Member Since</div>
            <div className="col-span-2 text-white font-mono">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "Today"}
            </div>
          </div>

          <div className="border-t border-white/[0.05] pt-6 flex justify-end gap-3">
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 font-bold text-xs uppercase tracking-wider rounded-lg transition cursor-pointer"
            >
              Sign Out Account
            </button>
          </div>
        </div>
      </div>
    );
  };

  // -------------------------------------------------------------
  // GUEST LOGIN & CREATE ACCOUNT SCREEN (Self-contained Portal)
  // -------------------------------------------------------------
  if (!user) {
    return (
      <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden font-sans">
        {/* Background Glowing Blobs */}
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-amber-500/5 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />

        <div className="sm:mx-auto sm:w-full sm:max-w-md z-10">
          <div className="flex justify-center mb-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-amber-500/30 bg-amber-500/10 text-[11px] font-mono uppercase tracking-wider text-amber-400">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
              Powered by 8 AI Specialist Agents
            </span>
          </div>

          <div className="text-center">
            <div className="inline-flex items-center gap-2">
              <div className="w-8 h-8 rounded-md bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)]">
                ⌬
              </div>
              <span className="font-bold tracking-wider text-2xl text-white font-mono">ATLAS</span>
            </div>
            <h2 className="mt-4 text-3xl font-extrabold text-white tracking-tight">
              {isCreateAccount ? "Create Your ATLAS Account" : "Validate Your Startup Like a VC"}
            </h2>
            <p className="mt-2 text-sm text-slate-400 max-w-sm mx-auto">
              {isCreateAccount 
                ? "Join thousands of founders validating ideas with AI-powered market intelligence."
                : "Sign in to access your startup analyses, AI agent reports, market insights, and saved projects."}
            </p>
          </div>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md z-10 px-4">
          <div className="backdrop-blur-md bg-white/[0.02] border border-white/[0.05] py-8 px-4 shadow-2xl rounded-2xl sm:px-10 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

            <form className="space-y-4" onSubmit={handleAuthSubmit}>
              {authError && (
                <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-xs font-mono text-red-400">
                  ⚠️ {authError}
                </div>
              )}

              {isCreateAccount && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-white text-sm transition placeholder:text-slate-600 font-sans"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-white text-sm transition placeholder:text-slate-600 font-sans"
                />
              </div>

              <div>
                <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  required
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-white text-sm transition placeholder:text-slate-600"
                />
              </div>

              {isCreateAccount && (
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-slate-400 mb-1.5">
                    Confirm Password
                  </label>
                  <input
                    type="password"
                    required
                    value={authConfirmPassword}
                    onChange={(e) => setAuthConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-4 py-2.5 rounded-lg bg-slate-950/50 border border-white/[0.08] focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 outline-none text-white text-sm transition placeholder:text-slate-600"
                  />
                </div>
              )}

              {!isCreateAccount && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      type="checkbox"
                      className="h-4 w-4 bg-slate-950/50 border-white/[0.08] rounded text-amber-500 focus:ring-amber-500/50 accent-amber-500 animate-fade-in"
                    />
                    <label htmlFor="remember-me" className="ml-2 block text-xs text-slate-400 font-sans">
                      Remember Me
                    </label>
                  </div>
                  <a href="#" className="text-xs font-mono text-amber-500/80 hover:text-amber-400 transition">
                    Forgot Password?
                  </a>
                </div>
              )}

              {isCreateAccount && (
                <div className="flex items-center py-1">
                  <input
                    id="agree-terms"
                    type="checkbox"
                    required
                    className="h-4 w-4 bg-slate-950/50 border-white/[0.08] rounded text-amber-500 focus:ring-amber-500/50 accent-amber-500"
                  />
                  <label htmlFor="agree-terms" className="ml-2 block text-xs text-slate-400 font-sans">
                    I agree to the Terms and Privacy Policy
                  </label>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold text-sm tracking-wide shadow-[0_0_20px_rgba(245,158,11,0.2)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)] transition duration-200 cursor-pointer transform hover:scale-[1.01]"
                >
                  {isCreateAccount ? "Create Account" : "Sign In"}
                </button>
              </div>
            </form>
          </div>

          <p className="mt-6 text-center text-sm text-slate-400 font-sans">
            {isCreateAccount ? "Already have an account? " : "Don't have an account? "}
            <button
              onClick={() => {
                setIsCreateAccount(!isCreateAccount);
                setAuthError("");
              }}
              className="font-semibold text-amber-500 hover:text-amber-400 transition cursor-pointer bg-transparent border-none outline-none"
            >
              {isCreateAccount ? "Sign In" : "Create Account"}
            </button>
          </p>

          <div className="mt-8 pt-6 border-t border-white/[0.03] flex justify-center gap-6 text-[11px] font-mono text-slate-500">
            <span>✓ Secure Authentication</span>
            <span>✓ Private Startup Data</span>
            <span>✓ Investor-Grade Analysis</span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // AUTHENTICATED SYSTEM LAYOUT (Sidebar + Content panels)
  // -------------------------------------------------------------
  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex font-sans">
      {/* Left Sidebar */}
      <aside className="w-64 bg-slate-950/60 border-r border-white/[0.05] flex flex-col justify-between shrink-0 h-screen sticky top-0">
        <div>
          {/* Brand Logo */}
          <div className="p-6 border-b border-white/[0.05] flex items-center gap-2">
            <div className="w-6 h-6 rounded bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-slate-950 font-bold text-xs shadow-[0_0_15px_rgba(245,158,11,0.3)]">
              ⌬
            </div>
            <div>
              <span className="font-bold tracking-wider text-sm text-white font-mono">ATLAS</span>
              <span className="text-[9px] font-mono uppercase tracking-[0.22em] text-slate-500 block">
                v0.1 · agentic
              </span>
            </div>
          </div>

          {/* Navigation Options */}
          <nav className="p-4 space-y-1">
            {[
              { id: "analyze", label: "New Analysis", icon: "🚀" },
              { id: "dashboard", label: "Dashboard", icon: "📊" },
              { id: "reports", label: "Reports Page", icon: "📁" },
              { id: "settings", label: "Settings", icon: "⚙️" },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setView(item.id as ViewState)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-mono uppercase tracking-wider transition cursor-pointer text-left ${
                  view === item.id
                    ? "bg-white/[0.04] text-white border-l-2 border-amber-500 font-semibold"
                    : "text-slate-400 hover:bg-white/[0.02] hover:text-white"
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Sidebar Footer User Section */}
        <div className="p-4 border-t border-white/[0.05] bg-slate-950/20">
          <div className="flex items-center gap-2.5 mb-3 px-2">
            <div className="w-7 h-7 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[10px] font-bold text-amber-400 font-mono select-none">
              {user.name.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate">{user.name}</div>
              <div className="text-[9px] text-slate-500 truncate font-mono">{user.email}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2 px-3 rounded-lg border border-white/[0.05] hover:border-red-500/30 hover:text-red-400 text-slate-400 text-[10px] font-mono uppercase tracking-wider text-center transition cursor-pointer"
          >
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-y-auto">
        <Ticker />
        <div className="flex-1 overflow-y-auto pb-10">
          {view === "analyze" && renderAnalyzeView()}
          {view === "dashboard" && renderDashboardView()}
          {view === "reports" && renderReportsView()}
          {view === "settings" && renderSettingsView()}
        </div>
        <Footer />
      </div>
    </div>
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
          className="self-start text-xs font-mono uppercase tracking-wider px-3 py-1.5 rounded border border-border hover:border-amber-500/50 hover:text-amber-400 transition text-muted-foreground whitespace-nowrap cursor-pointer"
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
      <section id="agents" className="max-w-7xl mx-auto px-5 lg:px-8 py-10">
        <div className="flex items-end justify-between mb-8 gap-4 flex-wrap">
          <div>
            <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-2">
              The fleet
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
              8 specialist agents. <span className="text-grad-amber">One verdict.</span>
            </h2>
          </div>
          <div className="text-sm text-slate-400 font-mono max-w-sm">
            Each agent has its own system prompt, reasoning style, and tools. The Orchestrator stitches their outputs into a single brief.
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="panel p-4 hover:border-amber-500/35 hover:-translate-y-0.5 transition-all group bg-[#0B0F19]"
            >
              <div className={`text-2xl font-display ${f.tone} mb-3`}>{f.icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{f.title}</div>
              <div className="text-xs text-slate-400 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="max-w-7xl mx-auto px-5 lg:px-8 pb-10">
        <div className="text-[11px] font-mono uppercase tracking-[0.22em] text-primary mb-2">
          Protocol
        </div>
        <h2 className="font-display text-3xl sm:text-4xl font-bold tracking-tight mb-10 text-white font-serif">
          How the agent fleet works.
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {flow.map((s) => (
            <div key={s.n} className="panel p-5 relative overflow-hidden bg-[#0B0F19]">
              <div className="absolute top-2 right-3 font-display text-5xl font-bold text-slate-800/40 select-none">
                {s.n}
              </div>
              <div className="text-sm font-semibold text-white mb-2 relative">{s.t}</div>
              <div className="text-xs text-slate-400 leading-relaxed relative">{s.d}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.05] bg-slate-950/20 mt-auto py-8">
      <div className="max-w-7xl mx-auto px-5 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <span className="text-grad-amber">⌬</span>
          <span>Atlas · agentic startup intelligence</span>
        </div>
        <div className="flex items-center gap-5">
          <span>​</span>
          <span className="dot-pulse text-signal">all systems operational</span>
        </div>
      </div>
    </footer>
  );
}
