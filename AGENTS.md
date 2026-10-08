# Repository Guide

## Environment

- Use Node.js 22.13.0 via nvm; `.nvmrc` pins the version.
- Use Yarn Classic 1.x.
- Install OpenSpec CLI 1.13.2 with `npm i -g @fission-ai/openspec@1.13.2`; `openspec --version` returned `1.13.2`.

## Commands

- Install: `yarn install` — passed (36.67s).
- Dev: `yarn dev` — not run in this setup; `.env` configures the frontend at port 3000 and API at port 3001.
- Build: `yarn build:ci` — passed (10.16s; produced `build/`). `yarn build` was not run.
- Types: `yarn types` — passed (2.29s).
- Lint: `yarn lint` — passed (2.66s).
- Unit tests: `yarn test:unit:ci` — passed (44 passed, 10 skipped; 9.95s).
- API tests: passed (51 passed, 0 failed; 32.04s). Run the full sequence below; keep `yarn start:ci` running in the background:
  1. `yarn build:ci`
  2. `yarn start:ci`
  3. `./node_modules/.bin/wait-on --timeout 120000 http://localhost:3000 http://localhost:3001`
  4. `yarn test:api`
  5. `git checkout -- data/database.json`
- End-to-end: `yarn test:headless` — not run in this setup; requires the app to be running.

Run `git checkout -- data/database.json` after API/e2e tests; they mutate data/database.json. Do not restore other files in data/; review their diff instead, since seed changes may be part of the change.

## Verification for Changes

Before declaring a change done, run:

- `yarn types`
- `yarn lint`
- `yarn test:unit:ci`
- Run the full API test sequence above (build, `yarn start:ci`, wait-on, `yarn test:api`, cleanup) when `backend/` changes.

## Agents

Implementation and QA run inline in the same session. QA runs the verification commands above.

## SDD Conventions

- Work items live in Azure Boards (https://dev.azure.com/AdamAchebe/Devin). Reference a work item as `AB#<id>`. With the Azure Boards GitHub app installed, this links commits and PRs to the work item.
- The integration branch is `develop` (there is no `main`). SDD branches start from an up-to-date `develop`, and non-stacked PRs target `develop`.
- Name branches `<prefix>/<id>-<slug>`, where `<id>` is the Azure Boards Task id. Use `feature/` by default; `fix/`, `hotfix/`, `refactor/`, `ci/` and `support/` are also allowed. Keep branch names at or below 80 characters and use a lowercase ASCII kebab-case slug. Example: `feature/14-transactions-csv-export`.
- Use these exact checkpoint subjects, with no scope or body; never use `--no-verify`:
  - `docs: sdd-spec-started <change> AB#<id>`
  - `docs: sdd-spec-proposed <change> AB#<id>`
  - `docs: sdd-spec-finished <change> AB#<id>`
- Implementation commits use Conventional Commits and end with the work item reference, for example: `feat(api): add transactions export endpoint AB#14`.
- OpenSpec lives in `openspec/`: active changes in `openspec/changes/`, archived with `openspec archive <change> --yes`, and specs in `openspec/specs/`. Validate a change with `openspec validate <change> --strict`.
- Use `.github/pull_request_template.md`. PR titles use `AB#<id>: <summary>`. Open PRs as drafts with the `AI-assisted` label.
- A Task with an Azure Boards `Predecessor` link to another Task branches from that Task's branch, and its PR targets that branch. Retarget the PR to `develop` after the upstream PR merges. Never push directly to `develop`.
