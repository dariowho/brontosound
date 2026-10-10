# Brontosound

Band management web app (SvelteKit 2 + Svelte 5, TypeScript, Tailwind + Flowbite, TypeORM/SQLite).

## Commands

```bash
npm run dev          # vite dev server
npm run build        # adapter-node build
npm run check        # svelte-check (type checking)
npm run lint         # eslint
npm run test:unit    # vitest
npm run test:integration  # playwright
npm run release      # standard-version: bump, changelog, tag
npm run release:dry  # preview the release
npm run -s hash-password  # hash for adminPasswordHash in bandSettings.json
```

Docker build/run instructions: see [README.md](README.md).

## Writing (this matters)

**Be as concise as you can be.** Every extra word costs the reader time. Say the thing
once, then stop — no restating the task back, no summarising what the diff already shows,
no caveats nobody asked for. This applies to chat replies, commit messages, docs and this
file.

In-depth explanation goes in [docs/](docs/), not in README or chat — and short there too.

## Coding

Keep the code elegant, minimal and readable. Your edits should be straightforward to understand and code review.

## Commits & releases

Conventional Commits (`feat:`, `fix:`, `refactor:`, …) — `standard-version` builds
[CHANGELOG.md](CHANGELOG.md) from them. Release: `npm run release`, see
[docs/releasing.md](docs/releasing.md). `src/lib/version.json` is generated; never edit it.

## Architecture

- `src/routes/app/**` — authenticated UI. `src/routes/api/**` — JSON endpoints (POST entity, save via TypeORM, return `instanceToPlain`).
- `src/lib/dbEntities/*.ts` — TypeORM entities. Registered in the `entities` array in [src/lib/db.ts](src/lib/db.ts) — new entities must be added there. `synchronize: true`, no migrations. DB at `data/database/database.sqlite`.
- Most entities extend `UserCreatedEntity` (id, createdBy, lastModifiedBy, creationDate).
- [src/lib/db.ts](src/lib/db.ts) — `TypeOrm.getDb()/getRepository()/saveEntity()` singleton; `saveEntityViaApi()` is the client-side helper that POSTs to an `/api` endpoint.
- Entities cross the server/client boundary as plain objects: `instanceToPlain` in `+page.server.ts` load, `plainToClass` on the way back in.
- Auth: email/password or Google SSO, see [docs/authentication.md](docs/authentication.md). [src/hooks.server.ts](src/hooks.server.ts) loads the `User` from the JWT's `userId` and guards `/app` and `/api`. Session is `event.locals.brontoSession` (`user`, `auth`, `permissions`). Roles/permissions in [src/lib/dbEntities/user.ts](src/lib/dbEntities/user.ts); enforce with `requirePermission()` ([src/lib/server/session.ts](src/lib/server/session.ts)) — only `users.manage` is enforced so far.
- Band settings: `data/bandSettings.json`, read/cached by [src/lib/server/bandSettings.ts](src/lib/server/bandSettings.ts). Never send it raw to the client — use `safeBandSettings()`.
- Song files (readme, chordpro) live in file storage, not the DB: `PersistedStorage` in [src/lib/server/storage.ts](src/lib/server/storage.ts) with a filesystem (`data/`) or WebDAV backend, selected by settings via `getUserStorage()`.
- `+page.server.ts` loads conventionally return `pageTitle` and `breadcrumb` alongside data.
- URLs are `/<id>/<slug>`; build them with `buildVenueUrl`/`buildGigUrl` in [src/lib/misc.ts](src/lib/misc.ts).

## Notes

- `src/routes/app/songbookLegacy/` is the old filesystem-indexed songbook; `songbook/` is the DB-backed replacement. Prefer the latter.
- Secrets in `.env` (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`); see `.env.template`.
- Test suites are still the create-svelte placeholders.
