# HeaderBar

The charcoal bar at the top of every page: the band's logo and name on the left, the avatar (or Sign in) on the right.

- Provide: the band logo (`bandLogo` from band settings; defaults to the Brontosound mark), the band name, and either the signed-in user's avatar or a Sign in link.
- Height `header-height`, background `header`, the only element with `shadow-header`.
- Logo is 36px and inverted to white (`filter: invert(1)`), name in `band-name` on `on-header`.
- Default avatar: `faUser` in `stone-200` on a `charcoal-raised` disc. A user picture replaces the glyph and keeps the disc size.
- Signed out: a small primary button labelled "Sign in" instead of the avatar.
- On mobile a hamburger button sits before the logo and opens the sidebar drawer.
- Do not add navigation, search or extra actions to the bar; navigation lives in SidebarNav.
