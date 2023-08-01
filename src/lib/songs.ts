import path from 'path'

import { FileNotFoundError, type FilesystemStorage } from "./storage"
import { extractYTVideoUrl, type YTVideoUrl } from './yt'

export interface SongFolder {
    folderName: string,
    folderPath: string,
    creationDate: Date,
    modificationDate: Date
}

export interface IndexedSongFolder extends SongFolder {
    metadata: SongMetadata
}

export interface SongMetadata {
    id: string,
    author: string,
    title: string,
    tags: string[]
}

export class Song {
    storage: FilesystemStorage;
    songFolder: IndexedSongFolder;

    constructor(storage: FilesystemStorage, songFolder: IndexedSongFolder) {
        this.storage = storage;
        this.songFolder = songFolder;
    }

    /**
     * Return the content of the Song's readme
     * @returns The content of the Song's README.md
     */
    readme(): string {
        try {
            return this.storage.readTextFile(this.songFolder.folderPath, "README.md");
        } catch (err) {
            if (err instanceof FileNotFoundError) return "";
            throw err;
        } 
    }

    writeReadme(content: string) {
        this.storage.writeTextFile(content, path.join(this.songFolder.folderPath, "README.md"));
    }

    /**
     * Parse YouTube links in the song's README.md, return the
     * first one
     */
    ytLink(): YTVideoUrl | null {
        try {
            return extractYTVideoUrl(this.readme());
        } catch (err) {
            if (err instanceof FileNotFoundError) return null;
            throw err;
        }        
    }

    chords(): string | null {
        try {
            return this.storage.readTextFile(this.songFolder.folderPath, "chords.chordpro");
        } catch (err) {
            if (err instanceof FileNotFoundError) return "";
            throw err;
        } 
    }
}