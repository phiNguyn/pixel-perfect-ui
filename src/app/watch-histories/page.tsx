import type { Metadata } from "next";
import WatchHistoriesClient from "./watch-histories-client";

export const metadata: Metadata = {
  title: "Lịch sử xem",
  description: "Xem lại lịch sử các phim đã xem",
};

export default function WatchHistoriesPage() {
  return <WatchHistoriesClient />;
}
