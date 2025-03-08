import { promises as fs } from 'fs';

import { localDataRoot, settingsFilename } from "$lib/server/config";
import { WebdavStorage, FilesystemStorage, type PersistedStorage } from './storage';

export interface SettingsData {
    bandName: string;
    webdavEnabled: boolean;
    webdavServer: string;
    webdavUsername: string;
    webdavPassword: string;
    webdavConcurrentConnections: number;
    ytInvidiousEnabled: boolean;
    ytInvidiousServer: string
}

export const defaultSettings: SettingsData = {
    bandName: "My Band",
    webdavEnabled: false,
    webdavServer: "",
    webdavUsername: "",
    webdavPassword: "",
    webdavConcurrentConnections: 5,
    ytInvidiousEnabled: true,
    ytInvidiousServer: "https://yewtu.be/"
}

let cachedSettings: SettingsData | null = null;

export async function readSettings(): Promise<SettingsData> {
    if (cachedSettings) {
        return cachedSettings;
    }

    const filePath = `${localDataRoot}/${settingsFilename}`;
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        cachedSettings = JSON.parse(data) as SettingsData;
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
    const settings = await readSettings();
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
