import type { PageLoad } from './$types';

export const load = (({ }) => {
    return {
        pageTitle: "Dashboard"
    };
}) satisfies PageLoad;