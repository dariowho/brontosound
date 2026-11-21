import fs from 'fs';
import path from 'path';
import { localDataRoot } from './config';

// Brontosound's own entries in data/, never the band's files
const INTERNAL = ['database', 'soundfonts', 'publicSite', 'files', 'persistedFilesystem', 'bandSettings.json'];

/**
 * The songs folder used to sit in data/ itself, next to Brontosound's own files. Moves it, once, to data/files/,
 * where the filesystem backend now keeps the band's files. Throws if it can't, rather than show an empty songbook.
 */
export function moveSongsFolderToFiles(songsFolder: string, filesystemBackend: boolean, dataRoot = localDataRoot): void {
    const relative = path.normalize(songsFolder).replace(/^\/+|\/+$/g, '');
    const top = relative.split('/')[0];
    if (relative == '' || relative == '.') {
        if (filesystemBackend) console.warn(`"songsFolder" is empty: song folders are now read from ${dataRoot}/files/, move them there`);
        return;
    }
    if (top == '..' || INTERNAL.includes(top)) return;

    const from = path.join(dataRoot, relative), to = path.join(dataRoot, 'files', relative);
    if (!fs.existsSync(from) || fs.existsSync(to)) return;
    try {
        fs.mkdirSync(path.dirname(to), { recursive: true });
        fs.renameSync(from, to);
    } catch (e) {
        throw new Error(`Couldn't move the songs folder from ${from} to ${to} (${e}). Move it there yourself, or mount it there.`);
    }
    console.info(`Moved the songs folder from ${from} to ${to}`);
}
