import { describe, expect, it } from 'vitest';
import { parseChordPro } from './chordPro';

const SAINTS = `{title: When the Saints Go Marching In}
{artist: Traditional}
{key: G}
{tempo: 120}
{time: 4/4}
# arranged by the band

{start_of_grid label="Intro"}
| G . . . | D7 . . . |: G . G7 . | C . . . :| x2
{end_of_grid}

{start_of_verse: Verse 1}
Oh when the [G]saints go marching in
Oh when the saints go marching [D7]in

When the [*Stop]saints
{end_of_verse}

{soc}
Oh Lord I [G]want to [G7]be in that [C]number
{eoc}
{c: Horns only}
{chorus: Last chorus}
{start_of_tab}
e|---0---|
{end_of_tab}
{start_of_abc}
X:1
{end_of_abc}
{comment-guitar: For guitars only}`;

describe('ChordPro', () => {
    const chart = parseChordPro(SAINTS);

    it('reads metadata', () => {
        expect(chart.meta).toEqual({ title: 'When the Saints Go Marching In', subtitles: ['Traditional'], key: 'G', tempo: 120, time: '4/4' });
    });

    it('reads sections with their labels', () => {
        expect(chart.sections.map(s => [s.type, s.label])).toEqual([
            ['grid', 'Intro'], ['verse', 'Verse 1'], ['chorus', undefined], ['none', undefined], ['chorus', 'Last chorus'], ['tab', undefined],
        ]);
    });

    it('splits lyrics at chords, with annotations, keeping blank lines inside a section', () => {
        const verse = chart.sections[1];
        expect(verse.lines[0]).toEqual({ kind: 'lyrics', segments: [{ lyrics: 'Oh when the ' }, { chord: 'G', lyrics: 'saints go marching in' }] });
        expect(verse.lines[2]).toEqual({ kind: 'space' });
        expect(verse.lines[3]).toEqual({ kind: 'lyrics', segments: [{ lyrics: 'When the ' }, { annotation: 'Stop', lyrics: 'saints' }] });
    });

    it('reads grids: bars, bar lines and margin text', () => {
        const line = chart.sections[0].lines[0];
        if (line.kind != 'grid') throw new Error('not a grid line');
        expect(line.row.bars.map(bar => bar.cells)).toEqual([['G', '', '', ''], ['D7', '', '', ''], ['G', '', 'G7', ''], ['C', '', '', '']]);
        expect(line.row.barLines.map(bar => [bar.repeatStart, bar.repeatEnd])).toEqual([[false, false], [false, false], [true, false], [false, false], [false, true]]);
        expect(line.row.comment).toBe('x2');
    });

    it('recalls the chorus, keeps comments and tabs, leaves out notation and other instruments', () => {
        expect(chart.sections[4].recalled).toBe(chart.sections[2]);
        expect(chart.sections[3].lines).toEqual([{ kind: 'comment', text: 'Horns only', style: 'normal' }]);
        expect(chart.sections[5].lines).toEqual([{ kind: 'tab', text: 'e|---0---|' }]);
        expect(JSON.stringify(chart)).not.toContain('X:1');
        expect(JSON.stringify(chart)).not.toContain('For guitars only');
    });
});
