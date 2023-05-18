import { Middleware, MiddlewareStage } from "../../src/app";

export const authPreware: Middleware = async (context, next) => {
  if (context.input.stuff !== "wow") {
    throw new Error("Invalid stuff");
  }

  await next();
};

authPreware.stage = MiddlewareStage.PRE_VALIDATE;
