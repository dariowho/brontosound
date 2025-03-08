import fs from 'fs'
import path from 'path'

export interface StoredDirectory {
    name: string;
    path: string;
    creationDate: Date;
    modificationDate: Date;
}

export class FilesystemStorage {
    basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    readTextFile(...pathSegments: string[]): string {
        const fullPath = path.join(this.basePath,...pathSegments);
        try{
            return fs.readFileSync(fullPath).toString();
        } catch (err: any) {
            const nodeError: NodeJS.ErrnoException = err;
            if (nodeError.code == "ENOENT") {
                // console.log("readTextFile: file not found: ", fullPath)
                throw new FileNotFoundError();
            } 
            throw err;
        }
    }

    writeTextFile(content: string, filePath: string) {
        const fullPath = path.join(this.basePath, filePath);
        fs.mkdirSync(path.dirname(fullPath), { recursive: true });
        fs.writeFileSync(fullPath, content, 'utf-8');
    }

    writeJSONFile(content: any, filePath: string) {
        this.writeTextFile(JSON.stringify(content, null, 4), filePath);
    }

    readJSON(...pathSegments: string[]) {
        return JSON.parse(this.readTextFile(...pathSegments));
    }

    storedDirectory(dirPath: string): StoredDirectory {
        return {
            name: path.basename(dirPath),
            path: dirPath,
            creationDate: new Date(),     // TODO: implement
            modificationDate: new Date()  // TODO: implement
        }
    }

    listSubfolders(...pathSegments: string[]): StoredDirectory[] {
        let result: StoredDirectory[] = [];
        const fullPath = path.join(this.basePath, ...pathSegments);
        let dirents = fs.readdirSync(fullPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .filter(dirent => dirent.name[0] != '.');
        dirents.forEach(dirent => {
            result.push({
                name: dirent.name,
                path: path.join(...pathSegments, dirent.name),
                creationDate: new Date(),     // TODO: implement
                modificationDate: new Date()  // TODO: implement
            })
        });
        return result;
    }
}

export class FileNotFoundError extends Error {};
