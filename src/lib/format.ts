export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
}

export function readingTime(text: string): number {
  return Math.max(1, Math.round(text.split(/\s+/).filter(Boolean).length / 230));
}
