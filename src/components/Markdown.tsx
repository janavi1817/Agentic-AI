import { useMemo } from "react";

/**
 * Tiny markdown renderer — no external deps. Supports:
 * headings (#, ##, ###), bold (**), italic (*), inline `code`, lists (-, *, 1.),
 * tables (| col | col |), hr (---), and paragraphs. Good enough for agent output.
 */
function escapeHtml(s: string) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function inline(text: string) {
  let s = escapeHtml(text);
  s = s.replace(/`([^`]+)`/g, '<code class="px-1 py-0.5 rounded bg-muted text-signal font-mono text-[0.85em]">$1</code>');
  s = s.replace(/\*\*([^*]+)\*\*/g, '<strong class="text-foreground font-semibold">$1</strong>');
  s = s.replace(/(^|[^*])\*([^*\n]+)\*/g, '$1<em class="text-foreground/90">$2</em>');
  return s;
}

function render(md: string): string {
  const lines = md.replace(/\r\n/g, "\n").split("\n");
  const out: string[] = [];
  let i = 0;

  const flushPara = (buf: string[]) => {
    if (!buf.length) return;
    out.push(`<p class="text-foreground/85 leading-relaxed">${inline(buf.join(" "))}</p>`);
    buf.length = 0;
  };

  let paraBuf: string[] = [];

  while (i < lines.length) {
    const line = lines[i];

    if (/^\s*$/.test(line)) {
      flushPara(paraBuf);
      i++;
      continue;
    }

    // hr
    if (/^---+\s*$/.test(line)) {
      flushPara(paraBuf);
      out.push('<hr class="my-3 border-border" />');
      i++;
      continue;
    }

    // heading
    const h = /^(#{1,4})\s+(.*)$/.exec(line);
    if (h) {
      flushPara(paraBuf);
      const lvl = h[1].length;
      const sizes = ["text-xl", "text-lg", "text-base", "text-sm"];
      out.push(
        `<h${lvl} class="font-display ${sizes[lvl - 1]} font-semibold text-foreground mt-3 mb-1 tracking-tight">${inline(h[2])}</h${lvl}>`,
      );
      i++;
      continue;
    }

    // table
    if (/^\s*\|.*\|\s*$/.test(line) && i + 1 < lines.length && /^\s*\|?\s*[-:| ]+\|/.test(lines[i + 1])) {
      flushPara(paraBuf);
      const header = line.trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim());
      i += 2;
      const rows: string[][] = [];
      while (i < lines.length && /^\s*\|.*\|\s*$/.test(lines[i])) {
        rows.push(lines[i].trim().replace(/^\||\|$/g, "").split("|").map((c) => c.trim()));
        i++;
      }
      out.push(
        `<div class="overflow-x-auto my-2"><table class="w-full text-xs border border-border rounded-md overflow-hidden">` +
          `<thead class="bg-muted/40"><tr>${header.map((h) => `<th class="text-left px-2 py-1.5 font-mono text-muted-foreground uppercase tracking-wider text-[10px] border-b border-border">${inline(h)}</th>`).join("")}</tr></thead>` +
          `<tbody>${rows.map((r) => `<tr class="border-b border-border/50 last:border-0">${r.map((c) => `<td class="px-2 py-1.5 text-foreground/85 align-top">${inline(c)}</td>`).join("")}</tr>`).join("")}</tbody>` +
          `</table></div>`,
      );
      continue;
    }

    // list
    if (/^\s*([-*+]|\d+\.)\s+/.test(line)) {
      flushPara(paraBuf);
      const ordered = /^\s*\d+\.\s+/.test(line);
      const items: string[] = [];
      while (i < lines.length && /^\s*([-*+]|\d+\.)\s+/.test(lines[i])) {
        items.push(lines[i].replace(/^\s*([-*+]|\d+\.)\s+/, ""));
        i++;
      }
      const tag = ordered ? "ol" : "ul";
      const cls = ordered ? "list-decimal" : "list-disc";
      out.push(
        `<${tag} class="${cls} list-outside pl-5 space-y-1 my-1.5 marker:text-primary/70">${items.map((it) => `<li class="text-foreground/85">${inline(it)}</li>`).join("")}</${tag}>`,
      );
      continue;
    }

    paraBuf.push(line.trim());
    i++;
  }
  flushPara(paraBuf);
  return out.join("\n");
}

export function Markdown({ content, className }: { content: string; className?: string }) {
  const html = useMemo(() => render(content || ""), [content]);
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
