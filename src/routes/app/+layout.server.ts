import { readSettings } from '$lib/server/bandSettings';
import type { PageLoad } from './$types';

export const load = (({ }) => {
    const bandSettings = readSettings();
    
    return {
        safeBandSettings: {
            googlemapsToken: bandSettings.googlemapsToken
        }
    };
}) satisfies PageLoad;