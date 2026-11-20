import { describe, expect, it } from 'vitest';
import { render } from 'svelte/server';
import Markdown from './Markdown.svelte';

// Without Svelte's hydration markers
const html = (source: string) => render(Markdown, { props: { source } }).body.replace(/<!--.*?-->/g, '');

describe('Markdown', () => {
    it('renders Markdown', () => {
        expect(html('**bold** [site](https://example.com)')).toBe('<p><strong>bold</strong> <a href="https://example.com">site</a></p>');
    });

    it('shows raw HTML as text', () => {
        const body = html('<img src=x onerror=alert(1)>\n\ntext <b onclick=alert(1)>inline</b>');
        expect(body).not.toMatch(/<img|<b /);
        expect(body).toContain('&lt;img src=x onerror=alert(1)>');
    });

    it('drops unsafe link and image URLs', () => {
        expect(html('[x](javascript:alert(1)) ![y](javascript:alert(1))')).not.toContain('javascript:');
    });
});
