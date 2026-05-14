// lib/ratelimit.ts
import { Ratelimit } from '@upstash/ratelimit'
import { Redis }     from '@upstash/redis'

export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(100, '1 h'),  // 5 requests per hour per user
  analytics: true,
})