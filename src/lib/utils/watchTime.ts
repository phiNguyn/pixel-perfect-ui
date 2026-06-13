export function formatWatchHours(hours: number): string {
  const totalSeconds = Math.round(hours * 3600);
  const h = Math.floor(totalSeconds / 3600);
  const m = Math.floor((totalSeconds % 3600) / 60);

  if (h > 0) {
    return `${h}g ${m}p`;
  }
  return `${m} phút`;
}

export function formatWatchDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours}g ${minutes}p`;
  }
  return `${minutes} phút`;
}

export function getDisplayName(
  name: string | null,
  username: string | null,
): string {
  return name || username || "Người dùng";
}
