import type { PageLoad } from './$types';

export const load = (({ }) => {
    return {
        pageTitle: "Dashboard",
        breadcrumb: [],
};
}) satisfies PageLoad;