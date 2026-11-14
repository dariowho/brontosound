# Field

A labelled text input or select, label above the control.

- Provide: a visible label (`label` style), the control, and a placeholder that is an example or "Optional".
- Control: `control-height`, `surface-muted` fill, `border-control` border, `radius-md`, `body-sm` text. Focus: `primary-500` border and ring.
- Fields in a row align to the bottom, `space-4` apart, with the submit button at the end of the row at the same height.
- A hint that explains a consequence goes under the row in `caption` `ink-muted`.
- Inside a table row the label may be visually hidden (`aria-label`), because the column header labels it.
- Errors: a red Flowbite `Alert` above the form that says what went wrong and how to fix it.
