import { Search, Bell, User, Menu } from "lucide-react";
import { useState } from "react";
import { categories, genres, countries } from "@/data/movies";

export default function SiteHeader() {
  const [searchOpen, setSearchOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-md border-b border-border/50">
      <div className="max-w-[1400px] mx-auto px-4">
        {/* Top bar */}
        <div className="flex items-center justify-between h-14">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-sm">TP</span>
              </div>
              <span className="text-foreground font-bold text-lg tracking-tight">ThiaPhim</span>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {searchOpen ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Tìm phim, diễn viên..."
                  className="bg-secondary text-foreground px-4 py-2 rounded-full text-sm w-64 outline-none border border-border focus:border-primary/50 transition-colors"
                  autoFocus
                  onBlur={() => setSearchOpen(false)}
                />
                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              </div>
            ) : (
              <button onClick={() => setSearchOpen(true)} className="p-2 text-muted-foreground hover:text-foreground transition-colors">
                <Search className="w-5 h-5" />
              </button>
            )}
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
            </button>
            <button className="p-2 text-muted-foreground hover:text-foreground transition-colors">
              <User className="w-5 h-5" />
            </button>
          </div>

          <button className="md:hidden p-2 text-muted-foreground">
            <Menu className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex items-center gap-1 pb-2 overflow-x-auto scrollbar-hide">
          <span className="text-sm text-muted-foreground mr-2 whitespace-nowrap">Tìm đang xem gì?</span>
          {categories.map((cat, i) => (
            <button
              key={cat}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                i === 0
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted"
              }`}
            >
              {cat}
            </button>
          ))}
        </nav>

        {/* Sub navigation */}
        <div className="flex items-center gap-4 pb-2 overflow-x-auto scrollbar-hide text-xs">
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Thể loại:</span>
            {genres.slice(0, 5).map((g) => (
              <button key={g} className="text-secondary-foreground hover:text-primary transition-colors whitespace-nowrap">{g}</button>
            ))}
          </div>
          <span className="text-border">|</span>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground">Quốc gia:</span>
            {countries.slice(0, 4).map((c) => (
              <button key={c} className="text-secondary-foreground hover:text-primary transition-colors whitespace-nowrap">{c}</button>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}
