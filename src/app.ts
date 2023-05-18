import type z from "zod";
import { fromZodError } from "zod-validation-error";
import { ZactAction } from "zact/server";

import { ActionType } from "./server";

export function zapp() {
  return new ZactApp();
}

export type Context<InputType extends z.ZodTypeAny, T = void> = {
  validator?: InputType;
  input: z.infer<InputType>;
} & T;

export type MiddlewareFn<InputType extends z.ZodTypeAny = any, T = void> = (
  context: Context<InputType, T>,
  next: () => Promise<void> | void
) => Promise<void> | void;

export enum MiddlewareStage {
  PRE_VALIDATE,
  PRE_EXECUTE,
  POST_EXECUTE,
}

export interface Middleware {
  <InputType extends z.ZodTypeAny = any, T = void>(
    context: Context<InputType, T>,
    next: () => Promise<void> | void
  ): Promise<void> | void;

  stage?: MiddlewareStage;
}

export class ZactApp {
  private preware: Middleware[] = [];
  private middleware: Middleware[] = [];
  private postware: Middleware[] = [];

  use(...mw: Middleware[]) {
    for (const m of mw) {
      if (m.stage === MiddlewareStage.PRE_VALIDATE) {
        this.preware.push(m);
      } else if (m.stage === MiddlewareStage.POST_EXECUTE) {
        this.postware.push(m);
      } else {
        this.middleware.push(m);
      }
    }
  }

  remove(...mw: Middleware[]) {
    this.preware = this.preware.filter((m) => !mw.includes(m));
    this.middleware = this.middleware.filter((m) => !mw.includes(m));
    this.postware = this.postware.filter((m) => !mw.includes(m));
  }

  usePreware(...mw: Middleware[]) {
    this.preware.push(...mw);
  }

  useMiddleware(...mw: Middleware[]) {
    this.middleware.push(...mw);
  }

  usePostware(...mw: Middleware[]) {
    this.postware.push(...mw);
  }

  async invokeWares<InputType extends z.ZodTypeAny, T = void>(
    context: Context<InputType, T>,
    middlewares: MiddlewareFn<InputType, T>[]
  ): Promise<void> {
    if (!middlewares.length) return;
    const _next = middlewares[0];
    return _next(context, async () => {
      await this.invokeWares(context, middlewares.slice(1));
    });
  }

  zact<InputType extends z.ZodTypeAny>(validator?: InputType) {
    const invokeWares = this.invokeWares.bind(this);
    const use = this.use.bind(this);
    const remove = this.remove.bind(this);
    const [preware, middleware, postware] = [
      this.preware,
      this.middleware,
      this.postware,
    ];

    // This is the "factory" that is created on call of zact. You pass it a "use server" function and it will validate the input before you call it
    return function <ResponseType extends any>(
      action: ActionType<InputType, ResponseType>,
      ...additional: Middleware[]
    ): ZactAction<InputType, ResponseType> {
      use(...additional);

      // The wrapper that actually validates
      const validatedAction = async (input: z.infer<InputType>) => {
        const invokeMiddleware = async (wares: Middleware[]) =>
          invokeWares({ input, validator }, wares);

        await invokeMiddleware(preware);

        if (validator) {
          // This will throw if the input is invalid
          const result = validator.safeParse(input);

          if (!result.success) {
            const validatedError = fromZodError(result.error);
            throw validatedError;
          }
        }

        await invokeMiddleware(middleware);

        const response = await action(input);

        await invokeMiddleware(postware);

        return response;
      };

      remove(...additional);

      return validatedAction as ZactAction<InputType, ResponseType>;
    };
  }
}
