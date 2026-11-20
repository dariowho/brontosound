import fs from 'fs'
import path, { basename, dirname } from 'path'
import { Readable } from 'stream';
import { createClient, type FileStat, type ResponseDataDetailed, type WebDAVClient } from 'webdav';
import pLimit from 'p-limit';

import { StoredDirectory, StoredFile } from '$lib/dbEntities/storage';

/** A file or folder in a folder listing. Hidden entries (starting with ".") are left out. */
export interface StorageEntry {
    name: string;
    isFolder: boolean;
    size?: number; // bytes, files only
}

/** A file's content, streamed as is */
export interface FileStream {
    stream: ReadableStream<Uint8Array>;
    size: number; // bytes
}

export interface PersistedStorage {
    readTextFile(...pathSegments: string[]): Promise<StoredFile>;
    readTextFileContent(...pathSegments: string[]): Promise<string>;
    writeTextFile(content: string, filePath: string): Promise<StoredFile>;
    readJsonFileContent(...pathSegments: string[]): Promise<any>;
    writeJSONFile(content: any, filePath: string): Promise<void>;
    deleteFile(filePath: string): Promise<void>;
    readFileStream(filePath: string): Promise<FileStream>;
    writeFile(filePath: string, data: Uint8Array): Promise<void>;
    fileExists(filePath: string): Promise<boolean>;

    storedDirectory(dirPath: string): Promise<StoredDirectory>;
    createDirectory(dirPath: string): Promise<void>;
    listSubfolders(...pathSegments: string[]): Promise<StoredDirectory[]>;
    listFolder(dirPath: string): Promise<StorageEntry[]>;
}

const isHidden = (name: string) => name.startsWith('.');

/** A name that stays one entry of its folder: no separators, not "." or ".." */
export function isFolderName(name: unknown): name is string {
    return typeof name == 'string' && name != '' && name != '.' && name != '..' && !/[/\\\0]/.test(name);
}

/** Throws unless `fullPath` is `root` or inside it. Both normalised, absolute, in the syntax of `paths`. */
export function assertInside(root: string, fullPath: string, paths: path.PlatformPath): void {
    const relative = paths.relative(root, fullPath);
    if (fullPath.includes('\0') || relative == '..' || relative.startsWith('..' + paths.sep) || paths.isAbsolute(relative))
        throw new FileAccessError(`Outside the songs folder: ${fullPath}`);
}

/** Files under `basePath`. Paths are relative to it, and can't leave its folder `root`. */
export class FilesystemStorage implements PersistedStorage {
    basePath: string;
    root: string;

    constructor(basePath: string, root: string) {
        this.basePath = basePath;
        this.root = path.resolve(path.join(basePath, root));
    }

    private full(...pathSegments: string[]): string {
        const fullPath = path.join(this.basePath, ...pathSegments);
        assertInside(this.root, path.resolve(fullPath), path);
        return fullPath;
    }

    async readTextFile(...pathSegments: string[]): Promise<StoredFile> {
        const fullPath = this.full(...pathSegments);
        try{
            return makeStoredFileObject(fullPath, fs.readFileSync(fullPath).toString(), new Date()); // TODO: implement modification date
        } catch (err: any) {
            const nodeError: NodeJS.ErrnoException = err;
            if (nodeError.code == "ENOENT") {
                // console.log("readTextFileContent: file not found: ", fullPath)
                throw new FileNotFoundError();
            } 
            throw err;
        }
    }

    async readTextFileContent(...pathSegments: string[]): Promise<string> {
        return (await this.readTextFile(...pathSegments)).content
    }

