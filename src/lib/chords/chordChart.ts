/**
 * A lyrics-and-chords chart, as read from ChordPro, OnSong or chords-over-lyrics text (docs/songPage.md).
 * iReal Pro charts are bar grids and have their own model, in iRealPro.ts.
 */
export interface ChordChart {
    meta: ChartMeta;
    sections: ChartSection[];
}

export interface ChartMeta {
    title?: string;
    subtitles: string[]; // subtitle, artist, composer… in the order found
    key?: string;
    capo?: string;
    tempo?: number; // bpm
    time?: string; // "4/4"
}

/** How a section renders: chorus is set apart, tab is monospace, grid is a bar grid */
export type SectionType = 'verse' | 'chorus' | 'bridge' | 'tab' | 'grid' | 'none';

export interface ChartSection {
    type: SectionType;
    label?: string;
    lines: ChartLine[];
    /** For a chorus recall (`{chorus}`): the chorus played again here, shown by its label only */
    recalled?: ChartSection;
}

export type ChartLine =
    | { kind: 'lyrics', segments: ChordSegment[] } // a chords-only line has empty lyrics
    | { kind: 'comment', text: string, style: 'normal' | 'italic' | 'box' }
    | { kind: 'tab', text: string }
    | { kind: 'grid', row: GridRow }
    | { kind: 'space' }; // a blank line inside a section

/** A chord (or an annotation such as "Coda") and the lyrics sung from it */
export interface ChordSegment {
    chord?: string;
    annotation?: string;
    lyrics: string;
}

/** A ChordPro grid line: `Intro | G . . . | D7 . . . :| x2` */
export interface GridRow {
    margin?: string; // text before the first bar line
    comment?: string; // text after the last bar line
    bars: GridBar[];
    barLines: BarLine[]; // barLines[i] opens bars[i]; the last one closes the row
}

export interface GridBar {
    cells: string[]; // a chord, "/" (play the chord again), "%" (repeat the bar) or "" (empty beat)
}

export interface BarLine {
    style: 'single' | 'double' | 'end';
    repeatStart?: boolean;
    repeatEnd?: boolean;
    volta?: string; // ending number, written on the bar line that opens it
}

/** The chart's key, or its first chord when it doesn't say: used to spell transposed chords */
export function chartKey(chart: ChordChart): string | undefined {
    return chart.meta.key ?? chart.sections
        .flatMap(section => section.lines)
        .flatMap(line => line.kind == 'lyrics' ? line.segments : [])
        .find(segment => segment.chord)?.chord;
}

const SECTION_NAMES: Record<SectionType, string> = {
    verse: 'Verse', chorus: 'Chorus', bridge: 'Bridge', tab: 'Tab', grid: 'Grid', none: '',
};

export const sectionName = (section: ChartSection): string => section.label ?? SECTION_NAMES[section.type];
