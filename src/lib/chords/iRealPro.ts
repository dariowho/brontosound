/**
 * iReal Pro charts, shared as `irealb://` links: in iReal Pro's .html exports, or pasted into text files.
 * iReal Pro doesn't publish the format. This follows the community's reading of it, as implemented by
 * ireal-renderer (MIT, Michael Daumling) and ireal-reader (MIT, pianosnake).
 *
 * A chart is a sequence of cells, 16 to a row, usually 4 to a bar.
 */
export interface IRealSong {
    title: string;
    composer: string;
    style: string;
    key: string; // "C", "Eb-" (minor)
    bpm?: number;
    cells: IRealCell[];
}

export interface IRealCell {
    chord?: IRealChord;
    symbol?: 'repeatBar' | 'repeatTwoBars' | 'slash' | 'noChord';
    barStart?: '|' | '[' | '{'; // single, double, repeat start
    barEnd?: '|' | ']' | '}' | 'Z'; // single, double, repeat end, final
    section?: string; // "A", "B", "In"
    timeSignature?: string; // "4/4"
    ending?: string; // "1", "2"
    marks: ('segno' | 'coda' | 'fermata')[];
    comment?: string;
    small: boolean; // chords written small: played lightly
    spaceAbove: number; // vertical spacers before this cell's row
}

export interface IRealChord {
    root: string; // "C", "Bb", "W" (invisible root: only the bass or the quality changes)
    quality: string; // iReal notation: "^7" major 7, "-7" minor 7, "h7" half-diminished, "o" diminished
    bass?: string;
    alternate?: IRealChord; // a smaller chord written above
}

