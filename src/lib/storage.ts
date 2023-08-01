import fs from 'fs'
import path from 'path'

import type { IndexedSongFolder, SongFolder, SongMetadata } from "./songs";

interface SongIndex {
    folderNameById: Record<string, string>
}

export class FilesystemStorage {
    basePath: string;
    songsBasePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
        this.songsBasePath = path.join(this.basePath, "Songs");
    }

    _songFolders(): fs.Dirent[] {
        const source = this.songsBasePath;
        return fs.readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => dirent.name[0] != '.');
    }

    _songIndexBasePath(): string {
        return path.join(this.basePath, 'Songs', '.bronto');
    }

    _songIndexPath(): string {
        return path.join(this._songIndexBasePath(), 'index.json');
    }

    _songIndex(): SongIndex {
        let result: SongIndex;
        const indexPath = this._songIndexPath();

        try {
            const data = fs.readFileSync(indexPath);
            result = JSON.parse(data.toString());
        } catch(err) {
            // TODO: throw if error is not ENOENT
            result = {
                folderNameById: {}
            }
            fs.mkdirSync(this._songIndexBasePath(), { recursive: true });
            fs.writeFileSync(indexPath, JSON.stringify(result, null, 4), 'utf-8');
        }

        return result;
    }

    _addSongToIndex(songId: string, songFolderName: string) {
        let index = this._songIndex();
        index.folderNameById[songId] = songFolderName;
        fs.writeFileSync(this._songIndexPath(), JSON.stringify(index, null, 4), 'utf-8');
    }

    _songFromDir(dirName: string, dirBasePath: string = this.songsBasePath): SongFolder | IndexedSongFolder {
        const dirPath = path.join(dirBasePath, dirName);
        let result: SongFolder = {
            folderName: dirName,
            folderPath: dirPath,
            creationDate: new Date(),
            modificationDate: new Date(),
        }

        let metadata = this.readSongMetadata(dirPath)
        if (metadata) (result as IndexedSongFolder).metadata = metadata

        return result
    }

    readTextFile(...pathSegments: string[]): string {
        const filePath = path.join(...pathSegments);
        try{
            return fs.readFileSync(filePath).toString();
        } catch (err: any) {
            const nodeError: NodeJS.ErrnoException = err;
            if (nodeError.code == "ENOENT") {
                throw new FileNotFoundError();
            } 
            throw err;
        }
    }

    writeTextFile(content: string, filePath: string) {
        fs.mkdirSync(path.dirname(filePath), { recursive: true });
        fs.writeFileSync(filePath, content, 'utf-8');
    }

    readJSON(...pathSegments: string[]) {
        return JSON.parse(this.readTextFile(...pathSegments));
    }

    // Song stuff below, should be moved in Song class

    listSongs(): SongFolder[] {
        let result: SongFolder[] = [];
            this._songFolders().forEach(dirent => {                
                result.push(this._songFromDir(dirent.name, dirent.path));
            })

        return result;
    }

    readSongMetadata(songFolderPath: string): SongMetadata | null {
        let result = null;
        const metadataPath = path.join(songFolderPath, '.bronto', 'metadata.json');

        try {
            const data = fs.readFileSync(metadataPath);
            result = JSON.parse(data.toString());
        } catch(err) {
            // TODO: throw if error is not ENOENT
        }

        return result;
    }

    songById(songId: string): IndexedSongFolder {
        let index: SongIndex = this._songIndex();

        // Song not in index
        if (! index.folderNameById[songId]) {
            return this._searchSongAndReindex(songId);
        } 

        try {
            // Song in index with valid folder name
            let result = this._songFromDir(index.folderNameById[songId]);
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
    initializeSongMetadata(songId: string, songFolderName: string): IndexedSongFolder {
        const metadataBasePath = path.join(this.songsBasePath, songFolderName, '.bronto')
        const metadataPath = path.join(metadataBasePath, 'metadata.json');
        // TODO: check for existing metadata (may be there with different ID)
        const metadata: SongMetadata = {
            id: songId,
            author: "",
            title: songFolderName,
            tags: []
        }
        fs.mkdirSync(metadataBasePath, { recursive: true });
        fs.writeFileSync(metadataPath, JSON.stringify(metadata, null, 4), 'utf-8');
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
    _searchSongAndReindex(songId: string): IndexedSongFolder {
        let result: IndexedSongFolder | null = null;
        let newIndex: SongIndex = {
            folderNameById: {}
        }

        this._songFolders().forEach(dirent => {
            let songFolder = this._songFromDir(dirent.name, dirent.path);

            if (! ('metadata' in songFolder)) {
                songFolder = this.initializeSongMetadata(songId, dirent.name);
            }
            let indexedSongFolder = songFolder as IndexedSongFolder;

            newIndex.folderNameById[indexedSongFolder.metadata.id] = dirent.name;
            if (songId && songId == indexedSongFolder.metadata.id) {
                result = indexedSongFolder;
            }  
        });

        fs.writeFileSync(this._songIndexPath(), JSON.stringify(newIndex, null, 4), 'utf-8');

        if (! result) throw new SongNotFoundError(songId);
        
        return result;
    }
}

export class FileNotFoundError extends Error {};
export class SongNotFoundError extends Error {};
