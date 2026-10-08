# Project Context

## Purpose

Cypress Real World App is a full-stack demonstration application for realistic web application behavior and testing. It provides a React client, an Express API, and local sample data.

## Technology Stack

- Node.js 22.13.0, Yarn Classic 1.x, and TypeScript.
- React 18 with Vite for the frontend, Material UI for components, and XState for client-side state machines.
- Express 4 for REST and GraphQL API services.
- lowdb 1.x with JSON data files under `data/`.
- Cypress for end-to-end, API, and component tests; Vitest for unit tests.

## Project Conventions

- Follow the existing TypeScript, ESLint, and Prettier configuration and nearby code patterns.
- Use Yarn Classic for dependency management and keep `yarn.lock` authoritative.
- Keep frontend code in `src/` and API implementation in `backend/`.
- Keep persistent application fixtures and database seeds in `data/`.
- Add tests alongside the existing test organization and use the project's established test tooling.

## Repository Layout

- `src/`: React application, components, state machines, models, utilities, and unit tests.
- `backend/`: Express API, route handlers, database helpers, GraphQL schema, and resolvers.
- `data/`: lowdb JSON database and seed data.
- `cypress/`: Cypress support files, fixtures, and end-to-end/API tests; component tests are colocated with frontend components.
- `openspec/`: OpenSpec project context, active changes, and archived changes.

## Testing

- Unit tests use Vitest, primarily under `src/__tests__/` and `src/utils/__tests__/`.
- Cypress API and end-to-end tests are under `cypress/tests/`.
- Cypress component tests are colocated with the components they exercise.
