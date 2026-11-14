# Tag

A small label for song tags, sign-in methods and availability.

- Provide: one short lowercase word or phrase as the label (`jazz`, `password`, `Coming soon`).
- Default: `accent-tint` fill with `primary-900` text (Flowbite `Badge` primary). Use it for data tags.
- Neutral: `gray-100` with `gray-700`. Use it for availability ("Coming soon") and for tags on deleted rows.
- `tag` text style, `radius-sm`, `space-2` between tags. Tags wrap; never truncate them.
- Tags are not buttons. If one needs to filter, make it a link and keep the same look.
