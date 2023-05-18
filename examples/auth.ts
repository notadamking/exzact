import { z } from "zod";

import { zapp } from "../src/app";
import { authPreware } from "./middleware/auth.preware";

const app = zapp();

export const hello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`Hello ${stuff}`);
  }
);

export const protectedHello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`[Protected]: Hello ${stuff}`);
  },
  authPreware
);

async function main() {
  try {
    await hello({ stuff: "unprotected" });
  } catch (err) {
    console.error(err);
  }

  try {
    await protectedHello({ stuff: "wow" });
    await protectedHello({ stuff: "protected (blocked)" });
  } catch (err) {
    console.error(err);
  }

  console.log("");
  console.log("✅ Example completed successfully.");
}

main();
