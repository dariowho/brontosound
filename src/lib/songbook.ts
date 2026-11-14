import { Song } from "./dbEntities/song";
import type { StoredDirectory } from "./dbEntities/storage";
import { pathJoin } from "./misc";

/**
 * Match Songbook songs with the song folders found in storage, by folder name:
 * `existing` songs have a folder, `deleted` songs lost theirs, `newDirs` are folders with no song yet.
 */
export function reconcileSongs<S extends Pick<Song, 'storedDirName'>, D extends Pick<StoredDirectory, 'name'>>(songs: S[], dirs: D[]) {
    const dirNames = new Set(dirs.map(dir => dir.name));
    const songDirNames = new Set(songs.map(song => song.storedDirName));
    return {
        existing: songs.filter(song => dirNames.has(song.storedDirName)),
        deleted: songs.filter(song => !dirNames.has(song.storedDirName)),
        newDirs: dirs.filter(dir => !songDirNames.has(dir.name)),
    };
}

export enum SongFilenames {
    README = "Readme.md",
    CHORDS = "chords.chordpro"
}

export class StoredSong extends Song {
    songsFolder: string;

    constructor(songEntity: Song, songsFolder: string) {
        super();
        Object.assign(this, songEntity);
        this.songsFolder = songsFolder;
    }

    buildPath(...pathSegments: string[]): string {
        // Cannot use path.join because of browser compatibility
        return pathJoin(this.songsFolder, this.storedDirName, ...pathSegments)
    }
}