# Hello World Action

> A simple GitHub Action written in JavaScript

[![Build Status](https://github.com/gr2m/github-organization-repository-auditing-action/actions/workflows/test.yml/badge.svg)](https://github.com/gr2m/github-organization-repository-auditing-action/actions/workflows/test.yml)

## Usage

```yml
name: Hello world!
on:
  push:
    branches:
      - master

jobs:
  sayHelloWorld:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/github-organization-repository-auditing-action@v1.x
```

Customize greeting

```yml
name: Hello world!
on:
  push:
    branches:
      - master

jobs:
  sayHelloWorld:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/github-organization-repository-auditing-action@v1.x
        with:
          greeting: Gregor
```

## How it works

Recommended reading: The official "[Creating a JavaScript action](https://docs.github.com/en/actions/creating-actions/creating-a-javascript-action)" guide.

`gr2m/github-organization-repository-auditing-action` does the following

1. It logs a "Hello, world!" to the output
2. It uses the [`@actions/core`](https://github.com/actions/toolkit/tree/main/packages/core) module to showcase how to use dependencies
3. It supports a `greeting` input
4. It writes the total greeting to outputs
5. It uses [`@vercel/ncc`](https://github.com/vercel/ncc) to compile the code and its dependencies to a single file that can be executed as a standalone GitHub Action.

The most important learning of using Node to create a GitHub Action is that you cannot require/import dependencies. When someone uses your action as part of their workflow, your action's dependencies are not automatically installed. Hence the build step using `@vercel/ncc`.

**Bonus**: This action is releasing automatically to GitHub using [`semantic-release`](https://github.com/semantic-release). It also pushes updates to the `v1.x` branch, which you can reliably depend on in your GitHub workflow (`uses: gr2m/github-organization-repository-auditing-action@v1.x`). If there should ever be a breaking release, I'll create a `v2.x` branch, etc.

## License

[ISC](LICENSE)
