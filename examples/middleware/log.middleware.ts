import { Middleware, MiddlewareStage } from "../../src/exzact"

export const logMiddleware: Middleware = async (context, next) => {
  console.log("Log Middleware (Pre): ", context.input)
  await next()
  console.log("Log Middleware (Post): ", context.input)
}

logMiddleware.stage = MiddlewareStage.PRE_EXECUTE
