"use client";

import { useState } from "react";
import { Trophy, Loader2 } from "lucide-react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import LeaderboardPodium from "@/components/features/Leaderboard/LeaderboardPodium";
import LeaderboardList from "@/components/features/Leaderboard/LeaderboardList";
import {
  useQueryLeaderboard,
  useQueryMyRank,
} from "@/lib/api/leaderboard/leaderboardQuery";
import type { LeaderboardPeriod } from "@/lib/api/leaderboard/leaderboardInterface";
import { formatWatchHours } from "@/lib/utils/watchTime";
import Empty from "@/components/Common/Empty";

const PERIOD_LABELS: Record<LeaderboardPeriod, string> = {
  all: "Tất cả",
  week: "Tuần này",
  month: "Tháng này",
};

export default function LeaderboardClient() {
  const { isAuthenticated, openLoginModal } = useAuth();
  const [period, setPeriod] = useState<LeaderboardPeriod>("all");

  const { data, isLoading, isError } = useQueryLeaderboard(period);
  const { data: myRankData } = useQueryMyRank(period, isAuthenticated);

  const myRank = data?.myRank ?? myRankData?.rank;
  const myHours =
    data?.myTotalWatchHours ?? myRankData?.totalWatchHours ?? 0;

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 mt-16">
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-white/10">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Trophy className="h-5 w-5 text-amber-400" />
            <h1 className="text-xl font-bold">Bảng xếp hạng</h1>
          </div>

          <div className="flex justify-center">
            <div className="inline-flex rounded-full bg-muted/60 p-1 gap-1">
              {(Object.keys(PERIOD_LABELS) as LeaderboardPeriod[]).map((p) => (
                <button
                  key={p}
                  onClick={() => setPeriod(p)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${
                    period === p
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {PERIOD_LABELS[p]}
                </button>
              ))}
            </div>
          </div>

          {isAuthenticated && myRank != null && myRank > 0 && (
            <div className="mt-4 text-center text-sm text-muted-foreground">
              Hạng của bạn:{" "}
              <span className="font-bold text-foreground">#{myRank}</span>
              {" · "}
              <span className="text-primary font-semibold">
                {formatWatchHours(myHours)}
              </span>
            </div>
          )}

          {!isAuthenticated && (
            <div className="mt-4 text-center">
              <Button variant="outline" size="sm" onClick={openLoginModal}>
                Đăng nhập để xem hạng của bạn
              </Button>
            </div>
          )}
        </div>

        <div className="px-4 md:px-6 py-4">
          {isLoading && (
            <div className="space-y-4 py-8">
              <div className="flex justify-center gap-4">
                <Skeleton className="h-20 w-20 rounded-full" />
                <Skeleton className="h-24 w-24 rounded-full" />
                <Skeleton className="h-20 w-20 rounded-full" />
              </div>
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          )}

          {isError && (
            <Empty
              icon={Trophy}
              title="Không thể tải bảng xếp hạng"
              description="Vui lòng thử lại sau"
            />
          )}

          {!isLoading && !isError && data && (
            <>
              {data.podium.length === 0 && data.list.length === 0 ? (
                <Empty
                  icon={Trophy}
                  title="Chưa có dữ liệu xếp hạng"
                  description="Hãy xem phim để leo hạng trên bảng xếp hạng"
                />
              ) : (
                <>
                  <LeaderboardPodium entries={data.podium} />
                  <LeaderboardList entries={data.list} />
                </>
              )}
            </>
          )}
        </div>

        {isLoading && (
          <div className="flex justify-center pb-6">
            <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
          </div>
        )}
      </div>
    </div>
  );
}
