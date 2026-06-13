export function formatWatchHours(hours: number): string {
  if (hours >= 100) {
    return `${hours.toFixed(1)}h`;
  }
  if (hours >= 10) {
    return `${hours.toFixed(2)}h`;
  }
  return `${hours.toFixed(2)}h`;
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