    async writeTextFile(content: string, filePath: string): Promise<StoredFile> {
        const fullPath = this.full(filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
        return makeStoredFileObject(fullPath, content, new Date());
    }

    async writeJSONFile(content: any, filePath: string) {
        this.writeTextFile(JSON.stringify(content, null, 4), filePath);
    }

    async readJsonFileContent(...pathSegments: string[]): Promise<any> {
        return JSON.parse(await this.readTextFileContent(...pathSegments));
    }

    async deleteFile(filePath: string): Promise<void> {
        fs.rmSync(this.full(filePath));
    }

    async readFileStream(filePath: string): Promise<FileStream> {
        const fullPath = this.full(filePath);
        const stats = await fs.promises.stat(fullPath).catch(() => { throw new FileNotFoundError(filePath); });
        return {
            stream: Readable.toWeb(fs.createReadStream(fullPath)) as ReadableStream<Uint8Array>,
            size: stats.size,
        };
    }

    async writeFile(filePath: string, data: Uint8Array): Promise<void> {
        const fullPath = this.full(filePath);
        await fs.promises.mkdir(path.dirname(fullPath), { recursive: true });
        await fs.promises.writeFile(fullPath, data);
    }

    async fileExists(filePath: string): Promise<boolean> {
        return fs.existsSync(this.full(filePath));
    }

    async storedDirectory(dirPath: string): Promise<StoredDirectory> {
        const r = new StoredDirectory();
        r.parentPath = path.dirname(dirPath);
        r.name = path.basename(dirPath);
        r.path = dirPath;
        r.creationDate = new Date(); // TODO: implement
        r.modificationDate = new Date(); // TODO: implement
        r.customProperties = null;
        r.lastVisited = new Date();
        return r;
    }

    async createDirectory(dirPath: string): Promise<void> {
        fs.mkdirSync(this.full(dirPath), { recursive: true });
    }

    async listFolder(dirPath: string): Promise<StorageEntry[]> {
        const fullPath = this.full(dirPath);
        const dirents = await fs.promises.readdir(fullPath, { withFileTypes: true })
            .catch(() => { throw new FileNotFoundError(dirPath); });
        return dirents
            .filter(dirent => !isHidden(dirent.name))
            .map(dirent => ({
                name: dirent.name,
                isFolder: dirent.isDirectory(),
                size: dirent.isDirectory() ? undefined : fs.statSync(path.join(fullPath, dirent.name)).size,
            }));
    }

    async listSubfolders(...pathSegments: string[]): Promise<StoredDirectory[]> {
        let result: StoredDirectory[] = [];
        const fullPath = this.full(...pathSegments);
        let dirents = fs.readdirSync(fullPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => dirent.name[0] != '.');
        dirents.forEach(dirent => {
            const r = new StoredDirectory();
            r.parentPath = path.join(...pathSegments);
            r.name = dirent.name;
            r.path = path.join(...pathSegments, dirent.name);
            r.creationDate = new Date(); // TODO: implement
            r.modificationDate = new Date(); // TODO: implement
            r.lastVisited = new Date();
            result.push(r);
        });
        return result;
    }
}

/** Files on a WebDAV server. Paths can't leave the folder `root`. */
export class WebdavStorage implements PersistedStorage {

    client: WebDAVClient;
    concurrency: number;
    root: string;

    constructor(server: string, username: string, password: string, root: string, concurrency: number = 5) {
        this.client = createClient(
            server,
            {
                username: username,
                password: password
            }
        );
        this.concurrency = concurrency;
        this.root = path.posix.join('/', root);
    }

    private full(...pathSegments: string[]): string {
        const fullPath = path.join(...pathSegments);
        assertInside(this.root, path.posix.join('/', fullPath), path.posix);
        return fullPath;
    }

    check() {
        this.client.getDirectoryContents('/');
        return true;
    }

    async readTextFileContent(...pathSegments: string[]): Promise<string> {
        return ((await this.readTextFile(...pathSegments)).content);
    }

    async readTextFile(...pathSegments: string[]): Promise<StoredFile> {
        const fullPath = this.full(...pathSegments);
        try {
            let data = await this.client.getFileContents(fullPath, {format: "text", details: true}) as ResponseDataDetailed<string>;
            // console.log("data:", data);
            return makeStoredFileObject(fullPath, data.data, new Date(data.headers['last-modified']));
        } catch (err: any) {
            if (err.response.status == 404)
                throw new FileNotFoundError(err.toString());
            throw Error("WebDAV error: " + err.toString());
        }
    }

    async writeTextFile(content: string, filePath: string): Promise<StoredFile> {
        filePath = this.full(filePath);
        let result = false;
        try {
            console.log("writeTextFile: creating dirs: ", path.dirname(filePath));
            await this.client.createDirectory(path.dirname(filePath), {recursive: true});
            console.log("writeTextFile: writing: ", filePath);
            result = await this.client.putFileContents(filePath, content);
        } catch (err: any) {
            throw Error("Webdav error: " + err.toString());
        }

        if (! result)
            throw new FileAccessError("WebDAV 'putFileContents' call failed for path: " + filePath);

        return makeStoredFileObject(filePath, content, new Date());
    }

    async deleteFile(filePath: string): Promise<void> {
        await this.client.deleteFile(this.full(filePath));
    }

    async readFileStream(filePath: string): Promise<FileStream> {
        filePath = this.full(filePath);
        const stats = await this.client.stat(filePath).catch(webdavNotFound(filePath)) as FileStat;
        return {
            stream: Readable.toWeb(this.client.createReadStream(filePath) as Readable) as ReadableStream<Uint8Array>,
            size: stats.size,
        };
    }

