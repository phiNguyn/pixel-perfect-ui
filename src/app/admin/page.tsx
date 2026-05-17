import { Metadata } from "next";
import AdminDashboard from "./admin-client";

export const metadata: Metadata = {
  title: "Admin Portal | Pinuss",
  description: "Quản lý người dùng và nội dung",
};

export default function AdminPage() {
  return <AdminDashboard />;
}
