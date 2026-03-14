/**
 * Generate a short, unique session ID based on timestamp + random suffix.
 * Format: YYYYMMDD-HHmmss-XXXX
 */
export function generateSessionId(): string {
  const now = new Date();
  const pad = (n: number, w = 2) => String(n).padStart(w, '0');
  const date = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}`;
  const time = `${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const rand = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `${date}-${time}-${rand}`;
}
