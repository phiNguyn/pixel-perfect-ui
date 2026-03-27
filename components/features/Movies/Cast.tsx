"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

interface CastProps {
  actors: string[];
}

export function Cast({ actors }: CastProps) {
  if (!actors || actors.length === 0) {
    return (
      <div className="text-sm text-muted-foreground">
        Chưa có thông tin diễn viên
      </div>
    );
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-3 sm:grid-cols-6 md:grid-cols-8 gap-4">
        {actors.slice(0, 16).map((actor, i) => (
          <div key={`${actor}-${i}`} className="flex flex-col items-center text-center">
            <Avatar className="w-14 h-14 mb-2">
              <AvatarFallback className="bg-muted text-muted-foreground text-sm font-medium">
                {actor.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <span className="text-xs text-foreground font-medium line-clamp-2">{actor}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Cast;
