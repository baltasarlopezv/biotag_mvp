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

For Android emulator, set this in `.env`:

```bash
EXPO_PUBLIC_API_URL=http://10.0.2.2:4000
```

## Database Commands

For your local PostgreSQL instance:

```bash
npm run db:setup
```

Schema file: `src/server/schema.sql`

## Scripts

- `npm start`: start Expo
- `npm run android`: start Expo for Android
- `npm run ios`: start Expo for iOS
- `npm run web`: start Expo for web
- `npm run api`: start Express API
- `npm run api:tunnel`: expose the API with ngrok and save the public URL
- `npm start`: start Expo
- `npm run api`: start Express API
- `npm run api:tunnel`: expose the API with ngrok and save the public URL
- `npm run env:check`: validate required environment vars
- `npm run db:setup`: apply schema and seeds to local PostgreSQL
- `npm run bootstrap`: one-shot initial setup for new machines
- `npm run db:up`: (optional) start PostgreSQL with Docker Compose
- `npm run db:down`: (optional) stop Docker PostgreSQL container

- Daily development branch: `dev`
- Stable integration branch: `main`
- Use PRs from `dev` to `main` for controlled integration
