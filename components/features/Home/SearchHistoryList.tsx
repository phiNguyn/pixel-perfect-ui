"use client";

import { useHistoryStore } from '@/stores/useHistoryStore';
import { X, Clock, Trash2, SearchX } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Empty from '@/components/Common/Empty';

interface SearchHistoryListProps {
  onSelect?: () => void;
}

function formatTimeAgo(timestamp: number) {
  const diff = Date.now() - timestamp;
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return 'Vừa xong';
  if (minutes < 60) return `${minutes}p trước`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h trước`;
  const days = Math.floor(hours / 24);
  return `${days}d trước`;
}

export default function SearchHistoryList({ onSelect }: SearchHistoryListProps) {
  const { searchHistory, removeSearchHistory, clearSearchHistory } = useHistoryStore();

  if (searchHistory.length === 0) return (
    <Empty
      icon={SearchX}
      title="Không có lịch sử tìm kiếm"
      description="Những phim bạn tìm kiếm sẽ hiển thị tại đây."
    />
  );

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between px-1 mb-1">
        <span className="text-xs font-medium text-muted-foreground flex items-center gap-1">
          <Clock className="w-3 h-3" />Tìm kiếm gần đây
        </span>
        <Button
          variant="outline"
          size="sm"
          className="text-[10px] text-muted-foreground hover:text-destructive h-6 px-2"
          onClick={clearSearchHistory}
        >
          <Trash2 className="w-3 h-3 mr-1" /> Xoá
        </Button>
      </div>
      {searchHistory.map((item) => (
        <div key={item.slug} className="flex items-center gap-2 group">
          <Link
            href={`/phim/${item.slug}`}
            onClick={onSelect}
            className="flex items-center gap-2 flex-1 p-1.5 rounded-md hover:bg-muted/50 transition-colors"
          >
            <img
              src={`https://img.ophim.live/uploads/movies/${item.thumb_url}`}
              alt={item.name}
              className="w-8 h-11 rounded object-cover flex-shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground line-clamp-1">{item.name}</p>
              <p className="text-[10px] text-muted-foreground">{item.year} · {item.episode_current}</p>
            </div>
            <span className="text-[9px] text-muted-foreground whitespace-nowrap">{formatTimeAgo(item.searchedAt)}</span>
          </Link>
          <Button
            size='icon'
            variant='secondary'
            onClick={() => removeSearchHistory(item.slug)}
            className="rounded-md text-muted-foreground transition-all"
          >
            <X className="w-3 h-3" />
          </Button>
        </div>
      ))}
    </div>
  );
}
