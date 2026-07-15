# Teacher Timetable: Agent Guide

## Product and stack

This is the LKC Timetable progressive web application. It displays college
program, teacher, and room schedules and includes an administrative UI for
managing timetable data.

- **Framework:** Next.js 16 App Router with React 19 and strict TypeScript.
- **Styling:** Tailwind CSS v4 with shadcn-style primitives in
  `src/components/ui` and Lucide icons.
- **Client data:** TanStack Query, provided by the root layout.
- **Database:** Drizzle ORM over Neon Postgres; the schema is
  `src/lib/db/schema.ts`.
- **Authentication:** Better Auth using the Drizzle adapter.
- **PWA:** `@ducanh2912/next-pwa`; production builds generate ignored service
  worker artifacts in `public`.
- **Package manager:** use Bun (`bun.lock` is committed). Run package scripts
  as `bun run <script>`.

## Architecture and data flow

### Application layers

- `src/app` owns App Router pages, the root layout, global CSS, and route
  handlers.
  - `/api/timetable/*` exposes public timetable reads.
  - `/api/admin/*` contains timetable, program, teacher, and room mutations.
  - `/api/auth/[...all]` exposes the Better Auth handler.
  - `/api/visitor-count` reads and increments visitor counters.
- `src/modules/timetable` contains the feature's shared client query hooks and
  server read helpers. Add shared timetable client types/fetch hooks to
  `hooks/use-timetable.ts`; add reusable server-side read queries to
  `server/hooks.ts`.
- `src/modules/auth` contains server-side session and role helpers. The Better
  Auth configuration and browser client live in `src/lib/auth.ts` and
  `src/lib/auth-client.ts`.
- `src/lib` owns infrastructure: environment access, DB connection, Drizzle
  schema, seed/truncate scripts, auth configuration, and `cn()`.
- `src/components` contains shared application components; use
  `src/components/ui` primitives instead of creating duplicate button, form,
  input, select, or layout infrastructure.

### Request and client-cache flow

Client pages and components fetch timetable data with TanStack Query. Public
read route handlers delegate to `src/modules/timetable/server/hooks.ts`, while
admin write handlers currently access Drizzle directly. When a mutation changes
an entity, invalidate every relevant existing query key (for example,
`programs`, `teachers`, `rooms`, or `timetable-entries`) so rendered schedules
do not remain stale.

Use the `@/` import alias for source files. Preserve React Server Component
boundaries: add `"use client"` only for components that need browser APIs,
state, effects, event handlers, or client-only libraries.

## Timetable and database contracts

The database has Better Auth tables (`user`, `session`, `account`, and
`verification`) plus timetable tables:

- `program`, `teacher`, `room`, and `subject` are independently managed
  entities.
- `timetableEntry` references a required program and optional subject, teacher,
  and room. Its relationships are UUID-based; preserve the schema's cascade and
  set-null behavior when editing it. `subjectLabel` stores the original
  per-entry subject text from timetable source data; use it before the shared
  `subject.name` when rendering or resolving group-specific colors.
- `visitorStats` maintains rows for `total` and the current ISO date
  (`YYYY-MM-DD`) used by the visitor counter.

Persisted lecture slots use lowercase canonical values such as
`lect-1_(9:00-9:45)`. Day ranges use strings such as `(1-6)`, representing a
contiguous slice of Monday through Saturday. Preserve both formats across the
schema, seed data, route APIs, filtering, and rendering.

`output.json` is the seed input. `src/lib/db/seed.ts` splits slash-delimited
subjects, teachers, rooms, and day ranges into related timetable entries. The
shared `subject` table remains keyed by unique code, while timetable-entry
labels preserve split subject text such as `G1(4-6)` and `G2(4-6)`.

## API, security, and data-safety rules

- Return explicit `NextResponse` JSON failures from route handlers and validate
  all untrusted request bodies before database writes.
- Treat `/admin` and every `/api/admin/*` mutation as sensitive. The repository
  includes `requireAuth` and `requireAdmin` in
  `src/modules/auth/server/hooks.ts`, but the current admin page and mutation
  handlers do **not** call them. Do not describe those routes as protected.
- Any change that adds, changes, or exposes an admin mutation must enforce
  authorization in the server-side route handler. Client-side role checks only
  affect navigation visibility and are not access control.
- Keep credentials in ignored environment files. `DATABASE_URL` is required for
  database access; never commit, echo, or log credentials or other secrets.
- `bun run db:push`, `bun run seed`, `bun run backfill:subject-labels`, and
  especially `bun run delete` mutate the configured database. Confirm the
  intended environment and get explicit approval before running them. The
  truncate script also deletes auth data.

## Cross-view consistency

Timetable display logic is duplicated in the home filtered view,
`/timetable/[id]`, and `/dashboard/timetable/[id]`. Verify all affected views
when changing timetable entries, lecture slots, day ranges, or rendering.

`dayRange` controls when an entry is scheduled, but group-specific colors must
also be supported by an explicit `G<number>` marker in the visible subject
name. Do not infer a group color solely from hidden `dayRange` metadata. An
unranged multi-group label such as `G1, G2` remains combined unless an explicit
group/day mapping resolves the applicable group.

The primary timetable views and seed data use lowercase canonical slot values,
but `/admin` and `/dashboard/timetable/[id]` currently use display-like
`Lect-…` slot strings. Treat this mismatch as an existing compatibility risk;
do not silently propagate it. Normalize deliberately and verify resulting data
can be found and displayed by every relevant view.

## Development and verification

```sh
bun run dev       # start the local Next.js development server
bun run test      # timetable utility tests
bun run lint      # Biome formatter, linter, and import organization checks
bun run build     # production Next.js/PWA build
```

The timetable group/day parsing utility has focused automated coverage through
`bun run test`; there is no CI configuration. Manually test affected public
program, teacher, and room timetable views, plus relevant admin mutation flows,
when code changes are not covered by automated checks.

Current baseline as of 2026-07-15:

- `bun run build` succeeds, with a warning that
  `baseline-browser-mapping` data is stale.
- `bun run lint` fails on pre-existing formatting, import-order, unused-code,
  and non-null-assertion diagnostics. Do not add new diagnostics; distinguish
  existing failures from failures introduced by your change.

When changing PWA branding, replace `public/lkc-logo.png` intentionally and
regenerate its public icon variants with the scripts in `scripts/`. Do not
commit generated service-worker files; they are ignored and recreated by
production builds.
