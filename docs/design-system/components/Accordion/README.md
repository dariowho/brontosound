# Accordion

Collapsible groups for settings, one group per concern (Users, Band, WebDAV, YouTube).

- Provide: a title per group and its panel content.
- One outlined box (`border`, `radius-md`). Headers have `space-5` × `space-6` padding and use `body` medium with a chevron on the right.
- Open header: `gray-100` fill, `ink` text, chevron up. Closed: `surface`, `ink-muted` text, chevron down. Use `aria-expanded` on the header button.
- Panel content follows the other components (Table, Field row). Read-only groups end with a `caption` saying where to change the values.
