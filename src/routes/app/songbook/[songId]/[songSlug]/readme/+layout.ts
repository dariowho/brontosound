import type { LayoutLoadEvent } from "./$types";

export async function load({ parent, url }: LayoutLoadEvent) {
	const { breadcrumb } = await parent();

    const href = breadcrumb[breadcrumb.length-1].href+'/readme';
	return {
        breadcrumb: [...breadcrumb, {title: "README.md", href: href}]
    }
}
