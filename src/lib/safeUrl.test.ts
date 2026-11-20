import { describe, expect, it } from 'vitest';
import { safeUrl } from './safeUrl';

describe('safeUrl', () => {
    it('keeps web, mail, phone and relative URLs', () => {
        for (const url of ['https://example.com/a?b#c', 'http://x.org', 'mailto:a@b.c', 'tel:+39123', '/app/songbook', '#notes', 'notes.md']) {
            expect(safeUrl(url)).toBe(url);
        }
    });

    it('drops script and data URLs, however they are spelled', () => {
        for (const url of ['javascript:alert(1)', ' JaVaScRiPt:alert(1)', 'java\tscript:alert(1)', 'data:text/html,<script>', 'vbscript:x', '', null]) {
            expect(safeUrl(url)).toBeUndefined();
        }
    });
});
