import { isChord } from './chordSymbols';
import { sectionName, type ChartLine, type ChartSection, type ChordChart } from './chordChart';
import { iRealBarIndexes, type IRealSong } from './iRealPro';

/**
 * How a chart plays when it drives the player (docs/songPage.md): a count of bars at a tempo,
 * split into named sections, with the bars each line (or grid bar, or iReal cell) covers.
 */
export interface ChartTimeline {
    tempo: number; // bpm
    beatsPerBar: number;
    bars: number;
    sections: TimelineSection[];
    barsOf: Map<object, BarRange>; // keyed by chart lines, grid bars, chorus recalls and iReal cells
}

export interface TimelineSection {
    name: string;
    bars: BarRange;
}

export interface BarRange {
    first: number;
    count: number;
}

const DEFAULT_TEMPO = 120;

export const secondsPerBar = (timeline: ChartTimeline) => timeline.beatsPerBar * 60 / timeline.tempo;
export const isInRange = (bar: number, range: BarRange | undefined) => !!range && bar >= range.first && bar < range.first + range.count;

/**
 * A lyrics line lasts one bar per chord, or one bar if it has none: charts don't say more.
 * Grid bars and chorus recalls count as written.
 */
export function chordChartTimeline(chart: ChordChart): ChartTimeline {
    const barsOf = new Map<object, BarRange>();
    let nextBar = 0;
    const take = (key: object, count: number) => {
        barsOf.set(key, { first: nextBar, count });
        nextBar += count;
    };

    const sections = chart.sections.map(section => {
        const first = nextBar;
        if (section.recalled) take(section, barCount(section.recalled));
        for (const line of section.lines) {
            if (line.kind == 'grid') line.row.bars.forEach(bar => take(bar, 1));
            else if (lineBars(line) > 0) take(line, lineBars(line));
        }
        return { name: sectionName(section), bars: { first, count: nextBar - first } };
    });

    return {
        tempo: chart.meta.tempo ?? DEFAULT_TEMPO,
        beatsPerBar: beatsPerBar(chart.meta.time),
        bars: nextBar,
        sections: sections.filter(section => section.bars.count > 0),
        barsOf,
    };
}

function lineBars(line: ChartLine): number {
    if (line.kind == 'grid') return line.row.bars.length;
    if (line.kind != 'lyrics') return 0;
    return Math.max(1, line.segments.filter(segment => segment.chord && isChord(segment.chord)).length);
}

const barCount = (section: ChartSection) => section.lines.reduce((sum, line) => sum + lineBars(line), 0);

function beatsPerBar(time: string | undefined): number {
    return parseInt(time ?? '') || 4;
}

/** An iReal Pro chart plays its bars in the order written: repeats and codas aren't followed */
export function iRealTimeline(song: IRealSong): ChartTimeline {
    const barsOf = new Map<object, BarRange>();
    const sections: TimelineSection[] = [];
    const barIndexes = iRealBarIndexes(song.cells);

    song.cells.forEach((cell, i) => {
        const bar = barIndexes[i];
        if (bar === null) return;
        barsOf.set(cell, { first: bar, count: 1 });
        if (cell.section || sections.length == 0) sections.push({ name: cell.section ?? '', bars: { first: bar, count: 0 } });
        const current = sections.at(-1)!;
        current.bars.count = bar - current.bars.first + 1;
    });

    const bars = Math.max(-1, ...barIndexes.map(bar => bar ?? -1)) + 1;
    const time = song.cells.find(cell => cell.timeSignature)?.timeSignature;
    return { tempo: song.bpm ?? DEFAULT_TEMPO, beatsPerBar: beatsPerBar(time), bars, sections, barsOf };
}
