import { describe, expect, it } from 'vitest';
import { looksLikeChordsOverLyrics, mergeChordsOverLyrics, parseChordsOverLyrics } from './chordsOverLyrics';
import { parseOnSong } from './onSong';

describe('chords over lyrics', () => {
    it('places each chord at its column in the lyrics below', () => {
        expect(mergeChordsOverLyrics('        D                G', 'Amazing Grace, how sweet the sound')).toEqual({
            kind: 'lyrics',
            segments: [{ lyrics: 'Amazing ' }, { chord: 'D', lyrics: 'Grace, how sweet ' }, { chord: 'G', lyrics: 'the sound' }],
        });
        expect(mergeChordsOverLyrics('G       C', 'Oh')).toEqual({ kind: 'lyrics', segments: [{ chord: 'G', lyrics: 'Oh      ' }, { chord: 'C', lyrics: '' }] });
    });

    it('reads section headers and tells charts from plain text', () => {
        const text = '[Verse 1]\nD        G\nAmazing grace\n\n[Chorus]\nA        D\nHow sweet the sound';
        expect(looksLikeChordsOverLyrics(text)).toBe(true);
        expect(looksLikeChordsOverLyrics('Intro      4 bars, rim click\nVerses     brushes')).toBe(false);
        expect(parseChordsOverLyrics(text).sections.map(s => [s.type, s.label, s.lines.length])).toEqual([['verse', 'Verse 1', 1], ['chorus', 'Chorus', 1]]);
    });
});

describe('OnSong', () => {
    it('reads the metadata block, labels, both chord styles, instructions and hidden notes', () => {
        const chart = parseOnSong('Amazing Grace\nJohn Newton\nKey: G\nTempo: 90\n\nVerse 1:\nA[G]mazing [C]grace\n(Repeat 2x)\n# remember the capo\n.Am   F\nHow sweet the sound');
        expect(chart.meta).toEqual({ title: 'Amazing Grace', subtitles: ['John Newton'], key: 'G', tempo: 90 });
        expect(chart.sections).toHaveLength(1);
        expect(chart.sections[0].label).toBe('Verse 1');
        expect(chart.sections[0].lines.map(line => line.kind)).toEqual(['lyrics', 'comment', 'lyrics']);
        expect(chart.sections[0].lines[2]).toEqual({ kind: 'lyrics', segments: [{ chord: 'Am', lyrics: 'How s' }, { chord: 'F', lyrics: 'weet the sound' }] });
    });
});
