import fs from 'fs';
import os from 'os';
import path from 'path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { moveSongsFolderToFiles } from './filesFolder';

let data: string;
beforeEach(() => { data = fs.mkdtempSync(path.join(os.tmpdir(), 'brontosound-data-')); });
afterEach(() => fs.rmSync(data, { recursive: true }));

const write = (file: string) => { fs.mkdirSync(path.dirname(path.join(data, file)), { recursive: true }); fs.writeFileSync(path.join(data, file), 'x'); };
const exists = (file: string) => fs.existsSync(path.join(data, file));

describe('moveSongsFolderToFiles', () => {
    it('moves the songs folder from data/ to data/files/', () => {
        vi.spyOn(console, 'info').mockImplementation(() => {});
        write('Songs/Autumn Leaves/chords.chordpro');
        moveSongsFolderToFiles('Songs', true, data);
        expect(exists('files/Songs/Autumn Leaves/chords.chordpro')).toBe(true);
        expect(exists('Songs')).toBe(false);
    });

    it('moves nested songs folders too', () => {
        vi.spyOn(console, 'info').mockImplementation(() => {});
        write('Music/Songs/a.txt');
        moveSongsFolderToFiles('/Music/Songs/', true, data);
        expect(exists('files/Music/Songs/a.txt')).toBe(true);
    });

    it('leaves alone a folder already moved, and Brontosound\'s own folders', () => {
        write('Songs/old.txt');
        write('files/Songs/new.txt');
        moveSongsFolderToFiles('Songs', true, data);
        expect(exists('Songs/old.txt')).toBe(true);

        write('database/database.sqlite');
        moveSongsFolderToFiles('database', true, data);
        moveSongsFolderToFiles('../outside', true, data);
        expect(exists('database/database.sqlite')).toBe(true);
    });
});
