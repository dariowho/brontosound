import { ChartBuilder } from './chartBuilder';
import type { ChordChart } from './chordChart';
import { parseChartBody } from './chordsOverLyrics';

/**
 * OnSong (https://onsongapp.com/docs/features/formats/onsong): a metadata block of `Name: value` lines
 * up to the first blank line (or the first two untagged lines, as title and artist), then a free-form body.
 */
export function parseOnSong(text: string): ChordChart {
    const chart = new ChartBuilder();
    const lines = text.split(/\r?\n/);
    const bodyStart = readMetadata(lines, chart);
    parseChartBody(lines.slice(bodyStart), chart);
    return chart.build();
}

const TAG = /^([A-Za-z][\w -]*):\s*(.+)$/;

/** Read the metadata block into the chart; returns the index of the first body line */
function readMetadata(lines: string[], chart: ChartBuilder): number {
    const { meta } = chart;
    let untagged = 0;
    let i = 0;
    for (; i < lines.length && lines[i].trim() != ''; i++) {
        const tag = TAG.exec(lines[i].trim());
        if (tag) {
            applyTag(chart, tag[1].toLowerCase(), tag[2].trim());
        } else if (untagged < 2) {
            if (untagged++ == 0) meta.title ??= lines[i].trim();
            else meta.subtitles.push(lines[i].trim());
        } else {
            return i; // lyrics without a blank line before them
        }
    }
    return i;
}

function applyTag(chart: ChartBuilder, name: string, value: string) {
    const { meta } = chart;
    if (name == 'title') meta.title = value;
    else if (name == 'artist' || name == 'author') meta.subtitles.push(value);
    else if (name == 'key') meta.key = value;
    else if (name == 'capo') meta.capo = value;
    else if (name == 'tempo') meta.tempo = parseFloat(value) || undefined;
    else if (name == 'time') meta.time = value;
}
