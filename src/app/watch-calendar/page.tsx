import type { Metadata } from "next";
import WatchCalendarClient from "./watch-calendar-client";

export const metadata: Metadata = {
  title: "Lịch xem phim",
  description: "Xem lịch sử xem phim theo từng ngày",
};

export default function WatchCalendarPage() {
  return <WatchCalendarClient />;
}
