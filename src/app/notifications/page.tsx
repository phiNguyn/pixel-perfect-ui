import type { Metadata } from "next";
import NotificationsClient from "./notifications-client";

export const metadata: Metadata = {
  title: "Thông báo",
  description: "Xem tất cả thông báo của bạn",
};

export default function NotificationsPage() {
  return <NotificationsClient />;
}
