# Authentication

Auth.js, configured in [src/auth.ts](../src/auth.ts). Two ways in:

- **Email (or username) + password** — Credentials provider. Passwords are scrypt-hashed ([password.ts](../src/lib/server/password.ts)). 10 attempts per login and client address per 15 minutes.
- **Google SSO** — allowed if the Google account is already linked to a user, or its verified email matches a user that has a password (i.e. was added by an admin). In the latter case it gets linked.

The session JWT carries `userId` and `sessionVersion`, signed with `AUTH_SECRET`: the server won't start without it or with the `.env.template` placeholder, and warns when it is under 32 characters. The `jwt` callback drops the session when the user is removed or their `sessionVersion` has changed.

Users change their display name and password at `/app/profile` (header avatar). Changing the password signs them out everywhere, and so does **Sign out everywhere**. Users who only have Google can set a password there.

## Default admin

User `admin` (no email) is created at startup. Its password hash is `adminPasswordHash` in band settings, required: the server won't start without it (`npm run hash-password`). Changing it takes effect on restart and signs admin out everywhere.

## Roles

`viewer`, `editor`, `admin` ([user.ts](../src/lib/dbEntities/user.ts)). Admins add and remove users in **Settings → Users**. Every endpoint and form action that changes data calls `requirePermission()`: viewers can only read. Profile, player preferences and Backline links are the user's own.

Removing a user deletes their password, linked accounts and Backline links (cutting off their Backline if live), signs them out everywhere, and sets `removedDate`. The row is kept so their content keeps its author; adding the same email again restores it.

## Google admins

Emails in `authorizedGoogleSSOUsers` (`data/bandSettings.json`) are created or made admin whenever they sign in with Google, and can't be removed from the UI. Removing an email from that list no longer revokes access: remove the user in Settings.

## Linked accounts

`UserAccount` maps (`provider`, `providerAccountId`) to a `User`, many per user. Linking a provider for API access (Spotify, Apple Music, …) will also need token columns on `UserAccount`, and a callback that reads the current session: without a DB adapter, Auth.js ignores it on OAuth sign-in.
