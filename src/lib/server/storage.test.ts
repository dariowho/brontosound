import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterAll, describe, expect, it } from 'vitest';

import { assertInside, FilesystemStorage, isFolderName } from './storage';

const base = fs.mkdtempSync(path.join(os.tmpdir(), 'brontosound-storage-'));
fs.mkdirSync(path.join(base, 'Songs/Autumn Leaves'), { recursive: true });
fs.writeFileSync(path.join(base, 'Songs/Autumn Leaves/chords.chordpro'), 'chords');
fs.writeFileSync(path.join(base, 'bandSettings.json'), '{}');
afterAll(() => fs.rmSync(base, { recursive: true }));

describe('filesystem storage', () => {
    const storage = new FilesystemStorage(base, 'Songs');

    it('reads and lists inside the songs folder', async () => {
        expect(await storage.readTextFileContent('Songs/Autumn Leaves/chords.chordpro')).toBe('chords');
        expect((await storage.listFolder('Songs')).map(entry => entry.name)).toEqual(['Autumn Leaves']);
    });

    it('refuses paths outside the songs folder', async () => {
        for (const outside of ['bandSettings.json', 'Songs/../bandSettings.json', '../etc/passwd', 'Songs/x\0']) {
            await expect(storage.readTextFile(outside)).rejects.toThrow('Outside the songs folder');
        }
        await expect(storage.writeFile('Songs/../written.txt', new Uint8Array())).rejects.toThrow('Outside the songs folder');
        expect(fs.existsSync(path.join(base, 'written.txt'))).toBe(false);
    });
});

describe('paths', () => {
    it('stay inside the root, in POSIX syntax too (WebDAV)', () => {
        expect(() => assertInside('/Songs', '/Songs/a/..b', path.posix)).not.toThrow();
        expect(() => assertInside('/Songs', path.posix.join('/', 'Songs/../x'), path.posix)).toThrow();
        expect(() => assertInside('/Songs', '/Songsx', path.posix)).toThrow();
    });

    it('accept single folder names only', () => {
        expect(isFolderName('Autumn Leaves')).toBe(true);
        for (const name of ['', '.', '..', 'a/b', 'a\\b', '../x', 7]) {
            expect(isFolderName(name)).toBe(false);
        }
    });
});
