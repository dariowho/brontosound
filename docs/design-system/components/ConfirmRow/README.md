# ConfirmRow

An inline confirmation that replaces a table row when someone starts a destructive action.

- Provide: the record's name, what will be removed, and the two actions.
- One full-width cell on `red-50`, `red-300` hairline. The sentence names the record in bold, says what goes with it, and ends with "This can't be undone." when that is true.
- Actions on the right: secondary "Cancel", then the danger button with the full outcome ("Delete permanently").
- Use it instead of `confirm()` dialogs. Only one row is in confirmation at a time; Cancel restores the row.
