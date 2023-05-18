import { z } from "zod";

import { zapp } from "../src/app";
import { logMiddleware } from "./middleware/log.middleware";

const app = zapp();

app.use(logMiddleware);

export const hello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`Hello ${stuff}`);
  }
);

async function main() {
  await hello({ stuff: "world" });

  console.log("");
  console.log("✅ Example completed successfully.");
}

main();
