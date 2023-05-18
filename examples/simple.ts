import { z } from "zod"

import { zapp } from "../src/exzact"
import { logMiddleware } from "./middleware/log.middleware"

interface Context {
  something?: string
}

const app = zapp<Context>()

app.use(logMiddleware)

export const hello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`Hello ${stuff}`)
  },
  {
    something: "injected",
  }
)

async function main() {
  await hello({ stuff: "world" })

  console.log("")
  console.log("✅ Example completed successfully.")
}

main()
