import type { BarLine, ChartLine } from './chordChart';

/** `|`, `||`, `|.`, `|:`, `:|`, `:|:`, and volta bar lines such as `|1`, `:|2`, `:|2>` */
const BAR_LINE = /^(:?)\|([|.:]?)(\d*)>?$/;

/**
 * A line in a ChordPro grid section (https://www.chordpro.org/chordpro/directives-env_grid/):
 * cells separated by spaces, bars separated by bar lines, optional text before and after.
 * A line without bar lines is text only.
 */
export function parseGridLine(line: string): ChartLine {
    const tokens = line.trim().split(/\s+/);
    const barLineAt = tokens.flatMap((token, index) => BAR_LINE.test(token) ? [index] : []);
    if (barLineAt.length == 0) return { kind: 'comment', text: line.trim(), style: 'normal' };

    const bars = barLineAt.slice(0, -1).map((start, i) => ({
        cells: tokens.slice(start + 1, barLineAt[i + 1]).map(gridCell),
    }));
    return {
        kind: 'grid',
        row: {
            margin: joinText(tokens.slice(0, barLineAt[0])),
            comment: joinText(tokens.slice(barLineAt.at(-1)! + 1)),
            bars,
            barLines: barLineAt.map(index => parseBarLine(tokens[index])),
        },
    };
}

function parseBarLine(token: string): BarLine {
    const [, closesRepeat, mark, volta] = BAR_LINE.exec(token)!;
    return {
        style: mark == '|' ? 'double' : mark == '.' ? 'end' : 'single',
        repeatStart: mark == ':',
        repeatEnd: closesRepeat == ':',
        volta: volta || undefined,
    };
}

/** "." is an empty beat; "~" joins chords that share a beat */
const gridCell = (token: string) => token == '.' ? '' : token.replaceAll('~', ' ');

const joinText = (tokens: string[]) => tokens.join(' ') || undefined;
