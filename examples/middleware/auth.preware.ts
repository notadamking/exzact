import Keyv from "@keyvhq/core"

import { Middleware, MiddlewareStage } from "../../src/exzact"

export const keyv = new Keyv()

interface AuthContext {
  user?: {
    id: string
  }
}

interface AuthJwt {
  exp: number
  userId: string
}

export const authPreware: Middleware<AuthContext> = async (context, next) => {
  const authJwt: string | null = await keyv.get("authJwt")

  try {
    const decoded = JSON.parse(authJwt ?? "") as AuthJwt

    if (!decoded.exp || decoded.exp < Date.now() / 1000) {
      throw new Error("Forbidden")
    }

    context.user = {
      id: decoded.userId,
    }
  } catch (error) {
    throw new Error("Forbidden")
  }

  await next()
}

authPreware.stage = MiddlewareStage.PRE_VALIDATE
