const stats = [
  ["10M+", "Happy athletes"],
  ["100+", "Products"],
  ["50+", "Sport events"],
  ["20+", "Countries"],
  ["2015", "Est. year"]
];

export function StatsStrip() {
  return (
    <section className="bg-neutral-950 text-white" aria-label="Brand highlights">
      <div className="container-page grid grid-cols-2 gap-px py-1 sm:grid-cols-5">
        {stats.map(([value, label]) => (
          <div key={label} className="bg-white/[0.04] px-4 py-6 text-center">
            <div className="font-display text-4xl font-black text-brand-orange sm:text-5xl">{value}</div>
            <div className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/55">{label}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
