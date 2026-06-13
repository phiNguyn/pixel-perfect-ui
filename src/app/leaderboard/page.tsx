import type { Metadata } from "next";
import LeaderboardClient from "./leaderboard-client";

export const metadata: Metadata = {
  title: "Bảng xếp hạng",
  description: "Xếp hạng người dùng theo thời gian xem phim",
};

export default function LeaderboardPage() {
  return <LeaderboardClient />;
}
