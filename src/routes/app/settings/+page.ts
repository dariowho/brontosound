import type { PageLoad } from './$types';

export const load = (({ }) => {
    return {
        pageTitle: "Settings",
        breadcrumb: [{title: "Settings"}],
};
}) satisfies PageLoad;