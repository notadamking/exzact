import { Middleware, MiddlewareStage } from "../../src/app";

const RESET_INTERVAL = 60 * 1_000; // 60 seconds

let counter = 0;
let lastReset = Date.now();

export const localRateLimitMiddleware: Middleware = async (_, next) => {
  if (Date.now() - lastReset > RESET_INTERVAL) {
    counter = 0;
    lastReset = Date.now();
  }

  // Allow 2 requests per 60 seconds
  const success = ++counter < 2;

  if (!success) {
    throw new Error("[LOCAL]: Unable to process at this time");
  }

  await next();
};

localRateLimitMiddleware.stage = MiddlewareStage.PRE_EXECUTE;
