# Deployment

Serve Brontosound only behind an HTTPS reverse proxy, with the app's port not reachable directly.

- **`ORIGIN` and `AUTH_URL`**: the public https origin, e.g. `https://band.example`. Without `AUTH_URL`, Auth.js builds its URLs from the `Host` header (`trustHost` in [src/auth.ts](../src/auth.ts)).
- **`ADDRESS_HEADER` and `XFF_DEPTH`**: the header the proxy puts the client address in, and how many proxies there are (e.g. `X-Forwarded-For` and `1`). Sign-in attempts are throttled per address: without these, every visitor shares the proxy's, and anyone can lock `admin` out for everyone. With them and the app port public, anyone can fake the header.
- **`AUTH_SECRET`**: `openssl rand -base64 32`. The server won't start with the `.env.template` placeholder.
- **Map keys** reach browsers by design: restrict each to your domain (HTTP referrer) in its provider's console. See [maps.md](maps.md).
- **Uploads**: `BODY_SIZE_LIMIT` caps request bodies (the Dockerfile sets 200M). Cap request size and connections at the proxy too.
- **Back up `data/`**: database, band settings and, with the filesystem backend, song files.
