export function formatChars(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `${(n / 1_000).toFixed(1)}k`;
  return Math.round(n).toLocaleString();
}

export function formatMinutes(min: number): string {
  if (!min) return "0m";
  const hours = Math.floor(min / 60);
  const mins = Math.round(min % 60);
  if (hours === 0) return `${mins}m`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}m`;
}

export function formatInt(n: number): string {
  return Math.round(n).toLocaleString();
}
