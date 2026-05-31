import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { categories } from "@/data/movies";
import Link from "next/link";

export default function MoodSection() {
  return (
    <section className="py-4">
      <div className="max-w-[1560px] mx-auto px-4">
        <h2 className="text-lg font-semibold text-foreground tracking-tight mb-3">
          Danh sách
        </h2>
        <ScrollArea >
          <div className="flex gap-3 pb-4">
            {categories.map((mood) => (
              <Link
                href={`/danh-sach/${mood.key}`}
                key={mood.key}
                className={`bg-secondary/80 backdrop-blur-sm px-5 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all `}
              >
                {mood.label}
              </Link>
            ))}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>
    </section>
  );
}