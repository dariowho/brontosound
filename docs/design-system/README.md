# Design system

Mirror of the [Brontosound design system](https://claude.ai/artifact/PJCYhwNPPaEUUGporuPet8). Tokens: [tokens.json](tokens.json); components: [components/](components/).

Brontosound is an open-source band management web app. Its look is **white and orange, sharp, minimal, and explicit**. The page is white, actions are orange, the header is charcoal, and every control says exactly what it does.

The app is built with SvelteKit, Tailwind and Flowbite. The orange scale is Tailwind's `primary` colour (`tailwind.config.cjs`), and the greys are Tailwind's `gray`. When you build in the app, use those classes (`bg-primary-700`, `text-gray-500`); outside it, use the tokens below.

## Content fundamentals

- **Say what happens.** A button names its outcome: "Add user", "Sync storage", "Re-create folder", "Delete permanently". Never "OK", "Submit" or an icon-only button for an action people need to find.
- **State the consequence** of anything destructive or anything that touches storage. Examples: "It will be removed from your Songbook with its tags. This can't be undone." "Creates the folder `/Canzoni/<song name>` in your storage."
- **Explain empty and unexpected states**, and offer the next step in the same place. Example: "There are no songs in your Songbook yet", followed by a form to create one.
- **Address the reader as "you" / "your"** ("your Songbook", "your storage"). Friendly, never cute; one exclamation mark at most ("add them!", "Go get 'em").
- **Sentence case** for titles, buttons and labels: "New songs", "Gig pursuit". Table headers are the only uppercase text, and only through the `table-head` style.
- **Dates as dd/mm/yyyy** (`it-IT`), for example 28/03/2025. Counts are written out with their noun: "18 venues", "1 new song".
- **No emoji.** Not in copy, not as icons.
- **Placeholders show an example or "Optional"**, never a repeat of the label.

## Visual foundations

**Colour.**
- Ground: `surface` (white). Text: `ink`. Descriptions: `ink-secondary`. Captions and counts: `ink-muted`.
- Hairlines: `border` (#E5E7EB), at 1px.
- `accent` (#EB4F27) marks what you can do: the primary button, accent icons, attention dots. Use one filled primary button per area; anything else beside it is a secondary button.
- Text links and text actions use `accent-text` (#CC4522), because `accent` is too light for small text on white.
- Tints: `accent-tint` for tags and icon tiles, `accent-selected` for the current sidebar item, `primary-50` with a `primary-300` border for an attention callout.
- Destructive actions use `danger` (#C81E1E). A delete button is outlined until the final confirmation, which is the only solid red button.
- Contrast flag: white on `accent` is 3.7:1. That is the brand's shipped pair, AA only for large or bold text. Keep it, but don't add new small white-on-orange text.

**Type.** Ubuntu throughout (Google Fonts), and Ubuntu Mono for storage paths.
- One `page-title` (48px bold) per page. `section-title` (36px) for blocks within a page.
- `card-title` and `panel-title` for cards. `body` and `body-sm` for everything else. `label` (medium) for buttons and form labels.
- No italic, no light weights.

**Layout.**
- A fixed shell: the header bar (`header-height`, 64px), then a row holding the sidebar (`sidebar-width`, 224px), the content and a `space-8` gap between them, then a footer.
- The page gutter is `space-6`.
- Content order: breadcrumb (Home › Section), then a title row (the `page-title` on the left, page actions on the right, wrapping on narrow screens), then content.
- On phones the sidebar stacks above the content (it is a drawer in the app).

**Shape and depth.**
- `radius-md` (8px) on buttons, inputs, nav items, cards and icon tiles. `radius-sm` on tags. `radius-full` only on avatars and dots.
- Borders, not shadows: the header's `shadow-header` is the only shadow in the system.
- Cards are a 1px `border` outline on `surface`, no fill.
- A dashed `border-control` outline means "not available yet".

**States.**
- Hover: buttons step one shade darker (`primary-800`), links move to `primary-900`, table rows take `gray-50`.
- Disabled: don't fade a button. Replace it with a "Coming soon" tag and a line saying why.
- Focus: Flowbite defaults. Buttons get a 4px `primary-300` ring; inputs get a `primary-500` border and ring. The button ring is under 3:1 on white, so a stronger ring (`primary-700`) is a known open item.
- Deleted or archived rows: `ink-muted` text. Their action buttons stay at full strength.

**Imagery.** None inside the app. The only images are the band logo in the header and the Brontosound mark in the footer.

## Iconography

- **Font Awesome 6 Solid** (`@fortawesome/free-solid-svg-icons` through `svelte-fa`) for the sidebar and inline actions:
  - nav: `faHouse`, `faMusic`, `faHeartPulse`, `faGears`
  - actions: `faPlus`, `faRotate`, `faFolderPlus`, `faTrashCan`
  - chevrons: `faChevronRight` / `faChevronDown` / `faChevronUp`
  - avatar: `faUser`

  18px in the sidebar, 12–14px inside buttons, filled in the current text colour.
- **Flowbite outline icons** (`flowbite-svelte-icons`), 24px with a 2px stroke, inside section-card icon tiles: `StoreOutline`, `FireOutline`, `TableColumnOutline`. Text-action arrows use `ArrowRightOutline`.
- Accent icons sit in an `accent-tint` tile and are drawn in `accent`. Unavailable sections use a `gray-100` tile with a `gray-500` icon.

## Logos

- **The band's own logo** goes in the header, at 36px, inverted to white on `header`. It comes from `bandSettings.json` (`bandLogo`).
- **The Brontosound mark** (`static/bronto.png`) is the default band logo. It also appears in "Powered by Brontosound" at 20px and 60% opacity, in the app footer and on the public site.

## Components

| Component | Use it for |
| --- | --- |
| HeaderBar | The charcoal bar on every page. |
| SidebarNav | Main navigation between sections. |
| Breadcrumb | The Home › Section line above every page title. |
| Button | Primary, secondary, danger outline, danger solid. |
| Tag | Song tags, sign-in methods, "Coming soon". |
| Field | Labelled text input and select. |
| Table | Every list of records. |
| SectionCard | A subsection of an area (Live → Venues, Gigs, Gig pursuit). |
| StatPanel | A dashboard summary of one area, linking to it. |
| EmptyState | A table or area with nothing in it yet. |
| ConfirmRow | Inline confirmation of a destructive row action. |
| Accordion | Settings groups. |
| Footer | "Powered by Brontosound", version and links. |

The reference CSS for each lives in `components/bundle.css` (`bs-` classes). It mirrors what the app renders with Tailwind and Flowbite.
