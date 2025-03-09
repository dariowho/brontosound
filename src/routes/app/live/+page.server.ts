import type { ServerLoadEvent } from "@sveltejs/kit";

export async function load({ }: ServerLoadEvent) {
  return {
    pageTitle: "Live",
    breadcrumb: [{title: "Live", href: "/app/live"}],
  }
}
