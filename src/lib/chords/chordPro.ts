import { ChartBuilder } from './chartBuilder';
import type { ChartLine, ChordChart, ChordSegment, SectionType } from './chordChart';
import { parseGridLine } from './chordProGrid';

/**
 * ChordPro (https://www.chordpro.org/chordpro/chordpro-directives/): lyrics with [chords] inline,
 * and {directives} for metadata, sections and comments. Formatting directives are ignored.
 */
export function parseChordPro(text: string): ChordChart {
    const chart = new ChartBuilder();
    let skipUntil: string | null = null; // the directive that ends a section we leave out

    for (const line of text.split(/\r?\n/)) {
        const directive = parseDirective(line);
        if (skipUntil) {
            if (directive?.name == skipUntil) skipUntil = null;
        } else if (directive) {
            skipUntil = applyDirective(chart, directive);
        } else if (!line.trimStart().startsWith('#')) { // "#" lines are notes for whoever edits the file
            addContentLine(chart, line);
        }
    }
    return chart.build();
}

export interface Directive {
    name: string; // long form: "comment", not "c"
    value: string;
    selector?: string; // `{comment-guitar: …}` applies to guitars only
}

const LONG_NAMES: Record<string, string> = {
    t: 'title', st: 'subtitle', c: 'comment', ci: 'comment_italic', cb: 'comment_box',
    soc: 'start_of_chorus', eoc: 'end_of_chorus', sov: 'start_of_verse', eov: 'end_of_verse',
    sob: 'start_of_bridge', eob: 'end_of_bridge', sot: 'start_of_tab', eot: 'end_of_tab',
    sog: 'start_of_grid', eog: 'end_of_grid',
};

/** `{name}`, `{name: value}`, `{name value}` or `{name label="value" …}`; null if the line isn't a directive */
export function parseDirective(line: string): Directive | null {
    const match = /^\s*\{\s*([A-Za-z_]+)(?:-([\w!]+))?\s*:?\s*(.*?)\s*\}\s*$/.exec(line);
    if (!match) return null;
    const [, name, selector, argument] = match;
    return { name: LONG_NAMES[name] ?? name, value: attributeValue(argument, 'label') ?? argument, selector };
}

/** The value of `name="…"` when the argument is in attribute form */
function attributeValue(argument: string, name: string): string | undefined {
    if (!/^\w+\s*=\s*["']/.test(argument)) return undefined;
    const match = new RegExp(`\\b${name}\\s*=\\s*(["'])(.*?)\\1`).exec(argument);
    return match?.[2] ?? '';
}

const SUBTITLE_DIRECTIVES = ['subtitle', 'artist', 'composer', 'lyricist'];
const SECTION_TYPES: Record<string, SectionType> = { verse: 'verse', chorus: 'chorus', bridge: 'bridge', tab: 'tab', grid: 'grid' };
const COMMENT_STYLES = { comment: 'normal', highlight: 'normal', comment_italic: 'italic', comment_box: 'box' } as const;
// Sections drawn by other programs (music notation, images): left out
const DELEGATED_SECTIONS = ['abc', 'ly', 'svg', 'textblock'];
const GRID_SHAPE = /^(\d+\+)?\d+(x\d+)?(\+\d+)?$/;

/** Apply a directive to the chart; returns the directive to skip to, when it opens a section we leave out */
export function applyDirective(chart: ChartBuilder, { name, value, selector }: Directive): string | null {
    const appliesHere = !selector || selector.endsWith('!'); // no instrument or user is configured
    const { meta } = chart;

    if (name.startsWith('start_of_')) {
        const environment = name.slice('start_of_'.length);
        if (!appliesHere || DELEGATED_SECTIONS.includes(environment)) return `end_of_${environment}`;
        const label = GRID_SHAPE.test(value) ? undefined : value; // legacy `{start_of_grid: 1+4x4+1}`
        chart.startSection(SECTION_TYPES[environment] ?? 'none', label || undefined);
    } else if (!appliesHere) {
        // meant for another instrument or user
    } else if (name.startsWith('end_of_')) {
        chart.endSection();
    } else if (name == 'chorus') {
        chart.recallChorus(value);
    } else if (name in COMMENT_STYLES) {
        chart.addLine({ kind: 'comment', text: value, style: COMMENT_STYLES[name as keyof typeof COMMENT_STYLES] });
    } else if (name == 'title') {
        meta.title ??= value;
    } else if (SUBTITLE_DIRECTIVES.includes(name)) {
        meta.subtitles.push(value);
    } else if (name == 'key') {
        meta.key ??= value;
    } else if (name == 'capo') {
        meta.capo = value;
    } else if (name == 'tempo') {
        meta.tempo = parseFloat(value) || undefined;
    } else if (name == 'time') {
        meta.time ??= value;
    }
    return null;
}

function addContentLine(chart: ChartBuilder, line: string) {
    if (line.trim() == '') chart.blankLine();
    else if (chart.currentType == 'tab') chart.addLine({ kind: 'tab', text: line });
    else if (chart.currentType == 'grid') chart.addLine(parseGridLine(line));
    else chart.addLine(parseBracketedChords(line));
}

/** A lyrics line with chords in brackets, placed before the syllable: `Swing [D]low, sweet [G]chari[D]ot`. `[*Coda]` is an annotation. */
export function parseBracketedChords(line: string): ChartLine {
    const parts = line.split(/\[([^\]]*)\]/); // lyrics, chord, lyrics, chord, …
    const segments: ChordSegment[] = parts[0] ? [{ lyrics: parts[0] }] : [];
    for (let i = 1; i < parts.length; i += 2) {
        const [mark, lyrics] = [parts[i], parts[i + 1]];
        segments.push(mark.startsWith('*') ? { annotation: mark.slice(1), lyrics } : { chord: mark, lyrics });
    }
    return { kind: 'lyrics', segments };
}
