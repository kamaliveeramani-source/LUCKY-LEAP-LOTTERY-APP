# Lucky Leap — Lottery Demo App

A demo lottery web application with wallet, games, ticket purchasing, and a small React frontend plus Node/Express + Sequelize (Postgres) backend.

## Features

- User registration and JWT authentication
- Server-backed Wallet model (balances, bonus, winnings, stats)
- Deposit / Withdraw / Transfer wallet APIs
- Multiple demo games: Lottery, Dice (3 & 5 min), Colour Prediction, Jackpot
- Ticket purchase flow integrated with wallet
- Notifications (toast system) across UI
- Responsive React frontend built with Vite

## Tech stack

- Frontend: React + Vite, Bootstrap
- Backend: Node.js, Express, Sequelize (Postgres)
- Auth: JSON Web Tokens (JWT)
- Bundler / Dev tooling: Vite, nodemon

## Installation

Prerequisites:
- Node.js 18+ installed
- PostgreSQL server

From repository root:

```bash
# install backend deps
cd backend
npm install

# install frontend deps
cd ../frontend
npm install
```

## Environment variables

Create a `.env` file in `backend/` with at least:

```env
PORT=5000
DATABASE_URL=postgres://user:password@host:5432/dbname
JWT_SECRET=your_jwt_secret
NODE_ENV=development
```

(Adjust according to `backend/config/database.js` usage.)

## Local setup

1. Start backend (development):

```bash
cd backend
npm run dev
```

2. Start frontend (development):

```bash
cd frontend
npm run dev
```

3. Build for production (frontend):

```bash
cd frontend
npm run build
```

4. Backend has no compile step; production start:

```bash
cd backend
npm start
```

Note: A one-time migration script exists at `backend/scripts/migrateWallets.js` (already run in this workspace). Skip it if you don't need to migrate legacy `User.wallet` values.

## Deploying to Render

This app can be split into two services on Render:

- Frontend: deploy the `frontend/dist` folder as a static site (or configure a build command on Render to run `npm run build` then publish `dist`).
- Backend: deploy the `backend` folder as a Node service.

Backend Render settings:
- Start Command: `npm start`
- Environment: set `DATABASE_URL`, `JWT_SECRET`, and other env vars described above.
- Add a Postgres managed database and set `DATABASE_URL`.

Frontend Render settings (static site)
- Build Command: `cd frontend && npm install && npm run build`
- Publish Directory: `frontend/dist`

CORS: Ensure `VITE_API_URL` (frontend) or `VITE_API_HOST` points to your backend URL in production.

## Live URLs

- Live frontend URL: https://your-frontend.onrender.com (replace with your site)
- Live backend URL: https://your-backend.onrender.com (replace with your service)

## Folder structure

```
backend/
  server.js
  package.json
  config/
  controllers/
  models/
  routes/
  scripts/
frontend/
  src/
    components/
    context/
    pages/
    services/
  public/
  package.json
  vite.config.js
```

## Screenshots

Add screenshots to `frontend/public/screenshots/` and reference them below. Example:

- `screenshots/dashboard.png` — Dashboard and wallet card
- `screenshots/wallet.png` — Wallet deposit / withdraw
- `screenshots/lottery.png` — Lottery listing

(Placeholders — add your images to the repo before publishing.)

## License

This repository is provided under the MIT License. See `LICENSE` for details.

---

If you want, I can also:
- Replace the remaining browser `alert()` uses (already replaced) with the in-app toast UI everywhere.
- Help prepare a Render `start` command or `Dockerfile` for single-container deployment.
- Add a simple health-check endpoint for the backend.

