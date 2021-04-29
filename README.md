# Hello World Action

> A simple GitHub Action written in JavaScript

[![Build Status](https://github.com/gr2m/github-organization-repository-auditing-action/actions/workflows/test.yml/badge.svg)](https://github.com/gr2m/github-organization-repository-auditing-action/actions/workflows/test.yml)

## Setup

You can setup this action on any repository, within or outside the organization you want to audit. For the action to work, you need to create a GitHub App with the following settings:

1. Webhook: remove check from `active`
2. Repository permissions: `Administration`: `read`
3. Organization permissions: `Members`: `read`
4. Where can this GitHub App be installed? ` Only on this account`

You can set the name of the app to your organizations name, and set the URL either to your organization or this repository. As description you can set something such as

> Internal GitHub App used for auditing repository access

After creating the app, you need to install it on your organization. Select `All repositories`.

After installing, add two secrets to the repository you want the action to run in

1. `APP_ID`: your newly created App's ID
2. `PRIVATE_KEY`: generate a private key for your app and paste it

Now create a GitHub Action workflow file at `.github/workflows/audit.yml` with the content below.

## Usage

You can run the action on a [schedule](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#schedule) and manually using the [`workflow_dispatch` event](https://docs.github.com/en/actions/reference/events-that-trigger-workflows#workflow_dispatch)

```yml
name: Audit
on:
  schedule:
    # Every day at 4am pacific time
    - cron: 0 12 * * *
  # manual trigger
  workflow_dispatch: {}

jobs:
  sayHelloWorld:
    runs-on: ubuntu-latest
    steps:
      # audit repositories
      - uses: gr2m/github-organization-repository-auditing-action@v1.x
        id: audit
        env:
          APP_ID: ${{ secrets.APP_ID }}
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
      # use the repositories JSON output
      - run: |
          echo '${{ steps.audit.outputs.repositories }}'
```

Use the action to write the JSON output to a logfile, together with a timestamp

```yml
name: Audit
on:
  schedule:
    # Every day at 4am pacific time
    - cron: 0 12 * * *
  # manual trigger
  workflow_dispatch: {}

jobs:
  audit:
    runs-on: ubuntu-latest
    steps:
      # checkout the current repository
      - uses: actions/checkout@v2
      # audit all organization repositories
      - uses: gr2m/github-organization-repository-auditing-action@v1.x
        id: audit
        env:
          APP_ID: ${{ secrets.APP_ID }}
          PRIVATE_KEY: ${{ secrets.PRIVATE_KEY }}
      - name: Get current timestamp
        run: echo "::set-output name=timestamp::`date -u +"%Y-%m-%dT%H:%M:%SZ"`"
        id: timestamp
      - name: write to audit.ndjson.log
        run: |
          echo '{"time": "${{ steps.timestamp.outputs.timestamp }}", "repositories": ${{ steps.audit.outputs.repositories }} }' >> audit.ndjson.log
      # commit the change
      - run: |
          git config user.name github-actions
          git config user.email github-actions@github.com
          git add audit.ndjson.log
          git commit audit.ndjson.log -m "log update"
          git push
```

## How it works

This action is using the GitHub App SDK from [`octokit`](https://github.com/octokit/octokit.js/#app-client). It iterates through all repositories the app is installed an, loads all teams with their permissions, and writes a resulting `repositories` array to the GitHub Action step output using [`@actions/core`](https://github.com/actions/toolkit/tree/main/packages/core).

The entire code is in [`index.js`](index.js)

## License

[ISC](LICENSE)
