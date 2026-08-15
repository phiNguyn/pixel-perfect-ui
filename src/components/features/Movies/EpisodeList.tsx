"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Play, Search, X } from "lucide-react";
import { Episode } from "@/lib/api/movies/movieInterface";
import { cn, normalizeEpisode, parseEpisodeNumber } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const GROUP_THRESHOLD = 50;

function getGroupSize(total: number): number {
  if (total > 200) return 100;
  if (total > GROUP_THRESHOLD) return 50;
  return total;
}

interface EpisodeRange {
  label: string;
  episodes: Episode[];
}

function buildRanges(episodes: Episode[]): EpisodeRange[] {
  const valid = episodes.filter((ep) => ep.slug);
  if (valid.length <= GROUP_THRESHOLD) {
    return [{ label: "Tất cả", episodes: valid }];
  }

  const sorted = [...valid].sort(
    (a, b) => parseEpisodeNumber(a.name) - parseEpisodeNumber(b.name),
  );

  const groupSize = getGroupSize(sorted.length);
  const ranges: EpisodeRange[] = [];

  for (let i = 0; i < sorted.length; i += groupSize) {
    const chunk = sorted.slice(i, i + groupSize);
    const firstNum = parseEpisodeNumber(chunk[0].name);
    const lastNum = parseEpisodeNumber(chunk[chunk.length - 1].name);
    const label =
      firstNum && lastNum
        ? `${firstNum} – ${lastNum}`
        : `${i + 1} – ${i + chunk.length}`;

    ranges.push({ label, episodes: chunk });
  }

  return ranges;
}

function findRangeIndex(ranges: EpisodeRange[], ep: Episode): number {
  const idx = ranges.findIndex((r) =>
    r.episodes.some((e) => e.slug === ep.slug),
  );
  return idx >= 0 ? idx : 0;
}

interface EpisodeListProps {
  episodes: Episode[];
  selectedEp?: Episode;
  onSelectEp: (ep: Episode) => void;
}

export default function EpisodeList({
  episodes,
  selectedEp,
  onSelectEp,
}: EpisodeListProps) {
  const [search, setSearch] = useState("");
  const [activeRangeIndex, setActiveRangeIndex] = useState(0);
  const selectedRef = useRef<HTMLButtonElement>(null);

  const ranges = useMemo(() => buildRanges(episodes), [episodes]);
  const validCount = useMemo(
    () => episodes.filter((ep) => ep.slug).length,
    [episodes],
  );
  const useRanges = validCount > GROUP_THRESHOLD;

  useEffect(() => {
    if (!selectedEp || !useRanges || search) return;
    setActiveRangeIndex(findRangeIndex(ranges, selectedEp));
  }, [selectedEp?.slug, ranges, useRanges, search]);

  const filteredEpisodes = useMemo(() => {
    const valid = episodes.filter((ep) => ep.slug);
    if (!search.trim()) {
      return useRanges ? (ranges[activeRangeIndex]?.episodes ?? []) : valid;
    }

    const query = search.trim();
    return valid.filter((ep) => {
      const num = normalizeEpisode(ep.name);
      return (
        num.includes(query) ||
        ep.name.toLowerCase().includes(query.toLowerCase())
      );
    });
  }, [episodes, search, useRanges, ranges, activeRangeIndex]);

  useEffect(() => {
    if (!search && selectedEp) {
      selectedRef.current?.scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }, [activeRangeIndex, selectedEp?.slug, search]);

  const handleSelect = (ep: Episode) => {
    onSelectEp(ep);
    if (search) {
      setSearch("");
      if (useRanges) {
        setActiveRangeIndex(findRangeIndex(ranges, ep));
      }
    }
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== "Enter" || filteredEpisodes.length === 0) return;
    const query = search.trim();
    const exact = filteredEpisodes.find(
      (ep) => normalizeEpisode(ep.name) === query,
    );
    handleSelect(exact ?? filteredEpisodes[0]);
  };

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        <Input
          type="text"
          inputMode="numeric"
          placeholder="Tìm theo số tập..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleSearchKeyDown}
          className="pl-9 pr-9 h-9 text-sm"
        />
        {search && (
          <button
            type="button"
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Xóa tìm kiếm"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {useRanges && !search && (
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent">
          {ranges.map((range, idx) => (
            <Button
              key={range.label}
              size="sm"
              variant={activeRangeIndex === idx ? "default" : "secondary"}
              className="shrink-0 h-8 text-xs font-medium"
              onClick={() => setActiveRangeIndex(idx)}
            >
              {range.label}
            </Button>
          ))}
        </div>
      )}

      {search && (
        <p className="text-xs text-muted-foreground">
          {filteredEpisodes.length > 0
            ? `Tìm thấy ${filteredEpisodes.length} tập`
            : `Không tìm thấy tập "${search}"`}
        </p>
      )}

      {filteredEpisodes.length > 0 && (
        <div
          className={cn(
            "grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-2",
            useRanges &&
              !search &&
              "max-h-[360px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent",
          )}
        >
          {filteredEpisodes.map((item, idx) => (
            <button
              aria-label={item.name}
              name={item.name}
              key={`${item.slug}-${idx}`}
              ref={selectedEp?.slug === item.slug ? selectedRef : undefined}
              onClick={() => handleSelect(item)}
              className={cn(
                "flex items-center justify-center gap-1 py-2.5 px-1.5 rounded text-xs font-medium transition-colors",
                selectedEp?.slug === item.slug
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary text-secondary-foreground hover:bg-muted",
              )}
            >
              <Play className="w-2.5 h-2.5 shrink-0" />
              {"Tập " + normalizeEpisode(item.name)}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
