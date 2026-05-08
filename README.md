# BioTag

Monolithic development environment based on the current main architecture:

- Mobile app in Expo/React Native
- API backend in Express
- PostgreSQL as primary database

## Team Development Standard

- Main architecture is the source of truth.
- Express stays as backend base (Nest is not used).
- Environment variables are defined by the root `.env.example`.

## Requirements

- Node.js 20+
- npm 10+
- PostgreSQL running locally on port 5432

## Prerequisites Installation

Before running the project, install and configure the following tools.

### 1) ngrok (required for iPhone / Expo Go tunnel flow)

Install ngrok:

- macOS: https://dashboard.ngrok.com/get-started/setup/macos
- Windows: https://dashboard.ngrok.com/get-started/setup/windows

Configure your ngrok auth token after installation:

1. Sign in at https://dashboard.ngrok.com/
2. Copy your auth token from the dashboard
3. Run:

```bash
ngrok config add-authtoken <YOUR_NGROK_TOKEN>
```

If your installed version expects the legacy syntax, use:

```bash
ngrok authtoken <YOUR_NGROK_TOKEN>
```

Quick check:

```bash
ngrok version
```

### 2) PostgreSQL 15

Install PostgreSQL 15:

- macOS: https://www.postgresql.org/download/macosx/
- Windows: https://www.postgresql.org/download/windows/

After installation, ensure PostgreSQL is running on port `5432` and that your `DATABASE_URL` in `.env` points to that instance.

### 3) pgAdmin 4 (version 9.14)

Install pgAdmin 4 version 9.14:

- macOS: https://www.pgadmin.org/download/pgadmin-4-macos/
- Windows: https://www.pgadmin.org/download/pgadmin-4-windows/

pgAdmin is optional for runtime, but recommended for inspecting and managing your local database.

## Quick Start

One-shot first setup (macOS and Windows):

```bash
npm install
npm run bootstrap
```

What `bootstrap` does:

- Creates `.env` from `.env.example` if missing
- Validates required environment variables
- Checks that PostgreSQL is available at `DATABASE_URL`
- Applies DB schema and seeds

Manual setup (if preferred):

```bash
npm install
cp .env.example .env
npm run env:check
npm run db:setup
```

Windows (PowerShell) manual copy alternative:

```powershell
Copy-Item .env.example .env
```

For standard initialization, `bootstrap` and `env:check` handle the required `.env` values automatically from `.env.example`.

Only change `.env` manually if you need a custom setup (for example Android emulator network settings).

Run services in separate terminals:

```bash
npm run api
```

```bash
npm start
```

For iPhone / Expo Go without Xcode:

```bash
npm run api
npm run api:tunnel
npm run start:tunnel
```

`npm run api:tunnel` publishes the backend with ngrok and writes the generated public URL to `.env.api-tunnel`, which `npm run start:tunnel` reads automatically.

Do not use `npm run ios` unless you want the iOS simulator and have Xcode installed.

## Database Commands

For your local PostgreSQL instance:

```bash
npm run db:setup
```

Schema file: `src/server/schema.sql`

## Scripts

- `npm start`: start Expo
- `npm run api`: start Express API
- `npm run api:tunnel`: expose the API with ngrok and save the public URL
- `npm run env:check`: validate required environment vars
- `npm run db:setup`: apply schema and seeds to local PostgreSQL
- `npm run bootstrap`: one-shot initial setup for new machines

- Daily development branch: `dev`
- Stable integration branch: `main`
- Use PRs from `dev` to `main` for controlled integration