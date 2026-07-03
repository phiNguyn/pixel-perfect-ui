export type TimeAgoInput = string | number | Date;

export interface FormatTimeAgoOptions {
  /** "long" -> "5 phút trước"; "short" -> "5p trước". Default "long". */
  style?: "long" | "short";
  /**
   * When the elapsed time reaches this many days, render an absolute date
   * (via `absoluteFormat`) instead of a relative string. "long" style only.
   */
  absoluteAfterDays?: number;
  /** Intl options for the absolute-date fallback. */
  absoluteFormat?: Intl.DateTimeFormatOptions;
  /** Locale for the absolute-date fallback. Default "vi-VN". */
  locale?: string;
}

const toDate = (input: TimeAgoInput): Date =>
  input instanceof Date ? input : new Date(input);

export const formatTimeAgo = (
  input: TimeAgoInput,
  options: FormatTimeAgoOptions = {},
): string => {
  const {
    style = "long",
    absoluteAfterDays,
    absoluteFormat,
    locale = "vi-VN",
  } = options;

  const date = toDate(input);
  const diffMs = Date.now() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (style === "short") {
    if (diffMin < 1) return "Vừa xong";
    if (diffMin < 60) return `${diffMin}p trước`;
    if (diffHour < 24) return `${diffHour}h trước`;
    return `${diffDay}d trước`;
  }

  if (diffSec < 60) return "Vừa xong";
  if (diffMin < 60) return `${diffMin} phút trước`;
  if (diffHour < 24) return `${diffHour} giờ trước`;

  // Notification-style: show an absolute date once old enough.
  if (absoluteAfterDays != null) {
    if (diffDay < absoluteAfterDays) return `${diffDay} ngày trước`;
    return date.toLocaleDateString(locale, absoluteFormat);
  }

  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffDay < 7) return `${diffDay} ngày trước`;
  if (diffWeek < 4) return `${diffWeek} tuần trước`;
  if (diffMonth < 12) return `${diffMonth} tháng trước`;
  return `${diffYear} năm trước`;
};
