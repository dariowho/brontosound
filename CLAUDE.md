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
npm run fetch-soundfont   # download FluidR3_GM into data/soundfonts (MIDI playback)
```

Docker build/run instructions: see [README.md](README.md).

## Writing (this matters)

**Be as concise as you can be.** Every extra word costs the reader time. Say the thing
once, then stop — no restating the task back, no summarising what the diff already shows,
no caveats nobody asked for. This applies to chat replies, commit messages, docs and this
file.

In-depth explanation goes in [docs/](docs/), not in README or chat — and short there too.

## Coding

Keep the code elegant, minimal, modular and readable. Your edits should be straightforward to understand and code review for human reviwers, minimize cognitive overload. If you need to add complex logic, factor it in components or libraries so that the abstract implementation remains clear. So no infinite blobs or obscure logic; yes: short functions, carefully named entities, reusable components with clear responsibilities.

## Commits & releases

Conventional Commits (`feat:`, `fix:`, `refactor:`, …) — `standard-version` builds
[CHANGELOG.md](CHANGELOG.md) from them. Release: `npm run release`, see
[docs/releasing.md](docs/releasing.md). `src/lib/version.json` is generated; never edit it.

## Architecture

- `src/routes/app/**` — authenticated UI. `src/routes/api/**` — JSON endpoints (POST entity, save via TypeORM, return `instanceToPlain`). Never save client JSON as is: build what you save field by field with [input.ts](src/lib/server/input.ts) (see [liveInput.ts](src/lib/server/liveInput.ts)); ids, authorship and relations are the server's.
- `src/lib/dbEntities/*.ts` — TypeORM entities. Registered in the `entities` array in [src/lib/db.ts](src/lib/db.ts) — new entities must be added there. `synchronize: true`, no migrations. DB at `data/database/database.sqlite`.
- Most entities extend `UserCreatedEntity` (id, createdBy, lastModifiedBy, creationDate).
- [src/lib/db.ts](src/lib/db.ts) — `TypeOrm.getDb()/getRepository()` singleton; `saveEntityViaApi()` is the client-side helper that POSTs to an `/api` endpoint.
- Entities cross the server/client boundary as plain objects: `instanceToPlain` in `+page.server.ts` load, `plainToClass` on the way back in.
- Auth: email/password or Google SSO, see [docs/authentication.md](docs/authentication.md). [src/hooks.server.ts](src/hooks.server.ts) loads the `User` from the JWT's `userId` and guards `/app` and `/api`. Session is `event.locals.brontoSession` (`user`, `auth`, `permissions`). Roles/permissions in [src/lib/dbEntities/user.ts](src/lib/dbEntities/user.ts); enforce with `requirePermission()` ([src/lib/server/session.ts](src/lib/server/session.ts)) in every endpoint and action that changes data, and hide the UI controls with `can()` ([src/lib/permissions.ts](src/lib/permissions.ts)).
- `data/files/` holds the band's files (filesystem backend), which the band may mount from elsewhere. The rest of `data/` is Brontosound's own: never expose it.
- Band settings: `data/bandSettings.json`, read/cached by [src/lib/server/bandSettings.ts](src/lib/server/bandSettings.ts). Never send it raw to the client — use `safeBandSettings()`.
- Backline (the band's companion app for playing live) integrates here: links to user accounts, and its Live page at `/backline`. See [docs/backline.md](docs/backline.md); code in `src/lib/server/backline/` and `src/routes/backline/` (a public route: it checks access itself).
- Song files (readme, chordpro) live in file storage, not the DB: `PersistedStorage` in [src/lib/server/storage.ts](src/lib/server/storage.ts) with a filesystem (`data/files/`) or WebDAV backend, selected by settings via `getUserStorage()`. Storage refuses paths outside the songs folder; never build paths from client input without `isFolderName()` or the song-scoped helpers in [songFolder.ts](src/lib/server/songFolder.ts).
- Song page: folder browser, viewer (chord chart formats, PDF…) and practice player, see [docs/songPage.md](docs/songPage.md).
- Venue maps: the provider (OpenStreetMap, Mapbox, HERE, Google) is chosen by `mapsProvider` in band settings, see [docs/maps.md](docs/maps.md); code in `src/lib/maps/` and `src/lib/components/maps/`.
- `+page.server.ts` loads conventionally return `pageTitle` and `breadcrumb` alongside data.
- URLs are `/<id>/<slug>`; build them with `buildVenueUrl`/`buildGigUrl` in [src/lib/misc.ts](src/lib/misc.ts).
- UI follows the design system in [docs/design-system/](docs/design-system/README.md): read it before building or restyling a page.

## Notes

- Secrets in `.env` (`AUTH_GOOGLE_ID`, `AUTH_GOOGLE_SECRET`, `AUTH_SECRET`); see `.env.template`.
- Test suites are still the create-svelte placeholders.
