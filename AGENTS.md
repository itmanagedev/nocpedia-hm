# NOCPedia-hm — Agent Guide

## Stack

- **Runtime:** React 19 + Vite 6 + TypeScript 5.8
- **Styling:** Tailwind CSS v4 (via `@tailwindcss/vite` plugin — no config file). Theme in `src/index.css`.
- **Database:** Supabase (PostgreSQL via REST + Realtime).
- **Auth:** Supabase Auth (Google OAuth + Email/Password).
- **Hosting:** Docker → nginx (port 3000).

## Commands

```sh
npm run dev      # Dev server on port 3000 (--host=0.0.0.0)
npm run build    # Production build to dist/
npm run preview  # Preview production build
npm run lint     # TypeScript type check only (tsc --noEmit) — no ESLint/Prettier
```

No test framework configured.

`.env` requires `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (see `.env.homolog`).

## Architecture

- **Monolithic SPA:** All logic in `src/App.tsx`. Extracted component: `src/components/RichTextEditor.tsx` (TipTap).
- **Entrypoint:** `src/main.tsx` → `App.tsx`.
- **Data layer:** `src/supabase.ts` (Supabase client) + `src/db.ts` (CRUD — commands, clientes, ativos, backups, user_profiles).
- **Static data:** `src/data/constants.ts` — 23 manufacturers, 27 categories, Redes/Server groups.
- **Seed data:** `src/data/initialCommands.ts` (~50 commands, auto-seeded on first admin login).
- **Types:** `src/types.ts` — `Command`, `Cliente`, `Ativo`, `DBUser`, `Backup`, `Fabricante`.

## Auth & Roles

**Roles:** `admin` (full), `viewer` (read commands only), `cliente` (own data). Stored in `user_profiles` table (FK to `auth.users`).

Hardcoded admin email: `noc.itmanage@gmail.com`.

## Supabase Schema

Tables: `commands`, `clientes`, `ativos`, `user_profiles`, `backups`. Migrations in `migrations/` (`001_initial_schema.sql`, `002_rls_policies.sql`). Column names use `snake_case` — mapping in `src/db.ts`.

## UI Language

All UI is in **Portuguese (pt-BR)**.

## Key Constraints

- No storage service — file attachments stored as **Base64 inline** in DB.
- No pagination — all collections fetched entirely.
- Backup/restore replaces ALL data (no granular restore).
- `GEMINI_API_KEY` injected into client bundle via Vite `define`.

## Keyboard Shortcuts (App.tsx)

| Key | Action | Role |
|---|---|---|
| Alt+N | New command | admin |
| Alt+M | Toggle sidebar | all |
| Alt+S | Focus search | all |
| Esc | Close modals | all |

## Legacy Removed

Firebase artifacts deleted:
- `firebase-applet-config.json` — unused config
- `firestore.rules` — replaced by Supabase RLS (`migrations/002_rls_policies.sql`)
- `firebase-blueprint.json` — legacy data model
- `docs/firebase-dependencies.md` — obsolete inventory
- `test-firestore.js` / `migrate-firestore-to-supabase.js` — legacy admin scripts

## Additional Docs

- `.specs/` — Architecture, data model, seed data, components.
- `docs/` — Supabase setup and migration guides.
