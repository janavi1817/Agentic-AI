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

function generateDynamicMockResponses(idea: string): Record<string, string> {
  const cleanIdea = idea.replace(/["']/g, "").trim();
  
  // 1. Extract target audience
  let audience = "Early-stage founders and venture teams";
  const forMatch = cleanIdea.match(/for\s+([^,.\n]+)/i);
  if (forMatch && forMatch[1]) {
    audience = forMatch[1].trim();
  } else {
    const toMatch = cleanIdea.match(/to\s+([^,.\n]+)/i);
    if (toMatch && toMatch[1]) {
      audience = toMatch[1].trim();
    }
  }
  audience = audience.split(" ").slice(0, 8).join(" ");

  // 2. Identify industry & keywords
  let industry = "General SaaS Portal";
  let regulations = "GDPR, CCPA, and SOC 2 Type II data residency standards";
  let competitors = ["Salesforce", "HubSpot", "Notion", "Airtable"];
  let cagr = "18.6%";
  let tam = "$15.4 Billion";
  let sam = "$2.8 Billion";
  let score = 84;
  let verdict = "GO";

  const ideaLower = cleanIdea.toLowerCase();
  if (ideaLower.includes("lawyer") || ideaLower.includes("legal") || ideaLower.includes("attorney") || ideaLower.includes("contract")) {
    industry = "LegalTech SaaS";
    regulations = "ABA Ethics Guidelines, attorney-client privilege data security, and regional bar compliance";
    competitors = ["Clio", "Ironclad", "Harvey AI", "Luminance"];
    cagr = "24.5%";
    tam = "$8.5 Billion";
    sam = "$1.2 Billion";
    score = 82;
    verdict = "GO";
  } else if (ideaLower.includes("med") || ideaLower.includes("health") || ideaLower.includes("doctor") || ideaLower.includes("clinical") || ideaLower.includes("patient")) {
    industry = "Digital Health / HealthTech Solutions";
    regulations = "HIPAA Security Rule, FDA digital health certifications, and SOC2 compliance";
    competitors = ["Veeva Systems", "Athenahealth", "Oscar Health", "Teladoc"];
    cagr = "21.2%";
    tam = "$24.8 Billion";
    sam = "$4.1 Billion";
    score = 79;
    verdict = "EXPLORE";
  } else if (ideaLower.includes("finance") || ideaLower.includes("loan") || ideaLower.includes("bank") || ideaLower.includes("pay") || ideaLower.includes("credit") || ideaLower.includes("micro-loan") || ideaLower.includes("wallet")) {
    industry = "Fintech & Micro-Lending Pipelines";
    regulations = "AML/KYC guidelines, CFPB standards, SEC rules, and regional central bank licenses";
    competitors = ["Stripe", "Plaid", "Brex", "M-Pesa Business"];
    cagr = "19.8%";
    tam = "$18.2 Billion";
    sam = "$3.5 Billion";
    score = 75;
    verdict = "EXPLORE";
  } else if (ideaLower.includes("real estate") || ideaLower.includes("broker") || ideaLower.includes("property") || ideaLower.includes("house") || ideaLower.includes("rent")) {
    industry = "PropTech CRM & Lead Pipelines";
    regulations = "RERA compliance, Fair Housing Act guidelines, and regional transaction audits";
    competitors = ["Zillow Group", "PropTiger", "Housing.com", "CoStar"];
    cagr = "16.4%";
    tam = "$12.1 Billion";
    sam = "$2.2 Billion";
    score = 85;
    verdict = "GO";
  } else if (ideaLower.includes("tutor") || ideaLower.includes("education") || ideaLower.includes("student") || ideaLower.includes("school") || ideaLower.includes("learn") || ideaLower.includes("teach")) {
    industry = "EdTech Platform";
    regulations = "COPPA student data protection guidelines, FERPA standards, and local school board checks";
    competitors = ["Duolingo", "Coursera", "Udemy", "Guild Education"];
    cagr = "15.3%";
    tam = "$9.5 Billion";
    sam = "$1.8 Billion";
    score = 81;
    verdict = "GO";
  } else if (cleanIdea.length > 20) {
    industry = cleanIdea.split(" ").slice(0, 2).join(" ") + " Solution";
  }

  const MOCK_ORCHESTRATOR = `### Verdict
**${verdict}.** The workflow provides clear utility for ${audience}. The primary execution target should be securing the acquisition funnel before building excessive features.

### Investability Score
**${score}/100**
*Rationale:* Strong margins and CAC payback curves in the ${industry} space, though long-term retention loops need pressure-testing.

### Top 3 Strengths
1. Direct feature solving for key paints in **${audience}** workflows.
2. High LTV:CAC potential (>10x) driven by recurring models.
3. Fast execution loop requiring minimal initial engineering overhead.

### Top 3 Risks
1. High customer churn if users treat this as a single-use tool.
2. Data safety liability regarding client descriptions.
3. High concurrency hosting costs at scale.

### Next 90 Days Actions
1. Build a landing page collecting beta signups from ${audience}.
2. Run a closed test with 25 target users.
3. Incorporate zero-retention privacy protocols for sensitive information.
4. Establish partnership pipelines with regional accelerators.
5. Launch sharing tools to drive referrals.

### Killer Question
**"How will you prevent users from churning once their first few ideas are validated or invalidated?"**`;

  return {
    market: `### Market Size Estimate (TAM/SAM/SOM)
* **Total Addressable Market (TAM):** ${tam} (Global TAM for ${industry})
* **Serviceable Addressable Market (SAM):** ${sam} (Refined target cohort: ${audience})
* **Serviceable Obtainable Market (SOM):** $120M - $250M (Initial target segment)

### CAGR & Growth Projections
* **Estimated 5-Year CAGR:** ${cagr} (Driven by accelerated digitization)

### Top 3 Market Tailwinds
1. **Demand for Automated Workflows:** Increased reliance on AI-driven micro-services.
2. **Niche Focus:** Standard generalist CRMs yielding to custom vertical products.
3. **Data Security Push:** Operations migrating towards compliance-oriented software.

**Market Verdict: HOT** (Excellent timing with strong customer pull).`,

    competitor: `### Competitive Landscape

| Competitor | Stage | Strength | Weakness |
| :--- | :--- | :--- | :--- |
| **${competitors[0]}** | Late (Enterprise) | Broad database, giant sales | High costs, complex onboarding |
| **${competitors[1]}** | Growth / Mid | Powerful API integrations | Requires tech team to maintain |
| **${competitors[2]}** | Early | Fast initial setup | Generic static templates |
| **${competitors[3]}** | Seed | Simple interface | Lack of customized regional logic |

### White Space Opportunity
For your startup idea: **"${cleanIdea}"**, the primary white space lies in **niche agentic workflows for ${audience}**. Existing systems require manual setup. Automating this vertical with custom compliance templates bypasses standard integration bottlenecks.`,

    persona: `### Target Customer Personas

#### ICP 1: The Core Operator
* **Demographics:** Professionals aligning with ${audience}.
* **Pains:** Overwhelming manual tasks, lack of CRM alignment, poor tech integration.
* **Jobs-to-be-Done (JTBD):** Standardize leads workflow and automate decision triggers.
* **Channels:** Targeted search queries, industry communities, LinkedIn.

#### ICP 2: The Enterprise Director
* **Demographics:** Team leaders managing operations.
* **Pains:** Team compliance audits, poor data retention.
* **Jobs-to-be-Done (JTBD):** Manage client workflows safely with robust auditing features.
* **Channels:** Trade portals, direct referral syndicates.`,

    unit: `### Unit Economics Projection
* **Business Model:** B2B SaaS (Subscription license + credit tier)
* **Customer Acquisition Cost (CAC):** $35.00 - $65.00 per user
* **Average Revenue Per User (ARPU):** $29.00 - $79.00/month
* **Gross Margin:** 84% (Low infrastructure cost)
* **Monthly Churn Rate:** 3.8% (Targeting low initial churn)
* **Customer Lifetime Value (LTV):** $820.00
* **LTV:CAC Ratio:** 12.6x (Very healthy balance)
* **Payback Period:** 1.8 Months

**Unit Economics Verdict: HOT** (Strong margins and rapid CAC recovery).`,

    funding: `### Funding & Capital Strategy
* **Recommended Round:** Pre-Seed / Seed ($250K - $750K)
* **Use of Funds:**
  - 60% Workflow pipeline engineering
  - 20% Growth marketing targeting ${audience}
  - 20% Security certifications (SOC2)

### 5 Target Investor Archetypes
1. **Industry Angels:** Specialized venture partners working in ${industry}.
2. **Pre-seed VCs:** High-velocity micro-funds.
3. **PLG-focused Syndicates:** Accelerators backing self-serve SaaS products.
4. **AI Incubation Funds:** Funds targeting micro-agentic workflow platforms.
5. **Startup Accelerators:** High-traction cohort programs.

**1-Line Pitch Hook:** "Empowering ${audience} to automate critical operations with custom-orchestrated intelligence."`,

    swot: `### SWOT & Feasibility Analysis

#### Strengths
* **High Focus:** Custom-built for **${audience}**.
* **Rapid Deployment:** Instantly operational.
* **Capital Efficiency:** High software margins.

#### Weaknesses
* **API Dependencies:** High reliance on core model vendors.
* **Retention Risk:** Users churn once validation is complete.

#### Opportunities
* **White-label portals:** Licensing CRM pipelines to team managers.
* **Integration Store:** Native connects into legacy databases.

#### Threats
* **Big Tech:** Foundational LLMs offering generic templates.

**Feasibility Score: 8.5/10**
*Rationale:* Strong GTM alignment and low initial development cost make pre-seed viability very high.`,

    regulatory: `### Regulatory & Compliance Audit
* **Applicable Regulations:**
  - **Data Privacy Rules:** ${regulations}.
  - **Compliance Requirements:** SOC2 Type II certifications.
* **Licenses Needed:** Standard business incorporation; no specialized licensing.
* **Top 3 Risks:**
  1. **User IP Protection:** Ensuring custom business briefs do not enter public model training caches.
  2. **Data Retention Rules:** Aligning user logs with regional guidelines.
  3. **Operational Liability:** Disclaiming formal investment/financial advice in output logs.

**Regulatory Verdict: WARM** (Standard data protection guidelines apply; IP safety is critical).`,

    benchmark: `### Benchmark Startup Cases
* **Clio (LegalTech)** — Success — Scaled massively by targeting solo lawyers before expanding upmarket.
* **Apollo Agriculture (AgriTech)** — Success — Validated micro-lending via mobile wallet integrations.
* **BetaList (Startup Validator)** — Success — Proven traction verifying early-stage startup demand.`,

    orchestrator: MOCK_ORCHESTRATOR
  };
}

function sse(event: string, data: unknown) {
  return `event: ${event}\ndata: ${JSON.stringify(data)}\n\n`;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function streamMockAgent(
  id: string,
  name: string,
  icon: string,
  category: string,
  text: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
) {
  controller.enqueue(encoder.encode(sse("agent_start", { id, name, icon, category })));
  await delay(100);

  const chunkSize = 35;
  for (let i = 0; i < text.length; i += chunkSize) {
    const delta = text.slice(i, i + chunkSize);
    controller.enqueue(encoder.encode(sse("agent_delta", { id, delta })));
    await delay(35);
  }

  controller.enqueue(encoder.encode(sse("agent_done", { id })));
  await delay(20);
}

async function streamMockOrchestrator(
  text: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
) {
  controller.enqueue(encoder.encode(sse("orchestrator_start", {})));
  await delay(150);

  const chunkSize = 40;
  for (let i = 0; i < text.length; i += chunkSize) {
    const delta = text.slice(i, i + chunkSize);
    controller.enqueue(encoder.encode(sse("orchestrator_delta", { delta })));
    await delay(25);
  }

  controller.enqueue(encoder.encode(sse("orchestrator_done", {})));
  await delay(20);
}

async function handleMockStream(
  idea: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder
) {
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
        })
      )
    );

    const responses = generateDynamicMockResponses(idea);

    // Stream all 8 agents in parallel dynamically
    await Promise.all([
      streamMockAgent("market", "Market Analysis", "◈", "Intelligence", responses.market, controller, encoder),
      streamMockAgent("competitor", "Competitor Research", "⬡", "Intelligence", responses.competitor, controller, encoder),
      streamMockAgent("persona", "Customer Persona", "◎", "Go-To-Market", responses.persona, controller, encoder),
      streamMockAgent("unit", "Unit Economics", "$", "Financial", responses.unit, controller, encoder),
      streamMockAgent("funding", "Funding Strategy", "⇡", "Financial", responses.funding, controller, encoder),
      streamMockAgent("swot", "SWOT & Feasibility", "△", "Intelligence", responses.swot, controller, encoder),
      streamMockAgent("regulatory", "Regulatory & Compliance", "§", "Risk", responses.regulatory, controller, encoder),
      streamMockAgent("benchmark", "Benchmark Comparison", "≡", "Intelligence", responses.benchmark, controller, encoder),
    ]);

    // Stream orchestrator after all agents are done
    await streamMockOrchestrator(responses.orchestrator, controller, encoder);
    controller.enqueue(encoder.encode(sse("done", {})));
  } catch (err) {
    controller.enqueue(
      encoder.encode(
        sse("fatal", { error: err instanceof Error ? err.message : "Unknown error" })
      )
    );
  } finally {
    controller.close();
  }
}

