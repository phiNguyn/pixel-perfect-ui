import { moods } from "@/data/movies";

export default function MoodSection() {
  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-3">
          Tâm Trạng Của Bạn
        </h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {moods.map((mood) => (
            <button
              key={mood.label}
              className={`px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all ${
                mood.color === "destructive"
                  ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
                  : mood.color === "accent"
                  ? "bg-accent/20 text-accent hover:bg-accent/30"
                  : mood.color === "primary"
                  ? "bg-primary/20 text-primary hover:bg-primary/30"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {mood.label}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
