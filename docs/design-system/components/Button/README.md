# Button

Four variants, each labelled with the outcome it causes; one primary per area.

- Provide: a verb-first label ("Add user", "Sync storage", "Re-create folder"), optionally a Font Awesome Solid icon before it, and `type` (`submit` in forms).
- **Primary**: `accent` fill, `white` label. The one main action of a page, form or row.
- **Secondary**: `surface` fill, `border-control` border, `ink` label. Every other action next to a primary (Sync storage, Cancel, Re-create folder).
- **Danger outline**: `red-300` border, `danger` label. The first step of a destructive action ("Delete"). It never deletes on its own; it opens a ConfirmRow.
- **Danger**: `danger` fill. Only the final confirm ("Delete permanently").
- Size: `control-height` by default; `control-height-sm` (13px label) inside table rows and the header.
- Text actions such as "Open Songbook →" or "Manage venues →" are links in `accent-text` with a trailing arrow, not buttons.
- Icon-only buttons need an `aria-label`. Avoid them for anything but the mobile menu.
- Unavailable actions are not shown as disabled buttons. Replace them with a "Coming soon" Tag and a line saying why.
