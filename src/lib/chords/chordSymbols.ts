/** Chord symbols: recognising them in text, and transposing them */

const ROOT = '[A-H](?:#|b|♯|♭)?';
const QUALITY = '(?:maj|min|dim|aug|sus|add|alt|omit|no|m|M|o|°|ø|h|\\+|-|\\^|\\d|#|b|♯|♭|\\(|\\)|,)*';
const CHORD = new RegExp(`^(${ROOT})(${QUALITY})(?:/(${ROOT}))?$`);
const NO_CHORD = /^N\.?C\.?$/i;

/** Tokens that may sit on a chord line besides chords: bar lines, rhythm slashes, repeat counts, (notes) */
const CHORD_LINE_EXTRAS = /^(?:\|+|:?\|:?|\/+|-+|\.+|%|x\d+|\d+x|\(.*\))$/i;

export function isChord(token: string): boolean {
    return CHORD.test(token) || NO_CHORD.test(token);
}

/** A line made only of chords (and bar lines, slashes, repeat counts or notes in parentheses) */
export function isChordLine(line: string): boolean {
    const tokens = line.trim().split(/\s+/).filter(Boolean);
    return tokens.some(isChord) && tokens.every(token => isChord(token) || CHORD_LINE_EXTRAS.test(token));
}

const SEMITONES: Record<string, number> = {
    C: 0, 'C#': 1, Db: 1, D: 2, 'D#': 3, Eb: 3, E: 4, Fb: 4, 'E#': 5, F: 5, 'F#': 6, Gb: 6,
    G: 7, 'G#': 8, Ab: 8, A: 9, 'A#': 10, Bb: 10, B: 11, H: 11, Cb: 11, 'B#': 0,
};
const SHARP_NAMES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const FLAT_NAMES = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];
// How each key is usually written
const MAJOR_KEYS = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B'];
const MINOR_KEYS = ['C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B'];
const FLAT_MAJOR_KEYS = ['F', 'Bb', 'Eb', 'Ab', 'Db', 'Gb'];
const FLAT_MINOR_KEYS = ['D', 'G', 'C', 'F', 'Bb', 'Eb'];

const normalizeAccidentals = (note: string) => note.replace('♯', '#').replace('♭', 'b');
const mod12 = (n: number) => ((n % 12) + 12) % 12;

export function transposeNote(note: string, semitones: number, useFlats: boolean): string {
    const index = SEMITONES[normalizeAccidentals(note)];
    if (index === undefined) return note;
    return (useFlats ? FLAT_NAMES : SHARP_NAMES)[mod12(index + semitones)];
}

export function transposeChord(chord: string, semitones: number, useFlats: boolean): string {
    const match = CHORD.exec(chord);
    if (!match || semitones == 0) return chord;
    const [, root, quality, bass] = match;
    const transposedBass = bass ? '/' + transposeNote(bass, semitones, useFlats) : '';
    return transposeNote(root, semitones, useFlats) + quality + transposedBass;
}

/** A key ("G", "Em", "Eb-") split into its tonic and its mode ("", "m", "-"…) */
function parseKey(key: string): { tonic: string, mode: string, minor: boolean } | null {
    const match = /^([A-H](?:#|b|♯|♭)?)(.*)$/.exec(key.trim());
    if (!match) return null;
    const mode = match[2];
    return { tonic: normalizeAccidentals(match[1]), mode, minor: /^\s*(m(?!aj)|min|-)/.test(mode) };
}

/** The key `semitones` away, spelled the usual way (Bb, not A#), keeping the original's mode marker */
export function transposeKey(key: string, semitones: number): string {
    const parsed = parseKey(key);
    const index = parsed ? SEMITONES[parsed.tonic] : undefined;
    if (!parsed || index === undefined) return key;
    return (parsed.minor ? MINOR_KEYS : MAJOR_KEYS)[mod12(index + semitones)] + parsed.mode;
}

/** Whether chords in this key are written with flats */
export function keyUsesFlats(key: string): boolean {
    const parsed = parseKey(key);
    if (!parsed) return false;
    return (parsed.minor ? FLAT_MINOR_KEYS : FLAT_MAJOR_KEYS).includes(parsed.tonic);
}

/**
 * A function that transposes chords by `semitones`, spelling them as the transposed key does.
 * `key` is the chart's key (or its first chord) and may be unknown.
 */
export function chordTransposer(key: string | undefined, semitones: number): (chord: string) => string {
    if (semitones == 0) return chord => chord;
    const useFlats = key ? keyUsesFlats(transposeKey(key, semitones)) : semitones < 0;
    return chord => transposeChord(chord, semitones, useFlats);
}

/** "G", or "A (+2)" once transposed */
export function keyLabel(key: string | undefined, semitones: number): string {
    const offset = semitones > 0 ? `+${semitones}` : `−${-semitones}`;
    if (!key) return semitones == 0 ? 'Original' : offset;
    return semitones == 0 ? key : `${transposeKey(key, semitones)} (${offset})`;
}
