# Main vs Dev - Environment Alignment

Date: 2026-05-04
Compared refs: `origin/main` (4a27ff3) vs `origin/dev` (4bc7511)

## Executive Summary

- The difference is architectural, not just environment config.
- `origin/dev` is a split monorepo style: `app/backend` + `app/frontend` + docker compose infra.
- `origin/main` is a unified app style: root `package.json`, Expo app + Express API in `src/server`.
- Recommendation: keep `main` architecture as source of truth and port only missing environment/developer-experience pieces from `dev`.

## Divergence Snapshot

- Ahead/behind (`dev...main`): `3 2`
- Unique files in `dev`: backend/frontend Nest+TS+Expo50 structure and docker compose stack.
- Unique files in `main`: root Expo54 + Express + PostgreSQL app structure.

## Environment and Tooling Matrix

| Area | `origin/dev` | `origin/main` | Alignment Action |
|---|---|---|---|
| App topology | Split: `app/backend` + `app/frontend` | Unified root app with `src/server` | Keep unified main topology |
| Backend runtime | NestJS 11 + TypeScript | Express 4 + Node | Do not mix runtimes now |
| Frontend runtime | Expo 50 / RN 0.73 / TS | Expo 54 / RN 0.81 / JS | Keep main versions |
| Package manifests | Two package.json files (backend/frontend) | Single root package.json | Keep root package strategy |
| Env examples | `app/backend/.env.example`, `app/frontend/.env.example` | root `.env.example` | Enrich root `.env.example` with optional vars |
| Docker compose | `infra/docker/docker-compose.yml` + postgres init sql | None | Add compose only if team needs containerized dev |
| Lint/format | backend/frontend specific configs | Minimal at root | Add lint/format scripts incrementally |
| Docs | Detailed setup in README (dev) | README has unresolved merge markers | Fix README first (critical) |

## High-Risk Findings

1. `README.md` in `main` has unresolved merge conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`).
2. `.gitignore` in `main` is much shorter and may miss common exclusions from `dev`.
3. Environment contract changed:
   - `main` uses `DATABASE_URL`, `JWT_SECRET`, `API_PORT`, `EXPO_PUBLIC_API_URL`.
   - `dev` uses many service-specific vars (`DATABASE_HOST`, `REDIS_URL`, `OPENAI_API_KEY`, etc.).

## Proposed Safe Convergence Plan (Main-Centric)

1. Create integration branch from `main`:
   - `git checkout main`
   - `git pull --ff-only origin main`
   - `git checkout -b chore/main-env-alignment`
2. Fix `README.md` conflict markers and keep one coherent setup section.
3. Expand root `.env.example` with optional documented variables needed by current codebase.
4. Restore practical ignore rules in `.gitignore` (without bringing obsolete paths).
5. Decide on docker support:
   - Option A: no docker for now (document local-only workflow).
   - Option B: add a lightweight `infra/docker/docker-compose.yml` compatible with main stack.
6. Validate startup:
   - `npm install`
   - `npm run db:setup`
   - `npm run api`
   - `npm start`
7. Open PR into `main` and keep `dev` untouched.

## Optional Follow-Up

If the team wants one branch model long-term, create a second PR to rebase/cherry-pick feature commits from `dev` into the main architecture instead of attempting a structural merge between both trees.
