import { z } from "zod"
import dotenv from "dotenv"
import "cross-fetch/polyfill"

/* Requires setting the following environment variables:
    * - UPSTASH_REDIS_REST_URL
    * - UPSTASH_REDIS_REST_TOKEN
    
    You can find these in your Upstash console.
*/

dotenv.config()

import { exzact } from "../src/exzact"
import { upstashMiddleware } from "./middleware/upstash.middleware"
import { authPreware, keyv } from "./middleware/auth.preware"
import { logMiddleware } from "./middleware/log.middleware"
import { localRateLimitMiddleware } from "./middleware/localRateLimit.middleware"

interface Context {
  thing?: string
  something?: string
  user?: {
    id: string
  }
}

const app = exzact<Context>({
  thing: "things",
})

app.use(upstashMiddleware, logMiddleware)

export const hello = app.zact(z.object({ stuff: z.string().min(1) }), {
  something: "stuff",
})(async ({ stuff }, { user, thing, something }) => {
  console.log(
    `Hello ${stuff}, you injected ${thing} and ${
      something ?? "nothing"
    }, from ${user?.id ?? "anonymous"}`
  )
})

export const expensive = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }, { user, thing, something }) => {
    console.log(
      `[Expensive]: Hello ${stuff}, you injected ${thing} and ${
        something ?? "nothing"
      }, from ${user?.id ?? "anonymous"}`
    )
  },
  localRateLimitMiddleware
)

export const protectedHello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }, { user, thing, something }) => {
    console.log(
      `[Protected]: Hello ${stuff}, you injected ${thing} and ${
        something ?? "nothing"
      }, from ${user?.id ?? "anonymous"}`
    )
    upstashMiddleware
  },
  authPreware
)

async function main() {
  try {
    await expensive({ stuff: "expensive" })
    await expensive({ stuff: "blocked" })
  } catch (err) {
    console.error(err)
  }

  try {
    await hello({ stuff: "cheap" })
    await hello({ stuff: "cheap" })
  } catch (err) {
    console.error(err)
  }

  try {
    await protectedHello({ stuff: "protected (blocked)" })
  } catch (err) {
    console.error(err)
  }

  // Used by authMiddleware to check if the user is authenticated.
  await keyv.set(
    "authJwt",
    JSON.stringify({
      exp: Date.now() + 60 * 1000,
    })
  )

  await protectedHello({ stuff: "authorized" })

  try {
    await hello({ stuff: "blocked" })
  } catch (err) {
    console.error(err)
  }

  console.log("")
  console.log("✅ Example completed successfully.")
}

main()
