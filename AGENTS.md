# NOCPedia — Agent Guide

## Stack

- **Runtime:** React 19 + Vite 6 + TypeScript 5.8
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no config file)
- **Database:** Firestore (real-time via `onSnapshot`)
- **Auth:** Firebase Auth (Google popup + Email/Password)
- **Hosting:** Docker → nginx (port 3000)

## Commands

```sh
npm run dev      # Dev server on port 3000
npm run build    # Production build to dist/
npm run lint     # TypeScript type check only (tsc --noEmit)
npm run clean    # Unix-only (rm -rf dist) — fails on Windows CMD/PowerShell
```

No test framework configured.

## Architecture

- **Monolithic SPA:** All logic in `src/App.tsx` (~5000 lines). Only extracted component: `src/components/RichTextEditor.tsx` (TipTap).
- **Entrypoint:** `src/main.tsx` → `App.tsx`
- **Firebase init:** `src/firebase.ts` (exports `db`, `auth`, consumes `firebase-applet-config.json`)
- **Static data:** `src/data/constants.ts` — 23 manufacturer names/details/logos, 27 categories, Redes/Server groups
- **Seed commands:** `src/data/initialCommands.ts` (~50 commands, auto-seeded to Firestore on first admin login)
- **Types:** `src/types.ts` — `Command`, `Cliente`, `Ativo`, `DBUser`, `Backup`, `Fabricante` (union)
- **`@/*` alias:** Maps to **project root** (`.`), not `src/` — see `tsconfig.json` paths + `vite.config.ts` resolve.alias

## Firestore Collections

| Collection | Subcollection | Read rule |
|---|---|---|
| `commands/{id}` | — | public (anyone) |
| `clientes/{id}` | `ativos/{id}` | admin or own cliente |
| `users/{id}` | — | authenticated |
| `backups/{id}` | — | admin only |
| `test/connection` | — | (connectivity check, single doc) |

**Roles:** `admin` (full), `viewer` (read commands only), `cliente` (own client data + commands).

**Hardcoded admin email:** `noc.itmanage@gmail.com` (also in `firestore.rules` as fallback).

## Key Constraints

- No storage service — file attachments are stored as **Base64 inline** in Firestore (~1MB per-document limit).
- No pagination — all collections are fetched entirely via `onSnapshot`.
- Backup/restore replaces ALL data (no granular restore).
- HMR is conditionally disabled via `DISABLE_HMR` env var (see `vite.config.ts`).

## Keyboard Shortcuts (App.tsx)

| Key | Action | Role |
|---|---|---|
| Alt+N | New command | admin |
| Alt+M | Toggle sidebar | all |
| Alt+S | Focus search | all |
| Esc | Close modals | all |

## Admin SDK Scripts (ESM, run with `node`)

- `test-firestore.js` — Lists Firestore collections.
- `migrate-firestore-to-supabase.js` — One-shot migration script (Firebase → Supabase).
- Both require `.env` file with `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`.
- Supabase credentials are also configured in `.env` (`SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`).

## Sensitive Files (not git-tracked, do not commit)

- `.env` (Firebase admin private key + Supabase service role key)
- `service-account.json`
- `gen-lang-client-*-firebase-adminsdk-*.json`

## Additional Docs

- `.specs/` — Architecture, data model, routes, seed data, Firestore rules explanations.
- `docs/` — Firebase dependency inventory, Supabase migration guides.
- `migrations/` — SQL schemas + RLS policies for planned Firebase→Supabase migration.
- `firebase-blueprint.json` — Data model reference (Firestore schema definitions).

## Supabase Migration (NOT LIVE)

The live system uses Firebase exclusively. `migrations/` and `supabase/` contain schemas, RLS policies, and config for a planned migration that has **not been executed**. The migration script (`migrate-firestore-to-supabase.js`) is available but the frontend has no Supabase client code.

## UI Language

All UI strings are in **Portuguese (pt-BR)**.
