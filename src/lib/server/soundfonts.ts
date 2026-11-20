import { promises as fs } from 'fs';
import { error } from '@sveltejs/kit';
import { localDataRoot } from '$lib/server/config';
import { readSettings } from '$lib/server/bandSettings';
import { BUILT_IN_SYNTH, type Soundfont, type SoundfontChoice } from '$lib/soundfonts';
import type { User } from '$lib/dbEntities/user';

/** Folders of MIDI.js files, served by `/api/soundfont/<folder>/<file>` */
const soundfontsRoot = `${localDataRoot}/soundfonts`;

/** The built-in synth, the folders in data/soundfonts, then the band settings' URLs */
export async function listSoundfonts(): Promise<Soundfont[]> {
    const folders = await fs.readdir(soundfontsRoot, { withFileTypes: true }).catch(() => []);
    const local = folders
        .filter(entry => entry.isDirectory())
        .map(entry => ({ name: entry.name, url: `/api/soundfont/${encodeURIComponent(entry.name)}/` }));
    const all = [BUILT_IN_SYNTH, ...local, ...readSettings().soundfonts];
    return all.filter((soundfont, i) => all.findIndex(other => other.name == soundfont.name) == i);
}

/** The user's last pick, else the band's default, else the first soundfont there is */
export async function soundfontChoice(user: User | undefined): Promise<SoundfontChoice> {
    const soundfonts = await listSoundfonts();
    const exists = (name?: string | null) => !!name && soundfonts.some(soundfont => soundfont.name == name);
    const selected = [user?.soundfont, readSettings().defaultSoundfont].find(exists) ?? (soundfonts[1] ?? soundfonts[0]).name;
    return { soundfonts, selected };
}

/** A file in a soundfont folder: names only, nothing outside it */
export async function readSoundfontFile(folder: string, file: string): Promise<Buffer> {
    if ([folder, file].some(name => name.includes('/') || name.includes('\\') || name.startsWith('.'))) error(400, "Invalid name");
    return fs.readFile(`${soundfontsRoot}/${folder}/${file}`).catch(() => error(404, "No such soundfont file"));
}
