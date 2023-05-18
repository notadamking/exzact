import { z } from "zod";
import dotenv from "dotenv";
import "cross-fetch/polyfill";

/* Requires setting the following environment variables:
    * - UPSTASH_REDIS_REST_URL
    * - UPSTASH_REDIS_REST_TOKEN
    
    You can find these in your Upstash console.
*/

dotenv.config();

import { zapp } from "../src/app";
import { upstashMiddleware } from "./middleware/upstash.middleware";
import { authPreware } from "./middleware/auth.preware";
import { logMiddleware } from "./middleware/log.middleware";
import { localRateLimitMiddleware } from "./middleware/localRateLimit.preware";

const app = zapp();

app.use(upstashMiddleware);
app.use(logMiddleware);

export const hello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`Hello ${stuff}`);
  }
);

export const expensive = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`[Expensive]: Hello ${stuff}`);
  },
  localRateLimitMiddleware
);

export const protectedHello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`[Protected]: Hello ${stuff}`);
  },
  authPreware
);

async function main() {
  try {
    await expensive({ stuff: "expensive" });
    await expensive({ stuff: "blocked" });
  } catch (err) {
    console.error(err);
  }

  try {
    await hello({ stuff: "cheap" });
    await hello({ stuff: "cheap" });
  } catch (err) {
    console.error(err);
  }

  try {
    await protectedHello({ stuff: "wow" });
    await protectedHello({ stuff: "protected (blocked)" });
  } catch (err) {
    console.error(err);
  }

  try {
    await hello({ stuff: "blocked" });
  } catch (err) {
    console.error(err);
  }

  console.log("");
  console.log("✅ Example completed successfully.");
}

main();
