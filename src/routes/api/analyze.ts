import { createFileRoute } from "@tanstack/react-router";

type AgentDef = {
  id: string;
  name: string;
  icon: string;
  category: string;
  system: string;
  userTemplate: (idea: string) => string;
};

const AGENTS: AgentDef[] = [
  {
    id: "market",
    name: "Market Analysis",
    icon: "◈",
    category: "Intelligence",
    system:
      "You are a Market Analyst agent. Estimate TAM/SAM/SOM, growth rate, and key tailwinds for the idea. Be specific with numbers (cite ranges). Use markdown with concise bullet points and a short verdict line.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nProduce:\n- TAM / SAM / SOM (with ranges in $)\n- 5-year CAGR estimate\n- Top 3 macro tailwinds\n- 1-line market verdict (HOT / WARM / COLD).`,
  },
  {
    id: "competitor",
    name: "Competitor Research",
    icon: "⬡",
    category: "Intelligence",
    system:
      "You are a Competitor Research agent. Identify 4-6 real competitors and how the idea differentiates. Be concrete; reference real company names you are confident about.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nProduce a markdown table | Competitor | Stage | Strength | Weakness |. Then a short 'White space' paragraph (≤60 words).`,
  },
  {
    id: "persona",
    name: "Customer Persona",
    icon: "◎",
    category: "Go-To-Market",
    system:
      "You are a Customer Persona agent. Generate 3 sharp ICPs with name-tag, demographics, pains, jobs-to-be-done, and where to reach them.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nReturn 3 ICPs as markdown sections with: Tag, Demographics, Pains, JTBD, Channels.`,
  },
  {
    id: "unit",
    name: "Unit Economics",
    icon: "$",
    category: "Financial",
    system:
      "You are a Unit Economics agent. Model CAC, LTV, gross margin, churn and payback using realistic benchmarks for the business model.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nReturn:\n- Assumed model (SaaS / marketplace / D2C / etc)\n- CAC estimate\n- ARPU\n- Gross margin %\n- Monthly churn %\n- LTV\n- LTV:CAC ratio\n- Payback months\n- 1-line verdict.`,
  },
  {
    id: "funding",
    name: "Funding Strategy",
    icon: "⇡",
    category: "Financial",
    system:
      "You are a Funding Strategy agent. Recommend the right stage, check size, and 5 specific investor archetypes.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nProduce:\n- Recommended round (Pre-seed / Seed / Series A) + check size $\n- Use of funds (3 bullets)\n- 5 specific investor archetypes or named funds that fit\n- 1-line pitch hook.`,
  },
  {
    id: "swot",
    name: "SWOT & Feasibility",
    icon: "△",
    category: "Intelligence",
    system:
      "You are a SWOT & Feasibility agent. Produce a tight SWOT plus a 1-10 feasibility score with rationale.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nReturn:\n**Strengths**, **Weaknesses**, **Opportunities**, **Threats** (3 bullets each)\nThen: **Feasibility Score: X/10** + one sentence why.`,
  },
  {
    id: "regulatory",
    name: "Regulatory & Compliance",
    icon: "§",
    category: "Risk",
    system:
      "You are a Regulatory & Compliance agent. Identify applicable laws, licenses, and risks by industry and likely geography.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nReturn:\n- Applicable regulations (GDPR, HIPAA, PCI, SEBI, FDA, etc. — only the relevant ones)\n- Licenses likely needed\n- Top 3 compliance risks\n- 1-line risk verdict.`,
  },
  {
    id: "benchmark",
    name: "Benchmark Comparison",
    icon: "≡",
    category: "Intelligence",
    system:
      "You are a Benchmark Comparison agent. Find 2-3 real companies that launched a similar idea and what happened.",
    userTemplate: (idea) =>
      `Idea: ${idea}\n\nReturn 2-3 real companies as markdown bullets:\n**Name** — outcome (success / pivot / failure) — 1-line lesson.`,
  },
];

const ORCHESTRATOR_SYSTEM = `You are the Orchestrator agent — the chief-of-staff for a startup analysis. After all specialist agent outputs are gathered, you synthesize them into an executive verdict.`;

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

