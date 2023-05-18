/* eslint @typescript-eslint/no-explicit-any: 0 */

import type z from "zod"
import { fromZodError } from "zod-validation-error"
import { ZactAction } from "zact/server"

export function zapp<ContextType extends object | undefined = any>() {
  return new ZactApp<ContextType>()
}

export enum MiddlewareStage {
  PRE_VALIDATE,
  PRE_EXECUTE,
  POST_EXECUTE,
}

export type Context<
  InputType extends z.ZodTypeAny,
  ContextType extends object | undefined = any
> = {
  validator?: InputType
  input: z.infer<InputType>
} & ContextType

export interface Middleware<ContextType extends object | undefined = any> {
  <InputType extends z.ZodTypeAny>(
    context: Context<InputType, ContextType>,
    next: () => Promise<void> | void
  ): Promise<void> | void

  stage?: MiddlewareStage
}

export type ActionType<InputType extends z.ZodTypeAny, RType = void> = (
  input: z.infer<InputType>
) => Promise<RType>

export class ZactApp<ContextType extends object | undefined = any> {
  private preware: Middleware<ContextType>[] = []
  private middleware: Middleware<ContextType>[] = []
  private postware: Middleware<ContextType>[] = []

  use(...mw: Middleware<ContextType>[]) {
    for (const m of mw) {
      if (m.stage === MiddlewareStage.PRE_VALIDATE) {
        this.preware.push(m)
      } else if (m.stage === MiddlewareStage.POST_EXECUTE) {
        this.postware.push(m)
      } else {
        this.middleware.push(m)
      }
    }
  }

  remove(...mw: Middleware<ContextType>[]) {
    this.preware = this.preware.filter((m) => !mw.includes(m))
    this.middleware = this.middleware.filter((m) => !mw.includes(m))
    this.postware = this.postware.filter((m) => !mw.includes(m))
  }

  usePreware(...mw: Middleware<ContextType>[]) {
    this.preware.push(...mw)
  }

  useMiddleware(...mw: Middleware<ContextType>[]) {
    this.middleware.push(...mw)
  }

  usePostware(...mw: Middleware<ContextType>[]) {
    this.postware.push(...mw)
  }

  async invokeMiddleware<
    InputType extends z.ZodTypeAny,
    ContextType extends object | undefined = any
  >(
    context: Context<InputType, ContextType>,
    middlewares: Middleware<ContextType>[]
  ): Promise<void> {
    if (!middlewares.length) return
    const _next = middlewares[0]
    return _next(context, async () => {
      await this.invokeMiddleware(context, middlewares.slice(1))
    })
  }

  zact<InputType extends z.ZodTypeAny>(validator?: InputType) {
    const invokeMiddleware = this.invokeMiddleware.bind(this)
    const use = this.use.bind(this)
    const remove = this.remove.bind(this)
    const [preware, middleware, postware] = [
      this.preware,
      this.middleware,
      this.postware,
    ]

    // This is the "factory" that is created on call of zact. You pass it a "use server" function and it will validate the input before you call it
    return function <RType = void>(
      action: ActionType<InputType, RType>,
      defaultContext: ContextType = {} as ContextType,
      ...additional: Middleware<ContextType>[]
    ): ZactAction<InputType, RType> {
      use(...additional)

      // The wrapper that actually validates
      const validatedAction = async (input: z.infer<InputType>) => {
        const context: Context<InputType, ContextType> = {
          input,
          validator,
          ...defaultContext,
        }

        await invokeMiddleware(context, preware)

        if (validator) {
          // This will throw if the input is invalid
          const result = validator.safeParse(input)

          if (!result.success) {
            const validatedError = fromZodError(result.error)
            throw validatedError
          }
        }

        await invokeMiddleware(context, middleware)

        const response = await action(input)

        await invokeMiddleware(context, postware)

        return response
      }

      remove(...additional)

      return validatedAction as ZactAction<InputType, RType>
    }
  }
}
