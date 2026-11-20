import { promises as fs } from 'fs';
import { readFileSync } from 'fs';

import { localDataRoot, settingsFilename } from "$lib/server/config";
import { WebdavStorage, FilesystemStorage, type PersistedStorage } from './storage';
import { MAPS_PROVIDERS, type MapsConfig, type MapsProviderId } from '$lib/maps/providers';

export interface SettingsData {
    bandName: string;
    bandLogo?: string;
    locale?: string;
    authorizedGoogleSSOUsers: string[];
    adminPasswordHash?: string; // required, checked at startup; generate with `npm run hash-password`
    songsFolder?: string;
    webdavEnabled: boolean;
    webdavServer: string;
    webdavUsername: string;
    webdavPassword: string;
    webdavConcurrentConnections: number;
    ytInvidiousEnabled: boolean;
    ytInvidiousServer: string,
    mapsProvider: MapsProviderId; // docs/maps.md
    mapboxToken?: string;
    hereApiKey?: string;
    googlemapsToken?: string;
    osmTileServer: string;
    osmNominatimServer?: string; // no default: check the public server's usage policy first (docs/maps.md)
    backlineStunServers: string[]; // tell Backline and the browsers on /backline their public addresses (docs/backline.md)
}

export const defaultSettings: SettingsData = {
    bandName: "My Band",
    locale: "it-IT",
    authorizedGoogleSSOUsers: [],
    songsFolder: "Songs",
    webdavEnabled: false,
    webdavServer: "",
    webdavUsername: "",
    webdavPassword: "",
    webdavConcurrentConnections: 5,
    ytInvidiousEnabled: true,
    ytInvidiousServer: "https://yewtu.be/",
    mapsProvider: "openstreetmap",
    osmTileServer: "https://tile.openstreetmap.org/{z}/{x}/{y}.png",
    backlineStunServers: ["stun:stun.l.google.com:19302"],
}

let cachedSettings: SettingsData | null = null;

export function readSettings(): SettingsData {
    if (cachedSettings) {
        return cachedSettings;
    }

    const filePath = `${localDataRoot}/${settingsFilename}`;
    try {
        const data = readFileSync(filePath, 'utf-8');
        const userSettings = JSON.parse(data) as SettingsData;
        cachedSettings = {...defaultSettings, ...userSettings};
        return cachedSettings;
    } catch (error) {
        console.error(`Error reading settings from ${filePath}:`, error);
        throw error;
    }
}

export async function writeSettings(settingsData: SettingsData): Promise<void> {
    const filePath = `${localDataRoot}/${settingsFilename}`;
    try {
        const data = JSON.stringify(settingsData, null, 2);
        await fs.writeFile(filePath, data, 'utf-8');
        cachedSettings = settingsData; // Update the cache
    } catch (error) {
        console.error(`Error writing settings to ${filePath}:`, error);
        throw error;
    }
}

export async function getUserStorage(): Promise<PersistedStorage> {
    const settings = readSettings();
    if (settings.webdavEnabled) {
        return new WebdavStorage(
            settings.webdavServer,
            settings.webdavUsername,
            settings.webdavPassword,
            settings.webdavConcurrentConnections
        );
    } else {
        return new FilesystemStorage("data/");
    }
}

export function safeBandSettings() {
    const bandSettings = readSettings();
    return {
        locale: bandSettings.locale,
        maps: mapsConfig(bandSettings),
    }
}

/** The selected maps provider, with only its own browser key */
function mapsConfig(settings: SettingsData): MapsConfig {
    const provider = MAPS_PROVIDERS[settings.mapsProvider];
    if (!provider) {
        throw new Error(`${settingsFilename}: "mapsProvider" must be one of: ${Object.keys(MAPS_PROVIDERS).join(", ")}`);
    }
    return {
        provider: settings.mapsProvider,
        key: provider.keySetting ? settings[provider.keySetting] : undefined,
        tileServer: settings.osmTileServer,
        nominatimServer: settings.osmNominatimServer,
    };
}