async function streamAgent(
  agent: AgentDef,
  idea: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
) {
  const apiKey = process.env.LOVABLE_API_KEY;
  if (!apiKey) throw new Error("LOVABLE_API_KEY missing");

  controller.enqueue(
    encoder.encode(sse("agent_start", { id: agent.id, name: agent.name, icon: agent.icon, category: agent.category })),
  );

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      stream: true,
      messages: [
        { role: "system", content: agent.system },
        { role: "user", content: agent.userTemplate(idea) },
      ],
    }),
  });

  if (!resp.ok || !resp.body) {
    const text = await resp.text().catch(() => "");
    controller.enqueue(
      encoder.encode(sse("agent_error", { id: agent.id, status: resp.status, error: text.slice(0, 200) })),
    );
    return "";
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";
  let full = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (delta) {
          full += delta;
          controller.enqueue(encoder.encode(sse("agent_delta", { id: agent.id, delta })));
        }
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }

  controller.enqueue(encoder.encode(sse("agent_done", { id: agent.id })));
  return full;
}

async function streamOrchestrator(
  idea: string,
  agentOutputs: { name: string; content: string }[],
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
) {
  const apiKey = process.env.LOVABLE_API_KEY!;
  controller.enqueue(encoder.encode(sse("orchestrator_start", {})));

  const synthesis = agentOutputs
    .map((a) => `## ${a.name}\n${a.content}`)
    .join("\n\n---\n\n");

  const resp = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-3-flash-preview",
      stream: true,
      messages: [
        { role: "system", content: ORCHESTRATOR_SYSTEM },
        {
          role: "user",
          content: `Startup idea: ${idea}\n\nSpecialist agent reports:\n${synthesis}\n\nSynthesize into a sharp executive brief with these markdown sections:\n### Verdict\n(2 sentences. GO / EXPLORE / KILL.)\n### Investability Score\n(X/100 with 1-line rationale)\n### Top 3 Strengths\n### Top 3 Risks\n### Next 90 Days\n(5 numbered actions)\n### Killer Question\n(One question the founder MUST answer before raising.)`,
        },
      ],
    }),
  });

  if (!resp.ok || !resp.body) {
    controller.enqueue(encoder.encode(sse("orchestrator_error", { status: resp.status })));
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buf = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });
    let idx: number;
    while ((idx = buf.indexOf("\n")) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith("\r")) line = line.slice(0, -1);
      if (!line.startsWith("data: ")) continue;
      const jsonStr = line.slice(6).trim();
      if (jsonStr === "[DONE]") continue;
      try {
        const parsed = JSON.parse(jsonStr);
        const delta = parsed.choices?.[0]?.delta?.content as string | undefined;
        if (delta) controller.enqueue(encoder.encode(sse("orchestrator_delta", { delta })));
      } catch {
        buf = line + "\n" + buf;
        break;
      }
    }
  }
  controller.enqueue(encoder.encode(sse("orchestrator_done", {})));
}

export const Route = createFileRoute("/api/analyze")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let idea = "";
        try {
          const body = (await request.json()) as { idea?: string };
          idea = (body.idea ?? "").toString().slice(0, 2000).trim();
        } catch {
          return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400 });
        }
        if (!idea || idea.length < 8) {
          return new Response(JSON.stringify({ error: "Idea is too short" }), { status: 400 });
        }

        const apiKey = process.env.LOVABLE_API_KEY;
        if (!apiKey) {
          return new Response(JSON.stringify({ error: "AI not configured" }), { status: 500 });
        }

        const encoder = new TextEncoder();
        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            try {
              controller.enqueue(
                encoder.encode(
                  sse("init", {
                    idea,
                    agents: AGENTS.map((a) => ({
                      id: a.id,
                      name: a.name,
                      icon: a.icon,
                      category: a.category,
                    })),
                  }),
                ),
              );

              // Run agents in pairs (concurrent) to avoid overwhelming the gateway, but keep streaming snappy
              const outputs: { name: string; content: string }[] = [];
              const concurrency = 3;
              for (let i = 0; i < AGENTS.length; i += concurrency) {
                const batch = AGENTS.slice(i, i + concurrency);
                const results = await Promise.all(
                  batch.map((a) => streamAgent(a, idea, controller, encoder).then((c) => ({ name: a.name, content: c }))),
                );
                outputs.push(...results);
              }

              await streamOrchestrator(idea, outputs, controller, encoder);
              controller.enqueue(encoder.encode(sse("done", {})));
            } catch (err) {
              controller.enqueue(
                encoder.encode(
                  sse("fatal", { error: err instanceof Error ? err.message : "Unknown error" }),
                ),
              );
            } finally {
              controller.close();
            }
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/event-stream",
            "Cache-Control": "no-cache, no-transform",
            Connection: "keep-alive",
          },
        });
      },
    },
  },
});
