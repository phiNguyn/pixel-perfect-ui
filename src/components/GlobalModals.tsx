"use client";

import dynamic from "next/dynamic";

const LoginModal = dynamic(
  () => import("@/components/auth/LoginModal").then((mod) => mod.LoginModal),
  { ssr: false },
);

// const FeedbackChatbot = dynamic(
//   () =>
//     import("@/components/features/Feedback/FeedbackChatbot").then(
//       (mod) => mod.default,
//     ),
//   { ssr: false },
// );

export function GlobalModals() {
  return (
    <>
      <LoginModal />
      {/* <FeedbackChatbot source="floating" /> */}
    </>
  );
}
