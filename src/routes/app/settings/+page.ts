import type { PageLoad } from './$types';

export const load = (({ }) => {
    return {
        pageTitle: "Settings"
    };
}) satisfies PageLoad;