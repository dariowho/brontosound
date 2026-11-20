/** A file or folder in a song's folder. `path` is relative to the song folder, "/"-separated. */
export interface SongFile {
    name: string;
    path: string;
    isFolder: boolean;
    size?: number; // bytes, files only
}

/** The files the song page opens with, as paths relative to the song folder */
export interface SongPins {
    pinnedDocument: string | null;
    pinnedAudio: string | null;
}

export function joinPath(folderPath: string, name: string): string {
    return folderPath ? `${folderPath}/${name}` : name;
}

/** A file known only by its path, like a pinned file in a folder that isn't listed yet */
export function fileAtPath(path: string): SongFile {
    return { name: path.split('/').pop()!, path, isFolder: false };
}

/** Where the browser reads a song file from; `download` makes the browser save it */
export function songFileUrl(songId: number, file: SongFile, download = false): string {
    const params = new URLSearchParams({ path: file.path });
    if (download) params.set('download', '1');
    return `/api/song/${songId}/file?${params}`;
}

export function formatSize(bytes: number): string {
    const units = ['bytes', 'KB', 'MB', 'GB'];
    let size = bytes, unit = 0;
    while (size >= 1000 && unit < units.length - 1) {
        size /= 1000;
        unit++;
    }
    return `${unit == 0 ? size : size.toFixed(size < 10 ? 1 : 0)} ${units[unit]}`;
}
