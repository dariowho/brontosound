import { readSettings, safeBandSettings } from '$lib/server/bandSettings';
import type { PageLoad } from './$types';

export const load = (({ }) => {
    return {
        safeBandSettings: safeBandSettings()
    };
}) satisfies PageLoad;