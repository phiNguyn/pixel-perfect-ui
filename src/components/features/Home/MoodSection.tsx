import { categories } from "@/data/movies";
import Link from "next/link";

export default function MoodSection() {
  return (
    <section className="py-4">
      <div className="max-w-[1400px] mx-auto px-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-3">
          Danh sách
        </h2>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {categories.map((mood) => (
            <Link href={`/danh-sach/${mood.key}`}
              key={mood.key}
              className={`bg-secondary/80 backdrop-blur-sm" px-5 py-2.5 rounded-full text-sm font-semibold whitespace-nowrap transition-all `}
            >
              {mood.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}