import type { ChartLine, ChartMeta, ChartSection, ChordChart, SectionType } from './chordChart';

/**
 * Collects lines into sections while a parser reads a chart top to bottom.
 * Lines outside any explicit section go into paragraphs, which blank lines separate.
 */
export class ChartBuilder {
    meta: ChartMeta = { subtitles: [] };
    private sections: ChartSection[] = [];
    private current: ChartSection | null = null;
    private explicit = false; // whether `current` was opened by a section start, rather than by a paragraph
    private lastChorus: ChartSection | null = null;

    startSection(type: SectionType, label?: string) {
        this.current = { type, label: label || undefined, lines: [] };
        this.sections.push(this.current);
        this.explicit = true;
        if (type == 'chorus') this.lastChorus = this.current;
    }

    endSection() {
        this.current = null;
        this.explicit = false;
    }

    get currentType(): SectionType | undefined {
        return this.current?.type;
    }

    addLine(line: ChartLine) {
        if (!this.current) {
            this.current = { type: 'none', lines: [] };
            this.sections.push(this.current);
        }
        this.current.lines.push(line);
    }

    /** A blank line: spacing inside a section, the end of a paragraph outside one */
    blankLine() {
        if (this.explicit) {
            if (this.current!.lines.length > 0) this.current!.lines.push({ kind: 'space' });
        } else {
            this.current = null;
        }
    }

    /** Play the last chorus again here (ChordPro `{chorus}`) */
    recallChorus(label?: string) {
        if (!this.lastChorus) return;
        this.endSection();
        this.sections.push({ type: 'chorus', label: label || this.lastChorus.label, lines: [], recalled: this.lastChorus });
    }

    build(): ChordChart {
        this.sections.forEach(section => section.lines = withoutTrailingSpace(section.lines));
        return { meta: this.meta, sections: this.sections.filter(section => section.lines.length > 0 || section.recalled) };
    }
}

function withoutTrailingSpace(lines: ChartLine[]): ChartLine[] {
    let end = lines.length;
    while (end > 0 && lines[end - 1].kind == 'space') end--;
    return lines.slice(0, end);
}
