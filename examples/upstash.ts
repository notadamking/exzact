import { z } from "zod"
import dotenv from "dotenv"
import "cross-fetch/polyfill"

/* Requires setting the following environment variables:
    * - UPSTASH_REDIS_REST_URL
    * - UPSTASH_REDIS_REST_TOKEN
    
    You can find these in your Upstash console.
*/

dotenv.config()

import { zapp } from "../src/exzact"
import { upstashMiddleware } from "./middleware/upstash.middleware"

const app = zapp()

app.use(upstashMiddleware)

export const expensive = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`[Expensive]: Hello ${stuff}`)
  }
)

async function main() {
  try {
    await expensive({ stuff: "expensive" })
    await expensive({ stuff: "expensive" })
    await expensive({ stuff: "expensive" })
    await expensive({ stuff: "expensive" })
    await expensive({ stuff: "expensive" })
    await expensive({ stuff: "blocked" })
  } catch (err) {
    console.error(err)
  }

  console.log("")
  console.log("✅ Example completed successfully.")
}

main()
