import { listUsers } from '$lib/server/users';
import { readSettings, type SettingsData } from '$lib/server/bandSettings';
import { settingsFilename } from '$lib/server/config';
import { MAPS_PROVIDERS } from '$lib/maps/providers';
import type { SettingEntry, SettingsSection } from './settingEntries';
import type { PageServerLoad } from './$types';

type Key = keyof SettingsData;

export const load = (async ({ locals }) => {
    const canManageUsers = !!locals.brontoSession?.permissions.includes('users.manage');
    const s = readSettings();

    const text = (label: string, key: Key): SettingEntry => ({ kind: 'text', label, key, value: String(s[key] ?? '') });
    const list = (label: string, key: Key): SettingEntry => ({ kind: 'text', label, key, value: (s[key] as string[]).join(", ") });
    const toggle = (label: string, key: Key): SettingEntry => ({ kind: 'toggle', label, key, value: Boolean(s[key]) });
    const secret = (label: string, key: Key): SettingEntry => ({ kind: 'secret', label, key, isSet: Boolean(s[key]) });
    const choice = (label: string, key: Key, options: { value: string, name: string }[]): SettingEntry =>
        ({ kind: 'choice', label, key, value: String(s[key]), options });

    const mapsProviderOptions = Object.entries(MAPS_PROVIDERS).map(([value, { name }]) => ({ value, name }));

    // Read-only; secrets (passwords, tokens) are never sent.
    const settings: SettingsSection[] = [
        { title: "Band", entries: [text("Band name", "bandName"), text("Locale", "locale")] },
        { title: "WebDAV", entries: [
            toggle("Enabled", "webdavEnabled"),
            text("Server", "webdavServer"),
            text("Username", "webdavUsername"),
            text("Songs folder", "songsFolder"),
        ] },
        { title: "Maps", hint: "The selected provider draws venue maps and finds places, with its own key.", entries: [
            choice("Provider", "mapsProvider", mapsProviderOptions),
            secret("Mapbox token", "mapboxToken"),
            secret("HERE API key", "hereApiKey"),
            secret("Google Maps token", "googlemapsToken"),
            text("OpenStreetMap tile server", "osmTileServer"),
            text("OpenStreetMap Nominatim server", "osmNominatimServer"),
        ] },
        { title: "Soundfonts", hint: "MIDI files play through these, or folders in data/soundfonts. Each user picks one in the player.", entries: [
            text("Default", "defaultSoundfont"),
            ...s.soundfonts.map(({ name, url }): SettingEntry => ({ kind: 'text', label: name, key: 'soundfonts', value: url ?? '' })),
        ] },
        { title: "Backline", entries: [list("STUN servers", "backlineStunServers")] },
        { title: "YouTube", entries: [toggle("Use Invidious", "ytInvidiousEnabled"), text("Invidious server", "ytInvidiousServer")] },
        { title: "Security", entries: [toggle("Refuse passwords found in data breaches", "breachedPasswordCheck")] },
    ];

    return {
        pageTitle: "Settings",
        breadcrumb: [{title: "Settings"}],
        users: canManageUsers ? await listUsers() : null,
        settings,
        settingsFilename,
    };
}) satisfies PageServerLoad;
