# Testing cypress-realworld-app

## Setup

1. Install dependencies: `yarn install`
2. Start dev server: `yarn dev` (starts both frontend on port 3000 and backend API on port 3001)
3. Wait for both servers to be ready before testing
4. The backend seeds a local SQLite database on first run

## Test Credentials

- Username: `Heath93`, Password: `s3cret`
- Other seeded users visible in the contacts list (Kristian Bradtke, Darrel Ortiz, etc.)

## Key Commands

- `yarn dev` — Start frontend + backend dev servers
- `yarn types` — Run TypeScript type checking (`tsc --noEmit`)
- `yarn lint` — Run ESLint + Prettier checks
- `yarn build:ci` — Full CI build

## Golden-Path Test Flows

### 1. Sign In
- Navigate to `localhost:3000/signin`
- Enter username and password
- Verify redirect to home page with transaction list and sidebar

### 2. Transaction List & Tabs
- On home page, verify EVERYONE tab shows public transactions
- Click FRIENDS tab — verify contacts transactions load
- Click MINE tab — verify personal transactions load

### 3. Create Transaction
- Click "$ NEW" button in top-right
- Step 1: Select a contact from the list
- Step 2: Enter amount and note, click PAY or REQUEST
- Verify snackbar shows "Transaction Submitted!"

### 4. Navigation Drawer
- Click hamburger icon in top-left header bar
- Sidebar nav should toggle (behavior varies by screen width)

### 5. Sign Out
- Click "Logout" in sidebar navigation
- Verify redirect back to `/signin` page

## Architecture Notes

- State management: XState v5 machines (authMachine, dataMachine, createTransactionMachine, drawerMachine, snackbarMachine)
- Global actor: `authService` created with `createActor(authMachine)` and started globally
- Data machines: Factory pattern via `dataMachine(id)` with `.provide()` for specific implementations
- Components receive actor refs as props typed as `AnyActorRef`
- Use `useSelector(actorRef, selector)` to read actor state in components (NOT `useActor(actorRef)`)
- Use `actorRef.send()` directly to send events (not destructured send from useActor)

## Common Pitfalls

- XState v5 `useActor()` only accepts machine logic, NOT started actor refs. If you pass an actor ref, you'll get a runtime error. Use `useSelector(actorRef, (s) => s)` instead.
- `send("EVENT", payload)` does not work in v5 — must use `send({ type: "EVENT", ...payload })`
- `event.data` is renamed to `event.output` (onDone) or `event.error` (onError) in v5
- The app might show a cached auth state from localStorage. Clear localStorage if you see unexpected auth behavior.

## Devin Secrets Needed

No secrets required — the app uses local seeded data with hardcoded test credentials.
