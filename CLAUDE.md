# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Farmatour5 is a gamified training platform (Spanish-language UI and code comments). Pharmacy staff (participants) log in with their DNI, move through Worlds → Levels → Missions → Questions, and earn stars. Admins manage the content and look at reports. It is a monorepo of three independent npm projects with no shared workspace tooling:

| Dir | Stack | Local port | Prod domain |
|---|---|---|---|
| `backend/` | NestJS 10 + TypeORM + PostgreSQL | 3011 (from `backend/.env`; the code default is 3001) | farmatour5-api.cuborojo.pe |
| `frontend-manager/` | Next.js 14 App Router, Tailwind, Zustand, TipTap | 3012 | farmatour5-admin.cuborojo.pe |
| `frontend-participants/` | Next.js 14 App Router, Tailwind, Zustand | 3010 | farmatour5.cuborojo.pe |

## Commands

From the repo root (uses `concurrently`):
```bash
npm run install:all          # install root + all three apps
npm run dev                  # run all three in dev mode
npm run dev:backend | dev:manager | dev:participants
npm run build                # build all; or build:backend / build:manager / build:participants
```

Per app: `backend`: `npm run start:dev` (nest watch) and `npm run build`. Frontends: `npm run dev` and `npm run build`. The frontends need `--legacy-peer-deps` for `npm install`/`npm ci` (CI uses it).

There is **no test suite** and no ESLint config. `backend` has `lint`/`test` scripts, but they are not wired up, and CI treats lint as non-blocking. To check a change, run `npm run build` in the affected app (`nest build` / `next build` type-check it). Swagger docs are served at `http://localhost:3011/api/docs`.

## Backend architecture

- All routes are under the global prefix `/api`. A global `ValidationPipe` runs with `whitelist + forbidNonWhitelisted`, so **every request body field must be declared in a DTO/class-validator class**, or the request is rejected.
- Feature modules live in `backend/src/modules/<feature>/` (controller/service/entity/module). Entities are auto-loaded by the glob `**/*.entity{.ts,.js}`.
- **`synchronize: false`**: TypeORM never changes the schema. Schema changes are hand-written SQL in `database/` (`schema.sql` is the base, `database/migrations/*.sql` are idempotent `DO $$ ... EXCEPTION` scripts). When you add or change an entity column, also add the SQL migration. Columns are snake_case in the DB and mapped with `@Column({ name: 'snake_case' })`.
- Auth uses two separate JWT strategies (`modules/auth/`):
  - `jwt-admin` (`JWT_SECRET`): system users with role `manager` or `reporter`. `AdminGuard` = any admin, `ManagerGuard` = manager role only.
  - `jwt-participant` (`JWT_PARTICIPANT_SECRET`): participants log in with **DNI only** (no password). `ParticipantGuard`.
- **Level types** (`levels/level.entity.ts`, `LevelType`): `normal` levels contain missions → questions. `golden` levels have no missions; they use `golden_level_items` / `golden_level_questions` / answer options (`golden-levels.service.ts`). `final` levels have their own question tables (`final-levels.service.ts`). The legacy `isGolden` boolean is still checked alongside `levelType === 'golden'`.
- **Progress cascade** (`progress/progress.service.ts`, the core game logic): `POST /progress/answer` saves to `participant_answers`, then `updateMissionProgress()` runs (a mission is complete when *all* active questions are answered; stars come only from correct answers), then `checkLevelCompletion()` (always upserts `participant_level_progress`, and the level is complete when all missions are complete), then the world completion check. Golden and final levels use `answer/golden` and `answer/final` with their own progress tracking. `GET /progress/game-state` is the large aggregate the participant app loads. See `GUIA_PROGRESO_NIVEL.md` and `BUG_FIX_FINAL_LEVEL_PROGRESS.md` for the intended semantics.
- `reports.service.ts` is mostly raw SQL for KPIs and exports.
- Media uploads go to disk (`UPLOAD_DIR`, default `./uploads`) through multer. `trust proxy` is enabled so that generated media URLs use https behind Nginx.

## Frontend notes

- **frontend-participants**: `src/services/api.ts` and `src/lib/axiosInstance.ts` attach the participant token from the Zustand `authStore`. On a 401 the instance silently re-logs in with the stored DNI and retries; if that fails it dispatches a `window` `auth-failed` event. `src/middleware.ts` guards `/game/*` with a `token` cookie. `game/levels/[levelId]/page.tsx` sends each level to `MissionsFlow`, `GoldLevelFlow` or `FinalLevelFlow` based on its level type. `WorldClassProvider` adds a `world-<slug>` class to `<body>` for per-world theming (e.g. farma/infant backgrounds in `public/images/level-*-farma|infant`).
- **frontend-manager**: admin pages are under `src/app/(dashboard)/` (Spanish route names: `mundos`, `niveles`, `misiones`, `participantes`, `reporteria`, `biblioteca`, ...). The API client in `src/app/services/api.ts` stores the token in `localStorage` (`manager_auth_token`) and redirects to login on a 401. There are bulk import modals for levels, questions, golden levels and participants (CSV/XLSX via `xlsx`/`papaparse`).
- Both apps read `NEXT_PUBLIC_API_URL` (and `NEXT_PUBLIC_MEDIA_URL`). `NEXT_PUBLIC_BASE_PATH`/`NEXT_PUBLIC_ASSET_PREFIX` are supported for proxying.

## Deployment

A push to `main` triggers `.github/workflows/deploy.yml`, which builds the three apps, copies them over SSH to the server, rebuilds them there, and reloads PM2 (`ecosystem.config.js`: process names `farmatour5-backend`, `farmatour5-manager`, `farmatour5-participants`) and Nginx (`nginx/*.conf`). The `.env` files are injected from GitHub secrets (`BACKEND_ENV`, `FRONTEND_*_ENV`). **Committing to `main` deploys to production.** DB backup scripts are in `scripts/`.
