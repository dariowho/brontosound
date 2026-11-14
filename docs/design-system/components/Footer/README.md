# Footer

The bottom line of every app page: "Powered by Brontosound" on the left, the version and links on the right.

- Provide: the app version (`src/lib/version.json`) and the link targets.
- `body-sm` in `ink-muted`, `border` hairline on top, `space-5` × `space-6` padding; the two halves wrap on narrow screens.
- Left: the Brontosound mark at 20px and 60% opacity, then "Powered by **Brontosound**" (the name links to the project, in `gray-700` medium).
- Right: the version (`v0.1.0`), then About, Privacy Policy, Licensing, Contact, `space-6` apart.
- The public site uses the left half only, centred.
