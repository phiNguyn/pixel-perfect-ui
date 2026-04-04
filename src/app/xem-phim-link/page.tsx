import { Metadata } from "next";
import WatchByLinkClient from "./watch-by-link-client";

export const metadata: Metadata = {
  title: "Xem phim với link - Pinuss Flix",
  description: "Dán link m3u8 hoặc embed để xem phim trực tiếp tại Pinuss Flix.",
};

export default function WatchByLinkPage() {
  return <WatchByLinkClient />;
}