    async writeFile(filePath: string, data: Uint8Array): Promise<void> {
        filePath = this.full(filePath);
        await this.client.createDirectory(path.dirname(filePath), { recursive: true });
        if (!await this.client.putFileContents(filePath, Buffer.from(data)))
            throw new FileAccessError("WebDAV 'putFileContents' call failed for path: " + filePath);
    }

    async fileExists(filePath: string): Promise<boolean> {
        return this.client.exists(this.full(filePath));
    }

    async listFolder(dirPath: string): Promise<StorageEntry[]> {
        const contents = await this.client.getDirectoryContents(this.full(dirPath)).catch(webdavNotFound(dirPath)) as FileStat[];
        return contents
            .filter(element => !isHidden(element.basename))
            .map(element => ({
                name: element.basename,
                isFolder: element.type == "directory",
                size: element.type == "file" ? element.size : undefined,
            }));
    }

    async readJsonFileContent(...pathSegments: string[]): Promise<any> {
        let data = await this.readTextFileContent(path.join(...pathSegments));
        return JSON.parse(data);
    }

    async writeJSONFile(content: any, filePath: string): Promise<void> {
        let data = JSON.stringify(content, null, 4);
        await this.writeTextFile(data, filePath)
    }

    async storedDirectory(dirPath: string): Promise<StoredDirectory> {
        const r = new StoredDirectory();
        r.parentPath = path.dirname(dirPath);
        r.name = path.basename(dirPath);
        r.path = dirPath;
        r.creationDate = new Date(); // TODO: implement
        r.modificationDate = new Date(); // TODO: implement
        r.customProperties = null;
        r.lastVisited = new Date();
        return r;
    }

    async createDirectory(dirPath: string): Promise<void> {
        await this.client.createDirectory(this.full(dirPath), {recursive: true});
    }

    async listSubfoldersWithMetadata(...pathSegments: string[]): Promise<StoredDirectory[]> {
        let result: StoredDirectory[] = [];
        const fullPath = this.full(...pathSegments);
        const contents = await this.client.getDirectoryContents(fullPath);
    
        const directories = (contents as Array<FileStat>).filter(element => element.type == "directory" && !element.basename.startsWith('.'));
    
        const limit = pLimit(this.concurrency); // Limit the number of concurrent requests to 5
    
        const promises = directories.map(element => limit(async () => {
            let customProperties = {};
            try {
                const jsonContent = await this.client.getFileContents(path.join(element.filename, '.bronto.json'));
                customProperties = JSON.parse(jsonContent.toString());
            } catch (err: any) {
                if (err.response && err.response.status !== 404) {
                    throw new Error("WebDAV error: " + err.toString());
                }
            }
    
            const r = new StoredDirectory();
            r.parentPath = fullPath
            r.name = element.basename;
            r.path = element.filename;
            r.creationDate = new Date(element.lastmod); // TODO: fix or remove
            r.modificationDate = new Date(element.lastmod);
            r.customProperties = customProperties;
            r.lastVisited = new Date();
            return r;
        }));
    
        result = await Promise.all(promises);
    
        return result;
    }

    async listSubfolders(...pathSegments: string[]): Promise<StoredDirectory[]> {
        let result: StoredDirectory[] = [];
        const fullPath = this.full(...pathSegments);
        const contents = await this.client.getDirectoryContents(fullPath);
        
        // TODO: handle folder not found

        (contents as Array<FileStat>).forEach(element => {
            if (element.type == "directory" && ! element.basename.startsWith('.')) {
                const r = new StoredDirectory();
                r.parentPath = fullPath
                r.name = element.basename;
                r.path = element.filename;
                r.creationDate = new Date(element.lastmod); // TODO: fix or remove
                r.modificationDate = new Date(element.lastmod);
                r.customProperties = null;
                r.lastVisited = new Date();
                result.push(r);
            }
        });

        // console.log("webdav listSubfolders: ", pathSegments, ": ", result);
        return result;
    }
}

function makeStoredFileObject(fullPath: string, content: string, modificationDate: Date): StoredFile {
    let result = new StoredFile();
    result.content = content;
    result.parentPath = path.dirname(fullPath);
    result.name = path.basename(fullPath);
    result.path = fullPath;
    result.modificationDate = modificationDate;
    result.lastVisited = new Date();
    return result;
}

/** A WebDAV error handler that turns 404s into FileNotFoundError */
function webdavNotFound(filePath: string) {
    return (err: any): never => {
        if (err.response?.status == 404)
            throw new FileNotFoundError(filePath);
        throw Error("WebDAV error: " + err.toString());
    };
}

export class FileNotFoundError extends Error {};
export class FileAccessError extends Error {};