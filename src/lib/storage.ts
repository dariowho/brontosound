import { readdirSync } from 'fs'

import type { Song } from "./songs";

export class FilesystemStorage {
    basePath: string;

    constructor(basePath: string) {
        this.basePath = basePath;
    }

    listSongs(): Song[] {
        const source = this.basePath + "Songs/";
        let result: Song[] = [];
        
        readdirSync(source, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory())
            .forEach(dirent => {
                result.push({
                    author: "Mock Author",
                    title: dirent.name,
                    creationDate: new Date(),
                    modificationDate: new Date,
                    tags: ['mock-tag']
                });
            })
            // .map(dirent => dirent.name).

        return result;
    }
}