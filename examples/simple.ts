import { z } from "zod"

import { exzact } from "../src/exzact"
import { logMiddleware } from "./middleware/log.middleware"

interface Context {
  thing?: string
  something?: string
}

const app = exzact<Context>({
  thing: "things",
})

app.use(logMiddleware)

export const hello = app.zact(z.object({ stuff: z.string().min(1) }), {
  something: "stuff",
})(async ({ stuff }, { thing, something }) => {
  console.log(`Hello ${stuff}, you injected ${thing} and ${something}`)
})

async function main() {
  await hello({ stuff: "world" })

  console.log("")
  console.log("✅ Example completed successfully.")
}

main()
