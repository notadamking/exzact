import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

import { Middleware, MiddlewareStage } from "../../src/exzact"

/* Requires setting the following environment variables:
    * - UPSTASH_REDIS_REST_URL
    * - UPSTASH_REDIS_REST_TOKEN
    
    You can find these in your Upstash console.
*/

const redis = Redis.fromEnv()

// Create a new ratelimiter, that allows 5 requests per 30 seconds
export const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "30 s"),
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */
  prefix: "@upstash/ratelimit",
})

export const upstashMiddleware: Middleware = async (_, next) => {
  const { success } = await ratelimit.limit("all")

  if (!success) {
    throw new Error("Unable to process at this time")
  }

  await next()
}

upstashMiddleware.stage = MiddlewareStage.PRE_EXECUTE
