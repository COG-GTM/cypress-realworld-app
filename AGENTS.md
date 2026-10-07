# Repository Guide

## Commands

- Install dependencies: `yarn install` — verified successfully.
- Start the development app: `yarn dev` — not run in this setup pass.
- Start the app for API tests: `yarn start:ci` — started successfully; backend listened on port 3001.
- Build: `yarn build` — not run in this setup pass.
- Typecheck: `yarn types` — passed.
- Lint and formatting: `yarn lint`.
- Unit tests: `yarn test:unit:ci` — passed (44 passed, 10 skipped).
- API tests: `yarn test:api` — Cypress ran headlessly, but all 9 specs failed in their setup hooks because `http://localhost:3000/` returned 404; 42 tests were skipped. The `start:ci` proxy serves `build/`, which was absent.

## SDD Conventions

- Name SDD branches `feature/<JIRA-KEY>-<slug>`; keep names at or below 80 characters and use a lowercase kebab-case slug.
- Use these exact checkpoint commit subjects:
  - Start: `docs: sdd-spec-started <change> <KEY>`
  - Proposed: `docs: sdd-spec-proposed <change> <KEY>`
  - Finished, after archiving: `docs: sdd-spec-finished <change> <KEY>`
- Store OpenSpec artifacts in `openspec/`, with active changes in `openspec/changes/`; archive completed changes with `openspec archive`.
- Validate OpenSpec changes with `openspec validate --strict`.
- Use `.github/pull_request_template.md` for PR descriptions. PR titles start with the Jira key, and PRs carry the `AI-assisted` label.
- For stacked work, branch a dependent task from its upstream task branch and target the dependent PR at that upstream branch.
