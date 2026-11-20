import { describe, expect, it } from 'vitest';
import { chordChartTimeline } from './chartTimeline';
import { parseChordPro } from './chordPro';

describe('chord chart timeline', () => {
    it('gives a line one bar per chord, grid bars one each, and plays recalled choruses again', () => {
        const chart = parseChordPro('{tempo: 90}\n{time: 3/4}\n{sog: Intro}\n| G . . | D . . |\n{eog}\n{soc}\n[G]Glory, [C]glory\nhallelujah\n{eoc}\n{chorus}');
        const timeline = chordChartTimeline(chart);
        expect([timeline.tempo, timeline.beatsPerBar, timeline.bars]).toEqual([90, 3, 8]);
        expect(timeline.sections).toEqual([
            { name: 'Intro', bars: { first: 0, count: 2 } },
            { name: 'Chorus', bars: { first: 2, count: 3 } },
            { name: 'Chorus', bars: { first: 5, count: 3 } },
        ]);
        expect(timeline.barsOf.get(chart.sections[1].lines[1])).toEqual({ first: 4, count: 1 });
    });
});
