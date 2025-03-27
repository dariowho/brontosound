import fs from 'fs'
import path, { basename, dirname } from 'path'
import { createClient, type FileStat, type ResponseDataDetailed, type WebDAVClient } from 'webdav';
import pLimit from 'p-limit';

import { StoredDirectory, StoredFile } from '$lib/dbEntities/storage';

export interface PersistedStorage {
    readTextFile(...pathSegments: string[]): Promise<StoredFile>;
    readTextFileContent(...pathSegments: string[]): Promise<string>;
    writeTextFile(content: string, filePath: string): Promise<StoredFile>;
    readJsonFileContent(...pathSegments: string[]): Promise<any>;
    writeJSONFile(content: any, filePath: string): Promise<void>;

    storedDirectory(dirPath: string): Promise<StoredDirectory>;
    listSubfolders(...pathSegments: string[]): Promise<StoredDirectory[]>;
}

export class FilesystemStorage implements PersistedStorage {
    basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }



    async readTextFile(...pathSegments: string[]): Promise<StoredFile> {
        const fullPath = path.join(this.basePath,...pathSegments);
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
        const fullPath = path.join(this.basePath, filePath);
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

    async listSubfolders(...pathSegments: string[]): Promise<StoredDirectory[]> {
        let result: StoredDirectory[] = [];
        const fullPath = path.join(this.basePath, ...pathSegments);
        let dirents = fs.readdirSync(fullPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => dirent.name[0] != '.');
        dirents.forEach(dirent => {
            const r = new StoredDirectory();
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

export class WebdavStorage implements PersistedStorage {

    client: WebDAVClient;
    concurrency: number;

    constructor(server: string, username: string, password: string, concurrency: number = 5) {
        this.client = createClient(
            server,
            {
                username: username,
                password: password
            }
        );
        this.concurrency = concurrency;
    }

    check() {
        this.client.getDirectoryContents('/');
        return true;
    }

    async readTextFileContent(...pathSegments: string[]): Promise<string> {
        return ((await this.readTextFile(...pathSegments)).content);
    }

    async readTextFile(...pathSegments: string[]): Promise<StoredFile> {
        try {
            const fullPath = path.join(...pathSegments);
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

    async listSubfoldersWithMetadata(...pathSegments: string[]): Promise<StoredDirectory[]> {
        let result: StoredDirectory[] = [];
        const fullPath = path.join(...pathSegments);
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
        const fullPath = path.join(...pathSegments);
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

export class FileNotFoundError extends Error {};
export class FileAccessError extends Error {};