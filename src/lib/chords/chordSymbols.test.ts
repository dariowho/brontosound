import { describe, expect, it } from 'vitest';
import { chordTransposer, isChord, isChordLine, keyLabel, transposeChord, transposeKey } from './chordSymbols';

describe('chord symbols', () => {
    it('recognises chords', () => {
        for (const chord of ['C', 'F#m7', 'Bbmaj7', 'Asus4/C#', 'G7(b9)', 'Cdim', 'E-7', 'N.C.']) expect(isChord(chord)).toBe(true);
        for (const word of ['Amazing', 'grace', 'x', 'Chorus']) expect(isChord(word)).toBe(false);
    });

    it('recognises chord lines, allowing bars and notes in parentheses', () => {
        expect(isChordLine('  G    D7   | C  (x2)')).toBe(true);
        expect(isChordLine('Amazing Grace, how sweet')).toBe(false);
        expect(isChordLine('A man, a plan')).toBe(false);
    });

    it('transposes chords and their bass notes', () => {
        expect(transposeChord('C#m7/G#', 2, false)).toBe('D#m7/A#');
        expect(transposeChord('G7', -2, true)).toBe('F7');
        expect(transposeChord('N.C.', 3, false)).toBe('N.C.');
    });

    it('spells transposed keys the usual way and chords to match', () => {
        expect(transposeKey('G', 3)).toBe('Bb');
        expect(transposeKey('Em', 1)).toBe('Fm');
        expect(transposeKey('Eb-', 2)).toBe('F-');
        expect(chordTransposer('G', 3)('D7')).toBe('F7');
        expect(chordTransposer('G', 3)('A')).toBe('C');
        expect(chordTransposer('G', 3)('C#')).toBe('E');
        expect(chordTransposer('D', 1)('F#m')).toBe('Gm');
        expect(keyLabel('G', 2)).toBe('A (+2)');
        expect(keyLabel(undefined, -1)).toBe('−1');
    });
});
