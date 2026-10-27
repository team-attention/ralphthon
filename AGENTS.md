# Ralphthon

Team Attention's hackathon operations site (GitHub `team-attention/ralphthon`, production https://ralphthon.team-attention.com).

- **Participants:** sign in with Google, register a team, submit links, and request a "lobster".
- **Admins:** watch teams live, send or cancel lobsters, and export CSV.
- **External engine:** the networking backoffice (ralph-net) pulls readiness and participant exports.

This is Next.js 16: read the relevant guide in `node_modules/next/dist/docs/` before relying on older Next.js habits.

## Deploy and verification (read first)

- **A push to `main` deploys to production immediately.** The Vercel project is Git-connected (production branch `main`) and does not wait for CI. Commit on a branch and push to `main` only with the owner's approval.
- **Production must equal git.** The deploy live since 2026-06-19 was made with the Vercel CLI and included `/timer` and `/slides-toss`, which were never committed. They were restored in `6aad4d0`. Never `vercel deploy` from a working tree that differs from a commit.
- **Gate before pushing:**
  - `pnpm install --frozen-lockfile`
  - `pnpm lint` (0 errors)
  - `pnpm tsc --noEmit`
  - `pnpm build` (needs network for `next/font/google`)
  - `pnpm test:e2e`
- **CI** (`.github/workflows/ci.yml`) runs lint, tsc, a `use server` grep and Playwright. It does not build; Vercel is the only build gate.
- **Env pulled with `vercel env pull` points at production data** (there is no staging project). For checks, use the CI placeholders `NEXT_PUBLIC_SUPABASE_URL=https://example.supabase.co` and `NEXT_PUBLIC_SUPABASE_ANON_KEY=test-anon-key`.

## Stack and commands

- Next.js 16.2.1 App Router (Turbopack), React 19.2, TypeScript strict (`@/*` resolves to `src/*`), pnpm 10.30.3.
- Tailwind CSS v4 with shadcn `base-nova` on `@base-ui/react`, next-intl 4, `@supabase/ssr` plus `supabase-js`, Polar checkout, Vercel Analytics.
- Scripts: `pnpm dev` (port 3000; `/` redirects to `/login`), `pnpm build`, `pnpm start`, `pnpm lint`, `pnpm test:e2e`.
- Change dependencies only with pnpm 10.30.3 so `pnpm-lock.yaml` stays in sync.
- Do not hand-edit `next-env.d.ts`, `*.tsbuildinfo` or `.next/`.

## Architecture rules

1. **No `'use server'` and no Server Actions.** ESLint errors on the directive in every file, and CI greps for the bare words "use server" in `src/` (comments included).
2. **Pages and layouts are client components.** Only `src/app/layout.tsx` and `src/app/page.tsx` are server components. Pages read and write Supabase in `useEffect`/handlers via `createClient()` from `@/lib/supabase`, which uses the anon key, so RLS applies.
3. **Privileged work runs in route handlers under `src/app/api/admin/*`.** They use `createAdminClient()` from `@/lib/supabase-server` (service role, `server-only`). Never import that module, or `@/lib/admin-auth` / `@/lib/networking`, from client code: `next build` fails.
4. **Admin auth is a cookie session plus an email allow-list.**
   - Allow-list format: comma-separated exact emails or `@domain` suffixes. The matcher is `isAdminEmail()` in `@/lib/admin-emails`.
   - Handlers read `ADMIN_EMAILS` per request. Use `adminSessionError()` from `@/lib/admin-auth`: it returns 401 without a session, 403 for a non-admin, and `null` for an admin.
   - The `/admin` and `/admin/login` pages only redirect in the browser, using `process.env.NEXT_PUBLIC_ADMIN_EMAILS`. Keep that literal reference so Next inlines it.
   - Keep `ADMIN_EMAILS` and `NEXT_PUBLIC_ADMIN_EMAILS` identical, and redeploy after changing either.
5. **Schema changes go only in a new file in `supabase/migrations/`.** Never edit an applied migration. Migrations are applied to the database by hand; CI and Vercel do not run them.
6. **`src/lib/database.types.ts` is hand-maintained.** It is not `supabase gen types` output. Update it in the same commit as the migration.
7. **Every route is dynamic** because the root layout reads the locale cookie. Do not try to make pages static.

## Map

- `src/app/(participant)/`: a route group with no URL segment, wrapped by the participant nav layout.
  - `/login`, `/register`, `/team/[id]`, `/guide`, `/timeline`, `/support` (Polar sponsor tiers)
  - Past-event pages: `/judge`, `/final`, `/awards`
- `src/app/admin/`:
  - `/admin`: dashboard with region tabs, the lobster queue, CSV export and the activity feed
  - `/admin/login`, `/admin/guide`, `/admin/timeline`, `/admin/networking`
- `src/app/slides/` (Busan deck), `src/app/slides-toss/` (Toss deck) and `src/app/timer/` (presenter timer) are standalone pages with no nav.
- `src/app/api/`:
  - `admin/lobster` (POST to send, DELETE to cancel a request)
  - `admin/team-members`
  - `admin/networking-status`, `admin/networking-export`
  - `dashboard` (public, service role; used by `public/dashboard.html`)
  - `checkout` (Polar)
  - `locale`
