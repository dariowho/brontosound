# SectionCard

A card for one subsection of an app area, e.g. Venues, Gigs and Gig pursuit under Live. Lay the cards out in a grid that grows as sections are added.

- Provide: a Flowbite outline icon, a title, a one-sentence description, a count for the footer, and the action label and link.
- The whole card is one link. Inside it, top to bottom: the icon tile (`icon-tile`, `accent-tint`, icon in `accent`), the title in `card-title`, the description in `ink-secondary`, then a footer row above a `border` hairline with the count (`ink-muted`) on the left and the action (`accent-text` + arrow) on the right.
- Grid: `repeat(auto-fill, minmax(300px, 1fr))`, `space-6` gap. Cards keep equal height, because the description grows and the footer stays at the bottom.
- Unavailable: a `div`, not a link, with a dashed `border-control` outline, a grey tile, a neutral "Coming soon" Tag after the title, and a footer line that says where to find the thing today.
- Hover: border `primary-300`.
