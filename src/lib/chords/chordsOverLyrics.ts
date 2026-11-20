import { ChartBuilder } from './chartBuilder';
import type { ChartLine, ChordChart, ChordSegment, SectionType } from './chordChart';
import { applyDirective, parseBracketedChords, parseDirective } from './chordPro';
import { isChord, isChordLine } from './chordSymbols';

/**
 * Plain-text charts as found on the web (Ultimate Guitar and the like): a line of chords above each
 * line of lyrics, aligned by column, and section headers such as `[Chorus]` or `Verse 2:`.
 */
export function parseChordsOverLyrics(text: string): ChordChart {
    const chart = new ChartBuilder();
    parseChartBody(text.split(/\r?\n/), chart);
    return chart.build();
}

/** Whether a text file is a chord chart: it has chord lines */
export function looksLikeChordsOverLyrics(text: string): boolean {
    return text.split(/\r?\n/).filter(isChordLine).length >= 2;
}

/**
 * The lines of a free-form chart, as OnSong reads them (https://onsongapp.com/docs/features/formats/onsong/chords):
 * section headers, chords over lyrics or in brackets, `(instructions)`, `# notes` (hidden) and ChordPro directives.
 * A line starting with "." or "`" is a chord line, whatever it holds.
 */
export function parseChartBody(lines: string[], chart: ChartBuilder) {
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const directive = parseDirective(line);
        const header = sectionHeader(line);

        if (line.trim() == '') chart.blankLine();
        else if (line.trimStart().startsWith('#')) continue;
        else if (directive) applyDirective(chart, directive);
        else if (header) chart.startSection(sectionTypeOf(header), header);
        else if (/^\s*\(.*\)\s*$/.test(line)) chart.addLine({ kind: 'comment', text: line.trim().slice(1, -1), style: 'normal' });
        else if (isForcedChordLine(line) || isChordLine(line)) {
            const chords = line.replace(/^(\s*)[.`]/, '$1'); // the marker isn't part of the alignment
            const next = lines[i + 1];
            if (next !== undefined && isLyricsLine(next)) {
                chart.addLine(mergeChordsOverLyrics(chords, next));
                i++;
            } else {
                chart.addLine(mergeChordsOverLyrics(chords, ''));
            }
        }
        else chart.addLine(parseBracketedChords(line));
    }
}

const isForcedChordLine = (line: string) => /^\s*[.`]/.test(line);

function isLyricsLine(line: string): boolean {
    return line.trim() != '' && !isChordLine(line) && !isForcedChordLine(line)
        && !sectionHeader(line) && !parseDirective(line) && !line.trimStart().startsWith('#');
}

const SECTION_WORDS = /^(intro|verse|pre-?chorus|chorus|refrain|bridge|solo|instrumental|interlude|break|outro|ending|coda|tag|hook|vamp)\b/i;

/** "Verse 1" for `[Verse 1]` or `Verse 1:` alone on a line; null for anything else */
export function sectionHeader(line: string): string | null {
    const trimmed = line.trim();
    const bracketed = /^\[([^\]]+)\]$/.exec(trimmed);
    if (bracketed && !isChord(bracketed[1])) return bracketed[1].trim();
    const colon = /^([^:[\]]+):$/.exec(trimmed);
    if (colon && SECTION_WORDS.test(colon[1].trim())) return colon[1].trim();
    return null;
}

export function sectionTypeOf(label: string): SectionType {
    if (/chorus|refrain/i.test(label) && !/pre-?chorus/i.test(label)) return 'chorus';
    if (/bridge/i.test(label)) return 'bridge';
    return 'verse';
}

/** Pair a chord line with the lyrics below it: each chord starts a segment at its column */
export function mergeChordsOverLyrics(chordLine: string, lyrics: string): ChartLine {
    const chords = [...chordLine.matchAll(/\S+/g)];
    if (chords.length == 0) return { kind: 'lyrics', segments: [{ lyrics }] };

    const padded = lyrics.padEnd(chords.at(-1)!.index!, ' ');
    const segments: ChordSegment[] = chords[0].index! > 0 ? [{ lyrics: padded.slice(0, chords[0].index) }] : [];
    chords.forEach((chord, i) => segments.push({
        chord: chord[0],
        lyrics: padded.slice(chord.index, chords[i + 1]?.index),
    }));
    return { kind: 'lyrics', segments };
}
