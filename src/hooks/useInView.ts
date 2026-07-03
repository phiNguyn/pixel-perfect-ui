"use client";

import { useEffect, useRef, useState } from "react";

interface UseInViewOptions {
  /** Khoảng cách "nới rộng" vùng quan sát để prefetch sớm trước khi element thật sự vào màn hình. */
  rootMargin?: string;
  /** Tỉ lệ element hiển thị để coi là "in view". */
  threshold?: number | number[];
  /** Sau khi đã in view 1 lần thì ngắt observer (mặc định true - phù hợp lazy load API). */
  once?: boolean;
}

/**
 * Theo dõi khi một element scroll vào viewport bằng IntersectionObserver.
 * Dùng để trì hoãn việc gọi API / render nội dung nặng cho tới khi người dùng cuộn tới.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>({
  rootMargin = "200px",
  threshold = 0,
  once = true,
}: UseInViewOptions = {}) {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    // Trình duyệt cũ không hỗ trợ -> hiển thị luôn.
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting) {
          setInView(true);
          if (once) observer.disconnect();
        } else if (!once) {
          setInView(false);
        }
      },
      { rootMargin, threshold },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin, threshold, once]);

  return { ref, inView };
}

export default useInView;
