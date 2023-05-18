import { z } from "zod";

import { zapp } from "../src/app";
import { localRateLimitMiddleware } from "./middleware/localRateLimit.preware";

const app = zapp();

app.use(localRateLimitMiddleware);

export const expensive = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`[Expensive]: Hello ${stuff}`);
  }
);

async function main() {
  try {
    await expensive({ stuff: "world" });
    await expensive({ stuff: "blocked" });
  } catch (err) {
    console.error(err);
  }

  console.log("");
  console.log("✅ Example completed successfully.");
}

main();