- `src/app/auth/callback`: OAuth code exchange, then redirects to `?next=` if it is a same-origin path (one leading `/`, not `//` or `/\`), else `/register`.
- `src/lib/`:
  - `supabase.ts`, `supabase-server.ts`
  - `admin-emails.ts`, `admin-auth.ts`, `networking.ts`
  - `use-lobster-countdown.ts`
  - `database.types.ts`, `utils.ts` (`cn`)
- `src/components/`: app components; `ui/` holds the shadcn primitives in use.
- `public/`: every file is a live URL and may be linked from outside, including `/dashboard.html` and `/showcase/`. Removing one is a behavior change.
- `docs/networking-ops-runbook.md`: operations runbook for the networking backoffice.
- `scripts/export-csv.ts`: a manual service-role CSV export (KR/US teams only). It reads `.env.local` and writes participant data to `exports/`, which is gitignored; never commit that output.

## Domain

- **Regions** (`teams.region`, a CHECK constraint):
  - `KR`: Seoul #2, 2026-03-29
  - `US`: SF, 2026-03-28
  - `SG`: Singapore, May 2026
  - `BUSAN`: Busan, 2026-05-30, the latest
  - Adding a region touches a migration, `database.types.ts`, the admin tabs and countdown, the register form and the activity feed.
- **Event content lives in source, not in data:** deadlines in `admin/page.tsx`, the Busan schedule in `components/timeline.tsx`, track copy in `components/guide.tsx` and `messages/*.json`, judges and teams in `/judge`, `/final` and `/awards`. `/register` always writes `region: 'BUSAN'`.
- **Tracks** (`teams.track`): `codex_plugin`, `image_service`, `busan_local`, `ai_application`. The legacy values `impact` and `harness` are still valid.
- **Lobster flow:**
  1. A member sets `teams.lobster_requested` on `/team/[id]`.
  2. An admin sends it through `POST /api/admin/lobster`. That calls RPC `activate_lobster`, which sets `lobster_activated_at` and increments `lobster_count`, then inserts a `lobster_events` row.
  3. The window is 10 minutes: `LOBSTER_DURATION_MS` in `src/lib/use-lobster-countdown.ts`.
- **Realtime** (postgres_changes on `teams` and `lobster_events`): channels `team-<id>`, `admin-teams-realtime` and `timeline-lobster-events-<region>`.
- **Networking backoffice contract** (`/api/admin/networking-*`):
  - Accepts the token `NETWORKING_BACKOFFICE_TOKEN` (fallback name `RALPHTHON_BACKOFFICE_TOKEN`) as `Authorization: Bearer` or `x-networking-backoffice-token`, or an admin session.
  - Returns 403 otherwise, never 401.
  - The status endpoint sends CORS headers for `NETWORKING_BACKOFFICE_ORIGIN` (default `https://ralph-net.vercel.app`) on every response.
  - Both endpoints fall back gracefully when the networking columns are missing.
  - Their JSON shapes (`schema_version` `ralphthon_*_v1`) are consumed externally: do not rename fields.

## i18n

- The locale comes only from the `NEXT_LOCALE` cookie (`en` default, or `ko`). It is set by `POST /api/locale`. There is no locale routing.
- The root layout ships all messages to the client, so `messages/en.json` and `messages/ko.json` must keep identical key sets. Add every key to both files and delete keys nobody calls.
- Many pages (`/judge`, `/final`, `/awards`, `/support`, `/slides`, `/admin/networking`) are not translated. Keep hardcoded copy as it is unless asked.

## Styling

- **Only `src/` is scanned.** `src/app/globals.css` imports Tailwind with `source("..")`, so class names in docs, `messages/` or `public/` never generate CSS. Class names must appear literally in `src/`; never build them with string interpolation.
- **Keyframes and the custom classes are referenced by name, not by the compiler.** Keyframes appear in inline style strings, e.g. `animation: 'lobsterPulse 1.5s ...'`. The custom classes are `.font-display`, `.glass`, `.glass-card`, `.grid-bg`, `.grain-overlay`, `.scanline-overlay` and `.text-glow-yellow`. Grep `src/` before renaming or deleting any of them.
- **Keep `<img>` tags as they are.** Switching to `next/image` changes the rendered HTML.

## Behavior-preserving changes

Treat these as observable behavior:
- DOM structure, className strings and inline-style key order
- Supabase request shapes: select strings, filter order, `.single()` vs `.maybeSingle()`
- Realtime channel names, route paths and query params (`?next`, `?judge`, `?slide`/`#id`, `?success`, `?event_slug`)
- API status codes, headers and bodies, including the order of checks (e.g. `team-members` validates `teamId` before auth)

The Busan admin countdown and the past-event tabs are still live UI.

## Known issues (owner decisions, not refactor targets)

- **Security migrations not yet applied to production:** `20261027000001` (revokes `activate_lobster` execute from anon/authenticated) and `20261027000002` (rewrites `team_update_guard` with `auth.role()`; the old one read the legacy `request.jwt.claim.role` setting and was a no-op). Until they are applied, both holes stay open.
- **Open writes:** `judging_scores` has open RLS (closing it is drafted in `supabase/drafts/`, pending the owner), and `/api/dashboard` is public.
- **Migrations cannot replay cleanly:** a fresh replay aborts at `20260325000009` (duplicate policy).
- **`/final` hydration mismatch:** it renders server time.
- **Admin CSV `member_count`:** RLS hides other teams' members.
- **Stale event pages still live:** `/judge`, `/final`, `/awards`, `/slides`, `/timeline`, `/dashboard.html` and `/showcase/`. `/showcase/` lists participants' real names.
