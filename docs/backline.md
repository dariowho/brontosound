# Backline

Brontosound Backline is the band's companion app for playing live. Brontosound integrates with it; the code is in `src/lib/server/backline/` and `src/routes/backline/`.

`/backline` shows the Live page of the band's [Backline](https://github.com/brontosauri/brontosound-backline), the app that plays the show, on any phone or tablet: who is there sees the song as it plays and can drive it (play, cue a song, jump to a scene).

Brontosound does three things, and nothing else:

1. **Links** a Backline to a user. In Backline the user enters this site's address; Backline opens `/backline/link?request=<id>` in the browser, the signed-in user confirms (the page and Backline show the same code), and Backline fetches its token from `/backline/host/link`, once, within 10 minutes. Only the token's hash is stored ([links.ts](../src/lib/server/backline/links.ts)). Profile → Backline lists the links and unlinks them.
2. **Decides who gets in**: band members, signed in as usual; or, when Backline shares publicly, anyone with the PIN Backline shows (10 attempts per address per 15 minutes).
3. **Passes messages** between Backline and the browsers ([liveSession.ts](../src/lib/server/backline/liveSession.ts)). It never reads them. The page the browsers show is HTML sent by Backline, run in a sandboxed frame so it cannot touch this site's session.

Once in, the page in the frame looks for a direct path to Backline (WebRTC) and uses this server as the fallback. The messages and the reasons are in Backline's `docs/reference/share.md`.

## One Backline at a time

The live session is kept in memory. The Backline that announced last is the live one; announcing kicks out another one and its browsers. A Backline that stops asking for 45 s is gone; when the server restarts, Backline announces again by itself.

## Mailboxes

Both sides talk in plain HTTP requests ([mailbox.ts](../src/lib/server/backline/mailbox.ts)): a `GET` waits until there is a message (25 s at most), a `POST` brings some. No WebSocket, so nothing to set up in the server or a proxy in front of it; the proxy must only let a request last 30 s.

| Route | For | Signs in with |
|---|---|---|
| `/backline/host` | Backline: `PUT` announce, `GET` messages from browsers, `POST` messages to them | `Authorization: Bearer <token>` |
| `/backline/client` | A browser: `GET` take a seat or fetch messages, `POST` messages to Backline | session, or the PIN cookie |

## Settings

`backlineStunServers` in `data/bandSettings.json` (shown under Settings → Backline): STUN servers that tell Backline and the browsers their public addresses, for the direct path between networks. Default: `["stun:stun.l.google.com:19302"]` (Google sees the addresses, nothing else). `[]`: devices on different networks always go through this server.
