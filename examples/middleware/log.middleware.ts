import { Middleware, MiddlewareStage } from "../../src/exzact"

export const logMiddleware: Middleware = async (context, next) => {
  delete context.validator

  console.log("Log Middleware (Pre): ", context)
  await next()
  console.log("Log Middleware (Post): ", context)
}

logMiddleware.stage = MiddlewareStage.PRE_EXECUTE
