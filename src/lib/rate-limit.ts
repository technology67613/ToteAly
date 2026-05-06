// Simple In-Memory Rate Limiter for Public Routes
// NOTE: This will not work across serverless instances. Use Redis (Upstash) for production.

const cache = new Map<string, { count: number; expires: number }>();

export function rateLimit(ip: string, limit: number = 5, windowMs: number = 60000) {
  const now = Date.now();
  const record = cache.get(ip);

  if (!record || now > record.expires) {
    cache.set(ip, { count: 1, expires: now + windowMs });
    return { success: true, remaining: limit - 1 };
  }

  if (record.count >= limit) {
    return { success: false, remaining: 0 };
  }

  record.count += 1;
  return { success: true, remaining: limit - record.count };
}
