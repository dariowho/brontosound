# StatPanel

A dashboard summary of one app area: three numbers, an optional attention line, and a link into the area.

- Provide: the area's name and Font Awesome icon (the same icon as its nav item), three label/value pairs, the "Open <Area>" link, and optionally one callout.
- Head: a 36px icon tile and the title in `panel-title` on the left, the text action on the right, above a `border` hairline.
- Stats: three equal columns split by hairlines; value in `stat-value`, label in `body-sm` `ink-muted` below it. A date value drops to 20px.
- Callout: the single thing that needs attention, as a link. Use `primary-50` fill, a `primary-300` border and an `accent` dot. Bold the count ("**1 new song** found in your storage") and end with a verb ("Review"). If nothing needs attention, use a neutral `gray-50` line with the next relevant item, or leave it out.
- Panels sit in a `repeat(auto-fit, minmax(360px, 1fr))` grid, one per area, in nav order.
- Show real counts only; never decorative numbers.
