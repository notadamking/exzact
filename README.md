[![npm version](https://badge.fury.io/js/angular2-expandable-list.svg)](https://badge.fury.io/js/angular2-expandable-list)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)

# Exzact

> Simple, expressive middleware for NextJS Server Actions using Zact.

## Installation

```sh
$ pnpm install exzact
```

## Usage

Create simple middleware for zact functions:

```ts

```

### Middleware Stages

Middleware can run during any of the following stages:
_ `PRE_VALIDATION`: Before the Zact function Zod validation runs.
_ `PRE_EXECUTION`: Before the validated Zact function runs. \* `POST_EXECUTION`: After the validated Zact runction runs.

Middleware defaults to `PRE_EXECUTION` if no stage is manually set.

```ts

```

```ts

```

### Rate Limiting

It's simple to use this library to add rate-limiting to your Zact functions.

```ts

```

### Development

```sh
$ npm run build
```

This task will create a distribution version of the project
inside your local `dist/` folder

## Contributing

1.  Fork it!
2.  Create your feature branch: `git checkout -b my-new-feature`
3.  Add your changes: `git add .`
4.  Commit your changes: `git commit -am 'Add some feature'`
5.  Push to the branch: `git push origin my-new-feature`
6.  Submit a pull request :sunglasses:

## License

[MIT License](https://andreasonny.mit-license.org/2019) © Andrea SonnY
