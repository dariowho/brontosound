export async function load({ parent, url }) {
	const { breadcrumb } = await parent();
	return {
        breadcrumb: [...breadcrumb, {title: "edit", href: url.href}]
    }
}