async function streamAgent(
  agent: AgentDef,
  idea: string,
  controller: ReadableStreamDefaultController<Uint8Array>,
  encoder: TextEncoder,
  apiKey: string
) {
  controller.enqueue(
    encoder.encode(sse("agent_start", { id: agent.id, name: agent.name, icon: agent.icon, category: agent.category }))
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
      encoder.encode(sse("agent_error", { id: agent.id, status: resp.status, error: text.slice(0, 200) }))
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
  apiKey: string
) {
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

        const encoder = new TextEncoder();
        const apiKey = process.env.LOVABLE_API_KEY;

        if (!apiKey) {
          const stream = new ReadableStream<Uint8Array>({
            start(controller) {
              handleMockStream(idea, controller, encoder);
            },
          });
          return new Response(stream, {
            headers: {
              "Content-Type": "text/event-stream",
              "Cache-Control": "no-cache, no-transform",
              Connection: "keep-alive",
            },
          });
        }

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
                  })
                )
              );

              const outputs: { name: string; content: string }[] = [];
              const concurrency = 8; // Concurrency increased to run parallelly
              const results = await Promise.all(
                AGENTS.map((a) =>
                  streamAgent(a, idea, controller, encoder, apiKey).then((c) => ({ name: a.name, content: c }))
                )
              );
              outputs.push(...results);

              await streamOrchestrator(idea, outputs, controller, encoder, apiKey);
              controller.enqueue(encoder.encode(sse("done", {})));
            } catch (err) {
              controller.enqueue(
                encoder.encode(
                  sse("fatal", { error: err instanceof Error ? err.message : "Unknown error" })
                )
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
