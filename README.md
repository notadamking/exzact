[![npm version](https://badge.fury.io/js/exzact.svg)](https://badge.fury.io/js/exzact)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Exzact

> ⚡︎ Simple, expressive middleware for NextJS Server Actions using Zact.

## Installation

```sh
$ pnpm install exzact
```

## Usage

Create simple middleware for zact functions:

```ts
import { z } from "zod"
import { zapp, Middleware } from "exzact"

interface Context {
  something?: string
}

const app = zapp<Context>()

const logMiddleware: Middleware = async (context, next) => {
  console.log("Log Middleware (Pre): ", context.input)
  await next()
  console.log("Log Middleware (Post): ", context.input)
}

export const hello = app.zact(z.object({ stuff: z.string().min(1) }))(
  async ({ stuff }: { stuff: string }) => {
    console.log(`Hello ${stuff}`)
  },
  {
    something: "injected",
  }
)

app.use(logMiddleware)

hello({ stuff: "world" })
```

In the above example, the logging middleware will run before the action has executed.

### Middleware Stages

Middleware can run during any of the following stages:

- `PRE_VALIDATE`: Before the Zact function Zod validation runs.
- `PRE_EXECUTE`: Before the validated Zact function runs.
- `POST_EXECUTE`: After the validated Zact runction runs.

Middleware defaults to `PRE_EXECUTE` if no stage is manually set.

```ts
import { MiddlewareStage } from "exzact";

...

logMiddleware.stage = MiddlewareStage.POST_EXECUTE;

...

app.use(logMiddleware);

hello({ stuff: "world" });
```

In the above example, the logging middleware will run after the action has executed.

### Rate Limiting

Rate-limiting can easily be added to Zact functions via middleware:

```ts
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"
import { Middleware } from "zact"

/* Requires setting the following environment variables:
    * - UPSTASH_REDIS_REST_URL
    * - UPSTASH_REDIS_REST_TOKEN
    
    You can find these in your Upstash console.
*/

const redis = Redis.fromEnv()

// Create a new ratelimiter, that allows 5 requests per 30 seconds
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "30 s"),
})

const upstashMiddleware: Middleware = async (_, next) => {
  const { success } = await ratelimit.limit("all")

  if (!success) {
    throw new Error("Unable to process at this time")
  }

  await next()
}

app.use(upstashMiddleware)
```

### Development

Install the necessary libraries.

```sh
$ npm install
```

Run a complete example of the middleware suite.

```sh
$ npm run example:complete
```

## Contributing

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Andrea SonnY
