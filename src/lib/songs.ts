import path from 'path'

import { FileNotFoundError, type StoredDirectory, type FilesystemStorage } from "./storage"
import { extractYTVideoUrl, type YTVideoUrl } from './yt'

interface SongIndexData {
    folderNameById: Record<string, string>
}

export interface IndexedSongFolderData extends StoredDirectory {
    metadata: SongMetadata
}

export interface SongMetadata {
    id: string,
    author: string,
    title: string,
    tags: string[]
}

export class SongIndex {

    storage: FilesystemStorage;
    songsBasePath: string;

    constructor(storage: FilesystemStorage, songsBasePath: string = "Songs") {
        this.storage = storage;
        this.songsBasePath = songsBasePath;
    }

    _songFolders(): StoredDirectory[] {
        return this.storage.listSubfolders(this.songsBasePath);
    }

    _songIndexBasePath(): string {
        return path.join(this.songsBasePath, '.bronto');
    }

    _songIndexPath(): string {
        return path.join(this._songIndexBasePath(), 'index.json');
    }

    _songIndex(): SongIndexData {
        let result: SongIndexData;
        const indexPath = this._songIndexPath();

        try {
            result = this.storage.readJSON(indexPath);
        } catch(err) {
            if (err instanceof FileNotFoundError) {
                result = {
                    folderNameById: {}
                }
                this.storage.writeJSONFile(result, indexPath);
            } else {
                throw err;
            }
        }

        return result;
    }

    _addSongToIndex(songId: string, songFolderName: string) {
        let index = this._songIndex();
        index.folderNameById[songId] = songFolderName;
        this.storage.writeJSONFile(index, this._songIndexPath());
    }

    /**
     * Read song metadata. If present (i.e. song is in index) extend and 
     * return the input dirData object
     * @param dirData Song Directory Data
     * @returns The same input dirData, enriched with Song metadata if present 
     */
    _songFromDir(dirData: StoredDirectory): StoredDirectory | IndexedSongFolderData {
        let metadata = this.readSongMetadata(dirData.name);
        if (metadata) {
            let result = (dirData as IndexedSongFolderData);
            result.metadata = metadata
            return result
        } 
        return dirData;
    }

    listSongs(): (StoredDirectory|IndexedSongFolderData)[] {
        let result: (StoredDirectory|IndexedSongFolderData)[] = [];
            this._songFolders().forEach(dirData => {                
                result.push(this._songFromDir(dirData));
            })

        return result;
    }

    _songMetadataPath(songFolderName: string): string {
        return path.join(this.songsBasePath, songFolderName, '.bronto', 'metadata.json');
    }

    readSongMetadata(songFolderName: string): SongMetadata | null {
        let result = null;

        try {
            result = this.storage.readJSON(this._songMetadataPath(songFolderName));
        } catch(err) {
            if (! (err instanceof FileNotFoundError))
                throw err;
        }

        return result;
    }

    writeSongMetadata(songFolderName: string, newMetadata: SongMetadata) {
        this.storage.writeJSONFile(newMetadata, this._songMetadataPath(songFolderName));
    }

    songById(songId: string): IndexedSongFolderData {
        let index: SongIndexData = this._songIndex();

        // Song not in index
        if (! index.folderNameById[songId]) {
            return this._searchSongAndReindex(songId);
        } 

        try {
            // Song in index with valid folder name
            const dirPath = path.join(this.songsBasePath, index.folderNameById[songId]);
            let storedDirectory = this.storage.storedDirectory(dirPath);
            let result = this._songFromDir(storedDirectory);
            if ('metadata' in result && result.metadata.id == songId)
                return result;
            // Folder does not contain metadata, or contains metadata for different ID
            throw new SongNotFoundError(songId)
        } catch {
            // Song folder was renamed: need to scan collection and update index
            return this._searchSongAndReindex(songId);
        }
    }

    /**
     * Initialize metadata from scratch in the song folder and return its
     * SongFolder object
     * 
     * @param songId id of the song to initialize
     * @param songFolderName name of the folder in Songs/
     * @returns The SongFolder object representing the song
     */
    initializeSongMetadata(songId: string, songFolderName: string): IndexedSongFolderData {
        const metadataPath = this._songMetadataPath(songFolderName);
        // TODO: check for existing metadata (may be there with different ID)
        const metadata: SongMetadata = {
            id: songId,
            author: "",
            title: songFolderName,
            tags: []
        }
        this.storage.writeJSONFile(metadata, metadataPath);
        this._addSongToIndex(songId, songFolderName);
        return this.songById(songId);
    }

    /**
     * Rebuild the index by scanning the Songs/ folder, updating id->folder
     * references and initializing folders that are not in index.
     * 
     * Return a SongFolder object representing the given songId.
     * 
     * @param songId id of the song to search
     */
    _searchSongAndReindex(songId: string): IndexedSongFolderData {
        let result: IndexedSongFolderData | null = null;
        let newIndex: SongIndexData = {
            folderNameById: {}
        }

        this._songFolders().forEach(dirData => {
            let songFolder = this._songFromDir(dirData);

            if (! ('metadata' in songFolder)) {
                songFolder = this.initializeSongMetadata(songId, dirData.name);
            }
            let indexedSongFolder = songFolder as IndexedSongFolderData;

            newIndex.folderNameById[indexedSongFolder.metadata.id] = dirData.name;
            if (songId && songId == indexedSongFolder.metadata.id) {
                result = indexedSongFolder;
            }  
        });

        this.storage.writeJSONFile(newIndex, this._songIndexPath());

        if (! result) throw new SongNotFoundError(songId);
        
        return result;
    }
}

export class Song {
    storage: FilesystemStorage;
    songFolder: IndexedSongFolderData;

    constructor(storage: FilesystemStorage, songFolder: IndexedSongFolderData) {
        this.storage = storage;
        this.songFolder = songFolder;
    }

    metadata(): SongMetadata {
        // TODO: merge with equivalent in SongIndex class
        return this.storage.readJSON(this.songFolder.path, '.bronto', 'metadata.json')
    }

    writeMetadata(metadata: SongMetadata) {
        this.storage.writeJSONFile(metadata, path.join(this.songFolder.path, '.bronto', 'metadata.json'));
    }

    /**
     * Return the content of the Song's readme
     * @returns The content of the Song's README.md
     */
    readme(): string {
        try {
            return this.storage.readTextFile(this.songFolder.path, "README.md");
        } catch (err) {
            if (err instanceof FileNotFoundError) return "";
            throw err;
        } 
    }

    writeReadme(content: string) {
        this.storage.writeTextFile(content, path.join(this.songFolder.path, "README.md"));
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

    chords(): string {
        try {
            return this.storage.readTextFile(this.songFolder.path, "chords.chordpro");
        } catch (err) {
            if (err instanceof FileNotFoundError) return "";
            throw err;
        } 
    }

    writeChords(content: string) {
        this.storage.writeTextFile(content, path.join(this.songFolder.path, "chords.chordpro"));
    }

    /**
     * Replace tags in song metadada with the given list
     * 
     * TODO: this is not thread safe: the whole metadata file is replaced with
     * content from the Song status
     * @param newTags New tag list that will replace the old one
     */
    writeTags(newTags: string[]) {
        let metadata = this.metadata();
        if (! metadata) {
            throw new SongNotInitializedError();
        }
        metadata.tags = newTags;
        this.writeMetadata(metadata);
    }
}

export class SongNotFoundError extends Error {};
export class SongNotInitializedError extends Error {};
