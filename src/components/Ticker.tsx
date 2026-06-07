const TICKS = [
  { k: "TAM", v: "$2.4T", d: "+12%" },
  { k: "SEED.MED", v: "$2.8M", d: "+8%" },
  { k: "SERIES-A", v: "$14M", d: "−3%" },
  { k: "VC.DRY-PWDR", v: "$1.1T", d: "flat" },
  { k: "AI.STARTUPS", v: "47K", d: "+22%" },
  { k: "PMF.RATE", v: "11%", d: "+1%" },
  { k: "Y-COMB.S25", v: "208", d: "+14" },
  { k: "VALU.MED", v: "$24M", d: "−6%" },
];

export function Ticker() {
  const items = [...TICKS, ...TICKS];
  return (
    <div className="border-y border-border bg-surface/60 backdrop-blur overflow-hidden ticker-strip">
      <div className="flex gap-10 py-2 px-6 whitespace-nowrap animate-[ticker_45s_linear_infinite] font-mono text-[11px]">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            <span className="text-muted-foreground tracking-wider">{t.k}</span>
            <span className="text-foreground font-semibold">{t.v}</span>
            <span
              className={
                t.d.startsWith("+")
                  ? "text-signal"
                  : t.d.startsWith("−") || t.d.startsWith("-")
                    ? "text-destructive"
                    : "text-muted-foreground"
              }
            >
              {t.d}
            </span>
            <span className="text-border">·</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-50%) } }`}</style>
    </div>
  );
}
