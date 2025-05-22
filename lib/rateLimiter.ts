const ipCache = new Map<string, { count: number; time: number }>();

export function checkRateLimit(ip: string, limit = 60, windowMs = 60000): boolean {
  const now = Date.now();
  const data = ipCache.get(ip) || { count: 0, time: now };

  if (now - data.time > windowMs) {
    ipCache.set(ip, { count: 1, time: now });
    return false;
  }

  if (data.count >= limit) return true;

  ipCache.set(ip, { count: data.count + 1, time: data.time });
  return false;
}