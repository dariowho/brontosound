# SidebarNav

The main navigation column: one item per app area, the current one filled with `accent-selected`.

- Provide: the items (label, href, Font Awesome Solid icon) and the current path.
- Width `sidebar-width`, items `body` in `ink` with an 18px icon, `space-3` padding, `radius-md`.
- Current item: `aria-current="page"` and `accent-selected` fill. Hover: `gray-100`.
- Order: Home, Songbook, Live, then Settings last. Areas that do not exist yet stay out of the nav rather than appearing disabled.
- On mobile it becomes a drawer opened from the HeaderBar.
