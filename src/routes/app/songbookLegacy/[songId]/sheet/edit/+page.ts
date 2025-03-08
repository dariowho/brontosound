import type { LoadEvent } from "@sveltejs/kit";

export async function load({ parent, url }: LoadEvent) {
	const { breadcrumb } = await parent();
	return {
        breadcrumb: [...breadcrumb, {title: "Chords (edit)", href: url.href}]
    }
}
