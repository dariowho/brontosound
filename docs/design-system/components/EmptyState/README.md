# EmptyState

What a table or area shows when it has nothing in it yet: what is missing, and the way to add the first one, right there.

- Provide: the area's icon, a title that states the fact ("There are no songs in your Songbook yet"), one sentence on how things get here, and the creation form or button.
- Centred, max 640px wide, `space-14` vertical padding. A 48px `accent-tint` tile, the title in `panel-title`, the text in `body-sm` `ink-secondary`.
- Prefer an inline form (Field row + primary button) over a button that opens something else. Add a `caption` hint for any side effect ("Creates the folder `/Canzoni/<song name>` in your storage.").
- Inside a Table, keep the header row and put the empty state in one full-width row.
- Never use an empty table with no message.
