import { Palette } from "lucide-react";
import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { THEMES } from "./ThemeProvider";
import { useTheme as useNextThemes } from "next-themes";

export function ThemeSelector() {
  const { theme, setTheme } = useNextThemes();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative">
        <Palette className="w-5 h-5" />
        <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="p-2 text-muted-foreground hover:text-foreground transition-colors relative group">
          <Palette className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56 p-3 ">
        {/* <div className="mb-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
                        Chế độ giao diện
                    </p>
                </div>
                <DropdownMenuItem
                    onClick={() => setTheme("light")}
                    className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer focus:bg-muted"
                >
                    <div className="w-6 h-6 rounded-full bg-white border border-border flex items-center justify-center">
                        <span className="text-[10px]">☀️</span>
                    </div>
                    <span className={`text-sm font-medium ${theme === "light" ? "text-foreground" : "text-muted-foreground"}`}>
                        Sáng
                    </span>
                    {theme === "light" && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => setTheme("dark")}
                    className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer focus:bg-muted"
                >
                    <div className="w-6 h-6 rounded-full bg-zinc-900 border border-border flex items-center justify-center">
                        <span className="text-[10px]">🌙</span>
                    </div>
                    <span className={`text-sm font-medium ${theme === "dark" ? "text-foreground" : "text-muted-foreground"}`}>
                        Tối
                    </span>
                    {theme === "dark" && (
                        <div className="ml-auto w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                </DropdownMenuItem> */}
        <div className="mb-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-1">
            Màu chủ đề
          </p>
        </div>
        <div className="grid grid-cols-1 gap-1 max-h-[80dvh] md:max-h-[none] overflow-y-auto">
          {THEMES.map((t) => {
            const isActive = theme === t.id;
            return (
              <DropdownMenuItem
                key={t.id}
                onClick={() => {
                  setTheme(t.id);
                }}
                className="flex items-center gap-3 px-2 py-2 rounded-md cursor-pointer focus:bg-muted"
              >
                <div
                  className="w-6 h-6 rounded-full flex-shrink-0 transition-all"
                  style={{
                    backgroundColor: t.color,
                  }}
                />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-muted-foreground">
                    {t.name}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {t.description}
                  </span>
                </div>
                {isActive && (
                  <div className="ml-auto w-2 h-2 rounded-full bg-primary" />
                )}
              </DropdownMenuItem>
            );
          })}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
