import { z } from "zod"

import { exzact } from "../src/exzact"
import { authPreware, keyv } from "./middleware/auth.preware"

interface Context {
  user?: {
    id: string
  }
}

const app = exzact<Context>()

export const hello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }, { user }) => {
    console.log(`Hello ${stuff}, from ${user?.id ?? "anonymous"}`)
  }
)

export const protectedHello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }, { user }) => {
    console.log(`[Protected]: Hello ${stuff}, from ${user?.id ?? "anonymous"}`)
  },
  authPreware
)

async function main() {
  try {
    await hello({ stuff: "unprotected" })
  } catch (err) {
    console.error(err)
  }

  try {
    await protectedHello({ stuff: "protected (blocked)" })
  } catch (err) {
    console.error(err)
  }

  await keyv.set(
    "authJwt",
    JSON.stringify({
      exp: Date.now() + 60 * 1000,
      userId: "123",
    })
  )

  await protectedHello({ stuff: "authorized" })

  console.log("")
  console.log("✅ Example completed successfully.")
}

main()
