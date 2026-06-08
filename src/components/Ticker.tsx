const TICKS = [
  { text: "15,247 IDEAS VALIDATED", icon: "🚀" },
  { text: "28,431 MARKET REPORTS GENERATED", icon: "📊" },
  { text: "19,874 COMPETITOR ANALYSES COMPLETED", icon: "⚔️" },
  { text: "FUNDING INSIGHTS LIVE", icon: "💰" },
  { text: "8 SPECIALIST AGENTS ACTIVE", icon: "🤖" },
  { text: "150+ MARKETS TRACKED", icon: "🌍" },
  { text: "RESULTS IN 90 SECONDS", icon: "⏱" },
];

export function Ticker() {
  const items = [...TICKS, ...TICKS, ...TICKS];
  return (
    <div className="border-b border-border bg-slate-950/80 backdrop-blur py-2.5 overflow-hidden ticker-strip text-[10px] uppercase font-mono tracking-widest text-slate-400 z-50 relative">
      <div className="flex gap-12 whitespace-nowrap animate-[ticker_30s_linear_infinite]">
        {items.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-2.5">
            <span>{t.icon}</span>
            <span className="text-slate-200 font-semibold">{t.text}</span>
            <span className="text-slate-700 font-bold">•</span>
          </span>
        ))}
      </div>
      <style>{`@keyframes ticker { from { transform: translateX(0) } to { transform: translateX(-33.33%) } }`}</style>
    </div>
  );
}
