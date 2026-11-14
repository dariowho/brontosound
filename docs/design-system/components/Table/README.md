# Table

The list view for every collection of records (songs, users, venues).

- Provide: column headers, rows, and the first column's link to the record.
- Header row: `surface-muted` fill, `table-head` in `gray-700`, uppercase.
- Cells: `body-sm`, `space-4` × `space-6` padding, a `border` hairline under each row, row hover `surface-muted`.
- First column: `ink`, medium, linking to the record. Other columns: `ink-secondary`. Dates as dd/mm/yyyy.
- Actions column: last, right-aligned, `width: 1%` and `white-space: nowrap`, so it is exactly as wide as its buttons. Small buttons, secondary before danger. Never leave empty space to the right of the actions.
- Muted rows (deleted, archived): `ink-muted` text, neutral tags, actions at full strength.
- Empty: keep the header row and put an EmptyState in a single full-width row.
- Wrap the table in an `overflow-x: auto` box with a sensible `min-width`, so it scrolls on phones instead of squashing.
- Explain a group of rows above the table in one `body-sm` sentence (what it is, what to do).
