import type { Metadata } from "next";
import SettingsClient from "./settings-client";

export const metadata: Metadata = {
  title: "Cài đặt",
  description: "Quản lý cài đặt tài khoản và tùy chỉnh giao diện",
};

export default function SettingsPage() {
  return <SettingsClient />;
}
