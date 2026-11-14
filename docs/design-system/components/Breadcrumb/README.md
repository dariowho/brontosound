# Breadcrumb

The Home › … › Current trail above every page title, followed by the title row.

- Provide: the trail, from the page's `breadcrumb` load data. Home always comes first, with the `faHouse` icon.
- Links in `label` `gray-700`, separator `faChevronRight` in `gray-400`, the current page as plain `ink-muted` text with `aria-current="page"`.
- Below it, `space-4` apart: the title row. That is the `page-title` on the left and page actions (secondary first, one primary last) on the right. It wraps on narrow screens.
- The Dashboard is the only page without a breadcrumb.
