import { joinPath } from './songFile';

/** A file on its way to the song folder, shown in the folder until it's there */
export interface Upload {
    file: File;
    folder: string; // relative to the song folder
    progress: number | null; // 0 to 1, null while waiting its turn
    error: string | null;
}

/** Send a new file to the song folder, reporting progress (which fetch can't) */
export function uploadSongFile(songId: number, upload: Upload, onProgress: (fraction: number) => void): Promise<void> {
    return new Promise((resolve, reject) => {
        const request = new XMLHttpRequest();
        request.open('POST', `/api/song/${songId}/file?${new URLSearchParams({ path: joinPath(upload.folder, upload.file.name) })}`);
        request.upload.onprogress = event => event.lengthComputable && onProgress(event.loaded / event.total);
        request.onload = () => request.status < 300 ? resolve() : reject(new Error(errorMessage(request)));
        request.onerror = () => reject(new Error('The connection failed'));
        request.send(upload.file);
    });
}

function errorMessage(request: XMLHttpRequest): string {
    if (request.status == 413) return 'The file is too big for the server';
    try {
        return JSON.parse(request.responseText).message;
    } catch {
        return request.statusText;
    }
}
