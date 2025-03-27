import { Song } from "./dbEntities/song";
import { pathJoin } from "./misc";

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