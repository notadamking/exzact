import { z } from "zod"

import { exzact } from "../src/exzact"
import { localRateLimitMiddleware } from "./middleware/localRateLimit.middleware"

const app = exzact()

app.use(localRateLimitMiddleware)

export const expensive = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }) => {
    console.log(`[Expensive]: Hello ${stuff}`)
  }
)

async function main() {
  try {
    await expensive({ stuff: "world" })
    await expensive({ stuff: "blocked" })
  } catch (err) {
    console.error(err)
  }

  console.log("")
  console.log("✅ Example completed successfully.")
}

main()
