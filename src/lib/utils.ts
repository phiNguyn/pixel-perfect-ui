import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
export const normalizeEpisode = (input: string | number): string => {
  if (!input) return "";

  let str = String(input).trim();

  // regex tìm "tập" + khoảng trắng + số
  const match = str.match(/tập\s*(\d+)/i);

  if (match) {
    return match[1]; // lấy số phía sau "tập"
  }

  return str; // nếu không có "tập" thì giữ nguyên
};
