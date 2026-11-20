import { describe, expect, it } from 'vitest';
import { iRealBarIndexes, iRealRows, parseIRealLinks, unscramble } from './iRealPro';
import { iRealTimeline } from './chartTimeline';

// A made-up blues, two sections, in iReal Pro's music notation
const MUSIC = '{*AT44C7XyQ|F7XyQ|C7XyQ|C7XyQ}[*BF7XyQ|F7XyQ|C^7XyQ|A-7XyQ|D-7 G7LZC6(A7)XyQZ';
const link = (music: string) => 'irealb://' + encodeURIComponent(`Test Blues=Band Composer==Medium Swing=C=n=1r34LbKcu7${unscramble(music)}=Jazz=140=3`);

describe('iReal Pro', () => {
    const [song] = parseIRealLinks(`<a href="${link(MUSIC)}">Test Blues</a>`);

    it('reads song details', () => {
        expect([song.title, song.composer, song.style, song.key, song.bpm]).toEqual(['Test Blues', 'Band Composer', 'Medium Swing', 'C', 140]);
    });

    it('reads cells: chords, sections, time, bar lines and alternate chords', () => {
        const [first] = song.cells;
        expect(first).toMatchObject({ section: 'A', timeSignature: '4/4', barStart: '{', chord: { root: 'C', quality: '7' } });
        expect(song.cells[15].barEnd).toBe('}');
        expect(song.cells[16]).toMatchObject({ section: 'B', barStart: '[' });
        const last = song.cells.find(cell => cell.chord?.alternate);
        expect(last?.chord).toEqual({ root: 'C', quality: '6', bass: undefined, alternate: { root: 'A', quality: '7', bass: undefined, alternate: undefined } });
        expect(song.cells.at(-1)?.barEnd).toBe('Z');
    });

    it('lays cells out 16 to a row, 4 to a bar', () => {
        expect(iRealRows(song.cells).map(row => row.length)).toEqual([16, 16, 8]);
        expect(iRealBarIndexes(song.cells).filter(bar => bar !== null).at(-1)).toBe(9);
        const timeline = iRealTimeline(song);
        expect(timeline.bars).toBe(10);
        expect(timeline.sections).toEqual([{ name: 'A', bars: { first: 0, count: 4 } }, { name: 'B', bars: { first: 4, count: 6 } }]);
    });
});