/** Every song in the `irealb://` links found in a text or HTML file */
export function parseIRealLinks(text: string): IRealSong[] {
    return [...text.matchAll(/irealb:\/\/([^"'\s<>]+)/g)].flatMap(link => {
        const songs = decodeURIComponent(link[1]).split('===');
        if (songs.length > 1) songs.pop(); // a playlist ends with its name
        return songs.filter(Boolean).map(parseSong);
    });
}

const MUSIC_PREFIX = '1r34LbKcu7';

/** `Title=Composer==Style=Key=Transpose=1r34LbKcu7<music>=CompStyle=Bpm=Repeats` */
function parseSong(data: string): IRealSong {
    const fields = data.split('=');
    const music = unscramble(fields[6]?.split(MUSIC_PREFIX)[1] ?? '');
    return {
        title: fields[0],
        composer: fields[1],
        style: fields[3],
        key: fields[4],
        bpm: Number(fields[8]) || undefined,
        cells: parseCells(music),
    };
}

/** The music string is scrambled in blocks of 50 characters, except the last one. Scrambling twice unscrambles. */
export function unscramble(music: string): string {
    let result = '';
    while (music.length > 51) {
        result += unscrambleBlock(music.slice(0, 50));
        music = music.slice(50);
    }
    return result + music;
}

function unscrambleBlock(block: string): string {
    const chars = block.split('');
    const swap = (i: number) => {
        chars[i] = block[49 - i];
        chars[49 - i] = block[i];
    };
    for (let i = 0; i < 5; i++) swap(i); // the first 5 characters with the last 5
    for (let i = 10; i < 24; i++) swap(i); // and characters 10 to 23 with 26 to 39
    return chars.join('');
}

// Tokens, tried in order at the start of the remaining music string
const CHORD = /^([ A-GW][b#]?)((?:sus|add|alt|[+\-^\dhob#])*)(\*.+?\*)?(\/[A-G][#b]?)?(\(.*?\))?/;
const TOKENS = [
    /^\*[a-zA-Z]/, // section
    /^T\d\d/, // time signature
    /^N\d/, // ending
    /^<.*?>/, // comment
    CHORD, // a chord, or " " for an empty cell
    /^LZ/, // a cell boundary and a bar line
    /^XyQ/, // three empty cells
    /^Kcl/, // repeat the previous bar
];
const EXPANSIONS: Record<string, string[]> = { LZ: [' ', '|'], XyQ: [' ', ' ', ' '], Kcl: ['|', 'x', ' '] };

/** Split the music string into tokens: chords as regex matches, everything else as strings */
function tokenize(music: string): (string | RegExpExecArray)[] {
    const tokens: (string | RegExpExecArray)[] = [];
    let rest = music.trimEnd();
    while (rest) {
        const match = TOKENS.map(token => token.exec(rest)).find(Boolean);
        if (!match) {
            if (rest[0] != ',') tokens.push(rest[0]); // commas only separate tokens
            rest = rest.slice(1);
        } else {
            if (match.length > 1) tokens.push(match);
            else tokens.push(...(EXPANSIONS[match[0]] ?? [match[0]]));
            rest = rest.slice(match[0].length);
        }
    }
    return tokens;
}

const newCell = (small: boolean): IRealCell => ({ marks: [], small, spaceAbove: 0 });
const SYMBOLS: Record<string, IRealCell['symbol']> = { x: 'repeatBar', r: 'repeatTwoBars', p: 'slash', n: 'noChord' };
const MARKS: Record<string, IRealCell['marks'][number]> = { S: 'segno', Q: 'coda', f: 'fermata' };
const SECTION_NAMES: Record<string, string> = { i: 'In', v: 'Verse' };

/**
 * Tokens become cells: annotations, bar lines and comments attach to the cell being built,
 * and a chord (or an empty cell, or a symbol) completes it.
 */
function parseCells(music: string): IRealCell[] {
    const tokens = tokenize(music);
    const cells: IRealCell[] = [];
    let small = false;
    let cell = newCell(small);

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (typeof token != 'string') {
            cell.chord = parseChord(token);
        } else if (token[0] == '*') {
            cell.section = SECTION_NAMES[token[1]] ?? token[1];
        } else if (token[0] == 'T') {
            cell.timeSignature = token == 'T12' ? '12/8' : `${token[1]}/${token[2]}`;
        } else if (token[0] == 'N') {
            cell.ending = token[1];
        } else if (token[0] == '<') {
            cell.comment = token.slice(1, -1).replace(/^\*\d\d/, '').replaceAll('XyQ', '   ');
        } else if (token in MARKS) {
            cell.marks.push(MARKS[token]);
        } else if (token == 's' || token == 'l') {
            small = cell.small = token == 's';
        } else if (token == 'Y') {
            cell.spaceAbove++;
        } else if (token == '[' || token == '{' || token == '|') {
            cell.barStart = token;
        } else if (token in SYMBOLS) {
            cell.symbol = SYMBOLS[token];
        } else if (token == 'U' || token == ']' || token == '}' || token == 'Z') {
            continue; // the end marker for the player; right bar lines are read with the cell before them
        }
        const completesCell = typeof token != 'string' || token == ' ' || token in SYMBOLS;
        if (!completesCell) continue;

        const next = tokens[i + 1];
        if (next == ']' || next == '}' || next == 'Z') cell.barEnd = next;
        cells.push(cell);
        cell = newCell(small);
    }
    return cells;
}

function parseChord(match: RegExpExecArray): IRealChord | undefined {
    const [, root, quality, custom, bass, alternate] = match;
    const alternateMatch = alternate && CHORD.exec(alternate.slice(1, -1));
    const chord: IRealChord = {
        root: root.trim(),
        quality: quality + (custom?.slice(1, -1) ?? ''),
        bass: bass?.slice(1),
        alternate: alternateMatch ? parseChord(alternateMatch) : undefined,
    };
    return chord.root || chord.alternate ? chord : undefined; // no root and no alternate: an empty cell
}

/** The chart's rows of 16 cells; a vertical spacer also starts a row */
export function iRealRows(cells: IRealCell[]): IRealCell[][] {
    const rows: IRealCell[][] = [];
    for (const cell of cells) {
        const row = rows.at(-1);
        if (!row || row.length == 16 || cell.spaceAbove > 0) rows.push([cell]);
        else row.push(cell);
    }
    return rows;
}

/** The bar each cell is in (0-based), or null for empty cells after the final bar line */
export function iRealBarIndexes(cells: IRealCell[]): (number | null)[] {
    let bar = -1;
    let inBar = false;
    return cells.map(cell => {
        const hasContent = !!(cell.chord || cell.symbol);
        if (cell.barStart || (!inBar && hasContent)) {
            bar++;
            inBar = true;
        }
        if (!inBar) return null;
        if (cell.barEnd) inBar = false;
        return bar;
    });
}
