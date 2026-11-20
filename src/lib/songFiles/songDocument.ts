import type { ChordChart } from '$lib/chords/chordChart';
import { chordChartTimeline, iRealTimeline, type ChartTimeline } from '$lib/chords/chartTimeline';
import { parseChordPro } from '$lib/chords/chordPro';
import { looksLikeChordsOverLyrics, parseChordsOverLyrics } from '$lib/chords/chordsOverLyrics';
import { parseIRealLinks, type IRealSong } from '$lib/chords/iRealPro';
import { parseOnSong } from '$lib/chords/onSong';
import { fileKind, fileTypeLabel, isWebPage } from './fileTypes';
import { songFileUrl, type SongFile } from './songFile';

/** A file opened in the viewer, ready to show */
export type SongDocument = { file: SongFile, typeLabel: string } & (
    | { kind: 'chart', chart: ChordChart, timeline: ChartTimeline }
    | { kind: 'iReal', song: IRealSong, timeline: ChartTimeline }
    | { kind: 'markdown', text: string }
    | { kind: 'text', text: string }
    | { kind: 'pdf', url: string }
    | { kind: 'download' }
);

/** A chart the player can follow: one with bars */
export function playableChart(document: SongDocument | null): (SongDocument & { timeline: ChartTimeline }) | null {
    return document && 'timeline' in document && document.timeline.bars > 0 ? document : null;
}

export async function openDocument(songId: number, file: SongFile): Promise<SongDocument> {
    const typeLabel = fileTypeLabel(file);
    const url = songFileUrl(songId, file);

    switch (fileKind(file)) {
        case 'chordpro': return chartDocument(file, typeLabel, parseChordPro(await fetchText(url)));
        case 'onsong': return chartDocument(file, typeLabel, parseOnSong(await fetchText(url)));
        case 'markdown': return { file, typeLabel, kind: 'markdown', text: await fetchText(url) };
        case 'text': return readTextDocument(file, typeLabel, await fetchText(url));
        case 'pdf': return { file, typeLabel, kind: 'pdf', url };
        default: return { file, typeLabel, kind: 'download' };
    }
}

/** A text file may hold an iReal Pro link or a chords-over-lyrics chart; a web page that holds neither is download only */
function readTextDocument(file: SongFile, typeLabel: string, text: string): SongDocument {
    const [iRealSong] = parseIRealLinks(text);
    if (iRealSong) return { file, typeLabel: 'iReal Pro', kind: 'iReal', song: iRealSong, timeline: iRealTimeline(iRealSong) };
    if (isWebPage(file)) return { file, typeLabel, kind: 'download' };
    if (looksLikeChordsOverLyrics(text)) return chartDocument(file, 'Chord chart', parseChordsOverLyrics(text));
    return { file, typeLabel, kind: 'text', text };
}

function chartDocument(file: SongFile, typeLabel: string, chart: ChordChart): SongDocument {
    return { file, typeLabel, kind: 'chart', chart, timeline: chordChartTimeline(chart) };
}

async function fetchText(url: string): Promise<string> {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Couldn't open the file: ${response.statusText}`);
    return response.text();
}
